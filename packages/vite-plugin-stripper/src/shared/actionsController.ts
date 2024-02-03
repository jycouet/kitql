import { AUTH_SECRET } from '$env/static/private'

import { BackendMethod, remult, type Allowed } from 'remult'

export class ActionsController {
  @BackendMethod({
    // Only unauthenticated users can call this method
    allowed: () => remult.user === undefined,
  })
  static async read(info: Allowed) {
    console.info('AUTH_SECRET', AUTH_SECRET)
    return AUTH_SECRET + ' ' + info
  }
}
