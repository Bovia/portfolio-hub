# Portfolio Hub 多项目聚合架构

> 核心思路：**各项目代码独立、各自部署，只通过 `portfolio.md` 契约 + 中心 Hub 聚合展示**——不是把代码合并进一个 monorepo。

---

## 整体架构：Hub + Spoke（联邦式聚合）

```mermaid
flowchart TB
    subgraph 独立项目仓库["各项目 GitHub 仓库（代码互不合并）"]
        P1["financial_basic_practice\n├── 应用代码\n├── Vercel 独立部署\n└── portfolio.md"]
        P2["softexam-30d\n└── portfolio.md"]
        P3["be-young\n└── portfolio.md"]
        P4["ruankao-senior\n└── portfolio.md"]
        P5["clinic_tools\n└── portfolio.md"]
    end

    subgraph 唯一合并点["Portfolio Hub（portfolio-hub）"]
        CFG["projects.config.ts\nslug ↔ repo 映射表"]
        GH["lib/github.ts\n拉取 raw portfolio.md"]
        POSTS["lib/posts.ts\n解析 frontmatter + 聚合排序"]
        HOME["app/page.tsx\n首页项目卡片网格"]
        DETAIL["app/projects/[slug]/page.tsx\n详情页 MDX + Demo 预览"]
    end

    subgraph 对外展示["用户看到的"]
        USER["访问 portfolio-hub"]
        CARD["首页：精选作品卡片"]
        PAGE["详情页：文章 + iframe 在线 Demo"]
    end

    P1 & P2 & P3 & P4 & P5 -->|"GitHub Raw API\n每小时 revalidate"| GH
    CFG --> POSTS
    GH --> POSTS
    POSTS --> HOME & DETAIL
    HOME --> CARD
    DETAIL --> PAGE
    USER --> CARD & PAGE
    P1 & P2 & P3 & P4 & P5 -.->|"demoUrl 指向各自 Vercel"| PAGE
```

---

## 数据流：从配置到页面

```mermaid
sequenceDiagram
    participant Dev as 你在各项目仓库
    participant GH as GitHub Raw
    participant Hub as Portfolio Hub
    participant User as 访客

    Dev->>Dev: 维护 portfolio.md<br/>(frontmatter + 正文)
    Dev->>Dev: 应用独立部署到 Vercel

    Note over Hub: 构建 / 请求时
    Hub->>Hub: 读取 projects.config.ts
    loop 每个项目并行 fetch
        Hub->>GH: GET /{repo}/main/portfolio.md
        GH-->>Hub: Markdown 原文
    end
    Hub->>Hub: gray-matter 解析<br/>title / tags / demoUrl ...
    Hub->>Hub: 按 date 排序

    User->>Hub: GET /
    Hub-->>User: 项目卡片列表

    User->>Hub: GET /projects/{slug}
    Hub-->>User: MDX 文章 + iframe(demoUrl)
```

---

## 各层职责划分

```mermaid
flowchart LR
    subgraph 项目侧["各项目负责"]
        A1["业务功能开发"]
        A2["独立 CI/CD 部署"]
        A3["维护 portfolio.md"]
    end

    subgraph Hub侧["Portfolio Hub 负责"]
        B1["注册 slug → repo"]
        B2["拉取 & 缓存内容"]
        B3["统一展示 UI"]
        B4["SEO / 导航 / 品牌"]
    end

    subgraph 不合并["刻意不做"]
        C1["❌ 合并代码库"]
        C2["❌ 共享依赖"]
        C3["❌ 统一部署"]
    end

    A1 & A2 & A3 -.->|"只通过 portfolio.md 连接"| B1 & B2 & B3
```

---

## `portfolio.md` 契约（唯一的「合并协议」）

每个项目仓库根目录放同一个格式的文件，Hub 只认这一份：

```yaml
---
title: "项目名"
description: "一句话介绍"
tags: ["Next.js", "TypeScript"]
thumbnail: "/thumbnails/xxx.png"
demoUrl: "https://xxx.vercel.app/"    # 各自独立部署地址
githubUrl: "https://github.com/Bovia/xxx"
date: "2024-03"
---

## 为什么做这个
正文 Markdown，Hub 用 MDX 渲染
```

Hub 侧注册只需在 `projects.config.ts` 加一条：

```typescript
{
  slug: "my-new-project",
  repo: "Bovia/my-new-project",
  // branch: "main",  // 可选，默认 main
}
```

---

## 新增项目流程

```mermaid
flowchart TD
    S1["1. 在新仓库根目录创建 portfolio.md"]
    S2["2. 项目照常部署到 Vercel，demoUrl 写进 frontmatter"]
    S3["3. projects.config.ts 加 slug + repo"]
    S4["4. Hub 重新部署 → 自动出现在首页"]

    S1 --> S2 --> S3 --> S4
```

---

## 关键代码路径

| 文件 | 职责 |
|------|------|
| `projects.config.ts` | 项目注册表：slug ↔ GitHub repo |
| `lib/github.ts` | 从 GitHub Raw 拉取 `portfolio.md`，1 小时 revalidate |
| `lib/posts.ts` | 并行 fetch 所有项目，解析 frontmatter，按 date 排序 |
| `app/page.tsx` | 首页 Hero + 项目卡片网格 |
| `app/projects/[slug]/page.tsx` | 详情页：MDX 正文 + iframe Demo 预览 |
| `components/ProjectCard.tsx` | 首页卡片组件 |
| `components/MDXWrapper.tsx` | Markdown 正文渲染 |

---

## 设计要点总结

| 维度 | 策略 |
|------|------|
| **代码** | 各仓库完全独立，零侵入 |
| **部署** | 每个项目各自 Vercel；Hub 只做展示层 |
| **内容同步** | GitHub Raw 拉取 `portfolio.md`，1 小时缓存 |
| **扩展成本** | 新项目 = 1 个 md 文件 + 1 行 config |
| **展示** | 首页卡片 → 详情页（故事 + iframe 实时 Demo） |

---

## 一句话总结

不是把多个项目「揉」成一个仓库，而是用一个轻量 Hub 把分散在各处的「作品说明书 + 在线 Demo」统一呈现。
