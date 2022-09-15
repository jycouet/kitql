import { dev } from '$app/environment'
import { kitqlServer } from '$lib/graphql/kitQLServer'
import { graphiql } from '$lib/hooks/graphiql'
import { graphql } from '$lib/hooks/graphql'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(
  // Add graphql
  graphql(kitqlServer),

  // graphiql
  graphiql({
    enabled: dev,
  })
)
