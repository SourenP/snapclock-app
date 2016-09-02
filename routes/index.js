var express = require('express');
var router = express.Router();
var moment = require('moment');
var http = require('http');
var request = require('request');
var path = require('path');
var pg = require('pg');
var multer = require('multer');
var logger = require("../utils/logger");
var connectionString = require(path.join(__dirname, '../', 'config'));


/* ==HELPERS== */
function snapView(time, res) {
  var snaps = []

  if (!time || time == 'now') {
    time = moment().format('HH:mm')
  } else {
    time = moment(time, 'HH:mm').format('HH:mm');
    if (time == 'Invalid date') {
      err = new Error('Invalid time')
      logger.warn(err);
      res.render('error', { message: err.message });
    }
  }

  // Get a Postgres client from the connection pool
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        logger.warn(err);
        res.render('error', { message: err.message });
      }

      // SQL Query > Select Data
      var query = client.query("SELECT * FROM snaps WHERE time=$1 and verified=true", [time], function(err, results) {
        if(err) {
          done();
          logger.warn(err.message);
          res.render('error', { message: err.message });
        }
        logger.silly(results)
      });

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
};

function addPicture(res, path, time) {
  pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        logger.warn(err.message);
        res.render('error', { message: err.message });
      }

      // SQL Query > Insert Data
      client.query("INSERT INTO snaps(time, picture_dir, verified) values($1, $2, $3)", [time, path, false], function(err, results) {
        if (err) {
          done();
          logger.warn(err.message);
          return res.render('error', { message: err.message });
        }
        done();
        logger.silly(results)
        logger.info("[%s]\t A snap with the path %s for the time %s.", moment().format(), path, time)
        return res.render('thankyou', {"time": time, "path": path})
      });
  });
};


/* ==ROUTES== */

/* GET home page. */
router.get('/', function(req, res, next) {
  return snapView('now', res);
});

/* GET home page. */
router.get('/upload', function(req, res, next) {
  return res.render('upload', {});
});


/* GET current snap. */
router.get('/:time', function(req, res, next) {
  var time = req.params.time;
  return snapView(time, res);
});

/* GET thank you. */
router.get('/thankyou', function(req, res, next) {
  var time = req.params.time;
  return res.render('thankyou', {"time": time});
});

/* Upload image */
var upload = multer({
  limits: {fileSize: 5000000},
  dest: 'public/images/uploads/',
}).single('newsnap');
router.post('/upload', function(req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      logger.warn(err.message);
      res.render('error', { message: err.message });
    }
    // Everything went fine
    if (req.file)
      return addPicture(res, req.file.path, req.body.snap_time)
  });
});


module.exports = router;
