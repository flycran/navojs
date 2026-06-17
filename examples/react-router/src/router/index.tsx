import { generateRoutes } from '@navo/react-router'
import { createBrowserRouter } from 'react-router'
import { navo } from '../config/navigation'
import Layout from '../layouts/Layout'

export default createBrowserRouter([
  { path: '/', element: <Layout />, children: [...generateRoutes(navo)] },
])

export { navo }
