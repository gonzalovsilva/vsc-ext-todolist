import Button from 'antd/lib/button'
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'
import message from 'antd/lib/message'
import { BaseType } from 'antd/lib/typography/Base'
import React from 'react'

import { globalState } from '@/state'
import MoreOutlined from '@ant-design/icons/MoreOutlined'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../../src/constants'
import { i18n } from '../../i18n'
import { TreeNode } from '../../utils'
import { useInputTimeRangeModal } from '../date-setter/input-time-range'
import { usePromptModal } from '../prompt-modal'

import type { Services } from '../../../../src/api/type'
import SubMenu from 'antd/lib/menu/SubMenu'
export const TodoLevels: Record<BaseType | 'default', number> = {
  danger: 0,
  warning: 1,
  success: 2,
  default: 3,
  secondary: 4,
}

export interface OptionsBtnProps {
  node: TreeNode
  onPaste: (node: TreeNode) => void
  onAddLink: (link: string) => void
  onAddComment: (comment: string) => void
  onExpandAll: (node: TreeNode) => void
  onDelete: (node: TreeNode) => void
  onFocus: (node: TreeNode) => void
  onCollapseAll: (node: TreeNode) => void
  onDateRangeSet: (date: string) => void
  menuOnly?: boolean
}

export const copyNode = async (node: TreeNode) => {
  await callService<Services, 'SetTemp'>('SetTemp', {
    key: KEY_TODO_TREE,
    value: JSON.parse(JSON.stringify([node])),
  })
  message.success(i18n.format('copy_success'))
}

export const useCreateItemMenu = ({
  onPaste,
  onAddLink,
  node,
  onCollapseAll,
  onExpandAll,
  onDelete,
  onAddComment,
  onDateRangeSet,
  onFocus,
}: OptionsBtnProps) => {
  const { modal: AddLinkModal, setVisible: setAddLinkVisible } = usePromptModal(
    {
      onOk: (value) => {
        onAddLink(value)
        globalState.blockKeyboard = false
      },
      placeholder: i18n.format('add_link_holder'),
      title: i18n.format('add_link'),
      value: node?.todo?.link,
      onCancel: () => {
        globalState.blockKeyboard = false
      },
    },
  )

  const { modal: AddCommentModal, setVisible: setAddCommentVisible } =
    usePromptModal({
      onOk: (value) => {
        onAddComment(value)
        globalState.blockKeyboard = false
      },
      placeholder: i18n.format('add_tip_placeholder'),
      title: i18n.format('add_tip'),
      value: node?.todo?.tip,
      onCancel: () => {
        globalState.blockKeyboard = false
      },
      type: 'textarea',
    })

  const {
    modal: InputTimeRangeModal,
    setVisible: setInputTimeRangeModalVisible,
  } = useInputTimeRangeModal({
    date: node?.todo?.date,
    onChange: onDateRangeSet,
    title: node?.todo?.content,
  })

  return (
    <Menu>
      <Menu.Item onClick={() => onFocus(node)}>
        {node.todo.focus ? i18n.format('unfocus') : i18n.format('focus')}
      </Menu.Item>
      <Menu.Item onClick={() => onDelete(node)}>
        {i18n.format('delete')}
      </Menu.Item>
      <Menu.Item onClick={() => copyNode(node)}>
        {i18n.format('copy')}
      </Menu.Item>
      <Menu.Item onClick={() => onPaste(node)}>
        {i18n.format('paste')}
      </Menu.Item>
      <SubMenu title={i18n.format('viewOps')}>
        <Menu.Item onClick={() => onCollapseAll(node)}>
          {i18n.format('collapseAll')}
        </Menu.Item>
        <Menu.Item onClick={() => onExpandAll(node)}>
          {i18n.format('expandAll')}
        </Menu.Item>
      </SubMenu>
      <SubMenu title={i18n.format('otherOptions')}>
        <Menu.Item
          onClick={() => {
            globalState.blockKeyboard = true
            setAddLinkVisible(true)
          }}
        >
          {i18n.format('add_link')}
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            globalState.blockKeyboard = true
            setAddCommentVisible(true)
          }}
        >
          {i18n.format('add_tip')}
        </Menu.Item>
        <Menu.Item onClick={() => setInputTimeRangeModalVisible(true)}>
          {i18n.format('setTimeRange')}
        </Menu.Item>
      </SubMenu>
      {AddLinkModal}
      {AddCommentModal}
      {InputTimeRangeModal}
    </Menu>
  )
}
export const ItemOptions: React.FC<OptionsBtnProps> = (props) => {
  const menu = useCreateItemMenu(props)
  return (
    <Dropdown trigger={['click']} overlay={menu}>
      <Button size="small" type="text" icon={<MoreOutlined />}></Button>
    </Dropdown>
  )
}
