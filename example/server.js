var http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs");

http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), '../', uri);
  if (uri === '/') {
    filename =  path.join(process.cwd(), '/index_jwt.html');
  }
  exists = fs.existsSync(filename)
  if(!exists) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not Found\n");
    response.end();
    return;
  }
  else {
    file = fs.readFileSync(filename)
    response.writeHead(200);
    response.write(file, "binary");
    response.end();
  }
}).listen(3000);

console.log("Listening at http://localhost:3000");
