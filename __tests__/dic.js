const Path = require ('path')
const {GarXmlZip} = require ('..')

test ('bad', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	await expect (() => garXmlZip.getDataDictionary ({name: '1'})).rejects.toBeDefined ()

})

test ('basic', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const d = await garXmlZip.getDataDictionary ({
		name   : 'HOUSE_TYPES',
		filter : r => r.get ('ISACTIVE') === 'true',
		map    : r => r.get ('SHORTNAME')
	})

	expect (Object.fromEntries (d.entries ())).toStrictEqual ({
		'2': 'д.',
		'4': 'г-ж',
		'5': 'зд.',
		'6': 'шахта',
		'7': 'стр.',
		'8': 'соор.',
		'10': 'к.'
	})

})

test ('fm', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const d = await garXmlZip.getDataDictionary ({
		name   : 'HOUSE_TYPES',
	})
	
	expect (d.get ('14').get ('ISACTIVE')).toBe ('false')

})