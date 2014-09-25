cat license src/engineio.js src/pl.js > lib/pl.js
cat lib/pl.js | uglifyjs -o lib/pl.min.js
cat lib/pl.min.js | gzip > lib/pl.min.js.gz

