# 子项目 Portfolio 演示模式接入指南

> Hub 在 iframe 嵌入时会自动给 `demoUrl` 加上 `?embed=1`。  
> 子项目识别该参数后：**跳过登录、直接进主界面**，登录改为可选（仅用于云同步）。

---

## 协议（Hub ↔ 子项目）

| 项 | 约定 |
|----|------|
| URL 参数 | `embed=1` |
| 谁加参数 | Portfolio Hub `DemoPreview` 自动追加 |
| `portfolio.md` | **不需要**额外字段 |
| 直接访问 demoUrl | 行为不变（仍可要求登录） |

示例：

```text
https://your-app.vercel.app/?embed=1
```

---

## 子项目必做三件事

### 1. 识别 embed 模式

```js
function isPortfolioEmbed() {
  try {
    return new URLSearchParams(window.location.search).get("embed") === "1";
  } catch {
    return false;
  }
}
```

### 2. 跳过首屏登录

```js
// 伪代码：mounted / 路由守卫
if (!hasLocalUser()) {
  if (isPortfolioEmbed()) {
    initGuestUser(); // localStorage，不写 DB
  } else {
    showLoginScreen();
  }
}
```

`guest` 用户 ID 仅存在访客浏览器本地，**不要**在服务端创建默认账号。

### 3. 写 API 必须 gated

```js
// 有 token 才写 DB
if (ApiClient.isLoggedIn()) {
  await ApiClient.saveAnswers(...);
}
// 否则只写 localStorage（现有离线逻辑复用即可）
```

---

## 推荐 UI

### 嵌入且未登录

- 顶部轻提示条：`演示模式 · 数据仅保存在本浏览器`
- 按钮：`登录云同步` → 弹出原有登录框
- 登录框可提供 `继续本地体验` 取消

### 设置菜单

| 状态 | 菜单项 |
|------|--------|
| embed + 未登录 | **登录 / 云同步** |
| 已登录 | **退出登录**（embed 下退出 = 回到 guest，不锁屏） |

### 独立访问（无 embed）

- 保持原有登录流程，不必改

---

## 不要做的事

- ❌ 共享 `demo` 默认账号写 DB
- ❌ 在 Hub 的 `portfolio.md` 加 `guestDemo` 字段
- ❌ embed 模式下强制注册

---

## 参考实现

首个落地项目：**jiyiqi**（`Bovia/ruankao-senior`）

| 文件 | 改动 |
|------|------|
| `app.js` | `isPortfolioEmbed()`、embed 时 `_initFreshUser('guest')`、`openCloudLogin()` |
| `index.html` | 演示提示条、条件渲染登录/退出 |
| `styles.css` | `.embed-demo-banner` |

---

## 自测清单

- [ ] `https://xxx.vercel.app/?embed=1` 直接进入主界面，无登录挡屏
- [ ] 刷题 / 浏览核心功能可用，数据写 localStorage
- [ ] 未登录时不触发 DB 写请求（Network 面板确认）
- [ ] 点击「登录云同步」可正常登录，登录后云同步恢复
- [ ] 直接打开 `https://xxx.vercel.app/`（无 embed）行为与改前一致
- [ ] Portfolio Hub 详情页 iframe 预览正常

---

## 给其他项目的复制说明（短版）

在子项目里搜「登录挡屏 / lock screen / requireAuth」的入口，加上：

1. `embed=1` → 自动 guest，localStorage only  
2. 登录收到设置里，文案写「登录 / 云同步」  
3. 所有写 DB 的 API 调用包在 `isLoggedIn()` 里  

Hub 侧已自动带参，**子项目改完部署即可**，无需改 Hub config。
