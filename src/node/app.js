var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = express.Router();

var config = require("./config.js");
var r = require('rethinkdb');

var connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(function(req, res, next){
  res.io = io;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/save/:x/:y/:r/:g/:b', function(req, res) {
  var obj = Object.assign({}, req.params);
  obj.x = parseInt(obj.x, 10);
  obj.y = parseInt(obj.y, 10);
  obj.time = new Date().getTime();

  //TODO
  //validar se dados são validos antes de seguir adiante
  if(!connection){
    console.log("data not saved, database not connected...");
  }else{
    r.table(config.rethinkdb.table).insert([obj]).run(connection, function(err, result) {
        if (err) {
          console.log(err);
          console.log(result);
          throw err;
        }
        console.log("saved data...");
        console.log(JSON.stringify(result, null, 2));
    });;
  }

  res.io.emit("socketToMe", obj);
  res.send('respond with a resource.');
});

app.get('/getAll/:x/:y', function(req, res) {
  if(!connection){
    console.log("database not connected...");
    res.json({});
  }else{
    var x = parseInt(req.params.x, 10);
    var y = parseInt(req.params.y, 10);
    var dist = 100;
    r.table(config.rethinkdb.table)
    .filter(
      r.expr(r.row('x').gt(x - dist))
       .and(r.row('x').lt(x + dist))
       .and(r.row('y').gt(y - dist))
       .and(r.row('y').lt(y + dist))
    )
    .run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            res.json(result);
        });
    });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

r.connect(config.rethinkdb, function (err, conn) {
  if (err) {
    console.log("Could not open a connection to initialize the database");
    console.log(err.message);
    process.exit(1);
  }

  connection = conn;
});


module.exports = {app: app, server: server};
