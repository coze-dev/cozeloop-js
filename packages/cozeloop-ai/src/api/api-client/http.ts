// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import './polyfill-async-iterator';

import axios from 'axios';

import { compareVersions } from '../../utils/common';
import { handleError } from '../../error';
import {
  generateChunks,
  getNodeStreamAdapter,
  isAxiosStatic,
  parseEventChunk,
} from './utils';
import type { HttpOptions } from './types';

export async function http<T>(options: HttpOptions) {
  const { axiosInstance, streaming, ...requestConfig } = options;
  const axiosIns = axiosInstance || axios;

  if (streaming && isAxiosStatic(axiosIns)) {
    const axiosVersion = axiosIns.VERSION || axios.VERSION;
    if (!axiosVersion || compareVersions(axiosVersion, '1.7.1') < 0) {
      throw new Error(
        'Streaming requests require axios version 1.7.1 or higher. Please upgrade your axios version.',
      );
    }
  }

  try {
    const response = await axiosIns({
      responseType: streaming ? 'stream' : 'json',
      adapter: getNodeStreamAdapter(streaming),
      ...requestConfig,
    });

    return {
      stream: () => generateChunks<T>(response.data, parseEventChunk),
      json: () => response.data as T,
      response,
    };
  } catch (error) {
    throw handleError(error);
  }
}
