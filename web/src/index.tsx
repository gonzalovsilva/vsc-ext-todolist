import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router'

import { setMockVscodeApi } from '@saber2pr/vscode-webview'

import { App } from './app'
import { parseUrlParam } from './utils'

// for docker web service
setMockVscodeApi({
  async postMessage(message) {
    const uid = parseUrlParam(window.location.search).uid
    // /api in server.js
    const res = await axios.post('/api', message, {
      params: { uid: /^\d+$/.test(uid) ? uid : null },
    })
    return res.data.response
  },
})

ReactDOM.render(
  <MemoryRouter>
    <App />
  </MemoryRouter>,
  document.querySelector('#root')
)
