import { describe, expect, expectTypeOf, it } from 'bun:test'
import { createNavo } from '../src/main'

describe('createNavo', () => {
  it('should create a navo instance', () => {
    const navo = createNavo([
      { id: 'nav-1', path: '/nav-1' },
      { id: 'nav-2', path: '/nav-2', children: [{ id: 'menu-1', path: 'menu-1' }] },
    ])
    expectTypeOf(navo.originNodes[0]).toEqualTypeOf<{
      readonly id: 'nav-1'
      readonly path: '/nav-1'
    }>()
    expect(navo.nodes[0].id).toEqual('nav-1')
    expect(navo.nodes[1].id).toEqual('nav-2')
    expect(navo.nodes[0].originPath).toEqual('/nav-1')
    expect(navo.nodes[1].originPath).toEqual('/nav-2')
    expect(navo.nodes[1].children?.[0].originPath).toEqual('menu-1')
  })
})
