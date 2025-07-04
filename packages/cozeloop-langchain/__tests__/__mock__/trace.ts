import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export function setupTraceMock() {
  // skip mock server when set COZELOOP_E2E = '1'
  const isE2E = process.env.COZELOOP_E2E === '1';
  const server = setupServer(
    http.post(/\/v1\/loop\/opentelemetry\/v1\/traces/i, () =>
      HttpResponse.json({ code: 0 }),
    ),
  );

  return {
    start: () => isE2E || server.listen({ onUnhandledRequest: 'bypass' }),
    close: () => isE2E || server.close(),
    reset: () => isE2E || server.resetHandlers(),
  };
}
