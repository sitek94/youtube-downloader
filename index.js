const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/send-file', (req, res) => {
  res.sendFile(__dirname + '/file.html')
})

app.get('/download', (req, res) => {
  res.download(__dirname + '/file.html')
})

const port = 8000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
  console.log(`Visit http://localhost:${port}`)
})
