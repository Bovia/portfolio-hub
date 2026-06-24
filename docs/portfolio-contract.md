# portfolio.md 契约

各子项目仓库根目录的 `portfolio.md` 是 Portfolio Hub **唯一内容协议**。Hub 通过 GitHub Raw 拉取，不合并代码。

---

## Frontmatter 字段

```yaml
---
title: "项目名"
description: "一句话介绍"
published: true              # 默认 true；开发中可改为 false
demoUrl: "https://xxx.vercel.app/"
githubUrl: "https://github.com/Bovia/xxx"
date: "2026-06"
tags:
  - Next.js
  - TypeScript
devices:                     # 可选，Hub 预览轮播设备
  - desktop
  - mobile
  - tablet
  # - miniprogram
---
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 卡片与详情页标题 |
| `description` | ✅ | 一句话摘要 |
| `published` | 否 | 默认 `true`；`false` 时 Hub 首页与详情页均不可见 |
| `demoUrl` | 建议 | 独立部署地址；无则详情页无 iframe |
| `githubUrl` | 建议 | 默认可从 Hub `projects.config.ts` 推断 |
| `date` | 建议 | 排序，格式 `YYYY-MM` |
| `tags` | 否 | 技术栈标签 |
| `devices` | 否 | `desktop` / `mobile` / `tablet` / `miniprogram` |

---

## 正文结构（推荐四段）

```markdown
## 为什么做这个

## 它解决了什么

## 一个值得说的技术决定

## 结果
```

---

## 为什么叫 `published`

| 候选 | 说明 |
|------|------|
| **`published`（采用）** | 静态站点 / CMS 通用语义：「是否对外展示」；与 Git push 无关 |
| `visible` | 偏 UI，不够表达「作品集上架」 |
| `featured` | 更像「精选推荐」，无法表达「开发中隐藏」 |

**设计原则（opt-out）：**

- Hub 解析时**未写字段 = `true`**，老项目无需迁移
- 子项目建议**显式写 `published: true`**，一眼可知状态
- 开发中改为 `published: false` → Hub 首页不展示、详情页 404
- `projects.config.ts` 只管「注册拉取」，不管展示；可先注册、后公开

---

## Hub 注册

在 `portfolio-hub/projects.config.ts` 增加 slug ↔ repo（与 `published` 无关，未发布项目也可先注册）：

```typescript
{ slug: "my-app", repo: "Bovia/my-app" }
```

---

## 子项目还需配合（不在 portfolio.md 里写）

| 能力 | 说明 |
|------|------|
| `?embed=1` | Hub iframe 自动附加；有登录的项目须支持 guest 模式 |
| `CLAUDE.md` | 可选，指向本仓库 `docs/spoke-setup.md` |

详见 [spoke-setup.md](./spoke-setup.md)、[guest-demo-mode.md](./guest-demo-mode.md)。
