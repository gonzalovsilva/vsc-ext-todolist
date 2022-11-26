import { DatePicker, Divider, Typography } from 'antd'
import moment from 'moment'
import React, { useState } from 'react'

import { useModal } from '@/hooks/useModal'
import { i18n } from '@/i18n'
import { parseTimeRange } from '@/utils/date'

export interface InputTimeRangeProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export const InputTimeRange: React.FC<InputTimeRangeProps> = ({
  value,
  onChange,
}) => {
  return (
    <DatePicker.RangePicker
      dateRender={current => {
        const style: React.CSSProperties = {}
        if (current.day() === 0 || current.day() === 6) {
          style.opacity = 0.5
        }
        return (
          <div className="ant-picker-cell-inner" style={style}>
            {current.date()}
          </div>
        )
      }}
      allowClear
      value={value ? [moment.unix(value[0]), moment.unix(value[1])] : undefined}
      onChange={value => {
        if (value) {
          const [start, end] = value
          onChange([start.startOf('day').unix(), end.endOf('day').unix()])
        } else {
          onChange(null)
        }
      }}
    />
  )
}

export interface InputTimeRangeModalOps {
  title: string
  date: string // start,end
  onChange(date: string): void
}

export const useInputTimeRangeModal = ({
  date,
  onChange,
  title,
}: InputTimeRangeModalOps) => {
  const [dateDraft, onDateDraftChange] = useState<InputTimeRangeProps['value']>(
    parseTimeRange(date)
  )
  return useModal({
    title: i18n.format('setTimeRange'),
    content: (
      <>
        <Typography.Paragraph>{title}</Typography.Paragraph>
        <Divider />
        <InputTimeRange value={dateDraft} onChange={onDateDraftChange} />
      </>
    ),
    onOk: async () => {
      if (dateDraft) {
        const [start, end] = dateDraft
        onChange([start, end].join(','))
      } else {
        onChange(null)
      }
    },
  })
}
