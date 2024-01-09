import { remult } from 'remult'
import { remultSveltekit } from 'remult/remult-sveltekit'

// import { createPostgresDataProvider } from 'remult/postgres';
// import { DATABASE_URL } from '$env/static/private';
import { entities, controllers } from '../shared'
import { Task } from '../shared'

export const handleRemult = remultSveltekit({
  // dataProvider: createPostgresDataProvider({ connectionString: DATABASE_URL })
  entities,
  controllers,
  initApi: async () => {
    try {
      if ((await remult.repo(Task).count()) === 0) {
        await remult.repo(Task).insert({ title: 'Well done!' })
        await remult
          .repo(Task)
          .insert({ title: "You've successfully created a new KitQL remult project. 🚀" })
      }
    } catch (error) {
      console.error(error)
    }
  },
})
