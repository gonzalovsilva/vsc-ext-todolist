import clipboard from 'clipboard'
import { isTreeNodeJson, TreeNode } from './tree'

export const copyer = {
  copy(text: string) {
    clipboard.copy(text)
  },
  read() {
    return navigator.clipboard.readText()
  },
  copyTree(tree: TreeNode[]) {
    copyer.copy(JSON.stringify(tree))
  },
  async readTree() {
    const text = await copyer.read()
    if (isTreeNodeJson(text)) {
      return JSON.parse(text) as TreeNode[]
    }
  },
}