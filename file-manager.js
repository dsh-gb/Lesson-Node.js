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

    const creatHtml = (header, pathElem) => {
        const indexPath = path.join(__dirname, 'index-file-manager.html')
        let htmlPage = fs.readFileSync(indexPath, 'utf-8') // записываем index.html в переменную
        let listDir = `<h2>${header}</h2>\n`
        // читаем содержимое директории и формируем из нее html список 
        explorerDir(currentPath).forEach(el => {
            const urlEl = el.replace(/\s/g, '%20') // меняем все пробелы в url на символы %20
            listDir += `<li><a href=${pathElem}/${urlEl}>${el}</a></li>\n`
        })
        htmlPage = htmlPage.replace(/ListContents/gm, listDir) // заменяем ListContents в структуре index.html на список содержимого директории
        res.write(htmlPage)
    }

    if (req.method === 'GET') {
        switch (req.url) {
            case '/favicon.ico':
                res.writeHead(200, 'OK', {
                    'Content-Type': 'image/x-icon',
                })
                break;
            case `${'' || '/'}`: // проверка домашней директории 
                res.writeHead(200, 'OK', {
                    'Content-Type': 'text/html; charset=utf-8',
                })
                // структура домашней директории запуска скрипта
                creatHtml('Структура папок и файлов в домашней директории:', '')
                break;
            default: // все остальные url 
                const urlPath = req.url.replace(/%20/g, ' ') // читаем url из запроса, заменив кодировку пробела "%20" на сам пробел
                currentPath = path.join(executionDir, urlPath) // путь в текущую директорию/файл
                try {
                    res.writeHead(200, 'OK', {
                        'Content-Type': 'text/html; charset=utf-8',
                    })
                    if (isDir(urlPath.substring(1))) { // проверка перехода в директорию
                        if (explorerDir(currentPath).length === 0) { // проверка на пустую директорию
                            res.write(`<h2>Директория ${urlPath} пустая</h2>`)
                        } else {
                            // структура текущей директории  
                            creatHtml('Структура папок и файлов в текущей директории:', urlPath)
                        }
                    } else if (isFile(urlPath.substring(1))) { // проверка открытия файла
                        res.write(`<h2>Содержимое файла ${urlPath}:</h2>`)
                        const data = fs.readFileSync(currentPath, 'utf-8') // читаем файл
                        res.write(`<textarea rows="40" cols="100">${data}</textarea>`) // выводим данные 
                    }
                } catch (error) {
                    res.writeHead(404, 'NOT FOUND', {
                        'Content-Type': 'text/html; charset=utf-8',
                    })
                    res.write(`<h2 style="color: red">url ${urlPath} не явл путем директории или файла</h2>`)
                    console.error(error)
                }
                break;
        }
    } else { // все остальные методы запросов http
        res.writeHead(405, 'NOT ALLOWED');
        res.end('Method not allowed');
    }
    res.end()
})

server.listen(8888)

const io = socket(server)

// счетчик пользователей
io.on('connection', (client) => {
    // генерируем событие - подключение нового пользователя и передаем его всем остальным пользователям
    client.broadcast.emit('newUser', {
        clientsCount: io.engine.clientsCount // счетчик подключенных пользователей
    })

    // реагируем на событие отключение пользователя 
    client.once('disconnect', () => {
        client.broadcast.emit('disconectUser', {
            clientsCount: io.engine.clientsCount // счетчик подключенных пользователей
        })
    })
})