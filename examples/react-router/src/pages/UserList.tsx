import { Table } from 'antd'
import { Link } from 'react-router'

export default function UserList() {
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客' },
  ]

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: { id: number }) => (
        <Link to={`/system/users/${record.id}`}>{text}</Link>
      ),
    },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户列表</h1>
      <Table dataSource={users} columns={columns} rowKey="id" />
    </div>
  )
}
