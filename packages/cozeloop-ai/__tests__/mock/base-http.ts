import { join } from 'node:path';

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { fileToStreamResp, headersToJson, setupMockServer } from './utils';

export function setupBaseHttpMock() {
  const mockServer = setupServer(
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
