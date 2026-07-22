---
name: qianguanguan-web
description: Use when writing or modifying React frontend code in qianguanguan-web/. Covers TypeScript, Ant Design v6, Redux, Vite, and project conventions.
---

# 钱罐罐 前端规范

## 项目栈

- React 19 + TypeScript
- Vite + pnpm
- Ant Design v6 (`"antd": "^6.5.1"`)
- Redux Toolkit (react-redux)
- React Router v7
- dayjs

## 项目结构

```
qianguanguan-web/src/
├── api/            # 接口请求，按模块分文件
├── components/     # 公共组件，每个组件一个文件夹 (index.tsx)
├── constants/      # 常量定义
├── layouts/        # 布局组件
├── pages/          # 页面组件，每个页面一个文件夹
├── router/         # 路由配置
├── store/          # Redux store (token, userInfo)
└── utils/          # 工具函数 (request.ts 等)
```

## API 函数命名规则

**函数名 = URL 路径的驼峰形式**

| URL | 函数名 |
|-----|--------|
| `/user/info` | `userInfo()` |
| `/user/list` | `userList()` |
| `/user/password` | `userPassword()` |
| `/user/profile` | `userProfile()` |
| `/user/toggle/{id}` | `userToggle()` |
| `/bill/list` | `billList()` |
| `/bill/save` | `billSave()` |
| `/bill/stats` | `billStats()` |
| `/login` | `login()` |
| `/register` | `register()` |
| `/upload` | `upload()` |

## API 请求写法

```typescript
import create from '@/utils/request'

export async function userPassword(data: { oldPassword: string; newPassword: string }) {
  return create({
    url: '/user/password',
    method: 'PUT',
    data
  })
}
```

- 统一使用 `create<T>()` 发起请求
- 请求/响应类型定义在同一文件中
- `file` 上传设置 `requestType: 'blob'`，不使用 `Content-Type`
- **提示信息必须使用后端返回的 `msg`，禁止前端硬编码文案**：`message.success(msg)`

## 组件/页面规范

- 组件: `src/components/ComponentName/index.tsx`
- 页面: `src/pages/PageName/index.tsx`
- Props 接口定义在组件文件内: `interface Props { ... }`

## Ant Design 使用规范

- `App.useApp()` 获取 `message` / `modal` / `notification` 实例
- `theme.useToken()` 获取设计令牌
- `Form.useForm()` + `form.validateFields().then()` 处理表单提交
- Modal 使用 `open` + `onCancel` + `onOk` 模式

## Ant Design 废弃属性替换

| 废弃属性 | 替换为 |
|----------|--------|
| `Modal destroyOnClose` | `destroyOnHidden` |
| `Divider type="vertical"` | 自定义 `<div>` 实现垂直分割线 |
| `Divider type` | `orientation`（仅对文字方向有效） |

## Token & 用户信息

- `token` 存储在 Redux store + localStorage
- `userInfo` 存储在 Redux store
- 退出登录/修改密码后: `dispatch(setToken(''))` + `dispatch(setUserInfo(null))` + 跳转登录页
- 请求拦截器自动从 Redux store 附加 `Authorization: Bearer {token}` 头

## 样式

全局样式统一放在 `src/app.scss` 中，通过 `App.tsx` 引入。`index.html` 不写内联样式。
响应式使用 CSS 媒体查询，不写 JS 监听 `window.innerWidth`。
