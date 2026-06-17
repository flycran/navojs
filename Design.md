# 🧭 Navigation Engine 设计文档（v0.2）

---

# 一、项目定位

## 🎯 本库是什么

> **Framework-agnostic Navigation Engine**

用于解决：

* 菜单 / 路由同源
* 导航激活状态
* 默认入口（重定向）解析
* 权限驱动的导航结构

---

## ❗ 核心原则

> **Routing 决定"在哪"**
> **Navigation 决定"如何表达 & 去哪"**

---

## ❌ 本库不做

* 不负责 UI 渲染
* 不负责路由注册
* 不负责页面加载 / 数据请求
* 不控制跳转行为（只提供信息）
* 不处理 404 路由（由用户在 router 层自行添加）
* 不处理 query 参数维度的导航状态

---

# 二、核心模型设计

## 2.1 NavNode（唯一输入源）

```ts
type NavNode = {
  id: string

  affiliated?: boolean  // 有路由但无菜单身份，激活状态归属最近祖先

  path?: string
  children?: NavNode[]

  resolve?: number
  // number: 优先级权重，越小越优先，默认 100
  // string: 指向某个节点 id
  // function: 自定义逻辑

  meta?: {
    title: string
    icon?: any
  }
}
```

---

## ❗ 设计原则

* NavTree 是**唯一数据源**
* 所有能力（菜单、路由、权限）均从 NavTree 派生
* 兼容已有的路由定义

如果由于某些原因无法使用Navo生成的路由，例如：

- 项目的routes数量庞大，定义位置分散
- 项目使用约定式路由定义
- 其他原因...

Navo可以只为导航UI提供驱动结构。
只需在route里添加和NavNode相同的id，即可无缝联动route和NavNode。这为迁移到Navo提供了灵活性。

---

## 节点类型语义

节点类型由结构自动推导，无需手动声明：

一个节点可能有多种类型，使用二进制按位与运算符 `&` 进行判断

- `group` 组合
- `menu` 直接驱动UI的菜单节点
- `affiliated` 有路由但不出现在菜单，激活状态向上归属
- `page` 页面节点，可能有菜单，也可能没有菜单，可能是附属节点，但一定有页面

---

# 三、affiliated 节点

## 语义

`affiliated: true` 的节点：

1. **菜单永远不渲染此节点**
2. **访问此页面时，自动向上找到最近的非 affiliated 祖先**，将其设为 `activeNavNode`

## 典型用法

```ts
{
  id: 'user-management',
  path: 'users',
  meta: { title: '用户管理' },
  children: [
    { id: 'user-list', path: 'list', affiliated: true }, // 访问列表时，用户管理高亮
    { id: 'user-detail', path: ':id', affiliated: true }  // 访问详情时，用户管理高亮
  ]
}
```

或者

```ts
{
  id: 'user-management',
  path: 'users',
  meta: { title: '用户管理' },
  children: [
    { id: 'user-list', path: '', affiliated: true }, // 没有额外path
    { id: 'user-detail', path: ':id', affiliated: true }  // 访问详情时，用户管理高亮
  ]
}
```

---

# 四、Entry Resolution（核心能力）

## 🎯 问题

如何从一个导航节点解析出：

> 👉 **最终可访问页面（无重定向闪烁）**

### resolve 定义

```ts
resolve?: number 
// 优先级权重，越小越优先
```

### 默认策略

```
1. 子节点按 priority 排序
2. 找第一个"可访问"的子节点（结合 canAccess）
3. 递归直到 page 节点
```

---

# 五、权限模型

## 设计原则

> Navo 不实现权限逻辑，只消费结果

## 接口

```ts
canAccess?: (node: NavNode) => boolean
```

## 使用位置

* resolve 阶段（优先级 + canAccess 一起参与选择）
* tree 过滤阶段（生成 visibleTree）
* UI 判断

> 实际上所有节点的鉴权都会在调用鉴权时一次性完全，后续运行不会再重复调用canAccess

---

# 六、Router 适配层设计

## 核心思想

> Navo 不持有 router，只消费 router 状态

## Adapter 接口

```ts
useMatches(): NavoNode[]
```

## ❗ 强约束

> 如果使用Navo生成 routes ，Navo 将保存id一致性。
> 如果使用独立定义的 routes ，`route.id` 必须与 `NavNode.id` 保存一致。

## matches 过滤

`useMatches` 返回的 matches 链中，可能包含无对应 NavNode 的 路由，直接过滤掉即可。

---

# 七、generateRoutes

## 定位

> 必须由 Navo 实现，不能让用户自己完成——路由生成涉及 Navo 的底层机制（id 约定、affiliated 处理、index route 注入等）。

