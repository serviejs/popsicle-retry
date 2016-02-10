module.exports = server

var cache = {}

function server (req, res) {
  var id = req.headers['request-id']

  if (cache[id] == null) {
    cache[id] = Number(req.url.substr(1))
  }

  if (cache[id] > 0) {
    cache[id]--
    res.statusCode = 500
  }

  return res.end()
}
