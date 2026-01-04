/**
 * Authentication configuration for Cloudbeds OAuth2
 */

const authentication = {
  type: 'oauth2',
  test: {
    url: 'https://hotels.cloudbeds.com/api/v1.1/getProperties',
    method: 'GET',
    headers: {
      Authorization: 'Bearer {{bundle.authData.access_token}}'
    },
    params: {}
  },
  oauth2Config: {
    authorizeUrl: {
      url: 'https://hotels.cloudbeds.com/oauth/authorize',
      params: {
        client_id: '{{process.env.CLOUDBEDS_CLIENT_ID}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
        scope: 'read:reservations write:reservations read:guests write:guests read:properties'
      }
    },
    getAccessToken: {
      url: 'https://hotels.cloudbeds.com/oauth/token',
      method: 'POST',
      body: {
        grant_type: 'authorization_code',
        code: '{{bundle.inputData.code}}',
        client_id: '{{process.env.CLOUDBEDS_CLIENT_ID}}',
        client_secret: '{{process.env.CLOUDBEDS_CLIENT_SECRET}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    refreshAccessToken: {
      url: 'https://hotels.cloudbeds.com/oauth/token',
      method: 'POST',
      body: {
        grant_type: 'refresh_token',
        refresh_token: '{{bundle.authData.refresh_token}}',
        client_id: '{{process.env.CLOUDBEDS_CLIENT_ID}}',
        client_secret: '{{process.env.CLOUDBEDS_CLIENT_SECRET}}'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    scope: 'read:reservations write:reservations read:guests write:guests read:properties',
    autoRefresh: true
  },

  connectionLabel: '{{bundle.authData.property_name || bundle.authData.email}}'
};

module.exports = authentication;


