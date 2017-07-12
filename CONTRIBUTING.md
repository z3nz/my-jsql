# Contributing

This is my first open source projet and I welcome any and all pull requests.

Fork, then clone the repo.

```bash
git clone git@github.com:your-username/my-jsql.git
```

Install dependencies.

```bash
npm install
```

Build and make sure the tests are passing.

```bash
npm run build
```

You will need a MySQL database server running locally. My OS is Arch Linux and I'm using [MariaDB](https://wiki.archlinux.org/index.php/MySQL). If you're on Mac OS X or Windows, I'd recommend [MAMP](https://www.mamp.info/en/).

After you have a MySQL database server running, you will probably need to change the database connection settings in `test/test.js` to get the unit tests to work. You should be able to run `npm test` with no errors if everything is correct.

Make your changes, add unit tests for your changes in `test/test.js` and do another build to make sure everything is still passing.

```bash
npm run build
```

Commit, push to your fork and [submit a pull request](https://github.com/z3nz/my-jsql/compare).

I'd love to review any pull requests and I'll try to respond ASAP. I'm currently still in the process of defining what my coding style preference is, so FWIW, try to stick to the style you see 😸 (eslint should also help).
