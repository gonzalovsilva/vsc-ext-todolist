import React from 'react'
import type { ITodoItem } from '../../../../src/api/type'
import moment from 'moment'
import { i18n } from '@/i18n'

export interface EndTimeProps {
  todo: ITodoItem
}

export const EndTime: React.FC<EndTimeProps> = ({ todo }) => {
  if (!todo.end) return <></>
  return (
    <span className="ant-btn ant-btn-text ant-btn-sm" style={{ opacity: 0.5 }}>
      {i18n.format('endAt')} {moment(todo.end).format('MM-DD HH:mm')}
    </span>
  )
}
