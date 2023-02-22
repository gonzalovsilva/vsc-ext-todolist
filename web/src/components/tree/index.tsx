import Tree, { DataNode } from 'antd/lib/tree'
import React, { useEffect, useState } from 'react'
import hotkey from 'hotkeys-js'

import { globalState } from '@/state'

import { Key } from '../../../../src/api/type'
import { findNode, getArray, treeDrop, TreeNode } from '../../utils'
import { defaultKeymap } from '../settings-modal/keybind'

export interface TodoTreeProps {
  showLine?: boolean
  virtualMode: boolean
  titleRender: (node: DataNode) => React.ReactNode
  expandedKeys: Key[]
  onExpand: (keys: string[]) => void
  treeData: TreeNode[]
  handleDrop: (newTree: TreeNode[]) => void
  onHotKeydown?(funcType: string, node: TreeNode, event: KeyboardEvent): void
  keymap: any
}

const parseHotEventName = (key: string) =>
  Array.from(new Set(key.toLowerCase().replace(/ /g, '').split(','))).join(',')

export const TodoTree: React.FC<TodoTreeProps> = ({
  showLine,
  virtualMode,
  titleRender,
  expandedKeys,
  onExpand,
  treeData,
  handleDrop,
  onHotKeydown,
  keymap,
}) => {
  const [selectedKeys, setSelectedKeys] = useState([])

  useEffect(() => {
    setSelectedKeys([globalState.currentSelectKey])
  }, [globalState.currentSelectKey])

  useEffect(() => {
    if (!onHotKeydown) return

    const keyMaps = Object.assign({}, defaultKeymap, keymap || {})

    const listeners = []
    const unlisteners = []

    Object.keys(keyMaps).map(funcType => {
      const hotkeyType = keyMaps[funcType]
      const kotEventName = parseHotEventName(hotkeyType)
      listeners.push(() => {
        hotkey(kotEventName, event => {
          const key = globalState.currentSelectKey
          const node = findNode(getArray(treeData), key)
          if (globalState.blockKeyboard) return
          onHotKeydown(funcType, node, event)
        })
      })
      unlisteners.push(() => hotkey.unbind(kotEventName))
    })

    listeners.forEach(l => l())
    return () => {
      unlisteners.forEach(l => l())
    }
  }, [
    treeData,
    selectedKeys,
    globalState.blockKeyboard,
    globalState.currentSelectKey,
    keymap,
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
      onSelect={keys => {
        setSelectedKeys(keys)
        globalState.currentSelectKey = getArray(keys)[0]
      }}
      selectedKeys={selectedKeys}
    />
  )
}
