---
name: qianguanguan-web
description: Use when writing or modifying React frontend code in qianguanguan-web/. Covers TypeScript, Ant Design v6, Redux, Vite, and project conventions.
---

# 钱罐罐 前端开发规范

## 技术栈

React 19 + TypeScript + Vite · Ant Design 6.x · @ant-design/charts · @ant-design/icons · Redux Toolkit · React Router 7 (HashRouter) · 自定义 fetch 封装（`@/utils/request`）· dayjs

## 项目目录

| 路径 | 职责 |
| --- | --- |
| `src/api/` | API 层，每模块一个文件 |
| `src/pages/` | 页面组件，每页面一个文件夹 |
| `src/components/` | 共享组件 |
| `src/layouts/` | 布局组件 |
| `src/router/` | 路由配置 |
| `src/store/` | Redux（token + userInfo） |
| `src/utils/` | 工具（request、分页常量） |
| `src/constants/` | 领域常量（BillType、Role 等） |

## 常量规范

所有领域枚举值和魔法数字必须定义为常量，禁止硬编码。模式：

```ts
export const BillType = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const
export type BillType = (typeof BillType)[keyof typeof BillType]
export const BillTypeLabel: Record<BillType, string> = {
  [BillType.INCOME]: '收入',
  [BillType.EXPENSE]: '支出'
}
```

**禁止**：字符串字面量比较、魔法数字、硬编码应用名称、硬编码颜色值。

## 代码质量

- 禁止 `eslint-disable` / `oxlint-disable` 注释
- 修改后运行 `pnpm run lint`，tsc + oxlint 零错误

## 路由

- 路径从 `RoutePath` 常量引用，禁止硬编码
- 菜单分组 `type: 'group'`，字段 `roles: Role[]`
- 页面全部 `React.lazy()` 懒加载；404 兜底 `path="*"`
- `RouteItem`：`Component: ComponentType | LazyExoticComponent<ComponentType>`

## 主题

- 明暗双主题：`themeMode` 来自 Redux theme slice（localStorage 持久化），`toggleTheme()` 切换，`<html data-theme>` 供 SCSS 覆盖（如滚动条）
- 配色完全由 `darkAlgorithm` / `defaultAlgorithm` 的 token 决定，禁止硬编码 hex、覆盖 `colorBg*`
- CSS 变量命名：驼峰转短横线加 `--ant-`（`colorBgContainer` → `--ant-color-bg-container`）

```tsx
const themeConfig = useMemo(
  () => ({
    cssVar: { prefix: 'ant' as const },
    algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: { Menu: { subMenuItemBg: 'transparent' } }
  }),
  [themeMode]
)
```

## 样式约定

- 禁止 `style={{}}` 内联样式；每页/组件配 `index.scss`；`app.scss` 仅放全局工具类
- SCSS 禁止硬编码 `px`，必须用 `var(--ant-*)`（如 `font-size: var(--ant-font-size)`）
- 渐变/透明度用 `color-mix(in srgb, var(--ant-color-primary) 25%, transparent)`
- `var(--ant-*)` 仅限 `.scss`、`style.textContent`、antd `styles` API；禁止用于组件 prop
- 移动端 `max-width: 767px`：`hide-on-mobile` / `show-on-mobile`；禁止监听 `window.innerWidth`；JSX 判断用 `Grid.useBreakpoint()` → `isMobile = !screens.md`

### CSS 变量速查

| 类别 | 变量 |
| --- | --- |
| 颜色 | `--ant-color-primary/success/error/info/warning/text/text-secondary/bg-container/bg-elevated/bg-layout/fill-secondary/border/border-secondary/primary-bg/primary-active/white` |
| 字号 | `--ant-font-size(-sm/-lg/-xl)`、`--ant-font-size-heading-3/4`、`--ant-font-weight-strong` |
| 间距 | `--ant-padding-xs(8)/sm(12)/md(20)/lg(24)/xl(32)`、`--ant-margin(-sm/-md/-lg/-xl)` |
| 尺寸 | `--ant-border-radius(-lg)`、`--ant-line-width(1)`、`--ant-control-height-sm(24)/-（32)/lg(40)` |
| 阴影 | `--ant-box-shadow-secondary/tertiary` |

### 组件 Props 用 Token

props 必须用 `token.xxx`（`theme.useToken()`），禁止 `'var(--ant-xxx)'` 字符串。Tag 必须 `variant="solid"`。

Tag 颜色映射：

| 语义 | 使用 | 禁止 |
| --- | --- | --- |
| 成功/收入 | `token.colorSuccess` | `'success'` |
| 错误/支出 | `token.colorError` | `'error'` |
| 超管 | `token.orange` | `'orange'` |
| 管理员 | `token.colorPrimary` | `'processing'` |
| 普通用户 | `token.colorTextQuaternary` | `'default'` |

