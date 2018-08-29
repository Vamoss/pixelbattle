var r = require('rethinkdb');
var app = require('express');
var config = require(__dirname + "/config.js");

r.connect(config.rethinkdb, function (err, conn) {
  if (err) {
    console.log("Could not open a connection to initialize the database");
    console.log(err.message);
    process.exit(1);
  }

  r.dbCreate(config.rethinkdb.db).run(conn)
    .finally(function () {
      return r.tableCreate(config.rethinkdb.table).run(conn);
    }).then(function () {
      r.table(config.rethinkdb.table).indexCreate('time').run(conn);
    }).then(function () {
      return r.tableCreate('users').run(conn);
    }).then(function () {
      return r.db(config.rethinkdb.db).table('users').insert({id: config.user, password: config.password}).run(conn);
    }).then(function (){
      return r.db(config.rethinkdb.db).grant(config.user, {read: true, write: true, config: true}).run(conn);
    }).then(function(result) {
      console.log(`Database '${config.rethinkdb.db}' created successfully!`);
      conn.close();
    }).error(function (err) {
      if (err) {
        console.log(err.msg);
        process.exit(1);
      }
    });
});