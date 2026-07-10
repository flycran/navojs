import { useMatchedNodes } from '@navojs/react-router'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

/**
 * 权限守卫组件
 * 当用户访问没有权限的页面时，显示 403 未授权页面
 *
 * 原理：useMatchedNodes 从 authedIdMap（已鉴权节点）中查找匹配的路由，
 * 如果 matchedNodes 为空，说明当前路由对应的节点不在已鉴权集合中（即无权限访问）。
 *
 * 用法：在 Layout 的 Outlet 外层包裹此组件
 */
export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const { matchedNodes } = useMatchedNodes()
  const navigate = useNavigate()

  // matchedNodes 为空 → 当前路由无权限
  if (matchedNodes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问此页面。"
          extra={
            <Button type="primary" onClick={() => navigate('/', { replace: true })}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  return <>{children}</>
}
