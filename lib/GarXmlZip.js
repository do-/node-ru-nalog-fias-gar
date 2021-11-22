const zip = require ('unzippo')

const GarXmlZip = class  {

	constructor (path) {

		this.path = path

	}
	
	async getDate () {
	
		const dir = await zip.list (this.path)
		
		const [key] = Object.keys (dir)
	
		return key.slice (-49, -45) + '-' + key.slice (-45, -43) + '-' + key.slice (-43, -41)
	
	}

}

module.exports = GarXmlZip