### 收入/支出顺序

收支同现时**支出在前、收入在后**：统计卡片 支出→收入→结余；图表支出系列在前；Select/Radio 选项 EXPENSE 在前。

## 布局

- `Layout.Sider`（fixed 左）+ `Layout.Header`（sticky 顶）+ `Layout.Content`
- 移动端 Sider 换 Drawer；Header 水平内边距 `var(--ant-padding-xs)`
- 无面包屑、无侧边栏折叠按钮

## Ant Design 组件

- `App.useApp()` → message / modal / notification
- `Form.useForm()` + `form.validateFields().then()`
- Modal：`open` / `onCancel` / `onOk`，`destroyOnClose` → `destroyOnHidden`
- Drawer：`width` → `size`
- Flex 替代 Row/Col 和 `style={{ display: 'flex' }}`
- 收支类型 Select：`labelRender` + `<Tag variant="solid">` 展示选中值
- 统计卡片：`Card` + `Statistic`，值色用 `styles={{ value: { color: token.colorError, fontWeight: token.fontWeightStrong } }}`，顺序 支出→收入→结余
- Table：`rowKey="id"`、`scroll={{ x: 'max-content' }}`、pagination 用 `showSizeChanger` + `showTotal` + onChange 更新页码
- 记账/分类表单新建默认 `form.setFieldsValue({ type: BillType.EXPENSE })`
- 分类图标：emoji 或 Upload 图片（`beforeUpload` 返回 false 阻止自动上传，保存时 `upload()` 上传，选中显示预览和移除按钮）

## API 调用

- 查询类 POST + JSON body，`create<T>(options)` 封装
- 函数命名：URL 路径转驼峰，同路径不同方法加动词（`billSave` / `billUpdate` / `billDelete`）
- `.then()` 回调解构，成功提示用后端 `msg`
- 分页默认值用 `DefaultPagination.PageNum` / `DefaultPagination.PageSize`

## 处理函数

简单逻辑内联 JSX，多次引用才抽离为独立函数。

## 日期格式

| 场景 | 格式 |
| --- | --- |
| 账单日期 | `YYYY-MM-DD` |
| 创建时间 | `YYYY-MM-DD HH:mm:ss` |
| 图表 X 轴 | `D日` |
| 传后端 | `YYYY-MM-DD` 字符串 |

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_NAME` | 应用名称 |
| `VITE_REQUEST_API` | API 域名 |
| `VITE_REQUEST_BASE_URL` | API 基础路径 |
| `VITE_REQUEST_TIMEOUT` | 请求超时(ms) |
| `VITE_REQUEST_TARGET` | 代理目标地址 |

## 图表（@ant-design/charts v2）

- 主题色/文字色从 `token` 读取；文字色按主题取：`isDark ? token.colorWhite : token.colorText/colorTextSecondary/colorBorder`，亮色禁止 `token.colorWhite`
- Area：`scale={{ color: { range: [token.colorError, token.colorSuccess] } }}`（支出系列在前）
- Pie：`innerRadius={0.45}`，label/legend/tooltip 文字色同上，`style={{ stroke: token.colorBgContainer, lineWidth: 2 }}`
- 移动端：`Grid.useBreakpoint()` 调 `height` / `innerRadius` / `label`

## 登录/注册

- 邮箱 + 密码登录；注册：邮箱 → 验证码（60s 倒计时）→ 密码 → 确认密码 → 图形验证码；注册成功直接拿 token 跳首页
- 自动填充：邮箱始终 `autoComplete="email"`；登录密码 `current-password`；注册密码 `new-password`，其余敏感字段 `autoComplete="off"` + `readOnly` + `onFocus` 移除 readOnly

### 微信扫码登录

- 进入自动获取二维码，每 2s 轮询状态：`loading → pending → confirmed / expired`
- 过期显示遮罩点击重取；底部"使用邮箱密码登录"返回

### 微信绑定（WechatBindModal）

- 打开时获取二维码，每 2s 轮询，绑定成功回调刷新用户信息；已绑定用户菜单不显示"绑定微信"

### 验证码倒计时

```tsx
const [codeCountdown, setCodeCountdown] = useState(0)
useEffect(() => {
  if (codeCountdown <= 0) return
  const timer = setInterval(() => setCodeCountdown((prev) => prev - 1), 1000)
  return () => clearInterval(timer)
}, [codeCountdown])
```

### ProfileModal

- 邮箱变更时用 `Form.Item shouldUpdate` + 函数子节点动态显示验证码区（带红色 * 必填）
- `userProfile()` 传参含 `emailCode`（仅邮箱变更时有值）

## Token & 用户信息

- 退出：`dispatch(setToken(''))` + `dispatch(setUserInfo(null))` + 跳登录页
- token 已含 `Bearer ` 前缀，拦截器直接透传为 `Authorization` 头
