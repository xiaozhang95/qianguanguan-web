---
name: qianguanguan-frontend
description: Use ONLY when working on qianguanguan-web (钱罐罐 React 前端). Covers antd theme, layout, API patterns, routing, state management, and project conventions.
---

# 钱罐罐 前端开发规范

## 技术栈

- **框架**: React 19 + TypeScript 7 + Vite 8
- **UI 库**: Ant Design 6.5.1
- **图标**: @ant-design/icons
- **状态管理**: Redux Toolkit
- **路由**: React Router 7 (HashRouter)
- **HTTP**: 自定义 fetch 封装 (`@/utils/request`)
- **日期**: dayjs

## Ant Design 主题

使用 `ConfigProvider` 的 `theme` 属性配置全局主题，默认使用 antd primary 色系：

```tsx
import { ConfigProvider, theme } from 'antd'

<ConfigProvider
  locale={zhCN}
  theme={{
    algorithm: theme.defaultAlgorithm,
    token: {
      borderRadius: 6,
    },
  }}
>
  <App />
</ConfigProvider>
```

主题文档: https://ant.design/docs/react/customize-theme-cn

## 项目目录

| 路径 | 职责 |
|---|---|
| `src/api/` | API 接口层，每个模块一个文件 |
| `src/pages/` | 页面组件，每个页面一个文件夹 |
| `src/components/` | 共享组件 |
| `src/layouts/` | 布局组件 |
| `src/router/` | 路由配置 |
| `src/store/` | Redux Store (token + userInfo) |
| `src/utils/` | 工具（request 封装） |

## API 调用规范

所有 API 调用通过 `create<T>(options)` 统一封装，匹配后端 POST 约定：

```typescript
import create from '@/utils/request'

// 有参查询 —— POST + data
export async function billList(params: BillListParams) {
  return create<BillPage>({
    url: '/bill/list',
    method: 'POST',
    data: params,
    errorMsg: true
  })
}

// 新增/更新 —— POST/PUT + data
export async function billSave(data: BillSaveParams) {
  return create<BillVO>({
    url: '/bill',
    method: 'POST',
    data,
    errorMsg: true
  })
}

// 删除 —— DELETE + 路径参数
export async function billDelete(id: number) {
  return create<CtmResponse<null>>({
    url: `/bill/${id}`,
    method: 'DELETE',
    errorMsg: true
  })
}
```

- `create<T>()` 泛型 T 是 `data` 字段的类型
- `errorMsg: true` 开启自动错误提示
- 通过 `{ data }` 解构获取返回数据

## 路由与权限

```typescript
// router/index.tsx
const routes = [
  {
    path: RoutePath.Bill,
    meta: {
      title: '账单',
      Icon: WalletOutlined,
      permissions: [Permission.SUPER_ADMIN, Permission.ADMIN, Permission.USER]
    },
    Component: lazy(() => import('@/pages/bill'))
  }
]
```

- 页面组件使用 `React.lazy()` 懒加载
- 路由路径统一从 `router/routes.ts` 的 `RoutePath` 常量引用
- `meta.permissions` 控制角色可见性
- `meta.Icon` 接收 antd 图标组件

## 布局

Layout 使用 antd `Layout.Sider` + `Layout.Header` + `Layout.Content` 结构：

- **Sider**: 固定在左侧，可折叠，包含 Logo + 菜单
- **Header**: sticky 顶部，包含折叠按钮 + 面包屑 + 用户头像下拉
- **Content**: `padding: 24px` 内容区

用户头像区域使用 `Dropdown` 组件放置退出登录选项。

## 状态管理

```typescript
// store/index.ts
export interface RootState {
  token: string           // JWT token, 持久化到 localStorage
  userInfo: UserInfo | null  // 当前用户信息
}
```

- `token` 通过 `setToken()` 写入 Redux + localStorage
- `userInfo` 通过 `setUserInfo()` 写入 Redux（登陆后由 LoadAuth 组件获取）

## 环境变量

```
VITE_REQUEST_BASE_URL=/api/business     # API 基础路径
VITE_REQUEST_TIMEOUT=60000              # 请求超时
VITE_NAME=钱罐罐                         # 应用名称
```

开发环境通过 `vite.config.ts` 的 proxy 转发到 `http://localhost:8888`。

## 样式约定

- 不使用独立 CSS/SCSS 文件
- 样式通过 antd 组件 props 和 `style` 属性内联
- 主题色通过 `ConfigProvider theme` 全局控制
