/** 节点输入 */
export interface NavoNodeInput {
  id?: string
  label?: string
  path?: string
  affiliated?: boolean
  children?: NavoNodeInput[]
  resolve?: number
  meta?: NavoMeta
}

// biome-ignore lint/suspicious/noEmptyInterface: 用户自己扩展
export interface NavoMeta {}

export interface NavoNode extends Omit<NavoNodeInput, 'children' | 'affiliated'> {
  id: string
  parent: NavoNode | null
  type: number
  path: string
  originPath?: string
  children?: NavoNode[]
}

export type CanAccess = (node: NavoNode) => boolean

export interface CreateNavoOptions {
  /** 鉴权范围 */
  canAccessScope?: number[]
  /** 基础路径 */
  basePath?: string
  /** 默认放行 */
  defaultAccess?: boolean
}

/** 获取完整path */
export function getFullPath(currentPath?: string, parentPath?: string) {
  if (!currentPath) return parentPath ?? ''
  if (currentPath[0] === '/') {
    return currentPath
  } else {
    if (parentPath) {
      if (parentPath === '/') {
        return `/${currentPath}`
      }
      return `${parentPath}/${currentPath}`
    }
    return `/${currentPath}`
  }
}

/** 获取resolve路径 */
export function getResolvePath(nodes?: NavoNode[]): string | undefined {
  if (!nodes) return
  let minNode: NavoNode = nodes[0]
  for (const child of nodes) {
    if (
      typeof child.resolve === 'number' &&
      (minNode?.resolve === undefined || child.resolve < minNode.resolve)
    ) {
      minNode = child
    }
  }
  return getResolvePath(minNode.children) || minNode.path
}

export function createNavo<const T extends NavoNodeInput[]>(
  nodeInputs: T,
  options?: CreateNavoOptions
) {
  return new Navo(nodeInputs, options)
}

export type BuildNode<T> = T extends NavoNodeInput
  ? Omit<T, 'children' | 'id' | 'path'> & {
      originPath: T['path'] extends string ? T['path'] : undefined
      id: T['id'] extends string ? T['id'] : string
      path: string
      parent: NavoNode | null
      type: number
    } & (T['children'] extends NavoNodeInput[] ? { children: BuildNodes<T['children']> } : object)
  : never

export type BuildNodes<T, D extends NavoNode[] = []> = T extends NavoNodeInput[]
  ? T extends [infer A, ...infer B]
    ? BuildNodes<B, [...D, BuildNode<A>]>
    : D
  : never

const NodeType = {
  /** 菜单组 */
  menuGroup: 0b1,
  /** 菜单 */
  menu: 0b10,
  /** 附属 */
  affiliated: 0b100,
  /** 布局 */
  layout: 0b1000,
  /** 页面 */
  page: 0b10000,
} as const

export type TypeKey = keyof typeof Navo.NodeType

export class Navo<const T extends NavoNodeInput[]> {
  constructor(nodes: T, options?: CreateNavoOptions) {
    this.originNodes = nodes
    this.basePath = options?.basePath ?? '/'
    this.canAccessScope = options?.canAccessScope ?? [NodeType.menu]
    this.defaultAccess = options?.defaultAccess ?? false
    this.buildNavoNodes()
    if (options?.defaultAccess) {
      this.authenticat()
    }
  }
  canAccessScope: number[]
  defaultAccess: boolean
  basePath: string
  originNodes: T
  nodes!: NavoNode[]
  idMap!: Map<string, NavoNode>
  authedNodes: NavoNode[] = []
  authedIdMap: Map<string, NavoNode> = new Map()
  authedRootResolvePath: string = ''

  static NodeType = NodeType
  // 类型守卫
  static isMenu(node: NavoNode) {
    return node.type & NodeType.menu
  }

  static isMenuGroup(node: NavoNode) {
    return node.type & NodeType.menuGroup
  }

  static isAffiliated(node: NavoNode) {
    return node.type & NodeType.affiliated
  }

  static isLayout(node: NavoNode) {
    return node.type & NodeType.layout
  }

  static isPage(node: NavoNode) {
    return node.type & NodeType.page
  }

  buildNavoNodes() {
    const idMap = new Map<string, NavoNode>()
    const r = (nodes: NavoNodeInput[], parent: NavoNode | null = null) => {
      const navoNodes: NavoNode[] = []
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const id = node.id ?? `${parent?.id ?? 'navo'}-${i}`
        if (idMap.has(id)) {
          throw new Error(`Duplicate id: ${id}`)
        }
        const cloneNode = { ...node }
        delete cloneNode.affiliated
        const navoNode = {
          ...cloneNode,
          id,
          parent,
          originPath: node.path,
          type: 0,
          path: getFullPath(node.path, parent ? parent?.path : this?.basePath),
        } as NavoNode

        idMap.set(id, navoNode)

        if (node.children?.length) {
          navoNode.children = r(node.children, navoNode)
        } else if ('children' in navoNode) {
          delete navoNode.children
        }

        if (node.children) {
          navoNode.type |= NodeType.layout
        } else {
          navoNode.type |= NodeType.page
        }

        if (node.affiliated) {
          navoNode.type |= NodeType.affiliated
        } else {
          if (navoNode.children) {
            let hasAffiliated = false
            let hasNormal = false
            for (const child of navoNode.children) {
              if (child.type & NodeType.affiliated) {
                hasAffiliated = true
              } else {
                hasNormal = true
              }
              if (hasAffiliated && hasNormal) break
            }
            if (hasAffiliated) {
              navoNode.type |= NodeType.menu
            }
            if (hasNormal) {
              navoNode.type |= NodeType.menuGroup
            }
          } else {
            navoNode.type |= NodeType.menu
          }
        }

        navoNodes.push(navoNode)
      }
      return navoNodes
    }

    this.nodes = r(this.originNodes) as BuildNodes<T>
    this.idMap = idMap
  }

  authenticat(callback?: CanAccess) {
    const authedIdMap: Map<string, NavoNode> = new Map()
    const r = (nodes: NavoNode[]) => {
      const newNodes: NavoNode[] = []
      const affiliatedNodes: NavoNode[] = []
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (callback) {
          if (this.canAccessScope.some((type) => node.type & type) && !callback(node)) continue
        } else {
          if (!this.defaultAccess) continue
        }
        const authedNode = {
          ...node,
          path: getResolvePath(node.children) ?? node.path,
        } as NavoNode
        const children = node.children ? r(node.children) : undefined
        authedNode.children = children?.nodes
        if (!authedNode.children?.length) {
          delete authedNode.children
        }

        authedIdMap.set(authedNode.id, authedNode)
        // 是否添加到可见节点列表
        let add = true
        if (authedNode.type & NodeType.affiliated) {
          add = false
          affiliatedNodes.push(authedNode)
        } else if (
          authedNode.type & NodeType.layout &&
          !children?.nodes?.length &&
          !children?.affiliatedNodes?.length
        ) {
          add = false
        }
        if (add) {
          newNodes.push(authedNode)
        }
      }
      return {
        nodes: newNodes,
        affiliatedNodes,
      }
    }

    const result = r(this.nodes)
    this.authedNodes = result.nodes
    this.authedIdMap = authedIdMap
    this.authedRootResolvePath = getResolvePath(this.nodes) ?? this.basePath
  }
}
