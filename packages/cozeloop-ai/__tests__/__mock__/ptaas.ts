// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { join } from 'node:path';

import { setupServer } from 'msw/node';
import { http, passthrough } from 'msw';

import { type ExecutePromptReply } from '../../src';
import { fileToStreamResp, setupMockServer, successResp } from './utils';

const basicReply: ExecutePromptReply = {
  message: {
    role: 'assistant',
    content:
      '**国庆长假**\\n\\n金秋国庆迎盛世，游人欢笑赏风景。  \\n家国同庆情更浓，祝福祖国繁荣富强。',
    reasoning_content: '',
    tool_call_id: '',
  },
  finish_reason: 'stop',
  usage: { input_tokens: 130, output_tokens: 60 },
};

export function setupPTaaSMock() {
  const mockServer = setupServer(
    http.all(/.*/, req => {
      const pass = Boolean(req.request.headers.get('x-pass'));
      return pass ? passthrough() : undefined;
    }),
    http.post(/\/v1\/loop\/prompts\/execute$/, req => {
      const executeType = req.request.headers.get('x-mock');

      switch (executeType) {
        case 'basic-invoke':
          return successResp(basicReply);
        default:
          return passthrough();
      }
    }),
    http.post(/\/v1\/loop\/prompts\/execute_streaming/, req => {
      const executeType = req.request.headers.get('x-mock');

      switch (executeType) {
        case 'basic-stream':
          return fileToStreamResp(join(__dirname, 'ptaas-stream.txt'));
        default:
          return passthrough();
      }
    }),
  );

  return setupMockServer(mockServer);
}
