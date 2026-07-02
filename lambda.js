const serverless = require('serverless-http')
const app = require('./routes/route')

module.exports.handler = serverless(app)
