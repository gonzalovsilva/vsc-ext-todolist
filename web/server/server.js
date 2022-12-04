const { join } = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const { RCManager } = require('../../out/store/rc')
const os = require('os')
const app = express()

const createOutputPath = file => {
  let base = __dirname
  if (process.env.VERCEL) {
    base = os.tmpdir()
  }
  return join(base, file)
}

app
  .use(express.static(join(__dirname, '../build')))
  .use(bodyParser())
  .use(cors({ origin: '*' }))

const TODO_REG = /^[a-zA-Z0-9_-]+$/

app.post('/api', async (req, res) => {
  const body = req.body
  console.log(body)

  let uid = req.query.uid
  if (!TODO_REG.test(uid) || uid === undefined || uid === 'true') uid = 'data'

  const service = body.service
  const params = body.params

  const dataPath = createOutputPath(`${uid}.json`)

  const servicesMock = {
    GetStore: ({ key }) => {
      const rc = new RCManager(dataPath)
      return rc.get(key)
    },
    Store: async ({ key, value }) => {
      const rc = new RCManager(dataPath)
      await rc.set(key, value)
      return dataPath
    },
  }

  if (service && service in servicesMock) {
    res.json({
      serviceUri: service,
      response: await servicesMock[service](params),
    })
    return
  }
  res.json({})
  return
})

app.listen(3000, () => console.log('http://localhost:3000'))
