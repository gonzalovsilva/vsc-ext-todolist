import Tree, { DataNode } from 'antd/lib/tree'
import keycode from 'keycode'
import React, { useEffect, useState } from 'react'

import { globalState } from '@/state'

import { OptionsBtnProps } from '../'
import { Key } from '../../../../src/api/type'
import { findNode, getArray, treeDrop, TreeNode } from '../../utils'

export interface TodoTreeProps {
  showLine?: boolean
  virtualMode: boolean
  titleRender: (node: DataNode) => React.ReactNode
  expandedKeys: Key[]
  onExpand: (keys: string[]) => void
  treeData: TreeNode[]
  handleDrop: (newTree: TreeNode[]) => void
  itemOptions: OptionsBtnProps
  onKeydown?(key: string, node: TreeNode, event: KeyboardEvent): void
}

export const TodoTree: React.FC<TodoTreeProps> = ({
  showLine,
  virtualMode,
  titleRender,
  expandedKeys,
  onExpand,
  treeData,
  handleDrop,
  itemOptions,
  onKeydown,
}) => {
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    setSelectedKeys([globalState.currentSelectKey])
  }, [globalState.currentSelectKey])

  useEffect(() => {
    if (!onKeydown) return
    const onKeydownHandle = (event: KeyboardEvent) => {
      const key = globalState.currentSelectKey
      if (key) {
        const node = findNode(getArray(treeData), key)
        if (node) {
          if (globalState.blockKeyboard) return
          onKeydown(keycode(event), node, event)
        }
      }
    }
    document.addEventListener('keydown', onKeydownHandle)
    return () => document.removeEventListener('keydown', onKeydownHandle)
  }, [
    treeData,
    selectedKeys,
    globalState.blockKeyboard,
    globalState.currentSelectKey,
  ])

  return (
    <Tree
      motion={null}
      height={virtualMode ? 500 : undefined}
      titleRender={titleRender}
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      draggable={{ icon: false }}
      blockNode
      showLine={showLine}
      onDrop={treeDrop(treeData, handleDrop)}
      treeData={treeData}
      onRightClick={({ node }) => {
        setSelectedKeys([node.key])
      }}
      onSelect={(keys) => {
        setSelectedKeys(keys)
        globalState.currentSelectKey = getArray(keys)[0]
      }}
      selectedKeys={selectedKeys}
    />
  )
}
