import express from 'express'
import ytdl from 'ytdl-core'
import ytpl from 'ytpl'
import filenamify from 'filenamify'
import contentDisposition from 'content-disposition'

const app = express()

/**
 * Downloads
 */
const downloadRouter = express.Router()

downloadRouter.route('/video').get(async (req, res) => {
  const url = req.query['url']

  if (!url) {
    return res.status(400).send('No URL provided')
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).send('Invalid URL')
  }

  try {
    const info = await ytdl.getBasicInfo(url)
    const title = info.videoDetails.title
    const filename = filenamify(title) + '.mp4'

    const stream = ytdl(url, {
      /**
       * itag 140 - audio-only format
       * https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options
       */
      quality: 140,
    })

    res.setHeader('Content-Disposition', contentDisposition(filename))
    stream.pipe(res)
  } catch (error) {
    if (error.statusCode === 410) {
      console.log('Video is unavailable')
      console.log('URL: ', url)
      return res.status(410).send({ url, message: 'Video is unavailable' })
    }
    console.log('URL: ', url)
    console.log(error)

    return res.status(500).send('Internal server error')
  }
})

/**
 * Info
 */
const infoRouter = express.Router()

infoRouter.route('/playlist').get(async (req, res) => {
  const url = req.query['url']

  if (!url) {
    return res.status(400).send('No URL provided')
  }

  let id = ''
  try {
    id = await ytpl.getPlaylistID(url)
  } catch {}
  if (!id || !ytpl.validateID(id)) {
    return res.status(400).send('Invalid URL')
  }

  const playlist = await ytpl(url, {
    /**
     * Download full playlist
     * https://github.com/TimeForANinja/node-ytpl#ytplid-options
     */
    pages: Infinity,
  })
  return res.json(playlist)
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
