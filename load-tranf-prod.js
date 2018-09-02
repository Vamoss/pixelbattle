
const fs = require('fs-extra');
const r = require('rethinkdb');
const config = require("./src/node/config.js");
const Color = require('color');
const {promisify} = require('util');

function transform (buffer) {
  let jsonDataBuffered = JSON.parse(buffer.toString());
  let pixels = [];
  for (let index in jsonDataBuffered) {
    let pixel = jsonDataBuffered[index];
    let parsedObjColor = Color(pixel.color).object();
    for (let i in parsedObjColor) {
      pixel[i] = parsedObjColor[i].toString();
    }
    delete pixel.color; delete pixel.alpha;
    pixels.push(pixel);
  }
  return pixels;
}

function loadAndTransformProcess (filename, sizePart) {
  let buf = fs.readFileSync(filename);
  let pixels = transform(buf);
  let totalPixelsByPart = sizePart;
  let totalParts = Math.ceil(pixels.length / totalPixelsByPart);

  try {
    fs.removeSync('data');
    fs.mkdirSync('data');
    let initialPartValue = 0,
        finalPartValue = totalPixelsByPart - 1;

    for (let i = 0; i < totalParts; i++) {
      part = pixels.slice(initialPartValue, finalPartValue);
      fs.writeFileSync(`data/file_${i}.json`, JSON.stringify(part));
      initialPartValue += totalPixelsByPart;
      finalPartValue = (totalPixelsByPart * (i + 2)) - 1;
    }
  } catch (e) {
      console.log(e.message);
  }

  return totalParts;
}

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
  let sizePart = process.argv[2];
  let filename = process.argv[3];

  try {
    loadAndTransformProcess(filename, parseInt(sizePart));
    // for (let i = 0; i < totalParts; i++) {
    //   pixels = JSON.parse(fs.readFileSync(`data/file_${i}.json`).toString());
    //   savePixels(pixels);
    // }
  } catch (err) {
    console.log(err.message);
  }

})();
