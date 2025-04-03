// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export interface PropertyUnprovidedErrorDetail {
  tag?: string;
  propName: string;
  envKey: string;
}

export class PropertyUnprovidedError extends Error {
  private _detail: PropertyUnprovidedErrorDetail;

  constructor(detail: PropertyUnprovidedErrorDetail) {
    super();
    this._detail = detail;
  }

  get tag() {
    return this._detail.tag;
  }

  get message() {
    const { tag, propName, envKey } = this._detail;
    const tagText = tag ? `[${tag}] ` : '';

    return `${tagText}${propName} not provided, neither pass it or set it via process.env.${envKey}`;
  }
}
