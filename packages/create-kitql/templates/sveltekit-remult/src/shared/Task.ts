import { BackendMethod, Entity, Fields, remult } from 'remult'

@Entity('tasks', {
  allowApiCrud: true,
})
export class Task {
  @Fields.cuid()
  id!: string

  @Fields.string<Task>({
    validate: (task) => {
      if (task.title.length < 3) throw 'The title must be at least 3 characters long'
    },
  })
  title: string = ''

  @Fields.boolean()
  completed: boolean = false

  @Fields.createdAt()
  createdAt?: Date
}

export class TasksController {
  @BackendMethod({ allowed: true })
  static async setAllCompleted(completed: boolean) {
    const taskRepo = remult.repo(Task)

    for (const task of await taskRepo.find()) {
      await taskRepo.update(task.id, { completed })
    }
  }
}