## 生成规则

| NavNode              | 生成 route                                              |
| -------------------- | ------------------------------------------------------- |
| 有 children（group） | layout route + index route（承载 resolve 跳转）         |
| 无 children（page）  | 普通 route                                              |
| `affiliated: true`   | 正常生成 route，但 id 对应的节点在 visibleTree 中不存在 |

## index route 说明

group 节点会自动生成一个 index route 用于承载 resolve 跳转（`<Navigate to={resolvedPath} />`）。这个 index route：

* 内部生成，不对应任何 NavNode
* 即时跳转，不会真正渲染
* id 无需关心（用户代码没有机会消费它）

## Escape 机制

纯路由层的字段（`loader`、`action`、`errorElement`、`lazy` 等）与 NavNode 无关，通过 Escape 透传：

```ts
{
  id: 'user-list',
  path: 'list',
  meta: { title: '用户列表' },
  route: {  // Escape：直接透传给生成的 route 对象
    loader: () => fetchUsers(),
    lazy: () => import('./UserList')
  }
}
```

## 与用户路由合并

Navo 只生成导航相关的 routes，其余由用户自行补充后合并：

```ts
createBrowserRouter([
  ...generateRoutesFromNavTree(tree),
  { path: '*', element: <NotFound /> }  // 404 由用户自己处理
])
```

---

# 八、React 绑定层设计

## Context

```ts
NavigationContext = {
  navigation
}
```

不包含：router、UI 状态

## Hooks 设计

### useNavigationState

```ts
{ activeNode, activeChain }
```

当前路由对应的激活状态（affiliated 节点自动向上归属）

### useNavigationTree

```ts
{ tree, visibleTree }
```

导航结构（`visibleTree` 已排除 affiliated 节点）

### useNavigationActions

```ts
{ resolve(id), canAccess(node) }
```

行为能力

## ❗ 设计原则

* 按职责拆分（state / data / actions）
* 避免单一大 hook 导致不必要 re-render

---

# 九、核心 API 设计

## defineNavTree

```ts
defineNavTree(tree)
```

作用：类型约束 + 校验（id 唯一性、resolve 引用合法性等）

## createNavigation

```ts
createNavigation({
  tree,
  adapter,
  canAccess
})
```

## React API

```ts
<NavigationProvider />

useNavigationState()
useNavigationTree()
useNavigationActions()
```

---

# 十、内部核心机制

## NavNodeMap

```ts
id → node
```

## match → node 映射

```ts
matches（已过滤）→ activeChain
```

## resolveMap（预计算）

```ts
id → { node, path }
```

用于消除 redirect 闪烁，UI 直接跳最终页面。

> 注意：权限异步加载时，需要一个"权限就绪"时机信号触发重算。

## 权限过滤

```ts
tree → visibleTree（排除 affiliated + 无权限节点）
```

---

# 十一、明确不做的能力

* 路由注册
* 自动跳转
* UI 组件
* 动画 / 过渡
* 数据加载
* 404 处理
* query 参数维度的导航状态

---

# 十二、未确定 / 待讨论设计

## ⚠️ 1. 动态路由参数

```ts
/users/:id
```

`useMatches` 会返回 params，但 NavNode 的 id 是静态的。`/users/1` 和 `/users/2` 会 match 到同一个 NavNode，这个行为是否符合预期需要确认。

当前建议：resolve 返回 node，不处理 params。

## ⚠️ 2. 空节点处理

```ts
group → 无可访问子节点
```

方案：返回 null，或自动在 visibleTree 中隐藏。

## ⚠️ 3. Escape 字段命名

透传给 route 的字段用什么 key？`_route`？`routeProps`？待定。

## ⚠️ 4. 权限就绪时机

`resolveMap` 预计算依赖 `canAccess`，权限异步加载时需要设计一个就绪信号，避免基于空权限的错误预计算。

---

# 十三、未来扩展方向

## 可扩展

* breadcrumb 生成
* tabs / 多开页
* keep-alive
* route preload

## 不建议扩展

* router 控制
* UI 组件

---

# 十四、最终总结

## 🔥 架构本质

> **NavTree →（match）→ activeChain →（resolve）→ final page**

## 🔥 设计哲学

1. 单一数据源（NavTree）
2. 类型由结构推导，不冗余声明
3. 扩展能力集中（resolve + Escape）
4. router 解耦（adapter）
5. UI 解耦（hooks 分层）

---

> 库还在设计阶段，以上设计都不是最终版，如果有更好的方案或对现有设计的缺陷，可以随时更改。