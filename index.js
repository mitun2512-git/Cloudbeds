const authentication = require('./authentication');
const triggers = require('./triggers');
const creates = require('./creates');
const searches = require('./searches');
const { getPropertiesList, getRoomTypesList } = require('./lib/helpers');

/**
 * Main Zapier App Configuration
 */
const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [
    (request, z, bundle) => {
      // Add authentication token to all requests
      if (bundle.authData && bundle.authData.access_token) {
        request.headers = request.headers || {};
        request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
      }
      return request;
    }
  ],

  afterResponse: [],

  triggers,
  creates,
  searches,

  resources: {}
};

module.exports = App;

