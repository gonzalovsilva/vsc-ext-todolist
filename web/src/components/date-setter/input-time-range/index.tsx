import { useModal } from '@/hooks/useModal'
import { i18n } from '@/i18n'
import { DatePicker, Divider, Typography } from 'antd'
import moment from 'moment'
import React from 'react'

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
      allowClear
      value={value ? [moment.unix(value[0]), moment.unix(value[1])] : undefined}
      onChange={value => {
        if (value) {
          const [start, end] = value
          onChange([start.unix(), end.unix()])
        } else {
          onChange(null)
        }
      }}
    />
  )
}

export interface InputTimeRangeModalOps {
  title: string
  inputProps: InputTimeRangeProps
  onOk(): void
}

export const useInputTimeRangeModal = ({
  inputProps,
  onOk,
  title,
}: InputTimeRangeModalOps) => {
  return useModal({
    title: i18n.format('setTimeRange'),
    content: (
      <>
        <Typography.Paragraph>{title}</Typography.Paragraph>
        <Divider />
        <InputTimeRange {...inputProps} />
      </>
    ),
    onOk: async () => onOk(),
  })
}
