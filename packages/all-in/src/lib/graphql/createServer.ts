import { createServer as createServerYoga, type YogaServerInstance, type YogaServerOptions } from '@graphql-yoga/common'

export type KitQLServerOptions<TServerContext, TUserContext, TRootValue> = Omit<
  YogaServerOptions<TServerContext, TUserContext, TRootValue>,
  'graphiql'
>

export function createServer<
  TServerContext extends Record<string, any> = {},
  TUserContext extends Record<string, any> = {},
  TRootValue = {}
>(
  options?: KitQLServerOptions<TServerContext, TUserContext, TRootValue>
): YogaServerInstance<TServerContext, TUserContext, TRootValue> {
  return createServerYoga<TServerContext, TUserContext, TRootValue>(options)
}
