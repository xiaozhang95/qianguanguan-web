---
name: qianguanguan-frontend
description: Use ONLY when working on qianguanguan-web (钱罐罐 React 前端). Covers antd theme, layout, API patterns, routing, state management, and project conventions.
---

# 钱罐罐 前端开发规范

## 技术栈

- **框架**: React 19 + TypeScript 7 + Vite 8
- **UI 库**: Ant Design 6.5.1
- **图表库**: recharts
- **图标**: @ant-design/icons
- **状态管理**: Redux Toolkit
- **路由**: React Router 7 (HashRouter)
- **HTTP**: 自定义 fetch 封装 (`@/utils/request`)
- **日期**: dayjs（需在 main.tsx 中配置 `dayjs.locale('zh-cn')`）

## 项目目录

| 路径 | 职责 |
|---|---|
| `src/api/` | API 接口层，每个模块一个文件 |
| `src/pages/` | 页面组件，每个页面一个文件夹 |
| `src/components/` | 共享组件（ErrorBoundary、Loading、Icon） |
| `src/layouts/` | 布局组件 |
| `src/router/` | 路由配置 |
| `src/store/` | Redux Store (token + userInfo) |
| `src/utils/` | 工具（request 封装、DefaultPagination） |
| `src/constants/` | 领域常量（BillType、Role、UserStatus 等） |

## 常量定义规范

**所有领域枚举值必须定义为常量**，禁止在代码中直接使用字符串字面量或魔法数字做比较或赋值。

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

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const
export type Role = (typeof Role)[keyof typeof Role]
export const RoleLabel: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '超级管理员',
  [Role.ADMIN]: '管理员',
  [Role.USER]: '用户'
}

export const UserStatus = {
  ENABLED: 1,
  DISABLED: 0
} as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]
export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ENABLED]: '启用',
  [UserStatus.DISABLED]: '禁用'
}
```

使用示例：
```typescript
import { BillType, BillTypeLabel, Role, RoleLabel, UserStatus, UserStatusLabel } from '@/constants'

record.type === BillType.INCOME
BillTypeLabel[type as BillType]
record.role === Role.SUPER_ADMIN
<Tag color={role === Role.SUPER_ADMIN ? 'orange' : role === Role.ADMIN ? 'processing' : 'default'}>
  {RoleLabel[role as Role]}
</Tag>
record.status === UserStatus.ENABLED
```

## 路由与权限

**所有路由路径必须从 `RoutePath` 常量引用**，禁止硬编码路径字符串。

路由配置使用 `Role` 常量控制菜单可见性，字段名为 `roles`（`Role[]`）。支持菜单分组（`type: 'group'`）。

```typescript
// router/index.tsx
{
  type: 'group',
  meta: { title: '系统设置', Icon: SettingOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
  children: [
    { path: RoutePath.Users, meta: { title: '用户列表', Icon: TeamOutlined, roles: [Role.SUPER_ADMIN, Role.ADMIN] }, Component: Users },
  ]
}
```

- 新增路由必须先添加 `RoutePath` 常量，再在 routes 数组中引用
- 页面组件使用 `React.lazy()` 懒加载
- 支持 404 兜底路由 `path="*"`

## Ant Design 主题

全局使用暗黑主题 `darkAlgorithm`，通过 `ConfigProvider` 配置：

```tsx
import { ConfigProvider, theme } from 'antd'

<ConfigProvider
  locale={zhCN}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: { borderRadius: 6 },
  }}
>
  <App />
</ConfigProvider>
```

**组件内获取主题 Token**：通过 `theme.useToken()` 获取当前主题色：

```tsx
const { token } = theme.useToken()
```

主题文档: https://ant.design/docs/react/customize-theme-cn

## 布局

Layout 使用 antd `Layout.Sider` + `Layout.Header` + `Layout.Content` 结构：

- **Sider**: 固定左侧，包含 Logo（`fill={token.colorPrimary}`）+ 应用名称（`import.meta.env.VITE_NAME`，颜色 `token.colorText`）+ 导航菜单
- **Header**: sticky 顶部，仅保留用户名下拉（`<Button type="text">` + `<DownOutlined />`）
- **Content**: `padding: token.paddingLG`，包含 `<ErrorBoundary>` + `<Suspense>` + `<Outlet>`
- 不使用面包屑导航，不使用侧边栏折叠按钮

菜单支持分组，选中态通过 `activeKey` / `openKeys` 状态管理。

## API 调用规范

所有查询类接口使用 POST + JSON body，通过 `create<T>(options)` 封装：

```typescript
// 查询 —— POST + data
export async function billList(params: BillListParams) {
  return create<BillPage>({
    url: '/bill/list',
    method: 'POST',
    data: params,
    errorMsg: true
  })
}

// 新增 —— POST + data
export async function billSave(data: BillSaveParams) {
  return create<BillVO>({
    url: '/bill',
    method: 'POST',
    data,
    errorMsg: true
  })
}

// 更新 —— PUT + 路径参数 + data
export async function billUpdate(id: number, data: BillSaveParams) {
  return create<BillVO>({
    url: `/bill/${id}`,
    method: 'PUT',
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
- 分页默认值使用 `DefaultPagination.PageNum` / `DefaultPagination.PageSize`

## 样式约定

- 不使用独立 CSS/SCSS 文件
- 布局容器使用 `<Flex>` 组件，禁止 `style={{ display: 'flex' }}` 和 `<Row>`/`<Col>`
- 所有颜色使用 `token.colorXxx`
- 字体大小使用 `token.fontSizeXxx`
- 间距使用 `token.marginXxx` / `token.paddingXxx`
- 圆角使用 `token.borderRadiusXxx`
- Tag 颜色使用 antd 预设：`'success'` / `'error'` / `'processing'` / `'orange'` / `'default'`
- 废弃 API：`valueStyle` → `styles={{ value: {...} }}`，`destroyOnClose` → 移除

## 处理函数约定

简单的事件处理逻辑内联到 JSX 中，避免单独定义 handle 函数。只在多次引用的逻辑（如 fetch 函数）才抽离为独立函数：

```tsx
// 推荐：内联
<Button onClick={() => { setEditingBill(null); form.resetFields(); setDrawerOpen(true) }}>新增</Button>

// 避免：独立的 handleAdd
const handleAdd = () => { ... }
<Button onClick={handleAdd}>新增</Button>
```

## 日期格式化

- 账单日期显示：`dayjs(d).format('YYYY-MM-DD')`
- 创建时间显示：`dayjs(t).format('YYYY-MM-DD HH:mm:ss')`
- 图表 X 轴：`dayjs(d).format('D日')`
- 前端传入后端的日期必须是 `YYYY-MM-DD` 格式字符串

## 环境变量

所有可配置文本必须通过环境变量引用：

| 变量 | 说明 |
|---|---|
| `VITE_NAME` | 应用名称（Layout Logo旁、登录页底部） |
| `VITE_USERNAME` | 默认登录用户名 |
| `VITE_PASSWORD` | 默认登录密码 |
| `VITE_REQUEST_BASE_URL` | API 基础路径 `/api/business` |

## 错误处理

- Layout 内使用 `ErrorBoundary` 包裹内容区
- 404 页面使用 antd `Empty` 组件 + 返回首页按钮

## 数据刷新

从其他页面返回首页时需要重新拉取数据，useEffect 依赖使用 `[location.pathname]` 确保路由切换时刷新：

```typescript
const location = useLocation()
useEffect(() => { fetchData() }, [location.pathname])
```
