# 🧭 CozeLoop CI tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CI tools.

## Quick Start

### 1. Installation

```sh
npm install -g @cozeloop/ci-tools
```

### 2. Basic Usage

1. Environment variables

|Param|Comment|Example|
|----|----|------|
|LARK_APP_ID|Lark app id, `secrets.LARK_APP_ID`|'cli_xxx'
|LARK_APP_SECRET|Lark app secret, `secrets.LARK_APP_SECRET`|'xxx'
|ISSUE_ACTION|Github issue action, `github.event.action`|'opened'
|ISSUE_NUMBER|Github issue number, `github.event.issue.number`|'3'
|ISSUE_URL|Github issue html url, github.event.issue.html_url|'https://github.com/coze-dev/cozeloop-python/issues/3'
|ISSUE_TITLE|Github issue title, `github.event.issue.title`|'如何将coze智能体的数据通过cozeloop上报'
|ISSUE_BODY|Github issue body, `github.event.issue.body`|'请官方给出coze智能体上报到cozeloop的样例'
|REPO_NAME|Github repo name, `github.repository`|'coze-dev/cozeloop-python'

2. `cozeloop-ci` Commands

> Command usage:
> * global command: run `cozeloop-ci -h` after installing @cozeloop/ci-tools
> * using npx: `npx -p @cozeloop/ci-tools cozeloop-ci -h`

* Overview: `cozeloop-ci -h`
* lark related: `cozeloop-ci lark [send-message|sync-issue] -h`


### 3. CI Usage

🌰 notify via lark when issue opened, reopened or closed.

```yaml
name: Issue sync

on:
  issues:
    types: ['opened', 'reopened', 'closed']
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    env:
      NODE_VERSION: '18'
      LARK_APP_ID: ${{ secrets.LARK_APP_ID }}
      LARK_APP_SECRET: ${{ secrets.LARK_APP_SECRET }}
      ISSUE_ACTION: ${{ github.event.action }}
      ISSUE_NUMBER: ${{ github.event.issue.number }}
      ISSUE_URL: ${{ github.event.issue.html_url }}
      ISSUE_TITLE: ${{ github.event.issue.title }}
      ISSUE_BODY: ${{ github.event.issue.body }}
      REPO_NAME: ${{ github.repository }}

    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install dep
        run: |
          npm install -g @cozeloop/ci-tools@0.0.1

      - name: Notification via lark
        run: |
          cozeloop-ci lark sync-issue \
          --email qihai@bytedance.com
```
