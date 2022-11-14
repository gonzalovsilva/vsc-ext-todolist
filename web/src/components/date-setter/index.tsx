import { FieldTimeOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import moment from 'moment'
import React, { useMemo } from 'react'

import { parseTimeRange, useInputTimeRangeModal } from './input-time-range'

export interface DateSetterProps {
  title: string
  date: string // start,end
  onChange(date: string): void
  readOnly?: boolean
}

const DateLabel: React.FC<{ date: string; onClick: VoidFunction }> = ({
  date,
  onClick,
}) => {
  const [startLabel, endLabel] = useMemo(() => {
    if (!date) return []

    const [start, end] = parseTimeRange(date)
    return [
      moment.unix(start).format('MM-DD'),
      moment.unix(end).format('MM-DD'),
    ]
  }, [date])

  if (!date) return <></>

  let content = []

  if (startLabel) {
    content = content.concat(startLabel)
  }
  if (endLabel) {
    content = content.concat(endLabel)
  }

  return (
    <span className='ant-btn ant-btn-text ant-btn-sm' onClick={onClick}>
      {content.join('~')}
    </span>
  )
}

export const DateSetter: React.FC<DateSetterProps> = ({
  date,
  onChange,
  readOnly = false,
  title,
}) => {
  const api = useInputTimeRangeModal({
    date,
    onChange,
    title,
  })

  return (
    <>
      {api.modal}
      <Space>
        {date ? (
          <DateLabel
            date={date}
            onClick={() => (readOnly ? null : api.setVisible(true))}
          />
        ) : readOnly ? (
          <></>
        ) : (
          <Button
            size="small"
            type="text"
            icon={<FieldTimeOutlined />}
            onClick={() => api.setVisible(true)}
          />
        )}
      </Space>
    </>
  )
}
