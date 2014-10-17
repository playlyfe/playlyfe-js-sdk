rm -r ./lib
mkdir lib
cat license src/engineio.js src/pl.js > lib/playlyfe-js-sdk.js
cat lib/playlyfe-js-sdk.js | uglifyjs -o lib/playlyfe-js-sdk.min.js

