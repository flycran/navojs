import { config } from '@navojs/config/build.config'

Bun.build(config)

import('./src').catch((e) => console.error(e))
