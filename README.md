# CozeLoop Monorepo

[![codecov](https://codecov.io/gh/coze-dev/cozeloop-js/branch/main/graph/badge.svg)](https://codecov.io/gh/coze-dev/cozeloop-js)
[![CI](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/coze-dev/cozeloop-js/actions/workflows/ci.yml)

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

- Node.js 18+ (LTS/Hydrogen recommended)
- pnpm 9.12.0
- Rush 5.150.0

### Installation

1. **Install Node.js 18+**

``` bash
nvm install lts/hydrogen
nvm alias default lts/hydrogen # set default node version
nvm use lts/hydrogen
```

2. **Clone the repository**

``` bash
git clone git@github.com:coze-dev/cozeloop-js.git
```

3. **Install required global dependencies**

``` bash
npm i -g pnpm@9.12.0 @microsoft/rush@5.150.0
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

- [Contributing Guidelines](./CONTRIBUTING.md)

## 📄 License

[MIT](./LICENSE)

