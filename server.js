'use strict'

/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express();

// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

// if we wanted to supply more than JSON, we could
// use something similar to the content-negotiation
// example.

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked

app.use('/api', function(req, res, next){
  var key = req.query['api-key'];

  // key isn't present
  if (!key) return next(error(400, 'api key required'));

  // key is invalid
  if (apiKeys.indexOf(key) === -1) return next(error(401, 'invalid api key'))

  // all good, store req.key for route access
  req.key = key;
  next();
});

// map of valid api keys, typically mapped to
// account info with some sort of database like redis.
// api keys do _not_ serve as authentication, merely to
// track API usage or help prevent malicious behavior etc.

var apiKeys = ['foo', 'bar', 'baz'];

// these two objects will serve as our faux database


var users = [
    { id: 1, name: 'tobi' }
    , { id: 2,  name: 'loki' }
    , { id: 3, name: 'jane' }
  ];

var houses = [
  { id: 1, name: 'Green House', user_id: 2 },
  { id: 2, name: 'Black Hole', user_id: 2 },
  { id: 3, name: 'Palace', user_id: 1 }
];


var devices = [
    { id: 1, name: 'Device 1', serial_number: '123AAA', house_id: 1},
    { id: 2, name: 'Device 2', serial_number: '123AAA', house_id: 2 },
    { id: 3, name: 'Device 3', serial_number: '123AAA', house_id: 2 }
];

// we now can assume the api key is valid,
// and simply expose the data

// example: http://localhost:3000/api/users/?api-key=foo
// Add new device
app.post('/api/house/:house_id/device', function (req, res) {
  res.send(users);
});

// example: http://localhost:3000/api/repos/?api-key=foo
//Get all devices by house id
app.get('/api/house/:house_id/devices', function (req, res) {

    var device_by_house = []
    var house_id = req.params.house_id;
    for (var device of devices) {
        if (device.house_id == house_id )
            device_by_house.push(device)
    }
    res.send(device_by_house);
});

// example: http://localhost:3000/api/user/tobi/repos/?api-key=foo
app.get('/api/house/:house_id/device/:device_id', function(req, res, next){
  var house_id = req.params.house_id;
  var device_id = req.params.device_id;
//   var user = userRepos[name];

//   if (user) res.send(user);
//   else next();
});

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function(req, res){
  res.status(404);
  res.send({ error: "Sorry, can't find that" })
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3030);
  console.log('Express started on port 3030');
}