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
