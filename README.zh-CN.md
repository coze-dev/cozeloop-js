# CozeLoop Monorepo

[![codecov](https://codecov.io/gh/coze-dev/cozeloop-js/branch/main/graph/badge.svg)](https://codecov.io/gh/coze-dev/cozeloop-js)
[![CI](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yaml)

[English](./README.md) | 简体中文

## 📦 包列表

本 monorepo 包含以下包：

| 包名 | 描述 | 版本 |
|---------|------------|---------|
| [@cozeloop/ai](./packages/cozeloop-ai) | CozeLoop API SDK | [![npm](https://img.shields.io/npm/v/@cozeloop/ai.svg)](https://www.npmjs.com/package/@cozeloop/ai) |
| [@cozeloop/langchain](./packages/cozeloop-langchain) | CozeLoop LangChain Integration | [![npm](https://img.shields.io/npm/v/@cozeloop/langchain.svg)](https://www.npmjs.com/package/@cozeloop/langchain) |

## 🎮 示例

在 [examples](./examples) 目录中查找每个包的使用示例：

- [cozeloop-ai-node](./examples/cozeloop-ai-node) - @cozeloop/ai 的 Node.js 使用示例

## 🚀 快速开始

### 前置要求

- Node.js 24+ (推荐 LTS/Krypton)
- pnpm 10.27.0
- Rush 5.172.1

### 安装步骤

1. **安装 Node.js 24+**

```bash
nvm install lts/krypton
nvm alias default lts/krypton # 设置默认 node 版本
nvm use lts/krypton
```

2. **克隆仓库**

```bash
git clone git@github.com:coze-dev/cozeloop-js.git
```

3. **安装必需的全局依赖**

```bash
npm i -g pnpm@10.27.0 @microsoft/rush@5.172.1
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

- [官方文档](https://loop.coze.cn/open/docs/cozeloop/quick-start-nodejs)
- [贡献指南](./CONTRIBUTING.md)

## 📄 许可证

[MIT](./LICENSE)
