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

| 路径              | 职责                                                     |
| ----------------- | -------------------------------------------------------- |
| `src/api/`        | API 接口层，每个模块一个文件                             |
| `src/pages/`      | 页面组件，每个页面一个文件夹（驼峰命名，如 `notFound`）  |
| `src/components/` | 共享组件（驼峰命名，如 `errorBoundary`、`profileModal`） |
| `src/layouts/`    | 布局组件                                                 |
| `src/router/`     | 路由配置                                                 |
| `src/store/`      | Redux Store (token + userInfo)                           |
| `src/utils/`      | 工具（request 封装、DefaultPagination）                  |
| `src/constants/`  | 领域常量（BillType、Role、UserStatus 等）                |

## 常量定义规范

**所有领域枚举值和魔法数字必须定义为常量**，禁止硬编码：

| 类别          | 来源                          | 示例                                                      |
| ------------- | ----------------------------- | --------------------------------------------------------- |
| 业务枚举      | `@/constants`                 | `BillType`、`Role`、`UserStatus`                          |
| 分页默认值    | `@/utils/request`             | `DefaultPagination.PageNum`、`DefaultPagination.PageSize` |
| 应用名称/配置 | `import.meta.env`             | `VITE_NAME`、`VITE_USERNAME`、`VITE_PASSWORD`             |
| 主题色        | `token`（`theme.useToken()`） | `token.colorPrimary`、`token.colorSuccess`                |

**禁止行为：**

- 禁止字符串字面量比较（如 `'INCOME'`、`'超级管理员'`）
- 禁止魔法数字（如 `setPageNum(1)`、`status === 1`）
- 禁止硬编码应用名称（如 `钱罐罐`）
- 禁止硬编码颜色值（如 `'#ff4d4f'`、`'green'`）

## 代码质量

- **禁止使用 `eslint-disable` / `oxlint-disable` 注释**
- 每次代码修改后必须运行 `pnpm run lint`，确保 `tsc` 和 `oxlint` 零错误
- `react/exhaustive-deps` 规则在 `.oxlintrc.jsonc` 中关闭，useEffect 依赖由开发者自行保证

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
;<ConfigProvider
  locale={zhCN}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: { borderRadius: 6 }
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

**函数命名**：URL 路径按 `/` 分割后转驼峰，同名路径不同 HTTP 方法加动词后缀。

| URL                 | 函数名        | 规则          |
| ------------------- | ------------- | ------------- |
| `/user/info`        | `userInfo`    | 路径转驼峰    |
| `/user/profile`     | `userProfile` | 路径转驼峰    |
| `/bill/list`        | `billList`    | 路径转驼峰    |
| `/upload`           | `upload`      | 路径转驼峰    |
| `/bill` POST        | `billSave`    | 同名路径+动词 |
| `/bill/{id}` PUT    | `billUpdate`  | 同名路径+动词 |
| `/bill/{id}` DELETE | `billDelete`  | 同名路径+动词 |

所有查询类接口使用 POST + JSON body，通过 `create<T>(options)` 封装：

```typescript
// 查询 —— POST + data
export async function billList(params: BillListParams) {
  return create<BillPage>({
    url: '/bill/list',
    method: 'POST',
    data: params
  })
}

// 新增 —— POST + data
export async function billSave(data: BillSaveParams) {
  return create<BillVO>({
    url: '/bill',
    method: 'POST',
    data
  })
}

// 更新 —— PUT + 路径参数 + data
export async function billUpdate(id: number, data: BillSaveParams) {
  return create<BillVO>({
    url: `/bill/${id}`,
    method: 'PUT',
    data
  })
}

// 删除 —— DELETE + 路径参数
export async function billDelete(id: number) {
  return create<CtmResponse<null>>({
    url: `/bill/${id}`,
    method: 'DELETE'
  })
}
```

- `create<T>()` 泛型 T 是 `data` 字段的类型
- `errorMsg` 默认 `true`，无需显式设置
- 返回类型 `CtmResponse<T>` = `{ code, msg, data }`
- **成功提示必须使用后端返回的 `msg`，不可硬编码文案**
- **`.then()` 回调必须解构，不使用 `res.xxx` 写法**
- 分页默认值使用 `DefaultPagination.PageNum` / `DefaultPagination.PageSize`

调用示例：

```typescript
// 列表查询
billList({ ... }).then(({ data }) => { setBills(data.records) })

// 增删改 —— 解构 msg 用于提示
billSave(params).then(({ msg, data }) => { message.success(msg); ... })

// 无 data 的接口 —— 使用 CtmResponse<null>
billDelete(id).then(({ msg }) => { message.success(msg); ... })
```

## 文件上传

文件上传使用 FormData + `create()`，设置 `requestType: 'blob'` 跳过 JSON 序列化：

```typescript
export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return create<{ url: string }>({
    url: '/upload',
    method: 'POST',
    data: formData,
    requestType: 'blob'
  })
}
```

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

| 变量                    | 说明                                  |
| ----------------------- | ------------------------------------- |
| `VITE_NAME`             | 应用名称（Layout Logo旁、登录页底部） |
| `VITE_USERNAME`         | 默认登录用户名                        |
| `VITE_PASSWORD`         | 默认登录密码                          |
| `VITE_REQUEST_BASE_URL` | API 基础路径 `/api/business`          |

## 错误处理

- Layout 内使用 `ErrorBoundary` 包裹内容区
- 404 页面使用 antd `Empty` 组件 + 返回首页按钮

## 数据刷新

从其他页面返回首页时需要重新拉取数据，useEffect 依赖使用 `[location.pathname]` 确保路由切换时刷新：

```typescript
const location = useLocation()
useEffect(() => {
  fetchData()
}, [location.pathname])
```
