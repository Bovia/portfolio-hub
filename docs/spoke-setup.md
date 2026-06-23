# 子项目接入 Portfolio Hub 清单

> **原则**：统一规范写在 **portfolio-hub** 本仓库；子项目按本文改一遍即可，不必在 Hub 加额外字段。

---

## 一、Hub 侧（portfolio-hub 维护者）

1. `projects.config.ts` 增加 `slug` + `repo`
2. 确认子项目根目录有 `portfolio.md` 且 `published: true`

---

## 二、子项目侧（每个项目做一次）

### 必做

- [ ] 根目录创建 / 维护 `portfolio.md`（见 [portfolio-contract.md](./portfolio-contract.md)）
- [ ] 复制模板 `docs/spoke-templates/portfolio.md.example` 作起点
- [ ] 部署到 Vercel，`demoUrl` 与线上一致

### 有登录 / 用户名门槛时必做

- [ ] 支持 `?embed=1` → 跳过首屏登录，guest 本地体验（见 [guest-demo-mode.md](./guest-demo-mode.md)）
- [ ] 登录改为可选（设置 / 顶栏「登录云同步」）
- [ ] **禁止** guest 写入数据库

按技术栈选模板：

| 栈 | 模板目录 |
|----|----------|
| Next.js（UsernameGate） | `docs/spoke-templates/nextjs/` |
| Vue 单页（锁屏） | 参考 `ruankao-senior`（jiyiqi） |
| 纯静态 | 通常无需改 embed |

### 建议

- [ ] 根目录 `CLAUDE.md` 粘贴 [spoke-templates/CLAUDE.md.snippet](./spoke-templates/CLAUDE.md.snippet)
- [ ] 自测：`https://你的域名/?embed=1` 可直接进入主界面

---

## 三、文件复制对照

```
portfolio-hub/docs/spoke-templates/nextjs/
  ├── portfolio-embed.ts    →  src/lib/portfolio-embed.ts
  ├── guest-progress.ts     →  src/lib/guest-progress.ts
  └── embed-banner.tsx      →  src/components/user/embed-banner.tsx
```

然后按各项目 API 形状，在 `UsernameGate`、`use-user`、列表页、练习页接 guest 分支（中项 / 金融已落地，可直接对照仓库）。

---

## 四、当前项目状态

| 项目 | embed | published 字段 |
|------|-------|----------------|
| ruankao-senior（高项） | ✅ | 待加 |
| softexam-30d（中项） | ✅ | 待加 |
| financial_basic_practice | ✅ | 待加 |
| clinic_tools | 无需（无登录） | 待加 |
| be-young | 待定 | 待加 |
