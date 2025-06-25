/* eslint-disable @typescript-eslint/no-explicit-any -- callback handler params */
/* eslint-disable max-params -- callback handler methods */
import { NodeSDK as OTelNodeSDK } from '@opentelemetry/sdk-node';
import {
  type Span,
  SpanStatusCode,
  type Tracer,
  context,
  trace,
} from '@opentelemetry/api';
import { type LLMResult } from '@langchain/core/outputs';
import { type BaseMessage } from '@langchain/core/messages';
import { type DocumentInterface } from '@langchain/core/documents';
import { type ChainValues } from '@langchain/core/dist/utils/types';
import { type Serialized } from '@langchain/core/dist/load/serializable';
import {
  type AgentAction,
  type AgentFinish,
} from '@langchain/core/dist/agents';
import {
  type BaseCallbackHandlerInput,
  BaseCallbackHandler,
  type NewTokenIndices,
  type HandleLLMNewTokenCallbackFields,
} from '@langchain/core/callbacks/base';

import { extractLLMAttributes, generateUUID, stringifyVal } from './utils';
import { TreeLogSpanProcessor } from './tree-log-processor';
import { type CozeloopSpanProcessorOptions } from './schema';
import { CozeloopSpanProcessor } from './processor';
import { CozeloopAttr, CozeloopSpanType } from './constants';

export interface CozeloopCallbackHandlerInput extends BaseCallbackHandlerInput {
  /** Weather to ignore prompt node like {@link ChatPromptTemplate} */
  ignorePrompt?: boolean;
  spanProcessor?: Partial<CozeloopSpanProcessorOptions>;
}

// TODO: remove
export function logMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log('🟢', propertyKey, args);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

