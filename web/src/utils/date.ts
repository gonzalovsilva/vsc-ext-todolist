export const parseTimeRange = (date: string): [number, number] => {
  if (date) {
    const [start, end] = date.split(',')
    return [Number(start), Number(end)]
  }
  return
}
