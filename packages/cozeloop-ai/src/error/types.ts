// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT
/* eslint-disable @typescript-eslint/no-explicit-any -- some error is any */
import type { AxiosResponseHeaders } from 'axios';

export interface ErrorDetail {
  status: number;
  name?: string;
  /** error but with result */
  result?: any;
  message?: string;
  headers?: AxiosResponseHeaders | Record<string, unknown>;
}

export enum HttpStatusCode {
  /** 100 Continue | 服务器已经接收到请求头，并且客户端应继续发送请求主体 */
  Continue = 100,
  /** 101 Switching Protocols | 服务器已经理解了客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议来完成这个请求 */
  SwitchingProtocols = 101,
  /** 200 OK | 请求成功。一般用于GET与POST请求 */
  OK = 200,
  /** 201 Created | 已创建。成功请求并创建了新的资源 */
  Created = 201,
  /** 202 Accepted | 已接受。已经接受请求，但未处理完成 */
  Accepted = 202,
  /** 204 No Content | 无内容。服务器成功处理，但未返回内容 */
  NoContent = 204,
  /** 300 Multiple Choices | 多种选择。请求的资源可包括多个位置，相应可返回一个资源特征与地址的列表用于用户终端选择 */
  MultipleChoices = 300,
  /** 301 Moved Permanently | 永久移动。请求的资源已被永久的移动到新URI，返回信息会包括新的URI，浏览器会自动定向到新URI */
  MovedPermanently = 301,
  /** 302 Found | 临时移动。与301类似。但资源只是临时被移动。客户端应继续使用原有URI */
  Found = 302,
  /** 304 Not Modified | 未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源 */
  NotModified = 304,
  /** 400 Bad Request | 客户端请求的语法错误，服务器无法理解 */
  BadRequest = 400,
  /** 401 Unauthorized | 请求要求用户的身份认证 */
  Unauthorized = 401,
  /** 403 Forbidden | 服务器理解请求客户端的请求，但是拒绝执行此请求 */
  Forbidden = 403,
  /** 404 Not Found | 服务器无法根据客户端的请求找到资源（网页） */
  NotFound = 404,
  /** 405 Method Not Allowed | 客户端请求中的方法被禁止 */
  MethodNotAllowed = 405,
  /** 408 Request Timeout | 服务器等待客户端发送的请求时间过长，超时 */
  RequestTimeout = 408,
  /** 409 Conflict | 服务器完成客户端的PUT请求是可能返回此代码，服务器处理请求时发生了冲突 */
  Conflict = 409,
  /** 410 Gone | 客户端请求的资源已经不存在。410不同于404，如果资源以前有现在被永久删除了可使用410代码，网站设计人员可通过301代码指定资源的新位置 */
  Gone = 410,
  /** 429 Too Many Requests | 请求频次过高 */
  TooManyRequests = 429,
  /** 500 Internal Server Error | 服务器内部错误，无法完成请求 */
  InternalServerError = 500,
  /** 501 Not Implemented | 服务器不支持请求的功能，无法完成请求 */
  NotImplemented = 501,
  /** 502 Bad Gateway | 作为网关或者代理工作的服务器尝试执行请求时，从远程服务器接收到了一个无效的响应 */
  BadGateway = 502,
  /** 503 Service Unavailable | 由于超载或系统维护，服务器暂时的无法处理客户端的请求。延时的长度可包含在服务器的Retry-After头信息中 */
  ServiceUnavailable = 503,
  /** 504 Gateway Timeout | 充当网关或代理的服务器，未及时从远端服务器获取请求 */
  GatewayTimeout = 504,
  /** 505 HTTP Version Not Supported | 服务器不支持请求的HTTP协议的版本，无法完成处理 */
  HTTPVersionNotSupported = 505,
}

export enum InternalApiStatusCode {
  BadRequest = 4000,
  Unauthorized = 4100,
  Forbidden = 4101,
  NotFound = 4200,
  TooManyRequests = 4013,
}
