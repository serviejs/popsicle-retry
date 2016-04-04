var test = require('blue-tape')
var http = require('http')
var server = require('./support/server')
var popsicle = require('popsicle')
var popsicleRetry = require('../')

test('retry', function (t) {
  var app
  var url

  t.test('before', function (t) {
    app = http.createServer(server).listen(0)
    url = 'http://127.0.0.1:' + app.address().port

    t.end()
  })

  t.test('eventually work', function (t) {
    return popsicle.request({
      url: url + '/2',
      headers: {
        'Request-Id': '1'
      }
    })
      .use(popsicleRetry())
      .then(function (res) {
        t.equal(res.status, 200)
      })
  })

  t.test('fail after max attempts', function (t) {
    return popsicle.request({
      url: url + '/3',
      headers: {
        'Request-Id': '2'
      }
    })
      .use(popsicleRetry(popsicleRetry.retries(2)))
      .then(function (res) {
        t.equal(res.status, 500)
      })
  })

  t.test('after', function (t) {
    app.close()

    t.end()
  })
})
