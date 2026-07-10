import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'

/**
 * 未授权页面
 * 当用户访问没有权限的页面时显示
 */
export default function Unauthorized() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
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
