---
name: qianguanguan-web
description: Use when writing or modifying React frontend code in qianguanguan-web/. Covers TypeScript, Ant Design v6, Redux, Vite, and project conventions.
---

# 钱罐罐 前端开发规范

## 技术栈

- **框架**: React 19 + TypeScript + Vite
- **UI 库**: Ant Design 6.x
- **图表库**: @ant-design/charts
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
- 所有页面使用 `React.lazy()` 懒加载
- 404 兜底路由 `path="*"`

```typescript
const Home = lazy(() => import('@/pages/home'))
const Bill = lazy(() => import('@/pages/bill'))

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

### Tag 组件规范

**所有 Tag 必须添加 `variant="solid"`：**

```tsx
// 正确
<Tag variant="solid" color={token.colorSuccess}>收入</Tag>
// 错误
<Tag color={token.colorSuccess}>收入</Tag>
```

### Tag 颜色映射

| 语义         | 使用                          | 禁止                         |
| ------------ | ----------------------------- | ---------------------------- |
| 成功/收入    | `token.colorSuccess`          | `'success'`                  |
| 错误/支出    | `token.colorError`            | `'error'`                    |
| 超管角色     | `token.orange`                | `'orange'`                   |
| 管理员角色   | `token.colorPrimary`          | `'processing'`               |
| 普通用户     | `token.colorTextQuaternary`   | `'default'`                  |

### 收入/支出展示顺序

**所有 UI 中收入/支出同时出现时，支出在前、收入在后：**

- 统计卡片：支出 → 收入 → 结余
- 图表（饼图、趋势图）：支出系列在前
- Select 选项（类型筛选、记账表单）：EXPENSE 在前，INCOME 在后
- Radio.Group 选项：支出在前，收入在后

### SCSS 禁止硬编码值

**SCSS 中禁止硬编码 `px` 值，必须使用 `var(--ant-xxx)` CSS 变量：**

```scss
// 正确
font-size: var(--ant-font-size);
padding: var(--ant-padding-xs);

// 错误
font-size: 14px;
padding: 8px;
```

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
- 如需在 JSX 中判断移动端，使用 `Grid.useBreakpoint()`：`const screens = Grid.useBreakpoint(); const isMobile = !screens.md`

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
- **收支类型 Select**：用 `labelRender` + `<Tag variant="solid">` 展示选中值

### Statistic 统计卡片

收支统计使用 `Card` + `Statistic`，值颜色通过 `styles` API 设置：

```tsx
<Statistic
  title={<Flex align="center" gap={token.marginXS}><ArrowDownOutlined /><span>支出</span></Flex>}
  value={stats.totalExpense}
  prefix="¥"
  precision={2}
  styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong, fontSize: token.fontSizeHeading3 } }}
/>
```

三张卡片顺序：支出 → 收入 → 结余。

### Table 组件

```tsx
<Table
  rowKey="id"
  columns={columns}
  dataSource={data}
  loading={loading}
  scroll={{ x: 'max-content' }}
  pagination={{
    current: pageNum,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t) => `共 ${t} 条`,
    onChange: (p, s) => { setPageNum(p); setPageSize(s) }
  }}
/>
```

### 表单默认类型

记账表单和分类表单新建时默认类型为 `BillType.EXPENSE`：

```tsx
form.setFieldsValue({ type: BillType.EXPENSE })
```

### 分类图标上传

分类页面支持 emoji 文本图标和上传图片两种方式：
- 图片用 `Upload` + `beforeUpload` 返回 `false` 阻止自动上传，保存时通过 `upload()` API 上传
- 选中图片后显示预览和"移除图片"按钮
- 未上传图片时，Input 右侧显示 Upload 按钮

```tsx
<Select
  options={[
    { label: BillTypeLabel[BillType.EXPENSE], value: BillType.EXPENSE },
    { label: BillTypeLabel[BillType.INCOME], value: BillType.INCOME }
  ]}
  labelRender={(option) => (
    <Tag variant="solid" color={option.value === BillType.INCOME ? token.colorSuccess : token.colorError}>
      {option.label}
    </Tag>
  )}
