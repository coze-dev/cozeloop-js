// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
import {
  guessChainInput,
  guessChainOutput,
  isLangGraphNode,
} from '@cozeloop/langchain/callbacks/utils';

describe('guessChainInput', () => {
  it('🧪 should return undefined for undefined input', () => {
    expect(guessChainInput(undefined)).toBeUndefined();
  });

  it('🧪 should return the value of the input property if it exists', () => {
    const input = { input: 'Hello, world!' };
    expect(guessChainInput(input)).toBe(input.input);
  });

  it('🧪 should return the value of the inputs property if it exists', () => {
    const input = { inputs: 'Hello, world!' };
    expect(guessChainInput(input)).toBe(input.inputs);
  });

  it('🧪 should return the value of the question property if it exists', () => {
    const input = { question: 'Hello, world!' };
    expect(guessChainInput(input)).toBe(input.question);
  });
});

describe('guessChainOutput', () => {
  it('🧪 should return undefined for undefined input', () => {
    expect(guessChainOutput(undefined)).toBeUndefined();
  });

  it('🧪 should return the value of the text property if it exists', () => {
    const output = { text: 'Hello, world!' };
    expect(guessChainOutput(output)).toBe(output.text);
  });

  it('🧪 should return the value of the answer property if it exists', () => {
    const output = { answer: 'Hello, world!' };
    expect(guessChainOutput(output)).toBe(output.answer);
  });

  it('🧪 should return the value of the output property if it exists', () => {
    const output = { output: 'Hello, world!' };
    expect(guessChainOutput(output)).toBe(output.output);
  });

  it('🧪 should return the value of the result property if it exists', () => {
    const output = { result: 'Hello, world!' };
    expect(guessChainOutput(output)).toBe(output.result);
  });

  it('🧪 should return the input object if none of the expected properties exist', () => {
    const output = { someOtherProperty: 'Hello, world!' };
    expect(guessChainOutput(output)).toEqual(output);
  });

  it('🧪 should recursively call guessChainOutput if the returnValues property exists', () => {
    const output = {
      returnValues: {
        text: 'Hello, world!',
      },
    };
    expect(guessChainOutput(output)).toBe(output.returnValues.text);
  });
});

describe('isLangGraphNode', () => {
  it('🧪 should return true for "LangGraph" name', () => {
    expect(isLangGraphNode('LangGraph')).toBe(true);
  });

  it('🧪 should return false for other names', () => {
    expect(isLangGraphNode('SomeOtherNode')).toBe(false);
    expect(isLangGraphNode('langgraph')).toBe(false);
    expect(isLangGraphNode('LANGGRAPH')).toBe(false);
    expect(isLangGraphNode('')).toBe(false);
  });
});
