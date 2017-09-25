import _ from 'lodash';
import request from 'request-promise';

import {baseUrl, token} from './config';

const r = request.defaults({
  baseUrl: 'https://canvas.harvard.edu/api/v1/',
  headers: {
   'Authorization': 'Bearer 1875~aUXKCzRHdK3vjlcm379H48QUB9WXznfekW70T8HhNpzN1elGYIvlZswloz5UcXIO'
  },
  json: true
})

// async function listFiles()
r('/courses').then(console.log)
