// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { join } from 'node:path';

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { fileToStreamResp, headersToJson, setupMockServer } from './utils';

export function setupBaseHttpMock() {
  const mockServer = setupServer(
    http.post(/\/stream-event-error/i, () =>
      fileToStreamResp(join(__dirname, 'base-stream-event-error.txt')),
    ),
    http.post(/\/stream-parse-error/i, () =>
      fileToStreamResp(join(__dirname, 'base-stream-parse-error.txt')),
    ),
    http.post(/\/stream/i, () =>
      fileToStreamResp(join(__dirname, 'base-stream.txt')),
    ),
    http.all(/\/basic/i, ({ request }) =>
      HttpResponse.json({
        method: request.method,
        headers: headersToJson(request.headers),
      }),
    ),
  );

  return setupMockServer(mockServer);
}
