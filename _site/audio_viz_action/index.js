/**
 * @fileoverview This is the server app script.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const PORT = 5000

// Dependencies.
const express = require('express')
const http = require('http')
const path = require('path')
const ytdl = require('ytdl-core')

const app = express()
const server = http.Server(app)

app.set('port', PORT)

app.use('/client', express.static(path.join(__dirname, '/client')))

app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'))
})

app.post('/stream/:videoId', (request, response) => {
  const videoId = request.params.videoId
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  if (!ytdl.validateURL(videoUrl)) {
    response.send({ success: false })
  } else {
    ytdl(videoUrl, { filter: format => format.container === 'mp4' })
      .pipe(response)
  }
})

// Starts the server.
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Starting server on port ${PORT}`)
})
