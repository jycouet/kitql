import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const _kitRoutes = <T>(key: string, initValues: T) => {
  const store = writable<T>(initValues, set => {
    if (browser) {
      const v = localStorage.getItem(key)
      if (v) {
        try {
          const json = JSON.parse(v)
          set(json)
        } catch (error) {
          set(initValues)
        }
      } else {
        set(initValues)
      }

      //
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) set(event.newValue ? JSON.parse(event.newValue) : null)
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    }
  })

  return {
    subscribe: store.subscribe,
    update: (u: T) => {
      if (browser) {
        localStorage.setItem(key, JSON.stringify(u))
        store.update(() => u)
      } else {
        console.error('You should not update kitRoutes from server side!')
      }
    },
  }
}

/**
 *
 * Example of usage:
 * ```ts
 *  import { afterNavigate } from '$app/navigation'
 *  import { kitRoutes } from '$lib/ROUTES.js'
 *
 *  afterNavigate(() => {
 *	  kitRoutes.update({ lang: $page.params.lang })
 *  })
 * ```
 *
 */
export let kitRoutes = _kitRoutes<{ lang: string }>('kitRoutes', { lang: 'fr' })
