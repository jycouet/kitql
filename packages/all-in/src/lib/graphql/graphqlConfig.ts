import type { IGraphQLProject } from 'graphql-config'

export interface KitQLProjects {
  projects: {
    [name: string]: IGraphQLProject
  }
}

export type KitQLConfig = {
  projectLocation?: string
  scalars?: KitQLScalar
}

export type KitQLScalar = Record<string, string>
