const Path = require ('path')
const {GarXmlZip} = require ('..')

test ('bad', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	await expect (() => garXmlZip.createReadStream ({name: '1', region: 99})).rejects.toBeDefined ()

})

test ('basic', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const stream = await garXmlZip.createReadStream ({
		filter: r => r.get ('TYPEID') != 13,		
		map: r => Object.fromEntries (r.entries ()),
		name: 'APARTMENTS_PARAMS',
		region:  99,
    })

	const a = []; for await (const r of stream) a.push (r)

	expect (a).toStrictEqual (
		[
			{
			  ID: '1362407514',
			  OBJECTID: '157343423',
			  CHANGEID: '488480121',
			  CHANGEIDEND: '0',
			  TYPEID: '15',
			  VALUE: '1',
			  UPDATEDATE: '2022-11-30',
			  STARTDATE: '2022-11-30',
			  ENDDATE: '2079-06-06'
			},
/*			
			{
			  ID: '1362407515',
			  OBJECTID: '157343423',
			  CHANGEID: '488480121',
			  CHANGEIDEND: '0',
			  TYPEID: '13',
			  VALUE: '550000000000000000340036000100000',
			  UPDATEDATE: '2022-11-30',
			  STARTDATE: '2022-11-30',
			  ENDDATE: '2079-06-06'
			}
*/			  
		]
	)

})

test ('txt', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const a = [], m = []

	const stream = await garXmlZip.createReadStream ({
		name: 'APARTMENTS',
		region:  99,
		join: ['OBJECTGUID', '?', 'NUMBER'],
		progress: [p => m.push (p.percentage)],
	})

	for await (const r of stream) a.push (r.toString ())

	expect (a).toStrictEqual (['497202af-0ce7-4ca7-a73d-124546396d82\t\t1\n'])
	expect (m).toStrictEqual ([100, 100])

})


test ('pro', async () => {

	const garXmlZip = new GarXmlZip (Path.join (__dirname, 'gar_xml.zip'))

	const m = []

	let n = 0

	const stream = await garXmlZip.createReadStream ({
		name: 'HOUSES_PARAMS',
		region:  99,
		progress: [  
			p => m.push (p.percentage),
			{time: 1},
		],
	})

	for await (const r of stream) n ++

	expect (n).toBe (4433)
	expect (m.length > 1).toBe (true)

})