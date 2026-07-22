import { userList, userToggle, userUpdateRole, type UserInfo } from '@/api/user'
import { Role, RoleLabel, UserStatus, UserStatusLabel } from '@/constants'
import type { RootState } from '@/store'
import { DefaultPagination } from '@/utils/request'
import { App, Button, Flex, Input, Popconfirm, Select, Space, Table, Tag, theme } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function UserListPage() {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const currentUser = useSelector((state: RootState) => state.userInfo)
  const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN
  const [users, setUsers] = useState<(UserInfo & { status: number })[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [searchUsername, setSearchUsername] = useState('')
  const [filterRole, setFilterRole] = useState<string>()
  const [filterStatus, setFilterStatus] = useState<number | undefined>()
  const [pageNum, setPageNum] = useState(DefaultPagination.PageNum as number)
  const [pageSize, setPageSize] = useState(DefaultPagination.PageSize as number)

  const fetchList = (role?: string, status?: number | undefined, username?: string, pn?: number, ps?: number) => {
    setLoading(true)
    userList({
      username: username !== undefined ? username : searchUsername || undefined,
      role: role !== undefined ? role : filterRole,
      status: status !== undefined ? status : filterStatus,
      pageNum: pn ?? pageNum,
      pageSize: ps ?? pageSize
    })
      .then(({ data }) => {
        setUsers(data.records)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [pageNum, pageSize])

  return (
    <Flex vertical gap={token.marginLG}>
      <Flex justify="space-between" wrap gap={token.marginSM}>
        <Space wrap>
          <Select
            placeholder="全部角色"
            allowClear
            style={{ width: 120 }}
            value={filterRole}
            onChange={(v) => {
              setFilterRole(v)
              setPageNum(DefaultPagination.PageNum as number)
              fetchList(v, undefined, undefined, DefaultPagination.PageNum as number)
            }}
            options={Object.entries(RoleLabel).map(([key, label]) => ({ label, value: key }))}
          />
          <Select
            placeholder="全部状态"
            allowClear
            style={{ width: 120 }}
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v)
              setPageNum(DefaultPagination.PageNum as number)
              fetchList(undefined, v, undefined, DefaultPagination.PageNum as number)
            }}
            options={[
              { label: UserStatusLabel[UserStatus.ENABLED], value: UserStatus.ENABLED },
              { label: UserStatusLabel[UserStatus.DISABLED], value: UserStatus.DISABLED }
            ]}
          />
          <Input.Search
            placeholder="搜索用户名"
            allowClear
            style={{ width: 200 }}
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onSearch={(value) => {
              setPageNum(DefaultPagination.PageNum as number)
              fetchList(undefined, undefined, value, DefaultPagination.PageNum as number)
            }}
          />
        </Space>
      </Flex>

      <Table
        rowKey="id"
        scroll={{ x: 'max-content' }}
        columns={[
          { title: '用户名', dataIndex: 'username', width: 120 },
          { title: '姓名', dataIndex: 'name', width: 120 },
          {
            title: '角色',
            dataIndex: 'role',
            width: 140,
            render: (role: string, record: UserInfo & { status: number }) => {
              if (isSuperAdmin) {
                return (
                  <Select
                    size="small"
                    style={{ width: 120 }}
                    value={role}
                    onChange={(v) => {
                      userUpdateRole(record.id, v).then(({ msg }) => {
                        message.success(msg)
                        fetchList()
                      })
                    }}
                    options={Object.entries(RoleLabel).map(([key, label]) => ({ label, value: key }))}
                  />
                )
              }
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
            render: (s: number) => <Tag color={s === UserStatus.ENABLED ? 'success' : 'error'}>{UserStatusLabel[s as UserStatus]}</Tag>
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
            fixed: 'right' as const,
            render: (_: unknown, record: UserInfo & { status: number }) => {
              if (!isSuperAdmin) return null
              return (
                <Popconfirm
                  title={record.status === UserStatus.ENABLED ? '确定禁用该用户？' : '确定启用该用户？'}
                  onConfirm={() => {
                    userToggle(record.id).then(({ msg }) => {
                      message.success(msg)
                      fetchList()
                    })
                  }}
                >
                  <Button type="link" size="small" danger={record.status === UserStatus.ENABLED}>
                    {record.status === UserStatus.ENABLED ? '禁用' : '启用'}
                  </Button>
                </Popconfirm>
              )
            }
          }
        ]}
        dataSource={users}
        loading={loading}
        pagination={{
          current: pageNum,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => {
            setPageNum(p)
            setPageSize(s)
          }
        }}
      />
    </Flex>
  )
}
