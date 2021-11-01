//Using the node-geocoder module to pass the Geocoder API details. These details will be later used for Geocoding the address.

const nodeGeocoder = require('node-geocoder')

const options = {
  provider: process.env.GEOCODER_PROVIDER, 
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, 
  formatter: null,
}

const geocoder = nodeGeocoder(options)

module.exports = geocoder