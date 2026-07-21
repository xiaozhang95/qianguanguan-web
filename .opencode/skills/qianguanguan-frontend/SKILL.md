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
| `src/constants/` | 领域常量（BillType 等） |

## 常量定义规范

**所有领域枚举值必须定义为常量**，禁止在代码中直接使用字符串字面量做比较或赋值。

```typescript
// src/constants/index.ts
export const BillType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const

export type BillType = (typeof BillType)[keyof typeof BillType]

export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}
```

使用示例：
```typescript
import { BillType, BillTypeLabel } from '@/constants'

// 比较
record.type === BillType.INCOME

// 显示标签
BillTypeLabel[type as BillType]

// 表单默认值
form.setFieldsValue({ type: BillType.EXPENSE })
```

## 路由与权限

**所有路由路径必须从 `RoutePath` 常量引用**，禁止硬编码路径字符串。

```typescript
// router/routes.ts
export const RoutePath = {
  Home: '/',
  Login: '/login',
  Bill: '/bill',
  Category: '/category'
} as const
```

```typescript
// router/index.tsx - 路由定义
const routes = [
  { path: RoutePath.Bill, meta: { title: '账单', Icon: WalletOutlined, permissions: [...] }, Component: Bill },
]

// 页面跳转
nav(RoutePath.Login, { replace: true })
```

- 新增路由必须先添加 `RoutePath` 常量，再在 routes 数组中引用
- 页面组件使用 `React.lazy()` 懒加载
- `meta.permissions` 控制角色可见性

## Ant Design 主题

使用 `ConfigProvider` 的 `theme` 属性配置全局主题，默认使用 antd primary 色系：

```tsx
import { ConfigProvider, theme } from 'antd'

<ConfigProvider
  locale={zhCN}
  theme={{
    algorithm: theme.defaultAlgorithm,
    token: { borderRadius: 6 },
  }}
>
  <App />
</ConfigProvider>
```

**组件内获取主题 Token**：通过 `theme.useToken()` 获取当前主题色，用于 Logo 图标填充色、文字高亮等：

```tsx
import { theme } from 'antd'

const { token } = theme.useToken()
<Icon name="logo" fill={token.colorPrimary} />
<span style={{ color: token.colorPrimary }}>标题</span>
```

主题文档: https://ant.design/docs/react/customize-theme-cn

## 布局

Layout 使用 antd `Layout.Sider` + `Layout.Header` + `Layout.Content` 结构：

- **Sider**: 固定左侧，包含 Logo（fill 使用 `token.colorPrimary`） + 应用名称（从 `import.meta.env.VITE_NAME` 读取，颜色使用 `token.colorPrimary`） + 导航菜单
- **Header**: sticky 顶部，仅保留用户头像下拉菜单（退出登录）
- **Content**: `padding: 24px` 内容区
- 不使用面包屑导航
- 不使用侧边栏折叠按钮

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

所有可配置文本（应用名称等）必须通过环境变量引用，不可硬编码：

| 变量 | 说明 |
|---|---|
| `VITE_NAME` | 应用名称，在布局 Logo 旁显示 |
| `VITE_REQUEST_BASE_URL` | API 基础路径 `/api/business` |
| `VITE_REQUEST_TIMEOUT` | 请求超时 60000ms |

开发环境通过 `vite.config.ts` 的 proxy 转发到 `http://localhost:8888`。

## 样式约定

- 不使用独立 CSS/SCSS 文件
- 布局容器使用 antd `<Flex>` 组件，禁止 `style={{ display: 'flex' }}` 内联
- 所有颜色使用 `token.colorXxx`（如 `token.colorSuccess`、`token.colorError`、`token.colorPrimary`）
- 字体大小使用 `token.fontSizeXxx`（如 `token.fontSizeHeading5`）
- 间距使用 `token.marginXxx` / `token.paddingXxx`
- 圆角使用 `token.borderRadiusXxx`
- 阴影使用 `token.boxShadowXxx`

示例：
```tsx
import { Flex, theme } from 'antd'

const { token } = theme.useToken()

<Flex align="center" justify="center" gap={token.marginXS}>
  <span style={{ fontSize: token.fontSizeHeading5, color: token.colorPrimary }}>标题</span>
</Flex>
```，组件内通过 `theme.useToken()` 获取
