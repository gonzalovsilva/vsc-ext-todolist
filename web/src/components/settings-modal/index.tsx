import {
  Button,
  Collapse,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Typography,
} from 'antd'
import React, { useEffect, useState } from 'react'

import { FormCheckbox } from '../'
import { i18n } from '../../i18n'
import { Keybind } from './keybind'
import { SetDisplayFile } from './set-display-file'

const Link = Typography.Link

export interface Options {
  currentFile: string
}

export interface SettingsProps {
  options: Options
  visible?: boolean
  onCancel: VoidFunction
  onFinish: (values: FormValues) => Promise<void>
  onSaveAs: () => Promise<void>
  onParseMd: () => Promise<void>
  onPlay: () => Promise<void>
  initValues?: FormValues
}

type FormValues = {
  add_mode: 'top' | 'bottom'
  virtual?: boolean
  displayFile?: string
  showLine?: boolean
  playFontSize?: number
  webhook?: string
}

export const SettingsModal: React.FC<SettingsProps> = ({
  options,
  visible,
  onCancel,
  onFinish,
  initValues,
  onSaveAs,
  onParseMd,
  onPlay,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  }, [
    initValues?.add_mode,
    initValues?.displayFile,
    initValues?.playFontSize,
    initValues?.showLine,
    initValues?.virtual,
    initValues?.webhook,
  ])

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title={i18n.format('setting')}
      style={{ userSelect: 'none' }}
      footer={
        <div className="flex space-between align-items-center">
          <Link
            underline
            style={{ fontSize: 12 }}
            href="https://marketplace.visualstudio.com/items?itemName=saber2pr.todolist"
          >
            {i18n.format('shareTip')}
          </Link>
          <Space>
            <Button onClick={onCancel}>{i18n.format('cancel')}</Button>
            <Button type="primary" onClick={() => form.submit()}>
              {i18n.format('confirm')}
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} onFinish={onFinish} initialValues={initValues}>
        <Form.Item
          label={i18n.format('create_mode')}
          tooltip={i18n.format('create_mode_tip')}
          name="add_mode"
        >
          <Select
            options={[
              {
                value: 'top',
                label: i18n.format('create_mode_top'),
              },
              {
                value: 'bottom',
                label: i18n.format('create_mode_bottom'),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label={i18n.format('scroll_virtual')}
          tooltip={i18n.format('scroll_virtual_tip')}
          name="virtual"
        >
          <FormCheckbox />
        </Form.Item>
        <Form.Item
          label={i18n.format('display_file')}
          tooltip={i18n.format('display_file_tip')}
          name="displayFile"
        >
          <SetDisplayFile {...options} />
        </Form.Item>
        <Collapse bordered>
          <Collapse.Panel header={i18n.format('advanced')} key="advanced">
            <Form.Item label={i18n.format('showLine')} name="showLine">
              <FormCheckbox />
            </Form.Item>
            <Form.Item
              label={i18n.format('play_size')}
              name="playFontSize"
              tooltip={i18n.format('play_size_tip')}
            >
              <Input
                type="number"
                style={{ width: '100px' }}
                min={12}
                addonAfter="px"
              />
            </Form.Item>
            <Form.Item label={i18n.format('webhook')} name="webhook">
              <Input type="url" />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
      <Divider>{i18n.format('more_options')}</Divider>
      <Space split={<Divider type="vertical" />}>
        <Button type="text" onClick={onSaveAs}>
          {i18n.format('save_as')}
        </Button>
        <Button type="text" onClick={onParseMd}>
          {i18n.format('parsemd')}
        </Button>
        <Button
          type="text"
          onClick={() =>
            Modal.confirm({
              title: i18n.format('keybind'),
              width: 500,
              content: <Keybind />,
              okText: i18n.format('confirm'),
              cancelButtonProps: { hidden: true },
            })
          }
        >
          {i18n.format('keybind')}
        </Button>
        <Button type="text" onClick={onPlay}>
          {i18n.format('play')}
        </Button>
      </Space>
    </Modal>
  )
}

export interface SettingsModalOps {
  onFinish: (values: FormValues) => Promise<void>
  onCancel: () => void
  onSaveAs: () => Promise<void>
  onParseMd: () => Promise<void>
  onPlay: () => Promise<void>
  initValues: FormValues
  options: Options
}

export const useSettingsModal = (ops: SettingsModalOps) => {
  const [visible, setVisible] = useState(false)
  return {
    modal: (
      <SettingsModal
        options={ops.options}
        visible={visible}
        onCancel={() => {
          setVisible(false)
          ops.onCancel()
        }}
        onFinish={ops.onFinish}
        initValues={ops.initValues}
        onSaveAs={ops.onSaveAs}
        onParseMd={ops.onParseMd}
        onPlay={ops.onPlay}
      />
    ),
    setVisible,
  }
}
