import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons-vue'
import { Alert, Card, List, Space, Switch, Tag, Typography } from 'ant-design-vue'
import { usePermissions } from '../store/permissions'

const { Title, Text } = Typography

export default function Permissions() {
  const { permissions, togglePermission } = usePermissions()
  const list = permissions.value

  const enabledCount = list.filter((p) => p.enabled).length
  const totalCount = list.length

  return (
    <div>
      <div class="mb-6">
        <Title level={2}>
          <LockOutlined class="mr-2" />
          权限管理
        </Title>
      </div>

      <Alert
        message="菜单权限控制演示"
        description="通过下方开关可以动态控制菜单的显示与隐藏。当组内所有节点都无权限时，整个分组会自动隐藏。"
        type="info"
        showIcon
        class="mb-6"
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
        class="mb-6"
      >
        <List
          dataSource={list}
          renderItem={({ item }: { item: { id: string; label: string; enabled: boolean } }) => (
            <List.Item>
              {{
                actions: () => (
                  <Switch
                    checked={item.enabled}
                    onChange={() => togglePermission(item.id)}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                  />
                ),
                default: () => (
                  <List.Item.Meta
                    avatar={
                      item.enabled ? (
                        <CheckCircleOutlined class="text-green-500 text-lg" />
                      ) : (
                        <CloseCircleOutlined class="text-red-500 text-lg" />
                      )
                    }
                  >
                    {{
                      title: () => (
                        <Space>
                          <Text strong>{item.label}</Text>
                          <Tag color={item.enabled ? 'success' : 'default'}>
                            {item.enabled ? '已启用' : '已禁用'}
                          </Tag>
                        </Space>
                      ),
                      description: () => `菜单ID: ${item.id}`,
                    }}
                  </List.Item.Meta>
                ),
              }}
            </List.Item>
          )}
        />
      </Card>

      <Card title="使用说明" class="mb-6">
        <ul class="list-disc pl-6">
          <li>切换上方开关可实时控制对应菜单的显示/隐藏</li>
          <li>尝试禁用"工作台"分组下的所有菜单，观察整个分组是否隐藏</li>
        </ul>
      </Card>
    </div>
  )
}
Permissions.displayName = 'Permissions'
