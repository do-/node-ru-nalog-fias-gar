const assert               = require ('assert')
const zip                  = require ('unzippo')
const {XMLLexer, SAXEvent} = require ('xml-toolkit')

const GarXmlZip = class  {

	constructor (path) {

		this.path = path

	}
	
	async getDate () {
	
		const dir = await zip.list (this.path)
		
		const [key] = Object.keys (dir)
	
		return key.slice (-49, -45) + '-' + key.slice (-45, -43) + '-' + key.slice (-43, -41)
	
	}
	
	async getDataDictionary ({name, filter, map} = {}) {
	
		assert             (name != null, '`name` must be defined')
		assert.strictEqual (typeof name, 'string', '`name` must be defined as string')
		if (filter) assert.strictEqual (typeof filter, 'function', '`filter` must be defined as function')
		if    (map) assert.strictEqual (typeof map,    'function', '`map` must be defined as function')
	
		const dir = await zip.list (this.path)

		const path = Object.keys (dir).find (k => k.slice (3, -50) === name); if (!path) throw new Error (name + ' dictionary not found.')
		
		const m = new Map (), lex = (await zip.open (this.path, path)).pipe (new XMLLexer ())

		for await (const tag of lex) {
		
			const e = new SAXEvent (tag); if (!e.isSelfEnclosed) continue
			
			let r = e.attributes
			
			if (filter && !filter (r)) continue
			
			const id = r.get ('ID'); if (id == null) throw new Error ('No ID attribute:' + tag)

			if (map) r = map (r)
			
			m.set (id, r)

		}
		
		return m
		
	}
	
}

module.exports = GarXmlZip