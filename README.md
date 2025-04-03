# Loop Monorepo

English | [简体中文](./README.zh-CN.md)

## 📦 Packages

This monorepo contains the following packages:

| Package | Description | Version |
|---------|------------|---------|
| [@cozeloop/ai](./packages/cozeloop-ai) | Coze API SDK | [![npm](https://img.shields.io/npm/v/@cozeloop/ai.svg)](https://www.npmjs.com/package/@cozeloop/ai) |


## 🎮 Examples

Find usage examples for each package in the [examples](./examples) directory:

- [cozeloop-ai-node](./examples/cozeloop-ai-node) - Node.js Demo for @cozeloop/ai


## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS/Hydrogen recommended)
- pnpm 9.12.0
- Rush 5.140.0

### Installation

1. **Install Node.js 18+**

``` bash
nvm install lts/hydrogen
nvm alias default lts/hydrogen # set default node version
nvm use lts/hydrogen
```

2. **Clone the repository**

``` bash
git clone git@github.com:coze-dev/coze-js.git
```

3. **Install required global dependencies**

``` bash
npm i -g pnpm@9.12.0 @microsoft/rush@5.140.0
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

``` bash
npm run start
```

## 📖 Documentation

<!-- - [Official Documentation](https://www.coze.com/docs/developer_guides/nodejs_overview) -->
- [Contributing Guidelines](./CONTRIBUTING.md)
<!-- - [How to publish](./docs/publish.md) -->

## 📄 License

[MIT](./LICENSE)

