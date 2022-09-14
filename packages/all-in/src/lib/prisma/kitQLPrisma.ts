import { performance } from 'perf_hooks'
import { PrismaClient } from '@prisma/client'
import { Log, logCyan, logMagneta, logYellow } from '@kitql/helper'

export const getKitQLPrisma = (withSQL = false, withLog = true) => {
  const log = new Log('KitQL:Prisma')

  const prismaInstance = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })

  if (withSQL) {
    prismaInstance.$on('query', e => {
      log.info(
        `${logCyan(`  🔷 prisma SQL   (${e.duration.toFixed(0).padStart(3, ' ')} ms)`)}` +
          ` ${logMagneta(e.query)} ${logYellow(e.params)}`
      )
    })
  }

  prismaInstance.$use(async (params, next) => {
    const start = performance.now()
    const result = await next(params)
    if (withLog) {
      const took = performance.now() - start

      const argsJson = JSON.stringify(params.args)
      // ⚪ It's a create
      // 🟣 It's an update
      // 🟤 It's an delete
      // 🟥 It's a rawquery!
      // 🟩 It's probably a dalaloader! Well done!
      // 🟦 It's a usual query!
      const logo =
        params.action === 'create' || params.action === 'createMany'
          ? '⚪'
          : params.action === 'update' || params.action === 'updateMany' || params.action === 'upsert'
          ? '🟣'
          : params.action === 'delete' || params.action === 'deleteMany'
          ? '🟤'
          : params.action === 'queryRaw'
          ? '🟥'
          : argsJson && argsJson.startsWith('{"where":{"id":{"in":[')
          ? '🟩'
          : '🟦'

      log.info(
        `${logCyan(`  ${logo} prisma query (${took.toFixed(0).padStart(3, ' ')} ms)`)}` +
          ` ${logMagneta(params.action + (params.model ? ' ' + params.model : ''))}` +
          ` ${logYellow(
            params.action === 'queryRaw'
              ? 'RAW SQL - ' + params.args.query.split(' ')[0] + '...'
              : JSON.stringify(params.args)
          )}`
      )
    }
    return result
  })

  return prismaInstance
}
