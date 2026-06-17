import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'
import locale from 'antd/locale/zh_CN'
import type { ReactNode } from 'react'

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider locale={locale}>{children}</ConfigProvider>
    </StyleProvider>
  )
}
