# 项目长期约定（MEMORY.md）

## 自动提交约定（用户明确要求）
每次在本项目改完代码，必须自动执行：
1. 递增 `package.json` 的 `version`（规则见下）；
2. `git add -A`；
3. `git commit -m "<类型>(<模块>): <说明> 版本升至 x.y.z"`；
4. `git push origin main`（凭据已存本机 GCM，无需 token）。

## 版本号规则
- 小型修复 / 文案调整 → patch（x.y.Z+1）；
- 功能 / 页面级改动 → minor（x.Y+1.0）；
- 破坏性改动 → major（X+1.0.0）。
- 首次发布记为 1.0.0。

## Git 仓库信息
- 远程：`https://github.com/Kui0105/1261-04-pcue.ue.ehaiba.net.git`，分支 `main`。
- 提交者：Kui0105 <951377877@qq.com>（本机 git 默认身份）。
- **认证方案（关键）**：本机 Git Credential Manager 在无交互 shell 会拦截并丢弃身份，导致 push 401/失败。已采用如下可靠方案：
  - `origin` 远程 URL 已写入 PAT：`https://Kui0105:<token>@github.com/Kui0105/1261-04-pcue.ue.ehaiba.net.git`（明文仅存于本机 `.git/config`，不提交）。
  - 本仓库已 `git config --local credential.helper ""` 清空凭据助手，使 push 直接用 URL 内 token、不调用 GCM。
  - 后续自动提交命令：`git add -A` → `git commit -m "..."` → `git push origin main`（**不要**加 `GIT_TERMINAL_PROMPT=0` 或依赖 GCM，`-c credential.helper=` 亦可）。
  - PAT 轮换时：`git remote set-url origin https://Kui0105:<newtoken>@github.com/...`。

## 技术栈速记
- Vue3 + Vite + TypeScript + Element Plus + Pinia + vue-router + ECharts(vue-echarts)。
- 接口封装：`src/utils/request`（axios，GET 用 `request.get({url, params})`）。
- workbench 页：`src/views/workbench/index.vue`，后端接口 `/workbench/index`。
