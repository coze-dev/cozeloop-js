// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { Buffer } from 'node:buffer';

import { pickBy } from 'remeda';
import promiseRetry from 'promise-retry';
import { nanoid } from 'nanoid';
import { type ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { type AttributeValue, SpanStatusCode } from '@opentelemetry/api';

import { convertHrTimeToMicroseconds, safeJSONParse } from '../index';
import { SpanKind, type SerializedTagValue } from '../../types';
import {
  COZELOOP_LOGGER_TRACER_TAG,
  COZELOOP_TRACE_SPAN_STATUS_CODE,
  COZELOOP_TRACE_TAGS,
  ROOT_SPAN_PARENT_ID,
} from '../../constants';
import { LoopLoggable, simpleConsoleLogger } from '../../../utils/logger';
import {
  type LoopTraceLLMCallOutput,
  type LoopTraceLLMCallInput,
  type ObjectStorage,
  type Span,
  type TraceApi,
  type UploadFileReq,
  type LoopTraceLLMCallMessage,
  type Attachments,
  type LoopTraceLLMCallMessagePart,
  type LoopTraceRunTime,
} from '../../../api';
import packageJson from '../../../../package.json';

type SpanSystemTags = Pick<
  Span,
  'system_tags_string' | 'system_tags_long' | 'system_tags_double'
>;

type SpanCustomTags = Pick<
  Span,
  'tags_bool' | 'tags_long' | 'tags_double' | 'tags_string' | 'tags_bytes'
>;

interface LoopTraceSpanConverterOptions {
  span: ReadableSpan;
  api: TraceApi;
  workspaceId: string;
}

function isLoopTraceLLMCallInput(
  value: unknown,
): value is LoopTraceLLMCallInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const input = value as LoopTraceLLMCallInput;

  if (!input.messages || !Array.isArray(input.messages)) {
    return false;
  }

  if (
    !input.messages.every(
      msg => typeof msg === 'object' && msg !== null && msg.role,
    )
  ) {
    return false;
  }

  if (input.tools) {
    if (!Array.isArray(input.tools)) {
      return false;
    }
    if (
      !input.tools.every(
        tool =>
          tool.type === 'function' &&
          typeof tool.function === 'object' &&
          tool.function !== null,
      )
    ) {
      return false;
    }
  }

  if (input.tool_choice) {
    if (typeof input.tool_choice !== 'object' || !input.tool_choice.type) {
      return false;
    }
  }

  return true;
}

function isLoopTraceLLMCallOutput(
  value: unknown,
): value is LoopTraceLLMCallOutput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const output = value as LoopTraceLLMCallOutput;

  if (!output.choices || !Array.isArray(output.choices)) {
    return false;
  }

  if (
    !output.choices.every(
      choice =>
        typeof choice === 'object' &&
        choice !== null &&
        choice.finish_reason &&
        choice.message &&
        typeof choice.message === 'object' &&
        choice.message !== null &&
        choice.message.role,
    )
  ) {
    return false;
  }

  return true;
}

function truncateByteLength(str: string, maxBytes: number): [string, boolean] {
  const buf = Buffer.from(str);
  if (buf.length <= maxBytes) {
    return [str, false];
  }

  const halfMaxBytes = Math.floor(maxBytes / 2);
  const strArray = Array.from(str);
  let frontIndex = 0;
  let backIndex = strArray.length;
  let currentBytes = 0;

  for (let i = 0; i < strArray.length && currentBytes < halfMaxBytes; i++) {
    currentBytes += Buffer.from(strArray[i]).length;
    frontIndex = i + 1;
  }

  currentBytes = 0;
  for (
    let i = strArray.length - 1;
    i >= frontIndex && currentBytes < halfMaxBytes;
    i--
  ) {
    currentBytes += Buffer.from(strArray[i]).length;
    backIndex = i;
  }

  const frontPart = strArray.slice(0, frontIndex);
  const backPart = strArray.slice(backIndex);

  return [frontPart.concat(backPart).join(''), true];
}

/** JSON stringify storage without empty values */
function formatObjectStorage(storage?: ObjectStorage) {
  if (!storage) {
    return '';
  }

  const partialStorage = pickBy(storage, v => Boolean(v && v.length > 0));

  return Object.keys(partialStorage).length
    ? JSON.stringify(partialStorage)
    : '';
}

export class LoopTraceSpanConverter extends LoopLoggable {
  private readonly MAX_RETRIES = 3;
  /** 1 MB */
  private readonly MAX_TEXT_SIZE = 1 * 1024 * 1024;
  private readonly MAX_TAG_SIZE = 1024;
  private readonly MAX_TEXT_TRUNCATION_LENGTH = 1000;
  private readonly LONG_TEXT_TOS_KEY_SUFFIX = 'large_text';

  private _span: ReadableSpan;
  private _ultraLargeReport: boolean;
  private _api: TraceApi;
  private _workspaceId: string;
  private _objectStorage: ObjectStorage;
  private _cutOffTagKeys: string[] = [];

