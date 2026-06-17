import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, List, Space, Switch, Tag, Typography } from 'antd'
import { useAtom, useSetAtom } from 'jotai'
import {
  disableAllPermissionsAtom,
  enableAllPermissionsAtom,
  permissionsAtom,
  togglePermissionAtom,
} from '../store/permissions'

const { Title, Text } = Typography

/**
 * 权限管理页面
 * 用于演示 Navo 的菜单鉴权能力
 * 可以动态控制各个菜单的显示/隐藏
 */
export default function Permissions() {
  const [permissions] = useAtom(permissionsAtom)
  const togglePermission = useSetAtom(togglePermissionAtom)
  const enableAll = useSetAtom(enableAllPermissionsAtom)
  const disableAll = useSetAtom(disableAllPermissionsAtom)

  const enabledCount = permissions.filter((p) => p.enabled).length
  const totalCount = permissions.length

  return (
    <div>
      <Title level={2} className="mb-6">
        <LockOutlined className="mr-2" />
        权限管理
      </Title>

      <Alert
        message="菜单权限控制演示"
        description="通过下方开关可以动态控制菜单的显示与隐藏。当组内所有节点都无权限时，整个分组会自动隐藏。"
        type="info"
        showIcon
        className="mb-6"
      />

      <Card
        title={
          <Space>
            <span>菜单权限配置</span>
            <Tag color="blue">
              {enabledCount}/{totalCount}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<UnlockOutlined />} onClick={enableAll}>
              全部启用
            </Button>
            <Button icon={<LockOutlined />} onClick={disableAll}>
              全部禁用
            </Button>
            <Button onClick={enableAll}>重置默认</Button>
          </Space>
        }
        className="mb-6"
      >
        <List
          dataSource={permissions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch
                  key="toggle"
                  checked={item.enabled}
                  onChange={() => togglePermission(item.id)}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.enabled ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  ) : (
                    <CloseCircleOutlined className="text-red-500 text-lg" />
                  )
                }
                title={
                  <Space>
                    <Text strong>{item.label}</Text>
                    <Tag color={item.enabled ? 'success' : 'default'}>
                      {item.enabled ? '已启用' : '已禁用'}
                    </Tag>
                  </Space>
                }
                description={`菜单ID: ${item.id}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="使用说明" className="mb-6">
        <ul className="list-disc pl-6">
          <li>切换上方开关可实时控制对应菜单的显示/隐藏</li>
          <li>尝试禁用&quot;工作台&quot;分组下的所有菜单，观察整个分组是否隐藏</li>
        </ul>
      </Card>
    </div>
  )
}
