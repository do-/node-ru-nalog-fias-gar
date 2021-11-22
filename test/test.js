const fs          = require ('fs')
const assert      = require ('assert')
const {GarXmlZip} = require ('../')

const path = '/buf/___/gar_xml.zip'

async function test_001_date () {

	const garXmlZip = new GarXmlZip (path)

	const date = await garXmlZip.getDate ()

	assert.strictEqual (date, '2021-08-30')

}

async function main () {

	if (!fs.existsSync (path)) return console.log ('No file, no problem')
	
	await test_001_date ()

}

main ()
