// *********** Первое задание *********** //
// console.log('Record 1');

// setTimeout(() => {
//     console.log('Record 2');
//     Promise.resolve().then(() => {
//         setTimeout(() => {
//             console.log('Record 3');
//             Promise.resolve().then(() => {
//                 console.log('Record 4');
//             });
//         });
//     });
// });

// console.log('Record 5');

// Promise.resolve().then(() => Promise.resolve().then(() => console.log('Record 6')));

// *********** Ответ *************** //
// Record 1 
// Record 5 - сперва вывод синхронного года в порядке его следования в программе
// Record 6 - выполняется микро-задача промиса с console.log находящаяся в макро-задаче внешнего промиса
// Record 2 
// Record 3
// Record 4 - выполняются микро-задачи внешнего таймера, сперва синхронный код с console.log(Record 2)
// потом микро-задачи внутри промиса из таймера


// *************** Второе задание **************** //
// подключаем модули moment, events и colors
const moment = require('moment')
const EventEmitter = require('events')
const colors = require('colors')

// создаем экземпляры этих модулей
//const moment = new MomentModule()
const emitter = new EventEmitter()

// список наименований
const NAMES = {
    hour: 'часов',
    day: 'дней',
    month: 'месяцев',
    year: 'лет'
}

// список интервалов в сек
const INTERVAL = {
    minute: 60,
    hour: 3600,
    day: 86400,
    month: 2592000,
    year: 31104000,
}

// записываем в виде чисел значения времени и даты введенные в формате HH DD MM YYYY
const [hour, day, month, year] = process.argv.slice(2).map(Number)

const timeDate = `${hour}-${day}-${month}-${year}`

// функция обратного таймера - принимает имя таймера, начальное значение и номер интервала отчета
// const countDownTimer = (nameTimer, initialTimer, numInterval) => {
//     if (initialTimer - numInterval > 0) {
//         console.log(`осталось ${nameTimer} = ${initialTimer - numInterval}`.green)
//     } else {
//         //console.log(`счетчик ${nameTimer} закончился`.red.inverse)
//         // если таймер закончил отсчет, то генерируем событие по названию таймера
//         events.once(`${nameTimer}`, () => console.log(`счетчик ${nameTimer} закончился`.red.inverse))
//     }
// }
const countDownTimer = (nameTimer, initialTimer, interval) => {
    emitter.on('off', () => console.log(`счетчик ${nameTimer} закончился`.red.inverse))

    const idTimer = setInterval(() => {
        initialTimer -= 1
    }, interval)

    setInterval(() => {
        if (initialTimer > 0) {
            console.log(`осталось ${nameTimer} = ${initialTimer}`.green)
        } else {
            // если таймер закончил отсчет, то генерируем событие по названию таймера
            //console.log(`счетчик ${nameTimer} закончился`.red.inverse)
            emitter.emit('off')
            clearInterval(idTimer)
        }
    }, 1000)
}

// валидация полученных значений hour, day, month и year методом isValid() модуля moment
if (moment(timeDate, 'HH-DD-MM-YYYY').isValid()) {
    console.log(`введенное время и дата - ${timeDate}`)

    //let numInterval = 1 // номер интервала посекундного вывода в консоль
    // выводим каждую секунду в консоль таймеры для наших переменных
    countDownTimer(NAMES.hour, hour, 2000)

    // setInterval(() => {
    //     let returnHour = countDownTimer(NAMES.hour, hour, 2000)
    //     events.emit(NAMES.hour)

    //     let returnDay = countDownTimer(NAMES.day, day, 4000)
    //     events.emit(NAMES.day)

    //     console.log(`осталось ${NAMES.hour} = ${hour - returnHour}`.green)
    //     console.log(`осталось ${NAMES.day} = ${day - returnDay}`.green)
    //     // countDownTimer(NAMES.hour, hour, INTERVAL.hour * 10)
    //     // events.emit(NAMES.hour)

    //     // countDownTimer(NAMES.day, day, INTERVAL.day * 10)
    //     // events.emit(NAMES.day)

    //     // countDownTimer(NAMES.month, month, INTERVAL.month * 1000)
    //     // events.emit(NAMES.month)

    //     // countDownTimer(NAMES.year, year, INTERVAL.year * 1000)
    //     // events.emit(NAMES.year)
    // }, 1000);
    // setInterval(() => {
    //     // выводим номер текущего интервала
    //     console.log(`Интервал № ${numInterval}:`.yellow)

    //     // таймер часов и слушатель события окончания часов
    //     countDownTimer(NAMES.hour, hour, numInterval)
    //     events.emit(NAMES.hour)

    //     // таймер дней и слушатель события окончания дней
    //     countDownTimer(NAMES.day, day, numInterval)
    //     events.emit(NAMES.day)

    //     // таймер месяцев и слушатель события окончания месяцев
    //     countDownTimer(NAMES.month, month, numInterval)
    //     events.emit(NAMES.month)

    //     // таймер лет и слушатель события окончания лет
    //     countDownTimer(NAMES.year, year, numInterval)
    //     events.emit(NAMES.year)

    //     console.log()
    //     numInterval += 1
    // }, 1000);
} else {
    console.log('Введен неверный формат данных - требуется ввести время и дату в формате HH DD MM YYYY')
    console.log('Где HH = 0..24, DD = 1..31, MM = 1..12, YYYY >= 0')
}
