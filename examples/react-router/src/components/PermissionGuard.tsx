import { useCanAccess } from '@navojs/react-router'
import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

/**
 * 权限守卫组件
 * 当用户访问没有权限的页面时，显示 403 未授权页面
 *
 * 用法：在 Layout 的 Outlet 外层包裹此组件
 */
export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const canAccess = useCanAccess()
  const navigate = useNavigate()

  if (!canAccess) {
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
