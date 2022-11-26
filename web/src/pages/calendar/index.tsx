import { Calendar, Col, Row, Select, Space, Spin, Typography } from 'antd'
import { Moment } from 'moment'
import React from 'react'
import { useLocation } from 'react-router'

import { Navigator } from '@/components/navigator'
import { useAsync } from '@/hooks/useAsync'
import { findNodes, getArray, parseUrlParam, sortTree } from '@/utils'
import { callService } from '@saber2pr/vscode-webview'

import { KEY_TODO_TREE } from '../../../../src/constants'
import { CellList, CellListStatus } from './index.style'

import type { IStoreTodoTree, Services } from '../../../../src/api/type'
import { parseTimeRange } from '@/utils/date'
export interface PageCalenderProps {}

export const PageCalender: React.FC<PageCalenderProps> = ({}) => {
  const location = useLocation()
  const params = location?.search ? parseUrlParam(location.search) : {}

  const { data, loading } = useAsync(async () => {
    const todo = await callService<Services, 'GetStore'>('GetStore', {
      key: KEY_TODO_TREE,
      path: params?.file,
    })
    const val: IStoreTodoTree = todo
    return val
  })

  let TITLE = params?.name ?? data?.title ?? 'Todo List'

  const getTodoItemsByRange = (start: Moment, end: Moment) => {
    if (start && end) {
      const startUnix = start.unix()
      const endUnix = end.unix()

      const result = findNodes(getArray(data?.tree), item => {
        const date = item?.todo?.date
        if (date) {
          const todoDateRange = parseTimeRange(date)
          if (todoDateRange) {
            const [todoStartDate, todoEndDate] = todoDateRange
            if (todoStartDate <= startUnix && todoEndDate >= endUnix) {
              return true
            }
          }
        }
        return false
      })

      return result
    }
  }

  const getListData = (value: Moment) => {
    if (!value) return []
    const startOfDay = value.startOf('day')
    const endOfDay = value.endOf('day')

    const dayTodos = getTodoItemsByRange(startOfDay, endOfDay)
    return sortTree(getArray(dayTodos)).map(dayTodo => dayTodo?.todo)
  }

  const dateCellRender = (value: Moment) => {
    const listData = getListData(value)
    const count = listData.length
    const doneCount = listData.reduce(
      (acc, cur) => (cur.done ? acc + 1 : acc),
      0
    )
    return (
      <CellList>
        {count > 0 && (
          <CellListStatus>
            {doneCount}/{count}
          </CellListStatus>
        )}
        {listData.map((item, i) => {
          if (!item) return <React.Fragment key={i} />
          return (
            <li key={item.content}>
              <Typography.Paragraph
                delete={item.done}
                ellipsis={{
                  tooltip: item.content,
                  rows: 2,
                }}
                type={
                  item.done
                    ? 'secondary'
                    : item.level === 'default'
                    ? null
                    : item.level
                }
              >
                {item.content}
              </Typography.Paragraph>
            </li>
          )
        })}
      </CellList>
    )
  }

  return (
    <Spin spinning={loading}>
      <Calendar
        dateCellRender={dateCellRender}
        headerRender={({ value, onChange }) => {
          const start = 0
          const end = 12
          const monthOptions = []

          const current = value.clone()
          const localeData = value.localeData()
          const months = []
          for (let i = 0; i < 12; i++) {
            current.month(i)
            months.push(localeData.monthsShort(current))
          }

          for (let i = start; i < end; i++) {
            monthOptions.push(
              <Select.Option key={i} value={i} className="month-item">
                {months[i]}
              </Select.Option>
            )
          }

          const year = value.year()
          const month = value.month()
          const options = []
          for (let i = year - 10; i < year + 10; i += 1) {
            options.push(
              <Select.Option key={i} value={i} className="year-item">
                {i}
              </Select.Option>
            )
          }
          return (
            <Space
              style={{
                padding: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                {TITLE}
              </Typography.Title>
              <Row gutter={8}>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    className="my-year-select"
                    value={year}
                    onChange={newYear => {
                      const now = value.clone().year(newYear)
                      onChange(now)
                    }}
                  >
                    {options}
                  </Select>
                </Col>
                <Col>
                  <Select
                    size="small"
                    dropdownMatchSelectWidth={false}
                    value={month}
                    onChange={newMonth => {
                      const now = value.clone().month(newMonth)
                      onChange(now)
                    }}
                  >
                    {monthOptions}
                  </Select>
                </Col>
                <Col>
                  <Navigator />
                </Col>
              </Row>
            </Space>
          )
        }}
      />
    </Spin>
  )
}
