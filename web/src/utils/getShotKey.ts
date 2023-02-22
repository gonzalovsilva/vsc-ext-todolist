import keycode from 'keycode'
import { isNullOrUndefined } from './is'

export const getShotKeyType = (keymap: any, event: KeyboardEvent) => {
  if (keymap) {
    const key = keycode(event)
    if (isNullOrUndefined(key)) return
    const ctrl = event.ctrlKey || event.metaKey
    const alt = event.altKey
    const prefixs = []
    if (ctrl) {
      prefixs.push('ctrl')
    }
    if (alt) {
      prefixs.push('alt')
    }
    const shot = `${
      prefixs.length > 0 ? `${prefixs.join('+')}+` : ''
    }${key.toLowerCase()}`
    for (const shottype in keymap) {
      const curShot = keymap[shottype] as string
      const curShots = curShot.toLowerCase().replace(/ /g, '').split(',')
      if (curShots.includes(shot)) {
        return shottype
      }
    }
  }
}
