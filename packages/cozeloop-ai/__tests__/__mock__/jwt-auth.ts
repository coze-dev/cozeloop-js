// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { setupMockServer } from './utils';

export function setupJwtAuthMock() {
  const mockServer = setupServer(
    http.post(/\/api\/permission\/oauth2\/token/, () =>
      HttpResponse.json({
        access_token: 'fake_access_token',
        expires_in: 1741953784,
        token_type: 'Bearer',
      }),
    ),
  );

  return setupMockServer(mockServer);
}
