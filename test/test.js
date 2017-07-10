var test = require('unit.js');
var MyJsql = require('../dist/index.js');

describe('MyJsql', function() {
  var jsql = new MyJsql({
    user: 'root',
    password: '',
    socketPath: '/run/mysqld/mysqld.sock'
  });

  it('assertions', function() {
    test.object(jsql);
    test.object(jsql.config);
    test.object(jsql.Q);
    test.object(jsql.con);
    test.function(jsql.start);
    test.function(jsql.stop);
    test.function(jsql.i);
    test.function(jsql.s);
    test.function(jsql.u);
    test.function(jsql.d);
    test.function(jsql.t);
    test.function(jsql.w);
    test.function(jsql.run);
    test.function(jsql.buildQuery);
    test.function(jsql.each);
  });

  it('start', function(done) {
    jsql.start(done);
  });

  it('create db', function(done) {
    jsql.run('CREATE DATABASE MyJsql_test_db', done);
  });

  it('use db', function(done) {
    jsql.run('USE MyJsql_test_db', done);
  });

  it('create table', function(done) {
    jsql.run('CREATE TABLE users (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, first VARCHAR(30) NOT NULL, last VARCHAR(30) NOT NULL, email VARCHAR(50), created TIMESTAMP)', done);
  });

  it('set table', function() {
    jsql.t('users');
  });

  it('insert John Doe', function(done) {
    jsql.i({
      first: 'John',
      last: 'Doe',
      email: 'john@doe.com'
    })
    .run(done);
  });

  it('insert Jane Doe', function(done) {
    jsql.i({
      first: 'Jane',
      last: 'Doe',
      email: 'jane@doe.com'
    })
    .run(done);
  });

  it('select John', function(done) {
    jsql.s().w({first: 'John', last: 'Doe'}).run(function(e, r, f) {
      if (e) done(e);
      test.object(r[0])
        .hasProperty('id', 1)
        .hasProperty('first', 'John')
        .hasProperty('last', 'Doe')
        .hasProperty('email', 'john@doe.com')
        .hasProperty('created');
      done();
    });
  });

  it('select only one key', function(done) {
    jsql.s(['first']).w({id: 1}).run(function(e, r, f) {
      if (e) done(e);
      test.object(r[0])
        .hasProperty('first', 'John')
        .hasNotProperty('last');
      done();
    });
  });

  it('select John and Jane', function(done) {
    jsql.s().w({last: 'Doe'}).run(function(e, r, f) {
      if (e) done(e);
      test.number(r.length).is(2)
      done();
    });
  });

  it('where condition as string', function(done) {
    jsql.s().w('email LIKE ?', ['john%']).run(function(e, r, f) {
      if (e) done(e);
      test.number(r.length).is(1)
      done();
    });
  });

  it('select John or Jane', function(done) {
    jsql.s().w({id: 1},{id: 2}).run(function(e, r, f) {
      if (e) done(e);
      test.number(r.length).is(2)
      done();
    });
  });

  it('update John to Jack', function(done) {
    jsql.u({
      first: 'Jack'
    })
    .w({id: 1}).run(function(e) {
      if (e) done(e);
      jsql.s().run(function(e, r, f) {
        if (e) done(e);
        test.object(r[0])
          .hasProperty('first', 'Jack');
        done();
      });
    });
  });

  it('delete Jane', function(done) {
    jsql.d().w({id: 2}).run(function(e, r, f) {
      test.number(r.affectedRows)
        .is(1)
      done();
    });
  })

  it('drop db', function(done) {
    jsql.run('DROP DATABASE MyJsql_test_db', done);
  });

  it('stop', function(done) {
    jsql.stop(done);
  });

});