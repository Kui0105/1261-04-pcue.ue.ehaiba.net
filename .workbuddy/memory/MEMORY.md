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
- 远程：`https://github.com/Kui0105/1261-04-pcue.ue.ehaiba.net.git`
- 主分支：`main`
- 提交者：Kui0105 <951377877@qq.com>（本机 git 默认身份）
- 写权限 PAT 已缓存于 Git Credential Manager；`.git/config` 的 remote URL 不含 token。

## 技术栈速记
- Vue3 + Vite + TypeScript + Element Plus + Pinia + vue-router + ECharts(vue-echarts)。
- 接口封装：`src/utils/request`（axios，GET 用 `request.get({url, params})`）。
- workbench 页：`src/views/workbench/index.vue`，后端接口 `/workbench/index`。
