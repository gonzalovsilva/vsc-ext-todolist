import React from 'react'
import type { ITodoItem } from '../../../../src/api/type'
import moment from 'moment'
import { i18n } from '@/i18n'
import { Tooltip } from 'antd'
import { formatSeconds } from '@/utils/date'

export interface EndTimeProps {
  todo: ITodoItem
}

export const EndTime: React.FC<EndTimeProps> = ({ todo }) => {
  if (!todo.end || !todo.start) return <></>
  return (
    <Tooltip
      title={`${i18n.format('startAt')}: ${moment(todo.start).format(
        'MM-DD HH:mm'
      )}, ${i18n.format('duration')}: ${formatSeconds(
        moment.duration(moment(todo.end).diff(moment(todo.start))).asSeconds()
      )}`}
    >
      <span
        className="ant-btn ant-btn-text ant-btn-sm"
        style={{ opacity: 0.5 }}
      >
        {i18n.format('endAt')} {moment(todo.end).format('MM-DD HH:mm')}
      </span>
    </Tooltip>
  )
}
