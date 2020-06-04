const axios = require('axios').default

const http = axios.create({
  baseURL: 'localhost:8090/alt-verify/'
})

http.post({
  'nin': '19830610141280000121'
}).then(response => {
  console.log('Response:')
  console.log(response.data)
})