import { createYoga, type YogaServerInstance, type YogaServerOptions } from 'graphql-yoga'

export type KitQLServerOptions<TServerContext, TUserContext> = Omit<
  YogaServerOptions<TServerContext, TUserContext>,
  'graphiql'
>

export function createServer<
  TServerContext extends Record<string, any> = {},
  TUserContext extends Record<string, any> = {}
>(options?: KitQLServerOptions<TServerContext, TUserContext>): YogaServerInstance<TServerContext, TUserContext> {
  return createYoga<TServerContext, TUserContext>(options)
}