/>
```

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
| `VITE_REQUEST_API`      | API 域名       |
| `VITE_REQUEST_BASE_URL` | API 基础路径   |
| `VITE_REQUEST_TIMEOUT`  | 请求超时(ms)   |
| `VITE_REQUEST_TARGET`   | 代理目标地址   |

## 图表

图表使用 `@ant-design/charts` v2 API，主题色和文字色从 `token` 读取。

### 面积图/趋势图

```tsx
<Area
  data={areaData}
  xField="date"
  yField="value"
  seriesField="type"
  autoFit
  height={320}
  shapeField="smooth"
  colorField="type"
  scale={{ color: { range: [token.colorError, token.colorSuccess] } }}
  line={{ shapeField: 'smooth', style: { strokeWidth: 2 } }}
  style={{ fillOpacity: 0.2 }}
  axis={{
    x: { labelFill: token.colorWhite, labelOpacity: 1, lineStroke: token.colorWhite, tickStroke: token.colorWhite, tickOpacity: 1 },
    y: { labelFill: token.colorWhite, labelOpacity: 1, gridStroke: token.colorWhite, gridStrokeOpacity: 1, lineStroke: token.colorWhite, lineStrokeOpacity: 1, tickOpacity: 1 }
  }}
  legend={{ color: { itemLabelFill: token.colorWhite, itemLabelFillOpacity: 1, itemLabelFontSize: token.fontSizeSM } }}
  tooltip={{ channel: 'y', valueFormatter: (v) => `¥${Number(v).toFixed(2)}` }}
/>
```

### 饼图

```tsx
<Pie
  data={pieData}
  angleField="value"
  colorField="name"
  autoFit
  height={360}
  innerRadius={0.45}
  scale={{ color: { range: colors } }}
  label={{ text: (d) => `¥${d.value.toFixed(2)}`, position: 'outside', style: { fill: token.colorWhite, fillOpacity: 1, fontSize: token.fontSize, fontWeight: 'bold' } }}
  legend={{ color: { itemLabelFill: token.colorWhite, itemLabelFillOpacity: 1, itemLabelFontSize: token.fontSizeSM } }}
  tooltip={{ items: [(d) => ({ name: d.name, value: `¥${d.value.toFixed(2)}` })] }}
  style={{ stroke: token.colorBgContainer, lineWidth: 2 }}
/>
```

### 移动端图表适配

用 `Grid.useBreakpoint()` 判断 `isMobile = !screens.md`，调整图表 `height`、`innerRadius`、`label`。

```tsx
const screens = Grid.useBreakpoint()
const isMobile = !screens.md
```

## 登录/注册

- 使用邮箱 + 密码登录，不再使用用户名
- 注册表单：邮箱 → 邮箱验证码（60秒倒计时发送按钮）→ 密码 → 确认密码 → 图形验证码
- 注册成功直接拿到 token 跳转首页，不再需要二次登录
- 邮箱验证码输入框使用 `autoComplete="one-time-code"` 禁止浏览器自动填充

### 微信扫码登录

- 页面加载后自动获取二维码场景
- 二维码每 2 秒轮询状态
- 状态变化：`loading` → `pending` → `confirmed` / `expired`
- 过期后显示遮罩，点击重新获取
- 底部提供"使用邮箱密码登录"返回按钮

### 微信绑定

`WechatBindModal` 组件，扫码绑定模式：
- 模态框打开时获取绑定二维码
- 每 2 秒轮询绑定状态
- 绑定成功后回调刷新用户信息
- 已绑定微信的用户菜单中不显示"绑定微信"选项

### 验证码倒计时

```tsx
const [codeCountdown, setCodeCountdown] = useState(0)

useEffect(() => {
  if (codeCountdown <= 0) return
  const timer = setInterval(() => setCodeCountdown((prev) => prev - 1), 1000)
  return () => clearInterval(timer)
}, [codeCountdown])

<Button disabled={codeCountdown > 0}>
  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
</Button>
```

### 修改个人信息

`ProfileModal` 邮箱字段变更时动态显示验证码区域：
- 邮箱未变更 → 隐藏验证码输入框和发送按钮
- 邮箱已变更 → 显示验证码输入框（带红色 * 必填标记）和发送按钮
- 使用 `Form.Item shouldUpdate` + 函数子节点实现条件渲染
- `userProfile()` 传参包含 `emailCode`（仅邮箱变更时有值）

## Token & 用户信息

- 退出登录: `dispatch(setToken(''))` + `dispatch(setUserInfo(null))` + 跳转登录页
- 请求拦截器自动附加 `Authorization: Bearer {token}`
