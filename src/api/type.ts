import type { Pair } from '@saber2pr/vscode-webview'

export type IStoreTodoTree = {
  tree: ITodoTree[]
  expandKeys: Key[]
  schema: 'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L3'
  add_mode: 'top' | 'bottom'
  virtual?: boolean
  showLine?: boolean
  playFontSize?: number
  webhook?: string
  title?: string
  autoSort?: boolean
  showEndTime?: boolean
  page?: 'plan' | 'schedule'
  lang?: 'zh-cn' | 'en'
  desc?: string
  version?: string
  keymap?: string
}

// service type define
export type Services = {
  Store: Pair<
    {
      key: string
      value: any
      path?: string
    },
    string
  >
  GetStore: Pair<{ key: string; path?: string }, IStoreTodoTree>
  SaveFile: Pair<{ title: string; path: string; content: string }, any>
  SaveFileAs: Pair<{ title: string; name: string; content: string }, any>
  openFile: Pair<any, string>
  reload: Pair<any, any>
  // config
  SetConfig: Pair<{ key: keyof ITodoListConfig; value: any }, any>
  GetConfig: Pair<{ key: keyof ITodoListConfig }, string>
  GetDefaultFilePath: Pair<any, string>
  // display
  SetDisplayFile: Pair<string, any>
  GetDisplayFile: Pair<any, string>
  // vscode
  OpenFile: Pair<{ path: string }>
}

export type ITodoItem = {
  id: number
  content: string
  done: boolean
  level: 'secondary' | 'default' | 'success' | 'warning' | 'danger'
  link?: string
  pendingDelete?: boolean
  date?: string // start,end
  tip?: string
  focus?: boolean
  start?: number
  end?: number
}

export type ITodoTree = {
  key: string | number
  children: ITodoTree[]
  todo: ITodoItem
}

export type Key = string | number

export interface ITodoListConfig {
  displayFile: string
}
