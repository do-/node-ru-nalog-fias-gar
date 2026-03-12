const Path = require ('path')
const {GarXmlZip} = require ('..')

test ('basic', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const version = await garXmlZip.getVersion ()

	expect (version).toStrictEqual ({version: 'v.238', date: '2026-03-10'})

})

test ('bad', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, '1.zip'))

	await expect (() => garXmlZip.getVersion ()).rejects.toBeDefined ()

})
