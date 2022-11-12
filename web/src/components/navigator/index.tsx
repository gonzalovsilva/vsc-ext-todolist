import { Radio, Space } from 'antd'
import React, { useState } from 'react'
import { useMatch, useNavigate } from 'react-router'

import { i18n } from '@/i18n'
import { APP_ARGS } from '@/utils'
import { BarsOutlined, CalendarOutlined } from '@ant-design/icons'

export interface NavigatorProps {}

export const Navigator: React.FC<NavigatorProps> = ({}) => {
  const navigate = useNavigate()

  const isPlan = useMatch('/todo_v2')

  const [activeKey, setActiveKey] = useState<'plan' | 'schedule'>(
    isPlan ? 'plan' : 'schedule',
  )

  const links = [
    {
      key: 'plan',
      label: (
        <Space>
          <BarsOutlined />
          <span>{i18n.format('plan')}</span>
        </Space>
      ),
      onClick: () =>
        navigate(
          APP_ARGS?.file
            ? `/todo_v2?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
            : `/todo_v2`,
        ),
    },
    {
      key: 'schedule',
      label: (
        <Space>
          <CalendarOutlined />
          <span>{i18n.format('schedule')}</span>
        </Space>
      ),
      onClick: () =>
        navigate(
          APP_ARGS.file
            ? `/calendar?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`
            : '/calendar',
        ),
    },
  ]

  return (
    <Radio.Group
      size="small"
      value={activeKey}
      onChange={(event) => {
        setActiveKey(event.target.value)
      }}
    >
      {links.map((link) => (
        <Radio.Button key={link.key} value={link.key} onClick={link.onClick}>
          {link.label}
        </Radio.Button>
      ))}
    </Radio.Group>
  )
}