export class CozeloopCallbackHandler
  extends BaseCallbackHandler
  implements CozeloopCallbackHandlerInput
{
  name = 'cozeloop-langchain-callback';

  _awaitHandler?: boolean;

  ignorePrompt: boolean;

  private readonly _otel: OTelNodeSDK;

  private readonly _tracer: Tracer;

  private readonly _runMap = new Map<string, Span>();

  private readonly _llmStartMap = new Map<string, number>();

  private readonly _promptChain = new Set<string>();

  private readonly _agentRunIdMap = new Map<string, string[]>();

  constructor(handlerInput: CozeloopCallbackHandlerInput = {}) {
    const { ignorePrompt, spanProcessor = {}, ...input } = handlerInput;
    super(input);
    this.ignorePrompt = ignorePrompt ?? false;
    this._otel = new OTelNodeSDK({
      spanProcessors: [
        new CozeloopSpanProcessor(spanProcessor),
        new TreeLogSpanProcessor(),
      ],
    });
    this._otel.start();
    // MUST initialize tracer after otel sdk started
    this._tracer = trace.getTracer(this.name, process.env.COZELOOP_VERSION);
  }

  handleText(
    text: string,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ): Promise<void> | void {
    this._startSpan('Text', runId, parentRunId, span => {
      span.setAttribute(CozeloopAttr.INPUT, text);
    });
    this._endSpan(runId, undefined);
  }

  handleAgentAction(
    action: AgentAction,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ): Promise<void> | void {
    let _runId = runId;
    let _parentRunId = parentRunId;
    // check if it use the runId exists
    // see https://github.com/langchain-ai/langchainjs/issues/2488
    if (this._runMap.has(runId)) {
      _runId = generateUUID();
      _parentRunId = runId;

      // set runId relations
      this._agentRunIdMap.has(runId)
        ? this._agentRunIdMap.get(runId)?.push(_runId)
        : this._agentRunIdMap.set(runId, [_runId]);
    }
    const spanName = 'AgentAction';
    this._startSpan(spanName, _runId, _parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.AGENT,
        [CozeloopAttr.INPUT]: stringifyVal(
          // @ts-expect-error action has messageLog
          stringifyVal(action.messageLog || action.log),
        ),
      });
    });
  }

  handleAgentEnd(
    action: AgentFinish,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ): Promise<void> | void {
    this._endSpan(runId, undefined, span => {
      span.setAttribute(CozeloopAttr.OUTPUT, stringifyVal(action.returnValues));
    });
  }

  handleCustomEvent(
    eventName: string,
    data: any,
    runId: string,
    tags?: string[],
    metadata?: Record<string, any>,
  ) {
    this._startSpan(eventName, runId, undefined, span => {
      span.setAttribute(CozeloopAttr.INPUT, stringifyVal(data));
    });
    this._endSpan(runId, undefined);
  }

  handleChatModelStart(
    llm: Serialized,
    messages: BaseMessage[][],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
    tags?: string[],
    metadata?: Record<string, unknown>,
    runName?: string,
  ) {
    this._llmStartMap.set(runId, Date.now());
    const { model_name, model_provider, ...callOptions } = extractLLMAttributes(
      llm,
      extraParams,
      metadata,
    );
    const spanName = `${runName || model_name || 'ChatModelStart'}`;

    this._startSpan(spanName, runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.MODEL,
        [CozeloopAttr.MODEL_PROVIDER]: model_provider,
        [CozeloopAttr.REQUEST_MODEL]: model_name,
        [CozeloopAttr.RESPONSE_MODEL]: model_name,
        [CozeloopAttr.TEMPERATURE]: callOptions.temperature,
        [CozeloopAttr.MAX_TOKENS]: callOptions.max_tokens,
        [CozeloopAttr.TOP_P]: callOptions.top_p,
        [CozeloopAttr.TOP_K]: callOptions.top_p,
        [CozeloopAttr.FREQUENCY_PENALTY]: callOptions.frequency_penalty,
        [CozeloopAttr.PRESENCE_PENALTY]: callOptions.presence_penalty,
      });
    });
    this._endSpan(runId, undefined);
  }

  handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>,
    tags?: string[],
    metadata?: Record<string, unknown>,
    runName?: string,
  ) {
    this._llmStartMap.set(runId, Date.now());
    const { model_name, model_provider, ...callOptions } = extractLLMAttributes(
      llm,
      extraParams,
      metadata,
    );

    const spanName = `${runName || model_name || 'LLMStart'}`;
    this._startSpan(spanName, runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.MODEL,
        [CozeloopAttr.MODEL_PROVIDER]: model_provider,
        [CozeloopAttr.REQUEST_MODEL]: model_name,
        [CozeloopAttr.RESPONSE_MODEL]: model_name,
        [CozeloopAttr.TEMPERATURE]: callOptions.temperature,
        [CozeloopAttr.MAX_TOKENS]: callOptions.max_tokens,
        [CozeloopAttr.TOP_P]: callOptions.top_p,
        [CozeloopAttr.TOP_K]: callOptions.top_p,
        [CozeloopAttr.FREQUENCY_PENALTY]: callOptions.frequency_penalty,
        [CozeloopAttr.PRESENCE_PENALTY]: callOptions.presence_penalty,
      });
    });
  }

  handleLLMNewToken(
    token: string,
    idx: NewTokenIndices,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    fields?: HandleLLMNewTokenCallbackFields,
  ) {
    const now = Date.now();
    const span = this._runMap.get(runId);
    if (!span) {
      return;
    }

    const startAt = this._llmStartMap.get(runId);
    if (typeof startAt !== 'undefined') {
      span.setAttributes({
        [CozeloopAttr.LATENCY_FIRST_RESP]: now - startAt,
        [CozeloopAttr.STREAMING]: true,
      });
      this._llmStartMap.delete(runId);
    }
  }

  handleLLMEnd(
    output: LLMResult,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    extraParams?: Record<string, unknown>,
  ) {
    this._endSpan(runId, undefined, span => {
      span.setAttributes({
        [CozeloopAttr.OUTPUT]: stringifyVal(output?.generations),
        // TODO
        // [CozeloopAttr.INPUT_TOKENS]: stringifyVal(output?.llmOutput),
        // [CozeloopAttr.OUTPUT_TOKENS]: stringifyVal(output.generations),
        // [CozeloopAttr.TOTAL_TOKENS]: stringifyVal(output.generations),
      });
    });
  }

  handleLLMError(
    err: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    extraParams?: Record<string, unknown>,
  ) {
    this._endSpan(runId, err || '');
  }

  handleChainStart(
    chain: Serialized,
    inputs: ChainValues,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    metadata?: Record<string, unknown>,
    runType?: string,
    runName?: string,
  ) {
    // ChatPromptTemplate -> handlePromptStart
    if (runType === 'prompt' || runName === 'ChatPromptTemplate') {
      this.handlePromptStart(
        chain,
        inputs,
        runId,
        parentRunId,
        tags,
        metadata,
        runType,
        runName,
      );
      return;
    }

    const spanName = runName || 'ChainStart';
    this._startSpan(spanName, runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.CHAIN,
        [CozeloopAttr.INPUT]: stringifyVal(inputs),
      });
    });
  }

  handleChainEnd(
    outputs: ChainValues,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    kwargs?: { inputs?: Record<string, unknown> },
  ) {
    if (this._promptChain.has(runId)) {
      this.handlePromptEnd(outputs, runId, parentRunId, tags, kwargs);
      return;
    }
    this._endSpan(runId, undefined, span => {
      span.setAttributes({
        [CozeloopAttr.OUTPUT]: stringifyVal(outputs),
      });
    });
  }

  handleChainError(
    err: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    kwargs?: { inputs?: Record<string, unknown> },
  ) {
    if (this._promptChain.has(runId)) {
      this.handlePromptError(err, runId, parentRunId, tags, kwargs);
      return;
    }
    this._endSpan(runId, err || '');
  }

  handleToolStart(
    tool: Serialized,
    input: string,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    metadata?: Record<string, unknown>,
    runName?: string,
  ) {
    const spanName = `${runName ?? metadata?.toolName ?? tool.id.at(-1) ?? 'Tool'}`;
    this._startSpan(spanName, runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.TOOL,
        [CozeloopAttr.INPUT]: input,
      });
    });
  }

  handleToolEnd(
    output: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ) {
    this._endSpan(runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.OUTPUT]: stringifyVal(output),
      });
    });
  }

  handleToolError(
    err: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ) {
    this._endSpan(runId, err || '');
  }

  handleRetrieverStart(
    retriever: Serialized,
    query: string,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    metadata?: Record<string, unknown>,
    name?: string,
  ) {
    console.info('handleRetrieverStart');
  }

  handleRetrieverEnd(
    documents: DocumentInterface[],
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ) {
    console.info('handleRetrieverEnd');
  }

  handleRetrieverError(
    err: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
  ) {
    console.info('handleRetrieverError');
  }

  private handlePromptStart(
    chain: Serialized,
    inputs: ChainValues,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    metadata?: Record<string, unknown>,
    runType?: string,
    runName?: string,
  ) {
    this._promptChain.add(runId);
    this._startSpan(runName || 'Prompt', runId, parentRunId, span => {
      span.setAttributes({
        [CozeloopAttr.SPAN_TYPE]: CozeloopSpanType.PROMPT,
        [CozeloopAttr.INPUT]: stringifyVal(inputs),
        [CozeloopAttr.PROMPT_KEY]: '',
        [CozeloopAttr.PROMPT_VERSION]: '',
        [CozeloopAttr.PROMPT_PROVIDER]: 'LangChain',
      });
    });
  }

  private handlePromptEnd(
    outputs: ChainValues,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    kwargs?: { inputs?: Record<string, unknown> },
  ) {
    if (this.ignorePrompt) {
      return;
    }
    this._promptChain.delete(runId);
    this._endSpan(runId, undefined, span => {
      span.setAttributes({
        [CozeloopAttr.OUTPUT]: stringifyVal(outputs),
      });
    });
  }

  private handlePromptError(
    err: any,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    kwargs?: { inputs?: Record<string, unknown> },
  ) {
    if (this.ignorePrompt) {
      return;
    }
    this._promptChain.delete(runId);
    this._endSpan(runId, err || '');
  }

  private _startSpan(
    name: string,
    runId: string,
    parentRunId: string | undefined,
    cb?: (span: Span) => void,
  ) {
    const parentSpan = parentRunId ? this._runMap.get(parentRunId) : undefined;
    const currentContext = parentSpan
      ? trace.setSpan(context.active(), parentSpan)
      : context.active();

    context.with(currentContext, () => {
      const span = this._tracer.startSpan(name);
      // span.setAttribute(CozeloopAttr.WORKSPACE_ID, this._workspaceId || '');
      this._runMap.set(runId, span);
      span.setAttribute('langchain-run-id', runId);
      cb?.(span);
    });
  }

  private _endSpan(runId: string, err: unknown, cb?: (span: Span) => void) {
    const span = this._runMap.get(runId);

    if (!span) {
      return;
    }

    cb?.(span);

    if (typeof err !== 'undefined') {
      const errMsg = stringifyVal(err);
      span.setAttribute(CozeloopAttr.ERROR_MSG, errMsg);
      span.setStatus({ code: SpanStatusCode.ERROR, message: errMsg });
    }
    span.end();
    this._runMap.delete(runId);

    // end agent action related spans
    if (this._agentRunIdMap.has(runId)) {
      this._agentRunIdMap.get(runId)?.forEach(it => this._endSpan(it, err));
      this._agentRunIdMap.delete(runId);
    }
  }

  async shutdown() {
    this._runMap.clear();
    this._llmStartMap.clear();
    await this._otel.shutdown();
  }
}
