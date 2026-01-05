// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupServer } from 'msw/node';
import { http } from 'msw';

import { setupMockServer, successResp } from './utils';

export function setupLoopTracerMock() {
  const mockServer = setupServer(
    http.post(/\/v1\/loop\/traces\/ingest/, () => successResp({})),
    http.post(/\/v1\/loop\/files\/upload/, () => successResp({})),
  );

  return setupMockServer(mockServer);
}
