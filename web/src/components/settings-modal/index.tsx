import { isTreeNodeJson, TreeNode } from '@/utils'
import { isInVscode } from '@saber2pr/vscode-webview'
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
  Upload,
} from 'antd'
import React, { useEffect, useState } from 'react'

import { FormCheckbox } from '../'
import { i18n } from '../../i18n'
import { defaultKeymap, Keybind } from './keybind'
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
  onPaste: (node: TreeNode[]) => void
  onLangChange(lang: 'zh-cn' | 'en'): void
  initValues?: FormValues
  keymap: any
  onKeymapChange(keymap: any): void
}

type FormValues = {
  add_mode: 'top' | 'bottom'
  virtual?: boolean
  displayFile?: string
  showLine?: boolean
  playFontSize?: number
  webhook?: string
  autoSort?: boolean
  showEndTime?: boolean
  lang?: 'zh-cn' | 'en'
  desc?: string
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
  onPaste,
  onLangChange,
  keymap,
  onKeymapChange,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    form.resetFields()
  }, [
    initValues?.add_mode,
    initValues?.virtual,
    initValues?.displayFile,
    initValues?.showLine,
    initValues?.playFontSize,
    initValues?.webhook,
    initValues?.autoSort,
    initValues?.showEndTime,
    initValues?.lang,
    initValues?.desc,
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
        <Form.Item label={i18n.format('desc')} name="desc">
          <Input.TextArea autoSize={{ maxRows: 10 }} />
        </Form.Item>
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
        {isInVscode || (
          <Form.Item label={i18n.format('language')} name="lang">
            <Select
              onSelect={onLangChange}
              options={[
                {
                  value: 'en',
                  label: 'English',
                },
                {
                  value: 'zh-cn',
                  label: '简体中文',
                },
              ]}
            />
          </Form.Item>
        )}
        {isInVscode && (
          <Form.Item
            label={i18n.format('display_file')}
            tooltip={i18n.format('display_file_tip')}
            name="displayFile"
          >
            <SetDisplayFile {...options} />
          </Form.Item>
        )}
        <Collapse bordered>
          <Collapse.Panel header={i18n.format('advanced')} key="advanced">
            <Form.Item label={i18n.format('showEndTime')} name="showEndTime">
              <FormCheckbox />
            </Form.Item>
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
            {isInVscode && (
              <Form.Item label={i18n.format('webhook')} name="webhook">
                <Input type="url" />
              </Form.Item>
            )}
            <Form.Item hidden name="keymap" />
          </Collapse.Panel>
        </Collapse>
      </Form>
      <Divider>{i18n.format('more_options')}</Divider>
      <Space split={<Divider type="vertical" />} style={{ flexWrap: 'wrap' }}>
        {isInVscode || (
          <Upload
            beforeUpload={() => false}
            showUploadList={false}
            onChange={async event => {
              const originFileObj = event?.fileList?.[0]?.originFileObj
              if (originFileObj) {
                const text = await originFileObj.text()
                if (isTreeNodeJson(text)) {
                  onPaste(JSON.parse(text)?.todotree?.tree)
                }
              }
            }}
          >
            <Button type="text">{i18n.format('import')}</Button>
          </Upload>
        )}
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
              width: 600,
              content: <Keybind value={keymap} onChange={onKeymapChange} />,
              okText: i18n.format('confirm'),
              cancelText: i18n.format('reset'),
              onCancel: () => onKeymapChange(defaultKeymap),
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
  onPaste: (node: TreeNode[]) => void
  onLangChange?(lang: 'zh-cn' | 'en'): void
  initValues: FormValues
  options: Options
  keymap: any
  onKeymapChange(keymap: any): void
}

export const useSettingsModal = (ops: SettingsModalOps) => {
  const [visible, setVisible] = useState(false)
  return {
    modal: (
      <SettingsModal
        onPaste={ops.onPaste}
        options={ops.options}
        keymap={ops.keymap}
        onKeymapChange={ops.onKeymapChange}
        onLangChange={ops.onLangChange}
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
