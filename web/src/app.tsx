import './app.less'

import { ConfigProvider } from 'antd'
import enUS from 'antd/es/locale/en_US'
import zhCN from 'antd/es/locale/zh_CN'
import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

import { callService } from '@saber2pr/vscode-webview'

import { Services } from '../../src/api/type'
import { usePage } from './hooks/usePage'
import { useSettingsStore } from './hooks/useSettingsStore'
import { i18n } from './i18n'
import { PageTodoTree } from './pages'
import { PageCalender } from './pages/calendar'
import { PagePlay } from './pages/play'
import { APP_ARGS } from './utils'

setLogLevel('none')

export const App = () => {
  const pager = usePage()
  const [language, setLanguage] = useState<'en' | 'zh-cn'>('en')

  const settings = useSettingsStore()

  useEffect(() => {
    callService<Services, 'GetLanguage'>('GetLanguage', null).then(
      async language => {
        i18n.setLocal(language)
        setLanguage(language)

        const page = await settings.get(data => data?.page)
        pager.goto(page)
      }
    )

    if (
      APP_ARGS?.colorTheme &&
      typeof self !== 'undefined' &&
      self?.document?.body?.setAttribute
    ) {
      self.document.body.setAttribute('data-color-theme', APP_ARGS.colorTheme)
    }
  }, [])

  return (
    <ConfigProvider locale={language === 'zh-cn' ? zhCN : enUS}>
      <div className="app" data-theme={APP_ARGS.theme ?? 'light'}>
        <Routes>
          <Route path="/todo_v2" element={<PageTodoTree />} />
          <Route path="/play" element={<PagePlay />} />
          <Route path="/calendar" element={<PageCalender />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}
