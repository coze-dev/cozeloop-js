# 🧭 CozeLoop CI tools

[![npm version](https://img.shields.io/npm/v/%40cozeloop%2Fci-tools)](https://www.npmjs.com/package/@cozeloop/ci-tools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CI tools.

## Quick Start

### 1. Installation

```sh
npm install -g @cozeloop/ci-tools
```

### 2. Usage

> Command usage:
>
> - global command: run `cozeloop-ci -h` after installing @cozeloop/ci-tools
> - using npx: `npx -p @cozeloop/ci-tools cozeloop-ci -h`

- Overview: `cozeloop-ci -h`
- lark related: `cozeloop-ci lark [send-message|sync-issue|sync-pr] -h`

## Command: `cozeloop-ci lark`

Using lark app id and secret to authenticate for all sub commands.

| Param           | Comment                                      | Example    |
| --------------- | -------------------------------------------- | ---------- |
| LARK_APP_ID     | Lark app id, `secrets.LARK_APP_ID`           | 'cli_xxx'  |
| LARK_APP_SECRET | Lark app secret, `secrets.LARK_APP_SECRET`   | 'xxx'      |

### 1. `cozeloop-ci lark sync-issue`

Synchronize GitHub issue via lark, with params:

|Param|Comment|Example|
|----|----|------|
|REPO_NAME|repo name, `github.repository`|'coze-dev/cozeloop-python'|
|ISSUE_ACTION|issue action, `github.event.action`|'opened'|
|ISSUE_NUMBER|issue number, `github.event.issue.number`|3|
|ISSUE_URL|issue html url, `github.event.issue.html_url`|`https://github.com/coze-dev/cozeloop-python/issues/3`|
|ISSUE_TITLE|issue title, `github.event.issue.title`|'如何将coze智能体的数据通过cozeloop上报'|
|ISSUE_BODY|issue body, `github.event.issue.body`|'请官方给出coze智能体上报到cozeloop的样例'|

🌰 Setup github workflow to notify via lark when issue opened, reopened or closed.

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
          npm install -g @cozeloop/ci-tools

      - name: Notification via lark
        run: |
          cozeloop-ci lark sync-issue \
          --email <email1> <email2>
```

### 2. `cozeloop-ci lark sync-pr`

Synchronize GitHub PR(Pull Request) via lark, with params:

|Param|Comment|Example|
|----|----|------|
|REPO_NAME|repo name, `github.repository`|'coze-dev/cozeloop-python'|
|PR_ACTION|pr action, `github.event.action`|'opened'|
|PR_NUMBER|pr number, `github.event.pull_request.number`|3|
|PR_URL|pr html url, `github.event.pull_request.html_url`|`https://github.com/coze-dev/cozeloop-python/pull/1`|
|PR_TITLE|pr title, `github.event.pull_request.title`|'如何将coze智能体的数据通过cozeloop上报'|
|PR_SENDER|pr sender, `github.event.sender`|'xxx'|
|PR_SOURCE_OWNER|pr source owner, `github.event.pull_request.head.repo.owner.login`|'xxx'|
|PR_SOURCE_REF|pr source ref, `github.event.pull_request.head.ref`|'xxx'|
|PR_TARGET_OWNER|pr target owner, `github.event.pull_request.base.repo.owner.login`|'xxx'|
|PR_TARGET_REF|pr target ref, `github.event.pull_request.base.ref`|'xxx'|
|PR_MERGED|pr merged, `github.event.pull_request.merged`|'xxx'|

🌰 Setup github workflow to notify via lark when PR opened, reopened or closed.

```yaml
name: PR Notification

on:
  pull_request:
    types: ['opened', 'reopened', 'closed']

jobs:
  sync:
    name: Send Lark Message
    runs-on: ubuntu-latest
    env:
      NODE_VERSION: '18'
      LARK_APP_ID: ${{ secrets.COZELOOP_LARK_APP_ID }}
      LARK_APP_SECRET: ${{ secrets.COZELOOP_LARK_APP_SECRET }}
      REPO_NAME: ${{ github.repository }}
      PR_ACTION: ${{ github.event.action }}
      PR_URL: ${{ github.event.pull_request.html_url }}
      PR_NUMBER: ${{ github.event.pull_request.number }}
      PR_TITLE: ${{ github.event.pull_request.title }}
      PR_SENDER: ${{ github.event.sender }}
      PR_SOURCE_OWNER: ${{ github.event.pull_request.head.repo.owner.login }}
      PR_SOURCE_REF: ${{ github.event.pull_request.head.ref }}
      PR_TARGET_OWNER: ${{ github.event.pull_request.base.repo.owner.login }}
      PR_TARGET_REF: ${{ github.event.pull_request.base.ref }}
      PR_MERGED: ${{ github.event.pull_request.merged }}

    steps:
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install ci-tools
        run: |
          npm install -g @cozeloop/ci-tools

      - name: Notify via lark
        run: |
          cozeloop-ci lark sync-pr \
          --chat-id <oc_xxx>
```
