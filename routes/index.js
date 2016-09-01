var express = require('express');
var router = express.Router();
var moment = require('moment');
var http = require('http');
var request = require('request');
var path = require('path');
var pg = require('pg');
var connectionString = require(path.join(__dirname, '../', 'config'));

function snapView(time, res) {
  var snaps = []

  if (!time || time == 'now') {
    time = moment().format('HH:mm')
  } else {
    time = moment(time, 'HH:mm').format('HH:mm');
    if (time == 'Invalid date') {
      return next(new Error('Invalid time'))
    }
  }

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM snaps WHERE time='" + time + "' and verified=true");

      // Stream results back one row at a time
      query.on('row', function(row) {
          snaps.push(row);
      });

      // After all data is returned, close connection and return results
      query.on('end', function() {
          done();
          snap = {}
          if (snaps.length) {
            snap = snaps[Math.floor(Math.random() * snaps.length)];
            return res.render('index', snap);
          } else {
            return res.render('missing', {"time": time});
          }
      });
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  return snapView('now', res);
});

/* GET current snap. */
router.get('/:time', function(req, res, next) {
  var time = req.params.time;
  return snapView(time, res);
});

module.exports = router;
