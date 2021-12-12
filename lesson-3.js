// подключаем модули
const fs = require('fs')
const { Transform } = require('stream')
const color = require('colors')

// путь к файлу логов
const PATH_FILE_LOG = './log/access.log'

// массив ip адресов 
const IP_ADDRESS = [
    '89.123.1.41',
    '34.48.240.111',
]

// массив путей к файлам логов c нужными ip
const PATH_IP_LOG = Array.from(IP_ADDRESS, elem => `./log/${elem}`)

// размер куска файла для чтения bytes
const SIZE_PART = {
    small: 1024,
    normal: 65536,
    big: 1048576,
}

// функция возвращает регул выражение для поиска строки с указанным ip адресом
function paternIP(ip) {
    return new RegExp(`^${ip}.*`, 'gm')
}

// подключаем поток на чтение файла логов
const readStream = fs.createReadStream(
    PATH_FILE_LOG,
    {
        flags: 'r',
        encoding: 'utf-8',
        // start: 0,
        // end: SIZE_PART.big,
        highWaterMark: SIZE_PART.big,
    }
)

// размер файла логов в байтах
const statLogFile = fs.statSync(PATH_FILE_LOG)
const sizeLogFile = statLogFile.size
let sizeReading = 0

// подписываемся на событие чтения файла и показываем прогресс чтения
readStream.on('data', (chunk) => {
    sizeReading += chunk.length
    const percentReading = (sizeReading / sizeLogFile) * 100
    console.log(`READING FILE LOG ${percentReading.toFixed(1)} %`.green)
})

// подписываемся на событие ошибки чтения файла
readStream.on('error', () => {
    console.error('ERROR READ FILE LOG'.red)
})

// подписываемся на событие окончания чтения файла
readStream.on('end', () => {
    console.log('END READ FILE LOG'.inverse.green)
})

// проходимся по всем ip адресам поиска логов
for (const ip in IP_ADDRESS) {

    // подключаем поток на запись файла для всех ip
    const writeStream = fs.createWriteStream(
        `${PATH_IP_LOG[ip]}_requests.log`,
        {
            // flags: 'a',
            encoding: 'utf-8',
        }
    )

    // поток transform для преобразования файла логов в логи с нужными ip 
    // создаем массив результата поиска по шаблону рег выражения, потом склеиваем 
    // из элементов массива строку с раздел между элементами ввиде переноса строки
    const tStream = new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = chunk
                .toString()
                .match(paternIP(IP_ADDRESS[ip]), '')?.join(`\n`)
            this.push(transformedChunk)
            callback()
        }
    })

    // перенаправляем поток transform в поток записи файла
    readStream
        .pipe(tStream)
        .pipe(writeStream)
}

