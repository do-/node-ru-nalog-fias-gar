const assert                   = require ('assert')
const zip                      = require ('unzippo')
const progress_stream          = require ('progress-stream')
const {XMLLexer, SAXEvent}     = require ('xml-toolkit')
const GarXmlObjectTransformer  = require ('./GarXmlObjectTransformer')
const GarXmlTabTextTransformer = require ('./GarXmlTabTextTransformer')

const GarXmlZip = class  {

	constructor (path) {

		this.path = path

	}
	
	async getDate () {
	
		const dir = await zip.list (this.path)

		for (const key in dir) 

			if (key.slice (-4) === '.XML') 

				return key.slice (-49, -45) + '-' + key.slice (-45, -43) + '-' + key.slice (-43, -41)

		throw Error ('No .XML file found')

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
	
	meter (is, size, progress) {

		assert (Array.isArray (progress), '`progress` must be an Array')
		
		const {length} = progress
		
		assert (length > 0, '`progress` cannot be empty')
		
		assert (length < 3, '`progress` cannot be longer than 2')
				
		const [cb, opt] = progress
			
		return is.pipe (progress_stream ({...opt || {}, length: size})).on ('progress', cb)

	}

	async createReadStream ({name, region, filter, map, join, progress} = {}) {
	
		assert (region != null, '`region` must be defined')
		assert (name   != null, '`name`   must be defined')
				
		const pre = ('000' + region).slice (-2) + '/AS_' + name
		
		const dir = await zip.list (this.path)

		const path = Object.keys (dir).find (s => s.slice (0, -50) === pre); if (!path) throw new Error (pre + '...XML not found.')
		
		let is = await zip.open (this.path, path)

		if (progress != null) is = this.meter (is, dir [path].size, progress)

		const lex = new XMLLexer (); is.pipe (lex)

		const ox = new GarXmlObjectTransformer ({filter, map}); lex.pipe (ox)

		if (join == null) return ox		

		const tx = new GarXmlTabTextTransformer ({join}); ox.pipe (tx)

		return tx

	}
	
}

module.exports = GarXmlZip