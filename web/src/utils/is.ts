export const isJSON = (str: string) => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

export const isUndefined = (val: any): val is undefined =>
  typeof val === 'undefined'

export const isNull = (val: any): val is null => val === null

export const isNullOrUndefined = (val: any) => isNull(val) || isUndefined(val)