  constructor(options: LoopTraceSpanConverterOptions) {
    super(simpleConsoleLogger, COZELOOP_LOGGER_TRACER_TAG);
    const { span, api, workspaceId } = options;
    this._span = span;
    this._api = api;
    this._workspaceId = workspaceId;
    this._objectStorage = {
      input_tos_key: '',
      output_tos_key: '',
      attachments: [],
    };
    this._ultraLargeReport = span.attributes[
      COZELOOP_TRACE_TAGS.SPAN_ULTRA_LARGE_REPORT
    ] as boolean;
  }

  private generateTosKey(
    tagKey: 'input' | 'output',
    fileType: 'text' | 'image' | 'file',
  ) {
    const { spanId, traceId } = this._span.spanContext();
    return `${traceId}_${spanId}_${tagKey}_${fileType}_${
      fileType === 'text' ? this.LONG_TEXT_TOS_KEY_SUFFIX : nanoid()
    }`;
  }

  private async uploadFile(options: Pick<UploadFileReq, 'file' | 'tos_key'>) {
    try {
      await promiseRetry(
        async retry => {
          try {
            await this._api.uploadFile({
              workspace_id: this._workspaceId,
              ...options,
            });
          } catch (error) {
            retry(error);
          }
        },
        {
          retries: this.MAX_RETRIES,
        },
      );
    } catch (error) {
      this.loopLogger.error(
        `Upload span file error, errorMessage=${error instanceof Error ? error.message : '-'}`,
      );
    }
  }

  private getSpanSystemTags(): SpanSystemTags {
    const spanSystemTags: Required<SpanSystemTags> = {
      system_tags_string: {},
      system_tags_long: {},
      system_tags_double: {},
    };

    const { attributes } = this._span;

    spanSystemTags.system_tags_string.cut_off = JSON.stringify(
      this._cutOffTagKeys,
    );

    const spanType = attributes?.[COZELOOP_TRACE_TAGS.SPAN_TYPE] as SpanKind;

    const runtimeInfo: LoopTraceRunTime = {
      language: 'ts',
      loop_sdk_version: packageJson.version,
      scene: Object.values(SpanKind).includes(spanType) ? spanType : 'custom',
    };

    spanSystemTags.system_tags_string.run_time = JSON.stringify(runtimeInfo);

    return spanSystemTags;
  }

  private handleCustomTag(
    key: string,
    value?: AttributeValue,
  ): [string, AttributeValue | undefined] {
    const [truncatedKey, isKeyTruncated] = truncateByteLength(
      key,
      this.MAX_TAG_SIZE,
    );

    let isTruncated = isKeyTruncated;
    const processedKey = isKeyTruncated ? truncatedKey : key;
    let processedValue = value;

    if (!this._ultraLargeReport && value) {
      const [truncatedValue, isValueTruncated] = truncateByteLength(
        JSON.stringify(value),
        this.MAX_TAG_SIZE,
      );

      isTruncated = isTruncated || isValueTruncated;
      isValueTruncated && (processedValue = truncatedValue);
    }

    if (isTruncated && !this._cutOffTagKeys.includes(processedKey)) {
      this._cutOffTagKeys.push(processedKey);
    }

    return [processedKey, processedValue];
  }

  private getSpanCustomTags(): SpanCustomTags {
    const defaultSpanCustomTags: Required<SpanCustomTags> = {
      tags_bool: {},
      tags_long: {},
      tags_double: {},
      tags_string: {},
      tags_bytes: {},
    };

    const spanCustomTags = Object.entries(this._span.attributes)
      .filter(
        ([key]) =>
          !Object.values(COZELOOP_TRACE_TAGS).includes(
            key as COZELOOP_TRACE_TAGS,
          ),
      )
      .reduce((pre, [originalKey, originalValue]) => {
        const [key, value] = this.handleCustomTag(originalKey, originalValue);

        // The current attributes have not yet received bytes type.
        if (typeof value === 'boolean') {
          pre.tags_bool[key] = value;
        } else if (typeof value === 'number') {
          if (Number.isInteger(value)) {
            pre.tags_long[key] = value;
          } else {
            pre.tags_double[key] = value;
          }
        } else if (typeof value === 'string') {
          pre.tags_string[key] = value;
        } else {
          pre.tags_string[key] = JSON.stringify(value);
        }
        return pre;
      }, defaultSpanCustomTags);

    return spanCustomTags;
  }

