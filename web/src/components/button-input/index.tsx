import { Button, ButtonProps, Input, InputProps, Space } from 'antd'
import React from 'react'

export interface ButtonInputProps extends InputProps {
  buttonProps: ButtonProps
}

export const ButtonInput: React.FC<ButtonInputProps> = ({
  buttonProps,
  ...props
}) => {
  return (
    <Space>
      <Input {...props} />
      <Button {...buttonProps}></Button>
    </Space>
  )
}
