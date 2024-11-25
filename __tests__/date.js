const Path = require ('path')
const {GarXmlZip} = require ('..')

test ('basic', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const date = await garXmlZip.getDate ()

	expect (date).toBe ('2023-06-26')

})

test ('bad', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, '1.zip'))

	await expect (() => garXmlZip.getDate ()).rejects.toBeDefined ()

})