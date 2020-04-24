
const fs = require('fs-extra');
const r = require('rethinkdb');
const config = require("./src/node/config.js");

function savePixelInDb(pixel) {
  config.rethinkdb.timeout = 3600;
  r.connect(config.rethinkdb).then(function(conn) {
      r.table('pixels').insert([pixel]).run(conn, (err, result) => {
        if (err) throw err;
        conn.close({noreplyWait: true}).then(function() {
        }).error(function(err) {
        })
      });
  }).catch((err) => {
    console.log(err);
  });
}

function savePixels(pixels) {
  pixels.forEach((pixel) => {
    savePixelInDb(pixel);
  });
}

const main = (() => {
  let filename = process.argv[2];

  try {
    pixels = JSON.parse(fs.readFileSync(filename).toString());
    savePixels(pixels);
    fs.removeSync(filename);
    console.log(`File '${filename} processed.'`);
  } catch (err) {
    console.log(err.message);
  }

})();
