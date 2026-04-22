# CozeLoop Monorepo

[![codecov](https://codecov.io/gh/coze-dev/cozeloop-js/branch/main/graph/badge.svg)](https://codecov.io/gh/coze-dev/cozeloop-js)
[![CI](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yaml)

English | [简体中文](./README.zh-CN.md)

## 📦 Packages

This monorepo contains the following packages:

| Package | Description | Version |
|---------|------------|---------|
| [@cozeloop/ai](./packages/cozeloop-ai) | CozeLoop API SDK | [![npm](https://img.shields.io/npm/v/@cozeloop/ai.svg)](https://www.npmjs.com/package/@cozeloop/ai) |
| [@cozeloop/langchain](./packages/cozeloop-langchain) | CozeLoop LangChain Integration | [![npm](https://img.shields.io/npm/v/@cozeloop/langchain.svg)](https://www.npmjs.com/package/@cozeloop/langchain) |

## 🎮 Examples

Find usage examples for each package in the [examples](./examples) directory:

- [cozeloop-ai-node](./examples/cozeloop-ai-node) - Node.js Demo for @cozeloop/ai

## 🚀 Getting Started

### Prerequisites

- Node.js 24+ (LTS/Krypton recommended)
- pnpm 10.27.0
- Rush 5.172.1

### Installation

1. **Install Node.js 24+**

``` bash
nvm install lts/krypton
nvm alias default lts/krypton # set default node version
nvm use lts/krypton
```

2. **Clone the repository**

``` bash
git clone git@github.com:coze-dev/cozeloop-js.git
```

3. **Install required global dependencies**

``` bash
npm i -g pnpm@10.27.0 @microsoft/rush@5.172.1
```

4. **Install project dependencies**

``` bash
rush update
```

5. **Build the project**

``` bash
rush build
```

After that, you can start to develop projects inside this repository.

Enjoy it!

## 🔨 Development

Each package in this monorepo can be developed and published independently. To start developing:

1. Navigate to the package directory:

``` bash
cd packages/<package-name>
```

2. Start development:

> use rushx instead of `pnpm run` or `npm run`

``` bash
rushx start
```

## 📖 Documentation

- [Official Documentation](https://loop.coze.cn/open/docs/cozeloop/quick-start-nodejs)
- [Contributing Guidelines](./CONTRIBUTING.md)

## 📄 License

[MIT](./LICENSE)
