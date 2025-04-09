import { setTimeout } from 'node:timers/promises';

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import axios, { type AxiosRequestConfig } from 'axios';
import { context, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { cozeLoopTracer } from '@cozeloop/ai';

async function doSomething() {
  return await setTimeout(2000, 'result');
}

function setupMockServer() {
  const mockServer = setupServer(
    http.post(/\/mock\/service\/api\/endpoint/, async req => {
      // Simulate collecting headers in the request
      const headers: Record<string, string> = {};
      req.request.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Simulate a new context environment (for example, in a cross-service scenario) by
      // setting context to ROOT_CONTEXT, you don't need to take this step in real cross-service calls
      return await context.with(
        ROOT_CONTEXT,
        // Simulate service execution
        async () => await mockService({ headers }),
      );
    }),
  );

  return {
    start: () => mockServer.listen({ onUnhandledRequest: 'bypass' }),
    close: () => mockServer.close(),
  };
}

async function mockService(req: { headers: Record<string, string> }) {
  // Inject the context information passed
  const extractedContext = propagation.extract(context.active(), req.headers);

  // Use the extracted context
  return await context.with(
    extractedContext,
    async () =>
      await cozeLoopTracer.traceable(
        async () => {
          const result = await doSomething();

          return HttpResponse.json({
            code: 0,
            msg: '',
            data: {
              result,
            },
          });
        },
        {
          name: 'ChildSpan',
          type: 'TransferBetweenServicesType',
        },
      ),
  );
}

export async function runTransferBetweenServices() {
  const mockServer = setupMockServer();
  mockServer.start();

  const result = await cozeLoopTracer.traceable(
    async span => {
      span.setAttribute('custom-tag', 'xxx');

      const headers: AxiosRequestConfig['headers'] = {};

      // Get the current context information
      propagation.inject(context.active(), headers);

      const resp = await axios.post(
        'http://mock/service/api/endpoint',
        {},
        {
          headers,
        },
      );
      return resp.data;
    },
    {
      name: 'ParentSpan',
      type: 'TransferBetweenServicesType',
      // The baggage fields will be automatically passed through
      baggages: {
        user_id: 'uid-123',
        message_id: 'msg-123',
        thread_id: 'thread-123',
      },
    },
  );

  mockServer.close();

  return result;
}
