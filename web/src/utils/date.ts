import { isNullOrUndefined } from "./is"

export const parseTimeRange = (date: string): [number, number] => {
  if (date) {
    const [start, end] = date.split(',')
    return [Number(start), Number(end)]
  }
  return
}

export const formatSeconds = (seconds: number, split = ':') => {
  if (isNullOrUndefined(seconds) || Number.isNaN(seconds)) {
    return '-'
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(split)
}
