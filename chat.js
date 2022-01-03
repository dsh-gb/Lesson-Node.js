const socket = require('socket.io')
const http = require('http')
const path = require('path')
const fs = require('fs')

const server = http.createServer((req, res) => {
    // запись index.html на страницу клиента
    const indexPath = path.join(__dirname, 'index-chat.html')
    const readStream = fs.createReadStream(indexPath)
    readStream.pipe(res)
})

server.listen(8000)

const io = socket(server)

// чат пользователей
io.on('connection', (client) => {
    // генерируем событие - подключение нового пользователя
    client.broadcast.emit('newUser', {
        id: client.id,
        clientsCount: io.engine.clientsCount // счетчик подключенных пользователей
    })

    // реагируем на событие отключение пользователя и передаем его всем остальным пользователям
    client.once('disconnect', () => {
        client.broadcast.emit('disconectUser', {
            id: client.id,
            clientsCount: io.engine.clientsCount // счетчик подключенных пользователей
        })
    })

    // реагируем на событие - сообщение от пользователя
    client.on('client-msg', data => {
        const payload = {
            message: data.message?.split('').reverse().join(''),
            id: client.id,
        }

        client.emit('server-msg', payload) // отправка сообщения пользователю инициатору события
        client.broadcast.emit('server-msg', payload)  // генерируем событие - сообщение от сервера всем остальным пользователям
    })
})

