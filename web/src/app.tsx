import './app.less'

import { ConfigProvider } from 'antd'
import enUS from 'antd/es/locale/en_US'
import zhCN from 'antd/es/locale/zh_CN'
import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { setLogLevel } from 'webpack-dev-server/client/utils/log'

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
    settings.get().then((data) => {
      const lang = data?.lang || 'en'
      i18n.setLocal(lang)
      setLanguage(lang)
      pager.goto(data?.page)
    })

    if (
      APP_ARGS?.colorTheme &&
      typeof self !== 'undefined' &&
      self?.document?.body?.setAttribute
    ) {
      self.document.body.setAttribute('data-color-theme', APP_ARGS.colorTheme)
    }
  }, [])

  return (
    <ConfigProvider locale={language === 'zh-cn' ? zhCN : enUS} key={language}>
      <div className="app" data-theme={APP_ARGS.theme ?? 'light'}>
        <Routes>
          <Route
            path="/todo_v2"
            element={
              <PageTodoTree
                onLangChange={async (lang) => {
                  await settings.set((data) => {
                    data.lang = lang
                    return data
                  })
                  i18n.setLocal(lang)
                  setLanguage(lang)
                }}
              />
            }
          />
          <Route path="/play" element={<PagePlay />} />
          <Route path="/calendar" element={<PageCalender />} />
        </Routes>
      </div>
    </ConfigProvider>
  )
}
