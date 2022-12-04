import { APP_ARGS } from '@/utils'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../src/constants'

import type { IStoreTodoTree, Services } from '../../../src/api/type'

export const useSettingsStore = () => {
  // init
  const loadSource = async () => {
    // load todo file
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: APP_ARGS?.file,
    })
    if (todo) {
      const val: IStoreTodoTree = todo
      return val
    }
  }

  const setter = async (modify: (val: IStoreTodoTree) => IStoreTodoTree) => {
    const oldData = await getter()
    const tree = JSON.parse(JSON.stringify(modify(oldData || ({} as any))))
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: tree,
      path: APP_ARGS?.file,
    })
  }

  const getter = async <T = IStoreTodoTree>(
    selector?: (data: IStoreTodoTree) => T
  ) => {
    const oldData = await loadSource()
    return selector ? selector(oldData) : oldData
  }

  return {
    set: setter,
    get: getter,
  }
}
