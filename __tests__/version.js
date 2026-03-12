const Path = require ('path')
const {GarXmlZip} = require ('..')

test ('basic', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const version = await garXmlZip.getVersion ()

	expect (version).toStrictEqual ({version: 'v.238', date: '2026-03-10'})

})

test ('missing', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'no_version.zip'))

	await expect (() => garXmlZip.getVersion ()).rejects.toThrow ('not found')

})

test ('empty', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'empty.zip'))

	await expect (() => garXmlZip.getVersion ()).rejects.toThrow ('too small')

})

test ('large', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'large.zip'))

	await expect (() => garXmlZip.getVersion ()).rejects.toThrow ('too large')

})
