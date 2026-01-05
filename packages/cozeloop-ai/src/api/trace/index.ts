// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import FormData from 'form-data';

import type {
  ReportTraceReq,
  ReportTraceResp,
  UploadFileReq,
  UploadFileResp,
} from './types';
import { BaseApi } from '../base';

export type * from './types';

export class TraceApi extends BaseApi {
  reportTrace(req: ReportTraceReq) {
    const url = '/v1/loop/traces/ingest';

    return this._client.post<ReportTraceResp>(url, req);
  }

  uploadFile(req: UploadFileReq) {
    const url = '/v1/loop/files/upload';
    const formData = new FormData();

    const { workspace_id, tos_key, file } = req;
    formData.append('workspace_id', workspace_id);
    formData.append('file', file, tos_key);

    return this._client.post<UploadFileResp>(url, formData, false, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
  }
}
