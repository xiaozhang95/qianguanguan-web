---
name: qianguanguan-web
description: Use when writing or modifying React frontend code in qianguanguan-web/. Covers TypeScript, Ant Design v6, Redux, Vite, and project conventions.
---

# 钱罐罐 前端开发规范

## 技术栈

- **框架**: React 19 + TypeScript + Vite
- **UI 库**: Ant Design 6.x
- **图表库**: recharts
- **图标**: @ant-design/icons
- **状态管理**: Redux Toolkit
- **路由**: React Router 7 (HashRouter)
- **HTTP**: 自定义 fetch 封装 (`@/utils/request`)
- **日期**: dayjs

## 项目目录

| 路径              | 职责                           |
| ----------------- | ------------------------------ |
| `src/api/`        | API 接口层，每个模块一个文件   |
| `src/pages/`      | 页面组件，每个页面一个文件夹   |
| `src/components/` | 共享组件                       |
| `src/layouts/`    | 布局组件                       |
| `src/router/`     | 路由配置                       |
| `src/store/`      | Redux Store (token + userInfo) |
| `src/utils/`      | 工具（request 封装、分页常量） |
| `src/constants/`  | 领域常量（BillType、Role 等）  |

## 常量定义规范

**所有领域枚举值和魔法数字必须定义为常量**，禁止硬编码：

```typescript
// src/constants/index.ts
export const BillType = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const
export type BillType = (typeof BillType)[keyof typeof BillType]
export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}

export const Role = { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', USER: 'USER' } as const
export type Role = (typeof Role)[keyof typeof Role]
export const RoleLabel: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '超级管理员',
  [Role.ADMIN]: '管理员',
  [Role.USER]: '用户'
}

export const UserStatus = { ENABLED: 1, DISABLED: 0 } as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]
export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ENABLED]: '启用',
  [UserStatus.DISABLED]: '禁用'
}
```

**禁止**：字符串字面量比较、魔法数字、硬编码应用名称、硬编码颜色值。

## 代码质量

- **禁止 `eslint-disable` / `oxlint-disable` 注释**
- 每次代码修改后运行 `pnpm run lint`，确保 `tsc` 和 `oxlint` 零错误

## 路由

- 路由路径从 `RoutePath` 常量引用，禁止硬编码
- 菜单分组用 `type: 'group'`，字段名 `roles`（`Role[]`）
- **首页、账单管理、分类管理** 使用 `import` 直接导入（无需懒加载）
- **系统设置（用户列表）** 使用 `React.lazy()` 懒加载
- 404 兜底路由 `path="*"`

```typescript
const Home = import('@/pages/home')          // 直接导入
const Users = lazy(() => import('@/pages/settings/users'))  // 懒加载

interface RouteItem {
  Component: ComponentType | LazyExoticComponent<ComponentType>
}
```

## Ant Design 主题

```tsx
<ConfigProvider
  locale={zhCN}
  theme={{
    cssVar: { prefix: 'ant' },
    algorithm: theme.darkAlgorithm,
    token: { borderRadius: 6 },
    components: {
      Menu: {
        subMenuItemBg: 'transparent',
        itemSelectedColor: '#fff',
        itemSelectedBg: '#1677ff80'
      }
    }
  }}
>
```

CSS 变量命名规则：驼峰转短横线，加 `--ant-` 前缀。`colorBgContainer` → `--ant-color-bg-container`。

## 样式约定

### 核心原则

- **禁止 `style={{}}` 内联样式**，所有样式提取到独立 SCSS 文件
- 每个页面/组件对应一个 `index.scss`：`src/pages/login/index.tsx` → `src/pages/login/index.scss`
- `app.scss` 仅保留全局工具类（响应式、滚动条、autofill）

### SCSS 中使用 CSS 变量

| 类别     | 变量示例（含典型值）                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| 颜色     | `--ant-color-primary` `--ant-color-success` `--ant-color-error` `--ant-color-info` `--ant-color-warning` `--ant-color-text` `--ant-color-text-secondary` `--ant-color-text-tertiary` `--ant-color-text-description` `--ant-color-text-quaternary` `--ant-color-bg-container` `--ant-color-bg-elevated` `--ant-color-bg-layout` `--ant-color-fill-secondary` `--ant-color-border` `--ant-color-border-secondary` `--ant-color-primary-bg` `--ant-color-primary-active` `--ant-color-white` |
| 字号     | `--ant-font-size` `--ant-font-size-sm` `--ant-font-size-lg` `--ant-font-size-xl` `--ant-font-size-heading-3` `--ant-font-size-heading-4` `--ant-font-weight-strong` |
| 间距     | `--ant-padding-xs`(8) `--ant-padding-sm`(12) `--ant-padding`(16) `--ant-padding-md`(20) `--ant-padding-lg`(24) `--ant-padding-xl`(32) `--ant-margin`(16) `--ant-margin-sm`(12) `--ant-margin-md`(20) `--ant-margin-lg`(24) `--ant-margin-xl`(32) |
| 尺寸     | `--ant-border-radius` `--ant-border-radius-lg` `--ant-line-width`(1) `--ant-control-height-sm`(24) `--ant-control-height`(32) `--ant-control-height-lg`(40) |
| 阴影     | `--ant-box-shadow-secondary` `--ant-box-shadow-tertiary`                                  |

