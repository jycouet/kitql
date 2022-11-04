import type { GraphiQLRendererOptions as GraphiQLYogaOptions } from 'graphql-yoga/typings/plugins/useGraphiQL'

export type KitQLHandleGraphiQL = Omit<GraphiQLYogaOptions, 'headers' | 'endpoint'> & {
  /**
   * Send custom headers
   */
  headers?: Record<string, string>

  /**
   * As you added the handler, you probably want to use it... So it's enabled by default.
   *
   * **Default**: `true`
   *
   * ---
   * _Note:_
   * You can disable it with `dev` of `import { dev } from '$app/environment'`.
   */
  enabled?: boolean

  /**
   * The path to your graphql endpoint
   *
   * **Default**: `/api/graphql`
   *
   * ---
   * _Note:_
   * You can also set an external url like the Star Wars API: `https://swapi-graphql.netlify.app/`
   */
  endpoint?: string

  /**
   * The path to access your own GraphqiQL
   *
   * **Default**: `/api/graphiql`
   */
  graphiQLPath?: string
}

export const defaultQuery = `# Welcome to KitQL!

query MyFirstQuery {
  _greetings
}`
