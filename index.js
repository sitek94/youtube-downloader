const express = require('express')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')

const app = express()

/**
 * Downloads
 */
const downloadRouter = express.Router()

downloadRouter.route('/video').get(async (req, res) => {
  const url = req.query['url']

  if (!url) {
    res.status(400).send('No URL provided')
  }

  if (!ytdl.validateURL(url)) {
    res.status(400).send('Invalid URL')
  }

  const info = await ytdl.getBasicInfo(url)
  const stream = ytdl(url, {
    /**
     * itag 140 - audio-only format
     * https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options
     */
    quality: 140,
  })
  res.header(
    'Content-Disposition',
    `attachment; filename="${info.videoDetails.title}.mp4`,
  )
  stream.pipe(res)
})

/**
 * Info
 */
const infoRouter = express.Router()

infoRouter.route('/playlist').get(async (req, res) => {
  const url = req.query['url']

  if (!url) {
    res.status(400).send('No URL provided')
  }

  const id = await ytpl.getPlaylistID(url)
  if (!ytpl.validateID(id)) {
    res.status(400).send('Invalid URL')
  }

  const playlist = await ytpl(url, {
    /**
     * Download full playlist
     * https://github.com/TimeForANinja/node-ytpl#ytplid-options
     */
    pages: Infinity,
  })
  res.json(playlist)
})

// Middlewares
app.use(express.static('public'))
app.use(express.json())

// Routes
app.use('/download', downloadRouter)
app.use('/info', infoRouter)

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(`Visit http://localhost:${port}`)
})
