# Contributing

This is my first open source project and I welcome any and all pull requests.

Fork, then clone the repo.

```bash
git clone git@github.com:your-username/my-jsql.git
```

Install dependencies.

```bash
npm install
```

You will need a MySQL database server running locally. My OS is Arch Linux and I'm using [MariaDB](https://wiki.archlinux.org/index.php/MySQL). If you're on Mac OS X or Windows, I'd recommend [MAMP](https://www.mamp.info/en/).

After you have a MySQL database server running, you will probably need to change the database connection settings in `test/index.js` to get the unit tests to work. You should be able to run a test with no errors if everything is correct.

```bash
npm test
```

Make your changes, add unit tests for your changes in `test/index.js` and make sure the linter and tests are passing.

```bash
npm run lint
npm test
```

Commit, push to your fork and [submit a pull request](https://github.com/z3nz/my-jsql/compare).

I'd love to review any pull requests and I'll try to respond ASAP.
