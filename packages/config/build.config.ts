import fs from 'node:fs/promises'
import type { BuildConfig } from 'bun'

const pkgFile = await fs.readFile('./package.json', 'utf-8')
const pkg = JSON.parse(pkgFile)
const dependencies: string[] = Object.keys(pkg.dependencies ?? {})
const peerDependencies: string[] = Object.keys(pkg.peerDependencies ?? {})
const devDependencies: string[] = Object.keys(pkg.devDependencies ?? {})

const des = dependencies.concat(peerDependencies, devDependencies)

export const config: BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  external: [...des],
}
