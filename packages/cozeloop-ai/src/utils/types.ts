// Copyright (c) 2026 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
export type SetRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
