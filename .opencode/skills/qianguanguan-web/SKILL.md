---
name: qianguanguan-web
description: Use when working with the qianguanguan-web (钱罐罐) React + TypeScript + Vite frontend. Covers TypeScript types for Snowflake IDs, antd Table conventions, message API usage, and request patterns.
---

# qianguanguan-web 前端规范

## 项目技术栈

React 19 + TypeScript 7 + Vite 8 + Ant Design 6 + Redux Toolkit + React Router

## TypeScript 类型规范

- **所有后端 Snowflake ID（id / userId / categoryId 等）必须声明为 `string` 类型**，不得使用 `number`
- 后端 Jackson 已将 Long 序列化为 String，前端直接以 string 接收和传递

## antd Table 规范

- 所有 Table **必须**加 `scroll={{ x: 'max-content' }}`，保证表头与内容区域共用滚动容器，缩小屏幕时不会错位
- 操作列 **必须**加 `fixed: 'right' as const`，固定在右侧
```tsx
<Table
  rowKey="id"
  scroll={{ x: 'max-content' }}
  columns={columns}
  dataSource={data}
  loading={loading}
/>
```

## antd message 使用规范

- 组件内**必须**使用 `App.useApp()` 获取 message 实例，禁止 `import { message } from 'antd'` 静态调用：
```tsx
import { App } from 'antd'

export default function MyPage() {
  const { message } = App.useApp()
  message.success('操作成功')
}
```
- 非 React 工具函数（如 `request.ts`）通过 `msgHolder` 持有 message 实例：
  - `utils/msgHolder.ts`：`setMsgApi()` / `getMsgApi()`
  - `request.ts` 中调用 `getMsgApi().error(msg)` 代替 `message.error(msg)`
  - `App.tsx` 中必须包含 `<MsgInject />` 组件初始化 message 实例

## API 接口规范

- **URL 必须包含语义化动作后缀**（与后端一致）：
  - 新增：`/bill/save`、`/category/save`
  - 更新：`/bill/update/${id}`、`/category/update/${id}`
  - 删除：`/bill/delete/${id}`、`/category/delete/${id}`
- 删除类接口返回 void，调用 `create(...)` 时**不传泛型**，禁止 `create<null>` 或 `create<CtmResponse<null>>`
```ts
export async function billDelete(id: string) {
  return create({
    url: `/bill/delete/${id}`,
    method: 'DELETE'
  })
}
```
- 请求统一通过 `create<T>(options)` 发送，返回 `Promise<CtmResponse<T>>`
