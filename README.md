# my-jsql
Easy to use SQL query module for passing JavaScript objects instead of manually writing SQL

<p align="center">
  <a href="https://codecov.io/github/z3nz/my-jsql?branch=master"><img src="https://img.shields.io/codecov/c/github/z3nz/my-jsql/master.svg" alt="Coverage Status"></a>
</p>

## Install
```bash
npm install my-jsql
```

## About
This module depends **heavily** on the [mysql](https://www.npmjs.com/package/mysql) module. It allows you to run basic SQL querys just by passing objects and you don't have to worry about escaping variables.

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

// Start the connection to the db
jsql.start();

// Set the table
jsql.t('users');

// SELECT * FROM users WHERE last='Doe' ORDER BY first DESC LIMIT 10 OFFSET 5 
jsql.s().w({last: 'Doe'}).o({first: 'desc'}).l(10, 5).run(function(err, results, fields) {
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
jsql.u({email: 'email@email.com'}).w({email: null}, {not: {first: 'John'}}).run();

// DELETE FROM users WHERE first='John' AND email IS NOT NULL
jsql.d().w({
  first: 'John',
  not: {email: null}
})
.run();

// Manually write a WHERE condition
// SELECT * FROM users WHERE email LIKE 'e%'
jsql.s().w('email LIKE ?', ['e%']).run(function(err, results, fields) {
  if (err) throw err;
  jsql.each(results, function(index, value) {
    console.log('Result '+index+' is: ', value);
  });
});

// Manually write a query
jsql.run('SELECT * FROM users WHERE id=? AND first=?', [1,'John'], function(err, results, fields) {
  if (err) throw err;
  console.log('Result is: ', results[0]);
});

// Stop the connection
jsql.stop();

```

## API
This section is devoted to the API documentation.

### MyJsql(config)
Pass an object with the connection options. This is a basic example:

```javascript
var jsql = new MyJsql({
  host: 'localhost',
  user: 'me',
  password: 'secret',
  database: 'my_db'
});
```

Refer to [mysql's connection options](https://www.npmjs.com/package/mysql#connection-options) to view all the possible options.

### .start([callback])
You can optionally pass a callback function.

```javascript
jsql.start(function(err) {
  if (err) throw err;
  // The connection has started
});
```

### .stop([callback])
You can optionally pass a callback function.

```javascript
jsql.stop(function(err) {
  if (err) throw err;
  // The connection has stopped
});
```

### .t(table)
Pass a string of the table name.

```javascript
// Set the table for the following queries
jsql.t('users');

// SELECT * FROM users
jsql.s().run();

// Set the table while building a query
// INSERT INTO users (first) VALUES ('John')
jsql.i({first: 'John'}).t('users').run();
```

### .s([columns])
Pass an array of strings in order to `SELECT` certain columns. If no array is passed, all the columns will be returned `SELECT * FROM...`.

```javascript
// SELECT first, email FROM users
jsql.s(['first', 'email']).t('users').run(function(err, results, fields) {
  if (err) throw err;
  // These results will only return with the 'first' and 'email' columns
});

// SELECT * FROM users
jsql.s().t('users').run(function(err, results, fields) {
  if (err) throw err;
  // These results will return all columns
});
```

### .i(data)
Pass an object of the data you want to `INSERT`, with the keys being the table columns.

```javascript
// INSERT INTO users (first, last, email) VALUES ('John', 'Doe', 'email@email.com')
jsql.i({
  first: 'John',
  last: 'Doe',
  email: 'email@email.com'
})
.t('users').run(function(err, results, fields) {
  if (err) throw err;
});
```

### .u(data)
Pass an object of the data you want to `UPDATE`, with the keys being the table columns.

```javascript
// UPDATE users SET first='Jane' WHERE id=1
jsql.u({first: 'Jane'}).t('users').w({id: 1}).run(function(err, results, fields) {
  if (err) throw err;
  console.log('Results updated: ', results.affectedRowed);
});
```

### .d()
Nothing needs to be passed for a `DELETE FROM`.

```javascript
// DELETE FROM users WHERE id=1
jsql.d().t('users').w({id: 1}).run(function(err, results, fields) {
  if (err) throw err;
  console.log('Results deleted: ', results.affectedRowed);
});
```

### .w([conditions1[, conditions2[, ...]]])
Pass one or more objects as conditional `WHERE` statements. Statements in the same object are separated by `AND`. If you pass multiple objects, they are separated by `OR`. If nothing is passed, there will be no `WHERE...` statement. MyJsql also saves the last where statement, so you don't have to call it again, but this also means you need to clear if you don't want to reuse your previous statement.

```javascript
// SELECT * FROM users WHERE id=1 AND name='John'
jsql.s().w({id: 1, name: 'John'}).run();

// SELECT * FROM users WHERE (id=1 AND email IS NULL) OR name='John'
jsql.s().w({id: 1, email: null}, {name: 'John'}).run();

// This will use the last WHERE statement
// UPDATE users SET name='Jane' WHERE (id=1 AND email IS NULL) OR name='John'
jsql.u({first: 'Jane'}).run();

// Clearing the WHERE statement
// SELECT * FROM users
jsql.s().w().run();
```

If you want to use the `NOT` statement, pass a nested object with `not` as it's key.

```javascript
// SELECT * FROM users WHERE NOT id=1
jsql.s().w({not: {id: 1}}).run();
```

Currently, when passing objects, this function only uses the `=` operator. If you need to use other operators, you will need to use the API below.

### .w([condition[, values]])
Pass the `WHERE` condition as a string. If you want to escape the values using the `?` replacement, then pass the values as an array.

```javascript
// SELECT * FROM products WHERE price>=99.99 AND name LIKE 'a%'
jsql.s().t('products').w('price>=? AND name LIKE ?', [99.99, 'a%']).run();
```

### .o([orderBy])
Pass the `ORDER BY` statement as an object with the keys being the column names and the value being `asc` or `desc`. Pass nothing to clear the previous order by statement.

```javascript
// SELECT * FROM users ORDER BY first ASC, last DESC
jsql.s().o({first: 'asc', last: 'desc'}).run();

// Clearing the ORDER BY statement
// SELECT * FROM users
jsql.s().o().run();
```

### .l([limit[, offset]])
Pass the `LIMIT` and `OFFSET` statements as ints. Pass nothing to clear the previous statement.

```javascript
// Only passing a limit
// SELECT * FROM users LIMIT 10
jsql.s().l(10).run();

// Passing an offset too
// SELECT * FROM users LIMIT 10 OFFSET 5
jsql.s().l(10, 5).run();

// Clearing the LIMIT statement
jsql.s().l().run(); 
```

### .run([query[, values[, callback]]])
You can manually pass a query as a string. If you want to use `?` to escape values in the query, just pass an array of values. Pass a callback function to be able to access the return values. More documentation of the callback function can be found [here](https://www.npmjs.com/package/mysql#performing-queries).

```javascript
jsql.run('SELECT * FROM users WHERE id=? AND first=?', [1,'John'], function(err, results, fields) {
  if (err) throw err;
  console.log('Result is: ', results[0]);
});
```

### .clear()
Clears all statements (including the table).

```javascript
// SELECT * FROM users WHERE id=1 LIMIT 1
jsql.s().w({id: 1}).l(1).run();

// Where and limit statements are saved 
// SELECT * FROM users WHERE id=1 LIMIT 1
jsql.s().run();

// Clears everything
jsql.clear();

// SELECT * FROM users
jsql.s().t('users').run();
```

### .getQuery()
Returns the current SQL query as a string.

```javascript
jsql.s().w({id: 1});

console.log(jsql.getQuery());
// 'select * from users where id=?'
```

### .getValues()
Returns the current values as an array.

```javascript
jsql.s().w({id: 1, first: 'John'});

console.log(jsql.getValues());
// [1, 'John']
```

### .each(variable, function)
Similar to jQuery's each function, you can pass either an array as the first argument, or you can pass an object. The function you pass should have 2 arguments. The first is the index or key. The second is the value. This will make it easier to cycle through returned rows after you run a query.

```javascript
// SELECT * FROM users
jsql.s().t('users').run(function(err, results, fields) {
  jsql.each(results, function(index, value) {
    // Cycles through all of your results
  });
});
```
