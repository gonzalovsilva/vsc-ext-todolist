import { Button, Dropdown, Menu, message } from 'antd'
import React from 'react'

import { copyer } from '@/utils/copyer'
import MoreOutlined from '@ant-design/icons/MoreOutlined'

import { i18n } from '../../i18n'
import { cloneTree, getArray, TreeNode } from '../../utils'

export interface ViewOptionsProps {
  tree: TreeNode[]
  onUpdate: VoidFunction
  onExpandAll: VoidFunction
  onCollapseAll: VoidFunction
  onPaste: (tree: TreeNode[]) => any
  onSort: VoidFunction
  onSearch: VoidFunction
}

export const ViewOptions: React.FC<ViewOptionsProps> = ({
  onCollapseAll,
  onExpandAll,
  onUpdate,
  onPaste,
  onSort,
  onSearch,
  tree,
}) => {
  const menu = (
    <Menu>
      <Menu.SubMenu title={i18n.format('viewOps')}>
        <Menu.Item onClick={onUpdate}>{i18n.format('update')}</Menu.Item>
        <Menu.Item onClick={onCollapseAll}>
          {i18n.format('collapseAll')}
        </Menu.Item>
        <Menu.Item onClick={onExpandAll}>{i18n.format('expandAll')}</Menu.Item>
      </Menu.SubMenu>
      <Menu.Item
        onClick={async () => {
          copyer.copyTree(getArray(tree))
          message.success(i18n.format('copy_success'))
        }}
      >
        {i18n.format('copy')}
      </Menu.Item>
      <Menu.Item
        onClick={async () => {
          const tree: TreeNode[] = await copyer.readTree()
          onPaste(cloneTree(getArray(tree)))
        }}
      >
        {i18n.format('paste')}
      </Menu.Item>
      <Menu.Item onClick={onSearch}>{i18n.format('search_title')}</Menu.Item>
      <Menu.Item onClick={onSort}>{i18n.format('sort')}</Menu.Item>
    </Menu>
  )

  return (
    <Dropdown placement="topCenter" trigger={['click']} overlay={menu}>
      <Button type="text">
        {i18n.format('viewOps')}
        <MoreOutlined />
      </Button>
    </Dropdown>
  )
}
