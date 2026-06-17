import { describe, expectTypeOf, it } from 'bun:test'
import { createNavo, generateRoutes } from '../src/index'

describe('createNavo', () => {
  it('should create a navo instance', () => {
    const navo = createNavo([
      { id: 'nav-1', path: '/nav-1' },
      {
        id: 'nav-2',
        path: '/nav-2',
        children: [
          {
            id: 'menu-1',
            path: 'menu-1',
            route: {
              loader: () => 'data',
            },
          },
        ],
      },
    ])
    const routes = generateRoutes(navo)
    expectTypeOf(routes[1].children[0].loader).toBeFunction()
  })
})
