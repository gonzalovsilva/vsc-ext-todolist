import { Descriptions, Input, Space, Typography } from 'antd'
import React, { useState } from 'react'

import { useModal } from '@/hooks/useModal'
import { CheckOutlined, EditOutlined } from '@ant-design/icons'

import { i18n } from '../../../i18n'

export interface KeybindProps {
  value: any
  onChange(value: any): void
}

export const defaultKeymap = {
  newItem: 'Tab',
  newItem_sibling: 'Enter',
  delete: 'Backspace, Delete',
  copy: 'Ctrl + c, Command + c',
  paste: 'Ctrl + v, Command + v',
  search_title: 'Ctrl + f, Command + f',
  sort: 'Ctrl + s, Command + s',
}

export const Keybind: React.FC<KeybindProps> = ({ value, onChange }) => {
  const keymap = Object.assign({}, defaultKeymap, value || {})

  return (
    <Descriptions bordered column={1}>
      {Object.keys(keymap).map(key => (
        <Descriptions.Item key={key} label={i18n.format(key as any)}>
          <KeyItem
            value={keymap[key]}
            onChange={newKeyValue => {
              onChange({
                ...keymap,
                [key]: newKeyValue,
              })
            }}
          />
        </Descriptions.Item>
      ))}
    </Descriptions>
  )
}

const KeyItem: React.FC<{ value: string; onChange: (val: string) => void }> = ({
  value,
  onChange,
}) => {
  const [edit, setEdit] = useState(false)
  const [innerValue, setValue] = useState<string>(value)
  return (
    <Space>
      {edit ? (
        <Input
          autoFocus
          size="small"
          value={innerValue}
          onChange={event => setValue(event.target.value)}
          onPressEnter={() => {
            setEdit(false)
            onChange(innerValue)
          }}
        />
      ) : (
        <Typography.Text keyboard>{innerValue}</Typography.Text>
      )}
      {edit ? (
        <CheckOutlined
          onClick={() => {
            setEdit(false)
            onChange(innerValue)
          }}
        />
      ) : (
        <EditOutlined onClick={() => setEdit(true)} />
      )}
    </Space>
  )
}

export interface UseKeybindModelOps {
  keymap: any
  onKeymapChange(value: any): void
}

export const useKeybindModel = ({
  keymap,
  onKeymapChange,
}: UseKeybindModelOps) => {
  const api = useModal({
    title: i18n.format('keybind'),
    width: 600,
    content: <Keybind value={keymap} onChange={onKeymapChange} />,
    okText: i18n.format('confirm'),
    cancelText: i18n.format('reset'),
    onCancel: async () => {
      onKeymapChange(defaultKeymap)
      api.setVisible(false)
    },
  })
  return api
}
