const fs          = require ('fs')
const assert      = require ('assert')
const {GarXmlZip} = require ('../')

const path = '/buf/___/gar_xml.zip'

async function test_001_date () {

	const garXmlZip = new GarXmlZip (path)

	const date = await garXmlZip.getDate ()

	assert.strictEqual (date, '2021-08-30')

}

async function test_002_dic () {

	const garXmlZip = new GarXmlZip (path)

	const d = await garXmlZip.getDataDictionary ({
		name   : 'HOUSE_TYPES',
		filter : r => r.get ('ISACTIVE') === 'true',
		map    : r => r.get ('SHORTNAME')
	})

	assert (!d.has ('1'))
	assert.strictEqual (d.get ('2'), 'д.')

}

async function test_003_str () {

	const garXmlZip = new GarXmlZip (path)
	
	let cnt = 0

	const houses = await garXmlZip.createReadStream ({
		name: 'HOUSES',
	  region:  78,
//	  filter: r => r.get ('HOUSENUM') === '1',
		 map: r => {r.set ('foo', ++cnt); return r},
		join: ['foo', 'OBJECTGUID', 'HOUSENUM'],
		progress: [  
			p => console.log (p.percentage + '%'),
			{time: 2000},
		],
     })

	houses.pipe (fs.createWriteStream ('h.txt'))

/*	
	for await (const house of houses) {
		console.log ({house})
		return
	}
*/
}

async function main () {

	if (!fs.existsSync (path)) return console.log ('No file, no problem')
	
//	await test_001_date ()
//	await test_002_dic ()
	await test_003_str ()

}

main ()
