import { Radio, Space } from 'antd'
import React, { useState } from 'react'
import { useMatch } from 'react-router'

import { usePage } from '@/hooks/usePage'
import { useSettingsStore } from '@/hooks/useSettingsStore'
import { i18n } from '@/i18n'
import { BarsOutlined, CalendarOutlined } from '@ant-design/icons'

export interface NavigatorProps {}

export const Navigator: React.FC<NavigatorProps> = ({}) => {
  const page = usePage()
  const settings = useSettingsStore()

  const isPlan = useMatch('/todo_v2')

  const [activeKey, setActiveKey] = useState<'plan' | 'schedule'>(
    isPlan ? 'plan' : 'schedule'
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
      onClick: () => page.gotoPlan(),
    },
    {
      key: 'schedule',
      label: (
        <Space>
          <CalendarOutlined />
          <span>{i18n.format('schedule')}</span>
        </Space>
      ),
      onClick: () => page.gotoSchedule(),
    },
  ]

  return (
    <Radio.Group
      size="small"
      value={activeKey}
      onChange={event => {
        setActiveKey(event.target.value)
        settings.set(data => {
          data.page = event.target.value
          return data
        })
      }}
    >
      {links.map(link => (
        <Radio.Button key={link.key} value={link.key} onClick={link.onClick}>
          {link.label}
        </Radio.Button>
      ))}
    </Radio.Group>
  )
}
