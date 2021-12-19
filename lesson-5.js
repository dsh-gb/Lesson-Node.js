const fs = require('fs')
const http = require('http')
const path = require('path')

const executionDir = process.cwd() // рабочая директория запуска скрипта
const explorerDir = (nameDir) => fs.readdirSync(nameDir) // ф-я чтения содержимого каталога 
const isFile = (fileName) => fs.lstatSync(fileName).isFile() // ф-я проверки принадлежности имени к файлу
const isDir = (dirName) => fs.lstatSync(dirName).isDirectory() // ф-я проверки принадлежности имени к директории
let currentPath = executionDir


const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url !== '/favicon.ico') {

        res.writeHead(200, 'OK', {
            'Content-Type': 'text/html; charset=utf-8',
        })

        const urlPath = req.url
        currentPath = path.join(executionDir, urlPath) // путь в текущую директорию/файл

        // выводим html структуру домашней директории запуска скрипта
        if (req.url === '' || req.url === '/') { // проверка домашней директории 
            res.write('<h2>Структура папок и файлов в домашней директории:</h2>')
            res.write('<ul>')
            explorerDir(executionDir).forEach(el => {
                res.write(`<li><a href=/${el}>${el}</a></li>`)
            })
            res.write('</ul>')
        } else if (isDir(urlPath.substring(1))) { // проверка перехода в директорию
            if (fs.readdirSync(currentPath).length === 0) { // проверка на пустую директорию
                res.write(`<h2>Директория ${urlPath} пустая</h2>`)
            } else {
                // выводим html структуру текущей директории  
                res.write('<h2>Структура папок и файлов в текущей директории:</h2>')
                res.write('<ul>')
                explorerDir(currentPath).forEach(el => {
                    res.write(`<li><a href=${urlPath}/${el}>${el}</a></li>`)
                })
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
    res.end()
}).listen(8000)
