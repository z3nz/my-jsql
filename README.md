# my-jsql
Easy to use SQL query module for passing JavaScript objects instead of manually writing SQL

## Install
```
npm install my-jsql
```

## About
This module depends on the [mysql](https://www.npmjs.com/package/mysql) module. It allows you to run basic SQL querys just by passing objects and you don't have to worry about escaping the variables.

## Basic Usage
Here are some examples

```javascript
var MyJsql = require('my-jsql');

// Set the db credentials
var jsql = new MyJsql({
  host: 'localhost',
  user: 'me',
  password: 'secret',
  database: 'my_db'
});

// Connect to the db
jsql.con.connect();

// Set the table
jsql.t('users');

// SELECT * FROM users WHERE id=1
jsql.s().w({id: 1}).run(function(err, results, fields) {
  if (err) throw err;
  console.log('Result is: ', results[0]);
});

// INSERT INTO users (first, last, email) VALUES ('John','Doe','email@email.com')
jsql.i({
  first: 'John',
  last: 'Doe',
  email: 'email@email.com'
})
.run();

// UPDATE users SET email='email@email.com' WHERE email IS NULL OR NOT first='John'
jsql.u({email: 'email@email.com'}).w({email: null}, {'not': {first: 'John'}}).run();

// DELETE FROM users WHERE first='John' AND email IS NOT NULL
jsql.d().w({
  first: 'John',
  'not': {email: null}
})
.run();

// Manually write a query
jsql.run('SELECT * FROM users WHERE id=? AND first=?', [1,'John'], function(err, results, fields) {
  if (err) throw err;
  console.log('Result is: ', results[0]);
})

```