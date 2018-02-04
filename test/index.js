var test = require('unit.js')
var MyJsql = require('../dist/index.js')
var mysql = require('mysql')

describe('MyJsql', function () {
  var con = mysql.createConnection({
    user: 'root',
    password: '',
    socketPath: '/run/mysqld/mysqld.sock'
  })
  con.connect()
  var jsql = new MyJsql(con)

  it('assertions', function () {
    test.object(jsql)
    test.object(jsql.Q)
      .hasProperty('conditionValues')
      .hasProperty('conditions')
      .hasProperty('keys')
      .hasProperty('limit')
      .hasProperty('offset')
      .hasProperty('orderBy')
      .hasProperty('table')
      .hasProperty('type')
      .hasProperty('values')
    test.object(jsql.con)
    test.function(jsql.i)
    test.function(jsql.s)
    test.function(jsql.u)
    test.function(jsql.d)
    test.function(jsql.t)
    test.function(jsql.w)
    test.function(jsql.run)
    test.function(jsql.clear)
    test.function(jsql.getQuery)
    test.function(jsql.getValues)
    test.function(jsql.each)
  })

  it('create db', function (done) {
    jsql.run('CREATE DATABASE MyJsql_test_db', done)
  })

  it('use db', function (done) {
    jsql.run('USE MyJsql_test_db', done)
  })

  it('create table', function (done) {
    jsql.run('CREATE TABLE users (id INT(?) UNSIGNED AUTO_INCREMENT PRIMARY KEY, first VARCHAR(30) NOT NULL, last VARCHAR(30) NOT NULL, email VARCHAR(50), created TIMESTAMP)', [6], done)
  })

  it('set table', function () {
    jsql.t('users')
  })

  it('insert John Doe', function (done) {
    jsql.i({
      first: 'John',
      last: 'Doe',
      email: 'john@doe.com'
    })

    test.string(jsql.getQuery()).is('insert into users (first,last,email) values (?,?,?)')
    test.array(jsql.getValues()).is(['John', 'Doe', 'john@doe.com'])

    jsql.run(done)
  })

  it('insert Jane Doe', function (done) {
    jsql.i({
      first: 'Jane',
      last: 'Doe',
      email: 'jane@doe.com'
    })

    test.string(jsql.getQuery()).is('insert into users (first,last,email) values (?,?,?)')
    test.array(jsql.getValues()).is(['Jane', 'Doe', 'jane@doe.com'])

    jsql.run(done)
  })

  it('select John', function (done) {
    jsql.s().w({first: 'John', last: 'Doe'})

    test.string(jsql.getQuery()).is('select * from users where (first=? and last=?)')
    test.array(jsql.getValues()).is(['John', 'Doe'])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.object(r[0])
        .hasProperty('id', 1)
        .hasProperty('first', 'John')
        .hasProperty('last', 'Doe')
        .hasProperty('email', 'john@doe.com')
        .hasProperty('created')
      done()
    })
  })

  it('select only one key', function (done) {
    jsql.s(['first']).w({id: 1})

    test.string(jsql.getQuery()).is('select first from users where (id=?)')
    test.array(jsql.getValues()).is([1])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.object(r[0])
        .hasProperty('first', 'John')
        .hasNotProperty('last')
      done()
    })
  })

  it('select John and Jane', function (done) {
    jsql.s().w({last: 'Doe'})

    test.string(jsql.getQuery()).is('select * from users where (last=?)')
    test.array(jsql.getValues()).is(['Doe'])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(2)
      done()
    })
  })

  it('where condition as string', function (done) {
    jsql.s().w('email LIKE ?', ['john%'])

    test.string(jsql.getQuery()).is('select * from users where (email LIKE ?)')
    test.array(jsql.getValues()).is(['john%'])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(1)
      done()
    })
  })

  it('select John or Jane', function (done) {
    jsql.s().w({id: 1}, {id: 2})

    test.string(jsql.getQuery()).is('select * from users where (id=?) or (id=?)')
    test.array(jsql.getValues()).is([1, 2])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(2)
      done()
    })
  })

  it('update John to Jack', function (done) {
    jsql.u({first: 'Jack'}).w({id: 1})

    test.string(jsql.getQuery()).is('update users set first=? where (id=?)')
    test.array(jsql.getValues()).is(['Jack', 1])

    jsql.run(function (e) {
      if (e) done(e)
      jsql.s().l().run(function (e, r, f) {
        if (e) done(e)
        test.object(r[0])
          .hasProperty('first', 'Jack')
        done()
      })
    })
  })

  it('order by first', function (done) {
    jsql.s().w().o({first: 'desc'})

    test.string(jsql.getQuery()).is('select * from users order by first desc')
    test.array(jsql.getValues()).is([])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.object(r[0]).hasProperty('first', 'Jane')
      done()
    })
  })

  it('order by id and first', function (done) {
    jsql.s().w().o({id: 'desc', first: 'asc'})

    test.string(jsql.getQuery()).is('select * from users order by id desc,first asc')
    test.array(jsql.getValues()).is([])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.object(r[0]).hasProperty('first', 'Jane')
      done()
    })
  })

  it('limit to one', function (done) {
    jsql.s().w().o().l(1)

    test.string(jsql.getQuery()).is('select * from users limit 1')
    test.array(jsql.getValues()).is([])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(1)
      done()
    })
  })

  it('limit and offset by one', function (done) {
    jsql.s().w().l(1, 1)

    test.string(jsql.getQuery()).is('select * from users limit 1,1')
    test.array(jsql.getValues()).is([])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(1)
      test.object(r[0]).hasProperty('id', 2)
      done()
    })
  })

  it('select where order by and limit', function (done) {
    jsql.s().w({last: 'Doe'}).o({id: 'desc'}).l(2)

    test.string(jsql.getQuery()).is('select * from users where (last=?) order by id desc limit 2')
    test.array(jsql.getValues()).is(['Doe'])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(2)
      test.object(r[0]).hasProperty('first', 'Jane')
      done()
    })
  })

  it('null and is not', function (done) {
    jsql.clear().s().t('users').w({first: null, last: {not: 'Doo'}, email: {not: null}})

    test.string(jsql.getQuery()).is('select * from users where (first is null and not last=? and email is not null)')

    jsql.run(function (e, r, f) {
      if (e) done(e)
      test.number(r.length).is(0)
      done()
    })
  })

  it('clear test', function (done) {
    jsql.clear().s().t('users')

    test.string(jsql.getQuery()).is('select * from users')
    test.array(jsql.getValues()).is([])

    jsql.run(function (e, r, f) {
      if (e) done(e)
      var length = 0
      jsql.each(r, function (r) {
        length++
      })
      test.number(r.length).is(length)
      done()
    })
  })

  it('update all', function (done) {
    jsql.u({email: null}).w()

    test.string(jsql.getQuery()).is('update users set email=?')

    jsql.run(function (e, r, f) {
      test.number(r.affectedRows)
        .is(2)
      done()
    })
  })

  it('delete Jane', function (done) {
    jsql.d().w({id: 2})

    test.string(jsql.getQuery()).is('delete from users where (id=?)')
    test.array(jsql.getValues()).is([2])

    jsql.run(function (e, r, f) {
      test.number(r.affectedRows)
        .is(1)
      done()
    })
  })

  it('delete all', function (done) {
    jsql.d().w()

    test.string(jsql.getQuery()).is('delete from users')

    jsql.run(function (e, r, f) {
      test.number(r.affectedRows)
        .is(1)
      done()
    })
  })

  it('drop db', function (done) {
    jsql.run('DROP DATABASE MyJsql_test_db', done)
  })

})
