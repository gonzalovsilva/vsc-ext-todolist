import { message, Tooltip } from 'antd'
import Typography from 'antd/lib/typography'
import React, { useMemo, useState } from 'react'

import { globalState } from '@/state'
import {
  LinkOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { callService, isInVscode } from '@saber2pr/vscode-webview'

import type { ITodoItem, Services } from '../../../../src/api/type'
import { i18n } from '@/i18n'
import { copyer } from '@/utils/copyer'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'

const { Text } = Typography

export interface TodoItemProps {
  todo: ITodoItem
  nodeKey: string | number
  onChange: VoidFunction
}

const LinkIcon = <LinkOutlined style={{ marginLeft: 4 }} />
const TipIcon = <QuestionCircleOutlined style={{ marginLeft: 4 }} />

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onChange,
  nodeKey,
}) => {
  const [editing, setEditing] = useState(
    nodeKey === globalState.latestCreateKey
  )

  const Tip = useMemo(() => {
    const tip = todo?.tip
    if (tip) {
      return (
        <Tooltip title={<Markdown remarkPlugins={[gfm]}>{tip}</Markdown>}>
          {TipIcon}
        </Tooltip>
      )
    }
    return <></>
  }, [todo?.tip])

  const Copy = useMemo(() => {
    if (todo?.done) {
      return (
        <CopyOutlined
          style={{ marginLeft: 4, cursor: 'pointer' }}
          onClick={() => {
            copyer.copy(todo?.content)
            message.success(i18n.format('copy_content_success'))
          }}
        />
      )
    }
    return <></>
  }, [todo?.done])

  let content: string | JSX.Element = (
    <>
      {todo.content}
      {Tip}
      {Copy}
    </>
  )
  if (editing) {
    content = todo.content
  } else {
    if (todo.link) {
      const isUrlLink = /^http/.test(todo.link)
      if (isUrlLink) {
        content = (
          <>
            <a
              href={todo.link}
              onClick={() => {
                if (!isInVscode) {
                  window.open(todo.link, '_blank')
                }
              }}
            >
              {todo.content}
              {LinkIcon}
              {Tip}
            </a>
            {Copy}
          </>
        )
      } else {
        content = (
          <>
            <a
              onClick={() =>
                callService<Services, 'OpenFile'>('OpenFile', {
                  path: todo.link,
                })
              }
            >
              {todo.content}
              {LinkIcon}
              {Tip}
            </a>
            {Copy}
          </>
        )
      }
    }
  }

  return (
    <Text
      delete={todo.done}
      type={todo.level === 'default' ? null : todo.level}
      disabled={todo.done ? true : false}
      style={{ marginBottom: 0 }}
      editable={
        todo.done
          ? false
          : {
              tooltip: false,
              editing: editing,
              onStart() {
                setEditing(true)
                globalState.blockKeyboard = true
              },
              onEnd() {
                setEditing(false)
                globalState.blockKeyboard = false
                globalState.latestCreateKey = null
              },
              onCancel() {
                setEditing(false)
                globalState.blockKeyboard = false
                globalState.latestCreateKey = null
              },
              onChange: value => {
                globalState.blockKeyboard = false
                globalState.latestCreateKey = null
                if (todo.content !== value) {
                  todo.content = value
                  onChange()
                } else {
                  setEditing(false)
                }
              },
            }
      }
    >
      {content}
    </Text>
  )
}
