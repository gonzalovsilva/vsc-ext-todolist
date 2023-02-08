import './style.less'
import 'nprogress/nprogress.css'

import {
  Affix,
  Button,
  Divider,
  Dropdown,
  Empty,
  message,
  Modal,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import axios from 'axios'
import classnames from 'classnames'
import nprogress from 'nprogress'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import useInterval from 'react-use/lib/useInterval'

import { DateSetter } from '@/components/date-setter'
import { Navigator } from '@/components/navigator'
import { DEFAULT_PLAYFONTSIZE } from '@/components/words-inputing'
import { globalState } from '@/state'
import { calcProgressV2 } from '@/utils/calc-progress'
import { copyer } from '@/utils/copyer'
import { webSaveFile } from '@/utils/webSaveFile'
import CheckOutlined from '@ant-design/icons/CheckOutlined'
import PlusOutlined from '@ant-design/icons/PlusOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'
import {
  callService,
  isInVscode,
  mockVscodeApi,
} from '@saber2pr/vscode-webview'

import { IStoreTodoTree, Key, Services } from '../../../../src/api/type'
import { KEY_TODO_TREE } from '../../../../src/constants'
import {
  copyNode,
  ItemOptions,
  OptionsBtnProps,
  TodoLevels,
  useCreateItemMenu,
} from '../../components/item-options'
import { MdOptionModal } from '../../components/md-option-modal'
import { useSettingsModal } from '../../components/settings-modal'
import { TodoItem } from '../../components/todo-item'
import { TodoTree } from '../../components/tree'
import { ViewOptions } from '../../components/view-options'
import { i18n } from '../../i18n'
import {
  APP_ARGS,
  appendNodes,
  clearDoneNode,
  cloneTree,
  compileMd,
  findNodeParent,
  getArray,
  getTreeKeys,
  insertNodes,
  insertNodeSibling,
  sortTree,
  TreeNode,
  checkTreeSetTime,
  createTreeNode,
} from '../../utils'
import { parseUrlParam } from '../../utils/parseUrlParam'
import { ScheduleLink } from './index.style'
import Markdown from 'react-markdown'
import gfm from 'remark-gfm'
import { EndTime } from '@/components/end-time'
import { isNullOrUndefined } from '@/utils/is'

const { Title } = Typography

let events: VoidFunction[] = []

nprogress.configure({
  showSpinner: false,
})

export interface PageTodoTreeProps {
  onLangChange?(lang: 'zh-cn' | 'en'): void
}

export const PageTodoTree: React.FC<PageTodoTreeProps> = ({ onLangChange }) => {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})

  const expandKeysRef = useRef<Key[]>([])
  const updateExpandKeys = (keys: Key[], type: 'push' | 'replace' = 'push') => {
    const expandKeys = getArray(expandKeysRef.current)
    expandKeysRef.current = Array.from(
      new Set(type === 'push' ? [...expandKeys, ...keys] : keys)
    )
    forceUpdate()
  }

  const treeRef = useRef<TreeNode[]>([])
  const displayFileRef = useRef<string>(null)

  const treeSetTime = useMemo(
    () => checkTreeSetTime(getArray(treeRef.current)),
    [treeRef.current]
  )

  const updateTree = () => {
    const data = treeRef.current
    if (Array.isArray(data)) {
      treeRef.current = autoSort ? sortTree(data.slice()) : data.slice()
    }
    forceUpdate()
    events.forEach(l => l())
  }

  const location = useLocation()
  const params = location?.search ? parseUrlParam(location.search) : {}
  const navigate = useNavigate()

  const [loaded, setLoaded] = useState(false)
  // settings
  const [addMode, setMode] = useState<'top' | 'bottom'>('bottom')
  const [virtualMode, setVirtual] = useState<boolean>(false)
  const [showLine, setShowLine] = useState<boolean>(false)
  const [autoSort, setAutoSort] = useState<boolean>(false)
  const [showEndTime, setShowEndTime] = useState<boolean>(false)
  const [playFontSize, setPlayFontSize] = useState<number>(0)
  const [webhook, setWebhook] = useState<string>()
  const [desc, setDesc] = useState<string>()
  const [lang, setLang] = useState<'zh-cn' | 'en'>('en')
  const [STORE_TITLE, setSTORE_TITLE] = useState<string>()
  const [version, setVersion] = useState<string>()

  // for hook message
  useEffect(() => {
    if (webhook) {
      mockVscodeApi.hook = message => axios.post(webhook, message)
    } else {
      mockVscodeApi.hook = null
    }
  }, [webhook])

  // init
  const loadSource = async (
    callback?: (tree: IStoreTodoTree['tree']) => IStoreTodoTree['tree']
  ) => {
    setLoaded(false)
    if (isInVscode) {
      // config
      const displayFile = await callService<Services, 'GetDisplayFile'>(
        'GetDisplayFile',
        null
      )
      displayFileRef.current = displayFile
    }
    // load todo file
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    if (todo) {
      const val: IStoreTodoTree = todo
      treeRef.current = getArray(callback ? callback(val.tree) : val.tree)
      expandKeysRef.current = getArray(val.expandKeys)
      //settings
      val.add_mode && setMode(val.add_mode)
      setVirtual(!!val.virtual)
      setShowLine(!!val.showLine)
      setAutoSort(!!val.autoSort)
      setShowEndTime(!!val.showEndTime)
      setPlayFontSize(val.playFontSize || DEFAULT_PLAYFONTSIZE)
      setWebhook(val.webhook)
      setSTORE_TITLE(val.title)
      setLang(val.lang || 'en')
      setDesc(val.desc)
      setVersion(val.version)
      forceUpdate()
    }
    setLoaded(true)
  }

  useEffect(() => {
    loadSource()
  }, [])

  const deleteNode = (node: TreeNode) => {
    globalState.blockKeyboard = true
    Modal.confirm({
      title: i18n.format('removeItemTip'),
      content: node.todo.content,
      okText: i18n.format('confirm'),
      cancelText: i18n.format('cancel'),
      onOk: () => {
        node.todo.pendingDelete = true
        treeRef.current = clearDoneNode(
          treeRef.current,
          node => node.todo.pendingDelete
        )
        updateTree()
        globalState.blockKeyboard = false
      },
      onCancel() {
        globalState.blockKeyboard = false
      },
    })
  }

  const createNewNode = (node: TreeNode, anchor?: TreeNode) => {
    createNode(() => node.children, anchor)
    updateTree()
    updateExpandKeys([node.key], 'push')
  }

  const pasteNode = async (node: TreeNode) => {
    const text = await copyer.read()
    if (/^https?:/.test(text)) {
      node.todo.link = text.trim()
      updateTree()
      return
    }
    const temp: TreeNode[] = await copyer.readTree()
    const tree = cloneTree(temp)
    if (addMode === 'top') {
      insertNodes(node.children, ...tree)
    } else {
      appendNodes(node.children, ...tree)
    }
    updateTree()
    updateExpandKeys([node.key], 'push')
  }

  const pasteCopiedTree = (copyTree: TreeNode[]) => {
    const current = getArray(treeRef.current)
    const newNodes = getArray(copyTree)
    if (addMode === 'top') {
      treeRef.current = newNodes.concat(current)
    } else {
      treeRef.current = current.concat(newNodes)
    }
    updateTree()
  }

  const addSiblingNode = (node: TreeNode) => {
    const parent = findNodeParent(treeRef.current, node.key)
    if (parent) {
      createNewNode(parent, node)
    } else {
      createNode(() => treeRef.current, node)
      updateTree()
    }
  }

  const Item = ({ node }: { node: TreeNode }) => {
    const [_, setState] = useState({})
    useEffect(() => {
      const listener = () => setState({})
      events.push(listener)
      return () => {
        events = events.filter(l => l !== listener)
      }
    }, [])
    const todo = node.todo

    let ops = <></>

    const itemOptions: OptionsBtnProps = {
      node,
      onFocus: () => {
        todo.focus = !todo.focus
        updateTree()
      },
      onPaste: pasteNode,
      onAddLink: link => {
        todo.link = link
        updateTree()
      },
      onAddComment: tip => {
        todo.tip = tip
        updateTree()
      },
      onCollapseAll: node => {
        const keys = getTreeKeys(node)
        const keysMap = keys.reduce((acc, k) => ({ ...acc, [k]: k }), {})
        const currentKeys = getArray(expandKeysRef.current)
        const nextKeys = currentKeys.filter(k => !keysMap[k])
        updateExpandKeys(nextKeys, 'replace')
      },
      onExpandAll: node => {
        const keys = getTreeKeys(node)
        updateExpandKeys(keys, 'push')
      },
      onDelete: () => deleteNode(node),
      onDateRangeSet: date => {
        todo.date = date
        updateTree()
      },
    }
    const itemMenu = useCreateItemMenu(itemOptions)

    if (todo.done) {
      ops = (
        <>
          <DateSetter
            readOnly
            title={todo.content}
            date={todo.date}
            onChange={date => {}}
          />
          {showEndTime && <EndTime todo={todo} />}
          <Button
            size="small"
            type="text"
            icon={<UndoOutlined />}
            onClick={() => {
              todo.done = false
              updateTree()
            }}
          />
        </>
      )
    } else {
      ops = (
        <>
          {treeSetTime && (
            <DateSetter
              title={todo.content}
              date={todo.date}
              onChange={date => {
                todo.date = date
                updateTree()
              }}
            />
          )}
          <Select
            bordered={false}
            size="small"
            value={todo.level}
            onSelect={level => {
              todo.level = level
              updateTree()
            }}
            options={Object.keys(TodoLevels).map(level => ({
              label: `P${TodoLevels[level]}`,
              value: level,
            }))}
          />
          <Button
            size="small"
            type="text"
            icon={<PlusOutlined />}
            onClick={() => createNewNode(node)}
          />
          <Button
            size="small"
            type="text"
            icon={<CheckOutlined />}
            onClick={() => {
              todo.done = true
              todo.focus = false
              todo.end = Date.now()
              updateTree()
            }}
          />
          <ItemOptions {...itemOptions} />
        </>
      )
    }

    return (
      <Dropdown trigger={['contextMenu']} overlay={itemMenu}>
        <Space
          className={classnames('todo', todo?.focus ? 'ani-border' : null)}
          style={{
            paddingLeft: todo?.focus ? 4 : 0,
          }}
        >
          <TodoItem
            todo={todo}
            nodeKey={node.key}
            onChange={() => updateTree()}
          />
          {ops}
        </Space>
      </Dropdown>
    )
  }

  const createNode = (getContainer: () => TreeNode[], anchor?: TreeNode) => {
    const key = Date.now()
    globalState.latestCreateKey = key
    globalState.currentSelectKey = key
    globalState.blockKeyboard = true

    const node = createTreeNode()

    if (anchor) {
      insertNodeSibling(
        getContainer(),
        anchor.key,
        node,
        addMode === 'bottom' ? 'after' : 'before'
      )
    } else {
      if (addMode === 'top') {
        insertNodes(getContainer(), node)
      } else {
        appendNodes(getContainer(), node)
      }
    }
  }

  const autoRefreshInterval = isInVscode ? null : 10000
  useInterval(() => {
    if (!globalState.blockKeyboard) {
      if (!isInVscode) {
        isMounted.current = false
        loadSource()
      }
    }
  }, autoRefreshInterval)

  const save = async () => {
    nprogress.start()
    const oldTodo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    const oldVersion = oldTodo.version
    const isSameVersion = isNullOrUndefined(oldVersion)
      ? true
      : oldVersion === version
    if (!isSameVersion) {
      const isUseDiskVersion = await new Promise(resolve => {
        Modal.confirm({
          title: i18n.format('version'),
          content: i18n.format('versionDiff'),
          okText: i18n.format('versionContinue2'),
          cancelText: i18n.format('versionContinue'),
          onOk() {
            resolve(true)
          },
          onCancel() {
            resolve(false)
          },
        })
      })
      if (isUseDiskVersion) {
        isMounted.current = false
        await loadSource()
        message.success(i18n.format('updateTip'))
        return
      }
    }

    const storeVal: IStoreTodoTree = {
      tree: treeRef.current,
      expandKeys: expandKeysRef.current,
      schema:
        'https://github.com/Saber2pr/vsc-ext-todolist/blob/master/src/api/type.ts#L3',
      add_mode: addMode,
      virtual: virtualMode,
      showLine: showLine,
      playFontSize: playFontSize,
      webhook: webhook,
      title: TITLE,
      autoSort,
      showEndTime,
      lang,
      desc,
      version: `${Date.now()}`,
    }
    const tree = JSON.parse(JSON.stringify(storeVal))
    setVersion(storeVal.version)
    await callService<Services, 'Store'>('Store', {
      key: KEY_TODO_TREE,
      value: tree,
      path: params?.file,
    })
    nprogress.done()
    return {
      [KEY_TODO_TREE]: tree,
    }
  }

  // first render expandKeys
  useEffect(() => {
    // after tree rendered
    if (!isMounted.current) {
      updateExpandKeys(getArray(expandKeysRef.current), 'replace')
    }
  }, [treeRef.current])

  const isMounted = useRef(false)
  useEffect(() => {
    if (isMounted.current) {
      save()
    }
    if (loaded) {
      isMounted.current = true
    }
  }, [
    loaded,
    treeRef.current,
    expandKeysRef.current,
    addMode,
    virtualMode,
    showLine,
    autoSort,
    showEndTime,
    playFontSize,
    webhook,
    lang,
    desc,
  ])

  const percent = useMemo(
    () => calcProgressV2(treeRef.current),
    [treeRef.current]
  )

  let TITLE = params?.name ?? STORE_TITLE ?? 'Todo List'
  if (TITLE === '.todolistrc') {
    TITLE = STORE_TITLE ?? 'Todo List'
  }

  // md modal
  const [showMdOptionsModal, setShowMdOptionsModal] = useState(false)

  const toolsWrapperRef = useRef<HTMLDivElement>()
  const todoTreeLength = getArray(treeRef.current).length

  // settings
  const { modal, setVisible } = useSettingsModal({
    options: {
      currentFile: params?.file,
    },
    initValues: {
      add_mode: addMode,
      virtual: virtualMode,
      displayFile: displayFileRef.current,
      showLine,
      autoSort,
      showEndTime,
      playFontSize,
      webhook,
      lang,
      desc,
    },
    async onFinish(values) {
      const isChangeDisplay = values?.displayFile !== displayFileRef.current
      if (isChangeDisplay && values?.displayFile) {
        await callService<Services, 'SetConfig'>('SetConfig', {
          key: 'displayFile',
          value: values?.displayFile,
        })
        await callService<Services, 'reload'>('reload', null)
      }
      setMode(values?.add_mode)
      setVirtual(!!values?.virtual)
      setShowLine(!!values?.showLine)
      setAutoSort(!!values?.autoSort)
      setShowEndTime(!!values?.showEndTime)
      setPlayFontSize(values?.playFontSize || DEFAULT_PLAYFONTSIZE)
      setWebhook(values?.webhook)
      setLang(values?.lang)
      setDesc(values?.desc)
      message.success(i18n.format('settingTip'))
      setVisible(false)
      globalState.blockKeyboard = false
    },
    onCancel() {
      globalState.blockKeyboard = false
    },
    async onSaveAs() {
      const content = await save()
      const fileName = `${TITLE}.todo`
      const fileContent = JSON.stringify(content)
      if (isInVscode) {
        await callService<Services, 'SaveFileAs'>('SaveFileAs', {
          title: i18n.format('save_file'),
          content: fileContent,
          name: fileName,
        })
      } else {
        webSaveFile(fileName, fileContent)
      }
    },
    async onParseMd() {
      setShowMdOptionsModal(true)
    },
    async onPlay() {
      navigate(`/play?file=${APP_ARGS.file}&name=${APP_ARGS?.name}`)
    },
    onPaste: pasteCopiedTree,
    onLangChange,
  })

  return (
    <div className="PageTodoList">
      <div className="layout">
        <Space
          direction="vertical"
          style={{ width: '100%', position: 'relative', padding: 8 }}
        >
          <Title level={4} style={{ marginBottom: 0 }}>
            {TITLE}
          </Title>
          {desc && <Markdown remarkPlugins={[gfm]}>{desc}</Markdown>}
          <Progress percent={percent} />
          {treeSetTime && (
            <ScheduleLink>
              <Navigator />
            </ScheduleLink>
          )}
        </Space>
        <Divider style={{ marginTop: 0 }} />
        <div className="tree-wrapper">
          <Spin
            spinning={isInVscode ? !loaded : false}
            tip={i18n.format('loading')}
          >
            {todoTreeLength > 0 ? (
              <TodoTree
                showLine={showLine}
                virtualMode={virtualMode}
                titleRender={(node: TreeNode) => <Item node={node} />}
                expandedKeys={expandKeysRef.current}
                onExpand={keys => updateExpandKeys(keys, 'replace')}
                handleDrop={data => {
                  treeRef.current = data
                  updateTree()
                }}
                onKeydown={(key, node, event) => {
                  if (key === 'tab') {
                    createNewNode(node)
                  } else if (key === 'enter') {
                    addSiblingNode(node)
                  } else if (key === 'backspace' || key === 'delete') {
                    deleteNode(node)
                  } else {
                    const ctrl = event.ctrlKey || event.metaKey
                    if (ctrl) {
                      if (key === 'c' || key === 'C') {
                        copyNode(node)
                      }
                      if (key === 'v' || key === 'V') {
                        pasteNode(node)
                      }
                    }
                  }
                }}
                treeData={treeRef.current}
                itemOptions={null}
              />
            ) : loaded ? (
              <Empty description={i18n.format('null')} />
            ) : (
              <div style={{ height: 100 }}></div>
            )}
          </Spin>
        </div>
        <Affix offsetBottom={0}>
          <div className="tools-wrapper" ref={toolsWrapperRef}>
            <Divider className="tools-wrapper-div" style={{ margin: 0 }} />
            <Space split={<Divider type="vertical" />}>
              <Button
                type="text"
                onClick={() => {
                  createNode(() => treeRef.current)
                  updateTree()
                }}
              >
                {i18n.format('newItem')}
              </Button>
              <Button
                type="text"
                onClick={async () => {
                  await save()
                  message.success(i18n.format('saveTip'))
                }}
              >
                {i18n.format('save')}
              </Button>
              <Popconfirm
                placement="top"
                title={i18n.format('clearDoneTip')}
                onConfirm={() => {
                  treeRef.current = clearDoneNode(
                    treeRef.current,
                    node => node.todo.done
                  )
                  updateTree()
                }}
                okText={i18n.format('confirm')}
                cancelText={i18n.format('cancel')}
              >
                <Button type="text">{i18n.format('clearDone')}</Button>
              </Popconfirm>
              <ViewOptions
                tree={getArray(treeRef.current)}
                onUpdate={async () => {
                  isMounted.current = false
                  await loadSource()
                  message.success(i18n.format('updateTip'))
                }}
                onSort={async () => {
                  await loadSource(sortTree)
                  message.success(i18n.format('sort_tip'))
                }}
                onCollapseAll={() => {
                  updateExpandKeys([], 'replace')
                }}
                onExpandAll={() => {
                  const keys = getTreeKeys(...treeRef.current)
                  updateExpandKeys(keys, 'replace')
                }}
                onPaste={pasteCopiedTree}
              />
              <Button
                type="text"
                onClick={() => {
                  setVisible(true)
                  globalState.blockKeyboard = true
                  globalState.currentSelectKey = null
                  globalState.latestCreateKey = null
                }}
              >
                {i18n.format('setting')}
              </Button>
            </Space>
          </div>
        </Affix>
        <MdOptionModal
          visible={showMdOptionsModal}
          onCancel={() => setShowMdOptionsModal(false)}
          onOk={async values => {
            const tree = treeRef.current
            if (tree) {
              const fileName = `${TITLE}.md`
              const fileContent = compileMd(treeRef.current, {
                noTab: values.useTab === 'no-tab',
                displayDone: values.displayDone,
                displayLink: values.displayLink,
              })
              if (isInVscode) {
                await callService<Services, 'SaveFile'>('SaveFile', {
                  title: i18n.format('save_md'),
                  path: fileName,
                  content: fileContent,
                })
              } else {
                webSaveFile(fileName, fileContent)
              }
              message.success(i18n.format('createTip'))
              setShowMdOptionsModal(false)
            }
          }}
        />
      </div>
      {modal}
    </div>
  )
}
