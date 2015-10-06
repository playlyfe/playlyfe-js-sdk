jwt = require('jsonwebtoken');
client_id = 'NDgyM2RkZWUtYTdiYi00Njg5LWJlZGEtODA4OWY1MTZkYWEx'
client_secret = 'MzdlZjdmNTAtYjg5Ni00NmVhLWE5NzAtMGFkYTE0ZjRjYzY1MDZiNjQ3NjAtNmMyZi0xMWU1LTg4YzctMzlhNGYwZTRhODNh'
token = jwt.sign({ player_id: 'student1', scopes: [] },
  client_secret,
  { algorithm: 'HS256', expiresIn: 3600000000 }
)
token = client_id + ':' + token
console.log(token);
