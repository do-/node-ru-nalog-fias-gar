const {Transform} = require ('stream')

const GarXmlTabTextTransformer = class extends Transform {

	constructor (options) {

		const {join} = options
						
		delete options.join
		
		options.writableObjectMode = true
		
		super (options)
		
		this.join = join

	}

	_transform (chunk, encoding, callback) {
	
		const {join} = this, last = join.length - 1
				
		let i = 0, s = ''; while (true) {
		
			const v = chunk.get (join [i])
							
			if (v != null) s += v
			
			if (i === last) {
				s += '\n'
				break
			}
			else {
				s += '\t'
			}
			
			i ++
		
		}

		this.push (s)
	
		callback ()
	
	}
		
}

module.exports = GarXmlTabTextTransformer