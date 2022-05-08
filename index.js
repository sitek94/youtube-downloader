const express = require('express')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

const app = express()

app.use(express.static('public'))
app.use(express.json())

const downloadRouter = express.Router()

downloadRouter.route('/video').get(async (req, res) => {
  const url = req.query['videoUrl']

  if (!url) {
    res.status(400).send('No URL provided')
  }

  if (!ytdl.validateURL(url)) {
    res.status(400).send('Invalid URL')
  }

  const info = await ytdl.getBasicInfo(url)
  const stream = ytdl(url)
  res.header(
    'Content-Disposition',
    `attachment; filename="${info.videoDetails.title}.mp4`,
  )
  stream.pipe(res)
})

app.get('/download', (req, res) => {
  const url = req.query.url
  ytdl(url).pipe(res)
})

app.get('/playlist', async (req, res) => {
  const playlist = await ytpl('UU_aEa8K-EOJ3D6gOs7HcyNg')

  // FIXME: Sending only 3 items during development
  res.send(playlist.items.slice(0, 3))
})

app.use('/download', downloadRouter)

const port = 8000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(`Visit http://localhost:${port}`)
})
