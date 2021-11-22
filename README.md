# Disclaimer

This software is developed solely for integration with Russian government IT systems, so the Cyrillic script is widely used in its documentation.

# Описание

`ru-nalog-fias-gar` - библиотека для чтения в приложениях на основе node.js файлов Федеральной информационной адресной системы (ФИАС) в формате Государственного адресного реестра (ГАР), доступных на [официальном сайте](https://fias.nalog.ru/Updates) .

Чтение происходит непосредственно из ZIP-архива, не требуя предварительной распаковки в файловую систему.

Извлечение таблиц, содержащих миллионы записей (дома, улицы и т. п.) реализовано в виде [потока](https://nodejs.org/docs/latest/api/stream.html#readable-streams) [объектов](https://nodejs.org/docs/latest/api/stream.html#object-mode).

Отдельные записи, извлечённые из XML, представляются в виде объектов типа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). Все ключи и все значения в этих Map (в том числе такие, как `"1"`, `"true"`, `"2079-06-06"`) являются примитивными строками, непосредственно вырезанными из XML-текста, без дополнительных преобразований.

Предусмотрена опция для преобразования этих объектов в строки с разделителями-символами табуляции - для массовой загрузки в БД.

# Установка
```shell
npm i ru-nalog-fias-gar
```
# Как использовать

```js
// Инициализация
const {GarXmlZip} = require ('ru-nalog-fias-gar')
const garXmlZip = new GarXmlZip ('~/gar_xml.zip')

// Выяснение даты архива
const date = await garXmlZip.getDate () // 'YYYY-MM-DD'

// Извлечение общей таблицы-справочника
const houseTypes = await garXmlZip.getDataDictionary ({
    name: 'HOUSE_TYPES',
  filter: r => r.get ('ISACTIVE') === 'true',
     map: r => r.get ('SHORTNAME'),
}) // Map {"2" => "д.", ...}

// Извлечение таблицы данных региона
const houses = await garXmlZip.createReadStream ({
    name: 'HOUSES',
  region: 77,
  filter: r => r.get ('ISACTUAL') === '1',
     map: r => {r.set ('ADDRESS', ...) ...; return r},
    join: ['OBJECTGUID', 'ADDRESS'],
})

  // ...и дальше

for await (const house of houses) {
  // обработать `house`
}

  // ...либо

houses.pipe (new Transformer (...)).pipe (destination)
```
# API
## Общие замечания
Предполагается, что имя каждого файла в ZIP-архиве имеет формат `AS_${name}_${YYYY}${MM}${DD}_${UUID}.XML`, где:
* `${YYYY}${MM}${DD}` у всех элементов архива совпадают;
* `${name}` различается у любых двух файлов внутри одной директории;
* `${UUID}` имеет длину 36 символов.

Выполнение этих условий не проверяется. При их нарушении результат вызова нижеописанных методов непредсказуем.

## Конструктор
```js
const garXmlZip = new GarXmlZip ('~/gar_xml.zip')
```
Параметры: 
|Имя|Тип|Описание|
|-|-|-|
|path|string|Путь к файлу `gar_xml.zip`||

Сам по себе конструктор не производит никаких действий с файлом, в том числе не проверяет его наличие. Однако при вызове всех методов файл должен быть доступен на чтение по указанному пути.

## `getDate`
```js
const date = await garXmlZip.getDate ()
```
Асинхронный метод определения даты архива.

Дата возвращается в виде **строки** формата `YYYY-MM-DD` (НЕ объекта `Date`).

Значение, возвращаемое методом, формируется из подстроки длины 8, находящейся на расстоянии 41 символ от конца имени первого попавшегося в архиве файла.

## `getDataDictionary`

```js
const houseTypes = await garXmlZip.getDataDictionary ({
    name: 'HOUSE_TYPES',
  filter: r => r.get ('ISACTIVE') === 'true',
     map: r => r.get ('SHORTNAME'),
}) // Map {"2" => "д.", ...}
```
Асинхронный метод, извлекающий содержимое одного из файлов в корне архива. Такие файлы содержат справочники данных: типы документов и т. п.

Опции:
|Имя|Тип|Обязательность|По умолчанию|Описание|
|-|-|-|-|-|
|name|string|Да||Часть имени файла от `AS_` до `_YYYYMMDD`|
|filter|Map => Boolean|Нет|r => true|Если эта функция определена, она вызывается для каждой записи и в результат попадают только те из них, для которых функция вернёт значение, [приводимое](https://262.ecma-international.org/12.0/#sec-toboolean) к `true`|
|map|Map => any|Нет|r => r|Если эта функция определена, результат формируется из результатов её вызова|

В результате выдаётся [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), у которого:
* ключи - значения атрибутов `ID` элементов, найденных в файле;
* значения - результаты применения функции, заданной как опция `map`, к Map-наборам атрибутов
  * если `map` не задана - сами записи в виде Map (в том числе содержащие ключи `ID`, по которым они индексированы).

## `createReadStream`

```js
const houses = await garXmlZip.createReadStream ({
    name: 'HOUSES',
  region: 77,
  filter: r => r.get ('ISACTUAL') === '1',
     map: r => {r.set ('ADDRESS', ...) ...; return r},
    join: ['OBJECTGUID', 'ADDRESS'],
})
```
Асинхронный метод, извлекающий содержимое одного из файлов в региональной директории в виде потока.

Если задана опция `join`, поток обычный, если не задана - [объектный](https://nodejs.org/docs/latest/api/stream.html#object-mode).

Опции:
|Имя|Тип|Обязательность|По умолчанию|Описание|
|-|-|-|-|-|
|name|string|Да||Часть имени файла от `AS_` до `_YYYYMMDD`|
|region|string или Number|Да||Код региона, он же имя директории архива, в которой расположен файл|
|filter|Map => Boolean|Нет|r => true|Если эта функция определена, она вызывается для каждой записи и в результат попадают только те из них, для которых функция вернёт значение, [приводимое](https://262.ecma-international.org/12.0/#sec-toboolean) к `true`|
|map|Map => any|Нет|r => r|Если эта функция определена, то каждая исходная запись заменяется на результат её вызова|
|join|Array|Нет||Если этот массив определён, то каждая запись (после `map`) заменяется на строку, составленную из значений перечисленных в `join` полей, через `\t`, оканчивающуюся на `\n`|
