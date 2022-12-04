import { saveAs } from 'file-saver'

export const webSaveFile = (fileName: string, fileContent: string) => {
  const blob = new Blob([fileContent], {
    type: 'text/plain;charset=utf-8',
  })
  return saveAs(blob, fileName)
}