  private processingMultiModalContent(
    field: 'input' | 'output',
    value: LoopTraceLLMCallMessage,
  ): LoopTraceLLMCallMessage {
    const getPartInfo = (
      part: LoopTraceLLMCallMessagePart,
    ): Pick<Attachments, 'name' | 'type'> & { url?: string } => {
      switch (part.type) {
        case 'file_url':
          return {
            name: part.file_url?.name || '',
            type: 'file',
            url: part.file_url?.url,
          };
        case 'image_url':
        default:
          return {
            name: part.image_url?.name || '',
            type: 'image',
            url: part.image_url?.url,
          };
      }
    };

    const updatePartInfo = (
      part: LoopTraceLLMCallMessagePart,
      tosKey: string,
    ): LoopTraceLLMCallMessagePart => {
      const updatedPart = { ...part };
      if (part.type === 'file_url' && updatedPart.file_url) {
        updatedPart.file_url = {
          ...updatedPart.file_url,
          url: tosKey,
        };
      } else if (part.type === 'image_url' && updatedPart.image_url) {
        updatedPart.image_url = {
          ...updatedPart.image_url,
          url: tosKey,
        };
      }
      return updatedPart;
    };

    if (!value.parts) {
      return value;
    }

    const updatedParts = value.parts.map(part => {
      if (part.type !== 'image_url' && part.type !== 'file_url') {
        return part;
      }

      const { name, type, url } = getPartInfo(part);

      if (!url || !url.startsWith('data:')) {
        return part;
      }

      const tosKey = this.generateTosKey(field, type);

      this._objectStorage.attachments.push({
        field,
        name,
        type,
        tos_key: tosKey,
      });

      try {
        this.uploadFile({
          file: Buffer.from(url.split(',')[1], 'base64'),
          tos_key: tosKey,
        });
      } catch (error) {
        this.loopLogger.error(
          `Convert base64 to file error, errorMessage=${error instanceof Error ? error.message : '-'}`,
        );
      }

      return updatePartInfo(part, tosKey);
    });

    return { ...value, parts: updatedParts };
  }

  private processingLongText(field: 'input' | 'output', value: unknown) {
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value ?? '');

    const size = Buffer.from(serializedValue).length;

    if (this._ultraLargeReport && size > this.MAX_TEXT_SIZE) {
      const tosKey = this.generateTosKey(field, 'text');
      this._objectStorage[`${field}_tos_key`] = tosKey;

      this.uploadFile({
        file: Buffer.from(serializedValue),
        tos_key: tosKey,
      });

      return serializedValue.slice(0, this.MAX_TEXT_TRUNCATION_LENGTH);
    }

    return serializedValue.slice(0, this.MAX_TEXT_SIZE);
  }

  private convertInput(value: SerializedTagValue) {
    let input: unknown = value;
    if (
      typeof value === 'string' &&
      isLoopTraceLLMCallInput(safeJSONParse(value, {}))
    ) {
      const parsedValue = JSON.parse(value) as LoopTraceLLMCallInput;
      const tempInput = { ...parsedValue };
      if (tempInput.messages) {
        tempInput.messages = tempInput.messages.map(msg =>
          this.processingMultiModalContent('input', msg),
        );
      }
      input = tempInput;
    }

    return this.processingLongText('input', input);
  }

  private convertOutput(value: SerializedTagValue) {
    let output: unknown = value;
    if (
      typeof value === 'string' &&
      isLoopTraceLLMCallOutput(safeJSONParse(value, {}))
    ) {
      const parsedValue = JSON.parse(value) as LoopTraceLLMCallOutput;
      const tempOutput = { ...parsedValue };
      if (tempOutput.choices) {
        tempOutput.choices = tempOutput.choices.map(choice => {
          if (choice.message) {
            return {
              ...choice,
              message: this.processingMultiModalContent(
                'output',
                choice.message,
              ),
            };
          }
          return choice;
        });
      }
      output = tempOutput;
    }

    return this.processingLongText('output', output);
  }

  toLoopSpan(): Span {
    const { attributes, status, parentSpanId, startTime, duration } =
      this._span;

    const input = this.convertInput(
      attributes[COZELOOP_TRACE_TAGS.SPAN_INPUT] as SerializedTagValue,
    );
    const output = this.convertOutput(
      attributes[COZELOOP_TRACE_TAGS.SPAN_OUTPUT] as SerializedTagValue,
    );

    return {
      started_at_micros: convertHrTimeToMicroseconds(startTime),
      span_id: this._span.spanContext().spanId,
      parent_id: parentSpanId || ROOT_SPAN_PARENT_ID,
      trace_id: this._span.spanContext().traceId,
      duration: Math.max(convertHrTimeToMicroseconds(duration), 0),
      workspace_id: this._workspaceId,
      span_name: attributes[COZELOOP_TRACE_TAGS.SPAN_NAME] as string,
      span_type: attributes[COZELOOP_TRACE_TAGS.SPAN_TYPE] as string,
      method: '',
      status_code:
        status.code === SpanStatusCode.ERROR
          ? COZELOOP_TRACE_SPAN_STATUS_CODE.ERROR
          : COZELOOP_TRACE_SPAN_STATUS_CODE.SUCCESS,
      error: status.message,
      input,
      output,
      object_storage: formatObjectStorage(this._objectStorage),
      ...this.getSpanCustomTags(),
      ...this.getSpanSystemTags(),
    };
  }
}
