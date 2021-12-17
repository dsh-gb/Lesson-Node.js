#!/usr/bin/env node
// подключаем модули
const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')
const color = require('colors')

const executionDir = process.cwd() // рабочая директория запуска скрипта
const explorerDir = (nameDir) => fs.readdirSync(nameDir) // ф-я чтения содержимого каталога 

console.log(`Полный путь директории запуска скрипта: ${executionDir}`.yellow);
console.log('Структура папок и файлов в директории запуска скрипта:')
console.log(explorerDir(executionDir).join('\n').green)

const isFile = (fileName) => fs.lstatSync(fileName).isFile() // ф-я проверки принадлежности имени к файлу
const isDir = (dirName) => fs.lstatSync(dirName).isDirectory() // ф-я проверки принадлежности имени к директории

// ф-я принимает имя файла и проверяет в нем наличие введенного слова/строки
// выводит результат поиска слова/строки ввиде кол-ва совпадений
function searchStr(nameFile) {
    const data = fs.readFileSync(nameFile, 'utf-8') // читаем файл
    // запрашиваем поисковую строку/слово
    inquirer.prompt([
        {
            name: 'search',
            type: 'input',
            message: 'Введите строку/слово для поиска в файле: ',
        }
    ]).then(({ search }) => {
        try {
            const regSearch = new RegExp(`${search}`, 'gm') // создаем рег выражение 
            const resultSearch = data.match(regSearch) // ищем все вхождения поискового слова/строки
            const matchesNum = (resultSearch?.length) ? resultSearch.length : 0 // проверка для случая когда resultSearch = undefinde
            console.log('Кол-во вхождений строки'.green, `${search}`.blue, 'в файле:'.green, `${matchesNum}`.red)
        } catch (err) {
            console.error(`${err}`.inverse.red)
        }
    })
}

// ф-я принимающая имя файла/директории и полный путь текущей директории
// выводит для выбора список файлов и папок в текущей директории
// при выборе папки рекурсивно вызывает себя с новыми name и currentPath
// при выборе файла вызывает ф-ю проверки наличия в файле заданной строки
function readDir(name, currentPath) {
    // проверка на пустую директорию
    if (fs.readdirSync(currentPath).length === 0) {
        return console.log(`Директория ${currentPath} пустая`.red)
    }
    // если директория не пустая, то читаем ее
    return inquirer.prompt([
        {
            name: 'name',
            type: 'list',
            message: `Выберите содержимое директории ${name}: `,
            choices: fs.readdirSync(currentPath),
        }
    ]).then(({ name }) => {
        //currentPath = `${currentPath}\\${name}` // обновляем выбранный путь 
        currentPath = path.join(currentPath, name) // обновляем выбранный путь
        try {
            if (isDir(currentPath)) {
                readDir(name, currentPath)
            } else {
                console.log(`Файл ${name}: ${currentPath}`.yellow)
                searchStr(currentPath) // вызываем ф-ю поиска совпадений
            }
        } catch (err) {
            console.error(`${err}`.inverse.red)
        }
    })
}

// запрашиваем имя файла/папки 
inquirer.prompt([
    {
        name: 'name',
        type: 'input',
        message: 'Введите путь к директории или файлу в папке запуска скрипта: ',
    }
]).then(({ name }) => {
    try {
        // let currentPath = `${executionDir}\\${name}` // обновляем выбранный путь
        let currentPath = path.join(executionDir, name) // обновляем выбранный путь
        if (isDir(name)) {
            readDir(name, currentPath) // вызываем ф-ю чтения директории
        } else if (isFile(name)) {
            console.log(`Файл ${name}: ${currentPath}`.yellow)
            searchStr(currentPath) // вызываем ф-ю поиска совпадений 
        }
    }
    catch (err) {
        console.error('Это имя'.red, `${name}`.green, 'не является директорией или файлом!'.red)
        console.error(`${err}`.inverse.red)
    }
})