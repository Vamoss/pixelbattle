var r = require('rethinkdb');
var app = require('express');
var config = require(__dirname + "/config.js");
var json = require('./pixelbattle-vamoss-pixels-export.json');


var pixels = [];
Object.keys(json).forEach(function(key) {
  var pixel = {};
  var val = json[key];
  pixel.time = val.time;
  pixel.x = val.x;
  pixel.y = val.y;

  var color = val.color.substring(val.color.indexOf("(")).split(","),
      r = color[0].substring(1),
      g = color[1],
      b = color[2];

  pixel.r = r;
  pixel.g = g;
  pixel.b = b;

  pixels.push(pixel);
});

pixels.reverse();//convert from newest to latest

r.connect(config.rethinkdb, function (err, conn) {
  if (err) {
    console.log("Could not open a connection to initialize the database");
    console.log(err.message);
    process.exit(1);
  }

  r.db(config.rethinkdb.db).table(config.rethinkdb.table).insert(pixels).run(conn)
    .finally(function () {
      console.log('imported ' + pixels.length + ' pixels');
      conn.close();
    }).error(function (err) {
      if (err) {
        console.log(err.msg);
        process.exit(1);
      }
    });
});