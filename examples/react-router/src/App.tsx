import { NavoProvider, useCanAccess } from '@navo/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import AppProvider from './AppProvider'
import router, { navo } from './router'
import { enabledPermissionIdsAtom, initPermissionsAtom } from './store/permissions'

function AccessController() {
  const onCanAccess = useCanAccess()
  const enabledIds = useAtomValue(enabledPermissionIdsAtom)
  const init = useSetAtom(initPermissionsAtom)

  useEffect(() => {
    init(navo.nodes)
  }, [init])

  useEffect(() => {
    onCanAccess((node) => enabledIds.has(node.id))
  }, [enabledIds])

  return null
}

export default function App() {
  return (
    <AppProvider>
      <NavoProvider navo={navo}>
        <AccessController />
        <RouterProvider router={router} />
      </NavoProvider>
    </AppProvider>
  )
}
