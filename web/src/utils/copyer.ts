import clipboard from 'clipboard'
import { createTreeNode, isTreeNodeJson, TreeNode } from './tree'

export const copyer = {
  copy(text: string) {
    clipboard.copy(text)
  },
  read() {
    return navigator.clipboard.readText()
  },
  async readLines() {
    const text = await navigator.clipboard.readText()
    if (text) {
      return text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
    }
    return []
  },
  copyTree(tree: TreeNode[]) {
    copyer.copy(JSON.stringify(tree))
  },
  async readTree() {
    const text = await copyer.read()
    if (isTreeNodeJson(text)) {
      return JSON.parse(text) as TreeNode[]
    } else if (text) {
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
      return lines.map((line, i) => createTreeNode(line, Date.now() + i))
    }
  },
}
