import { i18n } from '@/i18n'
import { globalState } from '@/state'
import { Checkbox, Input, notification, Space } from 'antd'
import React, { useState } from 'react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

notification.config({
  maxCount: 1,
})

export const SearchBar: React.FC<SearchBarProps> = ({ onChange, value }) => {
  return (
    <Input.Search
      autoFocus
      onFocus={() => {
        globalState.blockKeyboard = true
      }}
      onBlur={() => {
        globalState.blockKeyboard = false
      }}
      size="middle"
      placeholder={i18n.format('search_tip')}
      value={value}
      allowClear
      onChange={event => onChange && onChange(event.target.value)}
    ></Input.Search>
  )
}

export interface UseSearchBarOps
  extends Omit<SearchBarProps, 'value' | 'onChange'> {
  onClose: VoidFunction
  onChange: (value: string, isReg: boolean, isChild: boolean) => number
}

export const useSearchBar = ({ onChange, onClose }: UseSearchBarOps) => {
  const Message = () => {
    const [value, setValue] = useState<string>()
    const [isReg, setIsReg] = useState<boolean>()
    const [isChild, setIsChild] = useState<boolean>()
    const [count, setCount] = useState<number>()
    return (
      <div style={{ userSelect: 'none' }}>
        <SearchBar
          value={value}
          onChange={value => {
            setValue(value)
            setCount(onChange(value, isReg, isChild))
          }}
        />
        <Space>
          <Checkbox
            onChange={event => {
              setIsReg(event.target.checked)
              setCount(onChange(value, event.target.checked, isChild))
            }}
          >
            .*
          </Checkbox>
          <Checkbox
            onChange={event => {
              setIsChild(event.target.checked)
              setCount(onChange(value, isReg, event.target.checked))
            }}
          >
            {i18n.format('search_has_child')}
          </Checkbox>
          <span className="ant-btn ant-btn-text ant-btn-sm">
            {count > 0
              ? i18n.format('search_count', { count: String(count) })
              : i18n.format('search_empty')}
          </span>
        </Space>
      </div>
    )
  }

  const showSearch = () => {
    notification.info({
      placement: 'topRight',
      message: <Message />,
      top: 8,
      duration: null,
      onClose: onClose,
    })
  }

  return { showSearch }
}
