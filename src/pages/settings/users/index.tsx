import { userList, userToggle, type UserInfo } from '@/api/user'
import { Role, RoleLabel, UserStatus, UserStatusLabel } from '@/constants'
import { DefaultPagination } from '@/utils/request'
import { Button, Flex, Input, message, Popconfirm, Select, Space, Table, Tag, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export default function UserListPage() {
  const { token } = theme.useToken()
  const [users, setUsers] = useState<(UserInfo & { status: number })[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [searchUsername, setSearchUsername] = useState('')
  const [filterRole, setFilterRole] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<number | undefined>()
  const [pageNum, setPageNum] = useState(DefaultPagination.PageNum as number)
  const [pageSize, setPageSize] = useState(DefaultPagination.PageSize as number)

  const fetchList = () => {
    setLoading(true)
    userList({
      username: searchUsername || undefined,
      role: filterRole,
      status: filterStatus,
      pageNum,
      pageSize,
    })
      .then(({ data }) => {
        setUsers(data.records)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [pageNum, pageSize, filterRole, filterStatus])

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" wrap>
        <Space wrap>
          <Input.Search
            placeholder="搜索用户名"
            allowClear
            style={{ width: 200 }}
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onSearch={() => { setPageNum(1); fetchList() }}
          />
          <Select
            placeholder="全部角色"
            allowClear
            style={{ width: 120 }}
            value={filterRole}
            onChange={(v) => { setFilterRole(v); setPageNum(1) }}
            options={Object.entries(RoleLabel).map(([key, label]) => ({ label, value: key }))}
          />
          <Select
            placeholder="全部状态"
            allowClear
            style={{ width: 120 }}
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v); setPageNum(1) }}
            options={[
              { label: UserStatusLabel[UserStatus.ENABLED], value: UserStatus.ENABLED },
              { label: UserStatusLabel[UserStatus.DISABLED], value: UserStatus.DISABLED },
            ]}
          />
        </Space>
      </Flex>

      <Table
        rowKey="id"
        columns={[
          { title: '用户名', dataIndex: 'username', width: 120 },
          { title: '姓名', dataIndex: 'name', width: 120 },
          {
            title: '角色',
            dataIndex: 'role',
            width: 120,
            render: (role: string) => {
              const colors: Record<string, string> = { [Role.SUPER_ADMIN]: 'orange', [Role.ADMIN]: 'processing', [Role.USER]: 'default' }
              return <Tag color={colors[role]}>{RoleLabel[role as Role] || role}</Tag>
            }
          },
          { title: '手机号', dataIndex: 'phone', width: 140 },
          { title: '邮箱', dataIndex: 'email', ellipsis: true },
          {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (s: number) => (
              <Tag color={s === UserStatus.ENABLED ? 'success' : 'error'}>{UserStatusLabel[s as UserStatus]}</Tag>
            )
          },
          {
            title: '创建时间',
            dataIndex: 'createtime',
            width: 180,
            render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: '操作',
            key: 'action',
            width: 100,
            render: (_: unknown, record: UserInfo & { status: number }) => (
              <Popconfirm
                title={record.status === UserStatus.ENABLED ? '确定禁用该用户？' : '确定启用该用户？'}
                onConfirm={() => {
                  userToggle(record.id).then(() => {
                    message.success('操作成功')
                    fetchList()
                  })
                }}
              >
                <Button type="link" size="small" danger={record.status === UserStatus.ENABLED}>
                  {record.status === UserStatus.ENABLED ? '禁用' : '启用'}
                </Button>
              </Popconfirm>
            )
          },
        ]}
        dataSource={users}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => { setPageNum(p); setPageSize(s) }
        }}
      />
    </Flex>
  )
}
