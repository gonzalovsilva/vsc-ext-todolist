import { Button, Space } from 'antd'
import moment from 'moment'
import React, { useMemo, useState } from 'react'

import { FieldTimeOutlined } from '@ant-design/icons'

import { useInputTimeRangeModal } from './input-time-range'

export interface DateSetterProps {
  title: string
  date: string // start,end
  onChange(date: string): void
}

const parseTimeRange = (date: string): [number, number] => {
  if (date) {
    const [start, end] = date.split(',')
    return [Number(start), Number(end)]
  }
  return
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
    <Button type="text" size="small" onClick={onClick}>
      {content.join('~')}
    </Button>
  )
}

export const DateSetter: React.FC<DateSetterProps> = ({
  date,
  onChange,
  title,
}) => {
  const [dateDraft, onDateDraftChange] = useState(date)

  const api = useInputTimeRangeModal({
    inputProps: {
      value: parseTimeRange(dateDraft),
      onChange: value => {
        if (value) {
          const [start, end] = value
          onDateDraftChange([start, end].join(','))
        } else {
          onDateDraftChange(null)
        }
      },
    },
    title,
    onOk() {
      // commit draft
      onChange(dateDraft)
    },
  })

  return (
    <>
      {api.modal}
      <Space>
        {dateDraft ? (
          <DateLabel date={dateDraft} onClick={() => api.setVisible(true)} />
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