### 组件 Props 中使用 Token — 禁止 CSS 变量字符串

**TSX 组件 props 必须用 `token.xxx`，禁止传入 `'var(--ant-xxx)'` 字符串：**

```tsx
const { token } = theme.useToken()

// 正确
<Tag color={token.colorSuccess}>启用</Tag>
<Flex gap={token.marginLG}>...</Flex>
<Icon name="logo" fill={token.colorWhite} />

// 错误
<Tag color="var(--ant-color-success)">启用</Tag>
<Flex gap="var(--ant-margin-lg)">...</Flex>
<Icon name="logo" fill="#fff" />
```

### Tag 颜色映射

| 语义         | 使用                          | 禁止                         |
| ------------ | ----------------------------- | ---------------------------- |
| 成功/收入    | `token.colorSuccess`          | `'success'`                  |
| 错误/支出    | `token.colorError`            | `'error'`                    |
| 超管角色     | `token.orange`                | `'orange'`                   |
| 管理员角色   | `token.colorPrimary`          | `'processing'`               |
| 普通用户     | `token.colorTextQuaternary`   | `'default'`                  |

### SCSS 中使用 `color-mix()` 处理渐变和透明度

```scss
box-shadow: 0 4px 12px color-mix(in srgb, var(--ant-color-primary) 25%, transparent);
background: linear-gradient(135deg, var(--ant-color-primary), var(--ant-color-primary-active));
```

### `var(--ant-xxx)` 允许场景

仅限：`.scss` 文件、`style.textContent` 注入 CSS、antd `styles` API。  
**禁止**在任何组件 prop 中使用。

### 移动端响应式

媒体查询 `max-width: 767px`：
- `hide-on-mobile` — 桌面端可见，移动端隐藏
- `show-on-mobile` — 移动端可见，桌面端隐藏
- 禁止 JS 监听 `window.innerWidth`

## 布局

- `Layout.Sider` (fixed 左) + `Layout.Header` (sticky 顶) + `Layout.Content`
- 移动端 Sider 改为 Drawer 抽屉菜单
- 移动端 Header 水平内边距 `var(--ant-padding-xs)`（8px）
- 不使用面包屑导航、侧边栏折叠按钮

## Ant Design 组件使用

- `App.useApp()` → `message` / `modal` / `notification`
- `Form.useForm()` + `form.validateFields().then()`
- Modal: `open` + `onCancel` + `onOk`，`destroyOnClose` → `destroyOnHidden`
- Drawer: `width` → `size`
- Flex 替代 `Row`/`Col` 和 `style={{ display: 'flex' }}`
- **Icon 组件**：用 `size` / `fill` 属性，禁止 `className`

## API 调用规范

- 查询类接口 POST + JSON body，`create<T>(options)` 封装
- 函数命名：URL 路径转驼峰，同名路径不同方法加动词（`billSave`/`billUpdate`/`billDelete`）
- `.then()` 回调解构，**成功提示用后端 `msg`**
- 分页默认值用 `DefaultPagination.PageNum` / `DefaultPagination.PageSize`

## 处理函数约定

简单逻辑内联到 JSX，多次引用的才抽离为独立函数。

## 日期格式化

| 场景       | 格式                     |
| ---------- | ------------------------ |
| 账单日期   | `YYYY-MM-DD`             |
| 创建时间   | `YYYY-MM-DD HH:mm:ss`    |
| 图表 X 轴  | `D日`                    |
| 传入后端   | `YYYY-MM-DD` 字符串      |

## 环境变量

| 变量                    | 说明           |
| ----------------------- | -------------- |
| `VITE_NAME`             | 应用名称       |
| `VITE_USERNAME`         | 默认登录用户名 |
| `VITE_PASSWORD`         | 默认登录密码   |
| `VITE_REQUEST_BASE_URL` | API 基础路径   |

## Token & 用户信息

- 退出登录: `dispatch(setToken(''))` + `dispatch(setUserInfo(null))` + 跳转登录页
- 请求拦截器自动附加 `Authorization: Bearer {token}`
