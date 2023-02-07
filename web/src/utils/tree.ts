import { DataNode } from 'antd/lib/tree'

import { ITodoItem, ITodoTree } from '../../../src/api/type'
import { TodoLevels } from '../components'
import { parseTimeRange } from './date'
import { getArray } from './getArray'
import { isJSON } from './is'

export interface TreeNode extends DataNode {
  todo: ITodoItem
  children: TreeNode[]
  toJSON?: () => ITodoTree
}

export const isTreeNodeJson = (node: string) => {
  return (
    isJSON(node) &&
    /todo/.test(node) &&
    /children/.test(node) &&
    /id/.test(node) &&
    /content/.test(node) &&
    /done/.test(node) &&
    /level/.test(node)
  )
}

export const getTreeKeys = (...tree: TreeNode[]) => {
  const keys = []
  mapTree(tree, node => {
    node.key && keys.push(node.key)
    return node
  })
  return keys
}

export const findNode = (
  treeNode: TreeNode[],
  key: number | string | ((node: TreeNode) => boolean)
): TreeNode => {
  if (!(treeNode?.length > 0)) return
  const stack = Array.isArray(treeNode) ? treeNode.slice() : []
  while (stack.length) {
    const node = stack.pop()
    const checked = typeof key === 'function' ? key(node) : node.key === key
    if (checked) return node
    stack.push(...node.children)
  }
}

export const findNodes = (
  treeNode: TreeNode[],
  finder: (item: TreeNode) => boolean
): TreeNode[] => {
  const result: TreeNode[] = []

  if (!(treeNode?.length > 0)) return result

  const stack = Array.isArray(treeNode) ? treeNode.slice() : []
  while (stack.length) {
    const node = stack.pop()
    if (finder(node)) result.push(node)
    stack.push(...node.children)
  }

  return result
}

export const findNodeParent = (
  treeNode: TreeNode[],
  key: number | string
): TreeNode => {
  if (!(treeNode?.length > 0)) return
  const stack = Array.isArray(treeNode) ? treeNode.slice() : []
  while (stack.length) {
    const node = stack.pop()
    const hasChild = getArray(node.children).find(item => item.key == key)
    if (hasChild) return node
    stack.push(...node.children)
  }
}

export const insertNodeSibling = (
  container: TreeNode[],
  key: number | string,
  newNode: TreeNode,
  pos: 'before' | 'after' = 'after'
) => {
  const index = getArray(container).findIndex(item => item.key == key)
  if (index === -1) {
    container.push(newNode)
  } else {
    container.splice(pos === 'after' ? index + 1 : index, 0, newNode)
  }
}

export const appendNodes = (container: TreeNode[], ...node: TreeNode[]) => {
  if (Array.isArray(container)) {
    container.push(...node)
  }
}

export const insertNodes = (container: TreeNode[], ...node: TreeNode[]) => {
  if (Array.isArray(container)) {
    container.unshift(...node)
  }
}

export const removeNode = (container: TreeNode[], node: TreeNode) => {
  if (Array.isArray(container)) {
    container.splice(container.indexOf(node), 1)
  }
}
export const clearDoneNode = (
  treeNode: TreeNode[],
  isRemove: (node: TreeNode) => boolean
) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: TreeNode[] = []
  for (const node of treeNode) {
    if (isRemove(node)) {
      continue
    }
    nextTree.push(node)
    node.children = clearDoneNode(node.children, isRemove)
  }
  return nextTree
}

export interface TreeLike {
  children?: any[]
}

export const mapTree = <N extends TreeLike, T extends TreeLike>(
  treeNode: N[],
  mapFunc: (node: N) => T
) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: T[] = []
  for (const node of treeNode) {
    const newNode = mapFunc(node)
    newNode.children = mapTree(node.children, mapFunc)
    nextTree.push(newNode)
  }
  return nextTree
}

export const cloneTree = (tree: TreeNode[]) => {
  let i = 0
  const start = Date.now()
  return mapTree(tree, n => {
    const newNode = { ...n }
    i++
    newNode.key = start + i
    return newNode
  })
}

export const sortTree = (treeNode: TreeNode[]) => {
  if (!(treeNode?.length > 0)) return []
  const nextTree: TreeNode[] = []

  // sort
  const treeNodeSorted = treeNode.slice().sort((a, b) => {
    const todoA = a?.todo
    const todoB = b?.todo
    if (todoA && todoB) {
      const aVal = TodoLevels[todoA.level] ?? 0
      const bVal = TodoLevels[todoB.level] ?? 0

      const offset = aVal - bVal

      // same level, compare date
      if (offset === 0) {
        const aDate = parseTimeRange(todoA.date) || [Number.MAX_VALUE]
        const bDate = parseTimeRange(todoB.date) || [Number.MAX_VALUE]
        return aDate[0] - bDate[0]
      }

      return offset
    }
    return 0
  })

  // split
  const newTreeNodeFocus: TreeNode[] = []
  const newTreeNodeProcess: TreeNode[] = []
  const newTreeNodeDone: TreeNode[] = []
  for (const node of treeNodeSorted) {
    if (node?.todo?.done) {
      newTreeNodeDone.push(node)
    } else if (node?.todo?.focus) {
      newTreeNodeFocus.push(node)
    } else {
      newTreeNodeProcess.push(node)
    }
  }

  // concat: focus > process > done
  const newTree = newTreeNodeFocus.concat(newTreeNodeProcess, newTreeNodeDone)
  for (const node of newTree) {
    const newNode = { ...node }
    newNode.children = sortTree(newNode.children)
    nextTree.push(newNode)
  }
  return nextTree
}

export const countTreeSize = (treeNode: TreeNode[]): number => {
  let size = 0
  if (!(treeNode?.length > 0)) return size
  const stack = Array.isArray(treeNode) ? treeNode.slice() : []
  while (stack.length) {
    const node = stack.pop()
    size++
    stack.push(...node.children)
  }
  return size
}

export const checkTreeSetTime = (treeNode: TreeNode[]) => {
  return !!findNode(treeNode, node => !!node?.todo?.date)
}

export const checkTreeSet = (
  treeNode: TreeNode[],
  keys: (keyof ITodoItem)[]
) => {
  const result = keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  findNode(treeNode, node => {
    const todo = node?.todo
    if (todo) {
      let finish = false
      for (const key in result) {
        result[key] = !!todo[key]
        finish = finish && result[key]
      }
      // break
      if (finish) {
        return true
      }
    }
  })
  return result
}

export const createTreeNode = (content = '', key = Date.now()) => {
  const newNode: TreeNode = {
    key,
    children: [],
    todo: {
      content,
      id: key,
      level: 'default',
      done: false,
      start: Date.now(),
    },
    toJSON: () => ({
      key: newNode.key,
      children: newNode.children,
      todo: newNode.todo,
    }),
  }
  return newNode
}
