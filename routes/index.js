var express = require('express');
var router = express.Router();
var moment = require('moment');
var http = require('http');
var request = require('request');
var path = require('path');
var pg = require('pg');
var multer = require('multer');
var logger = require("../utils/logger");
var config = require(path.join(__dirname, '../', 'config'));
var aws = require('aws-sdk')

/* ==HELPERS== */

/* Fetch snap from db */
function snapView(time, res) {
  var snaps = []

  if (!time || time == 'now') {
    time = moment().format('HH:mm')
  } else {
    time = moment(time, 'HH:mm').format('HH:mm');
    if (time == 'Invalid date') {
      err = new Error('Invalid time')
      console.log(err);
      logger.info(err);
      res.render('error', { message: err.message });
    }
  }

  // Get a Postgres client from the connection pool
  pg.connect(config.DATABASE_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      logger.info(err);
      res.render('error', { message: err.message });
    }

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM snaps WHERE time=$1 and verified=true", [time], function(err, results) {
      if(err) {
        done();
        console.log(err);
        logger.info(err);
        res.render('error', { message: err.message });
      }
    });

    // Stream results back one row at a time
    query.on('row', function(row) {
        snaps.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
        snap = {}
        if (snaps.length) {
          done();
          snap = snaps[Math.floor(Math.random() * snaps.length)];
          return res.render('index', snap);
        } else {
          return res.render('upload', { "emot": "◔ ⌣ ◔",
                                        "message": " I don't have any snaps for " + moment().format("hh:mm a") + ".",
                                        "time": time});
        }
    });
  });
};

/* Add snap to db */
function addPicture(res, path, time) {
  pg.connect(config.DATABASE_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      logger.info(err);
      res.render('error', { message: err.message });
    }

    // SQL Query > Insert Data
    client.query("INSERT INTO snaps(time, picture_dir, verified) values($1, $2, $3)", [time, path, false], function(err, results) {
      if (err) {
        done();
        console.log(err);
        logger.info(err);
        return res.render('error', { message: err.message });
      }
      done();
      logger.silly("[%s]\t A snap with the path %s for the time %s.", moment().format(), path, time)
      return res.render('thankyou', {"emot": "◔ ں ◔", "time": time})
    });
  });
};

function getPermission(res, name) {
  var snaps = []
  // Get a Postgres client from the connection pool
  pg.connect(config.DATABASE_URL, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      logger.info(err);
      res.render('error', { message: err.message });
    }

    // SQL Query > Select Data
    var query = client.query("SELECT * FROM snaps WHERE tag=$1", [name], function(err, results) {
      if(err) {
        done();
        console.log(err);
        logger.info(err);
        res.render('error', { message: err.message });
      }
    });

    // Stream results back one row at a time
    query.on('row', function(row) {
        snaps.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
        done();
        return res.render('permission', { "snaps": snaps });
    });
  });
}


/* ==ROUTES== */

/* GET home page. */
router.get('/', function(req, res, next) {
  return snapView('now', res);
});

/* GET s3 signature for upload */
router.get('/sign', function(req, res) {
  aws.config.update({accessKeyId: config.AWS_ACCESS_KEY_ID, secretAccessKey: config.AWS_SECRET_ACCESS_KEY});

  var s3 = new aws.S3()
  var options = {
    Bucket: config.S3_BUCKET,
    Key: req.query.file_name,
    Expires: 60,
    ContentType: req.query.file_type,
    ACL: 'public-read'
  }

  s3.getSignedUrl('putObject', options, function(err, data){
    if(err) return res.send(err)

    res.json({
      signed_request: data,
      url: 'https://s3.amazonaws.com/' + config.S3_BUCKET + '/' + req.query.file_name
    })
  })
});

/* GET home page. */
router.get('/upload', function(req, res, next) {
  return res.render('upload', {"message": "<3"});
});

/* GET current snap. */
router.get('/:time', function(req, res, next) {
  var time = req.params.time;
  return snapView(time, res);
});

/* POST add upload to db */
router.post('/upload', function(req, res, next) {
  var time  = req.body.snap_time
  var path = req.body.picture_url
  return addPicture(res, path, time)
});

/* GET permission */
router.get('/permission/:name', function(req, res, next) {
  var name  = req.params.name
  return getPermission(res, name)
});

module.exports = router;
