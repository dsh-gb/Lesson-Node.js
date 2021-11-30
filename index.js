const colors = require('colors') // подключаем модуль colors

// создаем три цвета для вывода чисел 
const green = colors.green
const yellow = colors.yellow
const red = colors.red

// функция вывода ошибки
const error = (text) => console.error(colors.yellow.inverse(text))

// получаем low и high границы диапазона вывода простых чисел
const low = +process.argv[2]
const high = +process.argv[3]

// проверка на правильность границ диапазона
if (Number.isInteger(low) && Number.isInteger(high)) {
    if (low <= high) {
        //let n = low 
        // проверяем также значение low на 0 и 1 - так как простое число должно быть > 1
        if (low > 1) n = low // переменная для поиска простых чисел
        else n = 2

        let k = 0 // счетчик для обновления светофора
        let noteSipmleNumbers = true

        // поиск простых чисел через алгоритм "Перебор делителей" 
        for (n; n <= high; n++) {
            let i = 2
            let j = 0
            for (i; i * i <= n & j === 0; i++) {
                if (n % i === 0) j = 1
            }
            // вывод простых чисел с окраской по принципу светофора
            if (j !== 1) {
                noteSipmleNumbers = false
                k += 1
                switch (k) {
                    case 1:
                        console.log(green(n))
                        break
                    case 2:
                        console.log(yellow(n))
                        break
                    case 3:
                        console.log(red(n))
                        k = 0
                        break
                }
            }
        }
        if (noteSipmleNumbers) console.log(red.inverse("Простых чисел в диапазоне нету"))
    } else error('Значения нижней границы диапазона больше верхней границы')
} else error(" Значения диапазона не являются целыми положительными числами")
