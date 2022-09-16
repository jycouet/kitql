import { dev } from '$app/environment'
import { kitqlServer } from '$lib/graphql/kitQLServer'
import { handleGraphiql } from '$lib/hooks/graphiql'
import { handleGraphql } from '$lib/hooks/graphql'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(
  //
  handleGraphql(kitqlServer),

  //
  await handleGraphiql({
    enabled: dev,
  })
)
