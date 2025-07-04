// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import { type ChainValues } from '@langchain/core/utils/types';

export function guessChainInput(inputs?: ChainValues) {
  if (!inputs) {
    return undefined;
  }

  return inputs.input || inputs.inputs || inputs.question || inputs;
}

export function guessChainOutput(outputs?: ChainValues) {
  if (!outputs) {
    return undefined;
  }

  if (outputs.returnValues) {
    return guessChainOutput(outputs.returnValues);
  }

  return (
    outputs.text ||
    outputs.answer ||
    outputs.output ||
    outputs.result ||
    outputs
  );
}
