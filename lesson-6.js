const socket = require('socket.io')
const http = require('http')
const path = require('path')
const fs = require('fs')

const executionDir = process.cwd() // рабочая директория запуска скрипта
const explorerDir = (nameDir) => fs.readdirSync(nameDir) // ф-я чтения содержимого каталога 
const isFile = (fileName) => fs.lstatSync(fileName).isFile() // ф-я проверки принадлежности имени к файлу
const isDir = (dirName) => fs.lstatSync(dirName).isDirectory() // ф-я проверки принадлежности имени к директории
let currentPath = executionDir

const server = http.createServer((req, res) => {
    // запись index.html на страницу клиента
    const indexPath = path.join(__dirname, 'index.html')
    const readStream = fs.createReadStream(indexPath)
    readStream.pipe(res)

    // файловый менеджер
    if (req.method === 'GET' && req.url !== '/favicon.ico') {

        res.writeHead(200, 'OK', {
            'Content-Type': 'text/html; charset=utf-8',
        })

        const urlPath = req.url.replace(/%20/g, ' ') // читаем url из запроса, заменив кодировку %20 пробела на сам пробел
        currentPath = path.join(executionDir, urlPath) // путь в текущую директорию/файл

        // выводим html структуру домашней директории запуска скрипта
        if (req.url === '' || req.url === '/') { // проверка домашней директории 
            res.write('<h2>Структура папок и файлов в домашней директории:</h2>')
            res.write('<ul>')
            explorerDir(executionDir).forEach(el => res.write(`<li><a href=/${el}>${el}</a></li>`))
            res.write('</ul>')
        } else if (isDir(urlPath.substring(1))) { // проверка перехода в директорию
            if (fs.readdirSync(currentPath).length === 0) { // проверка на пустую директорию
                res.write(`<h2>Директория ${urlPath} пустая</h2>`)
            } else {
                // выводим html структуру текущей директории  
                res.write('<h2>Структура папок и файлов в текущей директории:</h2>')
                res.write('<ul>')
                explorerDir(currentPath).forEach(el => res.write(`<li><a href='${urlPath}/${el}'>${el}</a></li>`))
                res.write('</ul>')
            }
        } else if (isFile(urlPath.substring(1))) { // проверка открытия файла
            res.write(`<h2>Содержимое файла ${urlPath}:</h2>`)
            const data = fs.readFileSync(currentPath, 'utf-8') // читаем файл
            res.write(`<textarea rows="40" cols="100">${data}</textarea>`) // записываем данные 
        }
    } else {
        res.writeHead(405, 'Not allowed');
        res.end('Method not allowed');
    }
})

server.listen(8000)

const io = socket(server)

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

