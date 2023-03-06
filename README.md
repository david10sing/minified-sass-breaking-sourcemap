# How to test

1. run `node sass-compiler.js`
2. run `npx http-server .`
3. Check the chrome devtool
4. `.index` should come from `index.scss` but when `minify` is true in `sass-compiler.js`, it points to `_test.scss`