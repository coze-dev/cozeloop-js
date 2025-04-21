# CozeLoop Monorepo

[![CI](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yml)

[English](./README.md) | 简体中文

## 📦 包列表

本 monorepo 包含以下包：

| 包名 | 描述 | 版本 |
|---------|------------|---------|
| [@cozeloop/ai](./packages/cozeloop-ai) | CozeLoop API SDK | [![npm](https://img.shields.io/npm/v/@cozeloop/ai.svg)](https://www.npmjs.com/package/@cozeloop/ai) |


## 🎮 示例

在 [examples](./examples) 目录中查找每个包的使用示例：

- [cozeloop-ai-node](./examples/cozeloop-ai-node) - @cozeloop/ai 的 Node.js 使用示例


## 🚀 快速开始

### 前置要求

- Node.js 18+ (推荐 LTS/Hydrogen)
- pnpm 9.12.0
- Rush 5.150.0

### 安装步骤

1. **安装 Node.js 18+**

```bash
nvm install lts/hydrogen
nvm alias default lts/hydrogen # 设置默认 node 版本
nvm use lts/hydrogen
```

2. **克隆仓库**

```bash
git clone git@github.com:coze-dev/cozeloop-js.git
```

3. **安装必需的全局依赖**

```bash
npm i -g pnpm@9.12.0 @microsoft/rush@5.150.0
```

4. **安装项目依赖**

```bash
rush update
```

5. **构建项目**

```bash
rush build
```

完成上述步骤后，你就可以开始在这个仓库中进行开发了。

开始享受开发吧！

## 🔨 开发

此 monorepo 中的每个包都可以独立开发和发布。开始开发：

1. 进入包目录：

```bash
cd packages/<package-name>
```

2. 启动开发：

```bash
npm run start
```

## 📖 文档

<!-- - [官方文档](https://www.coze.cn/docs/developer_guides/nodejs_overview) -->
- [贡献指南](./CONTRIBUTING.md)
<!-- - [如何发布](./docs/publish.md) -->

## 📄 许可证

[MIT](./LICENSE)
