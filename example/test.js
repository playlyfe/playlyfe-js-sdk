jwt = require('jsonwebtoken');
token = jwt.sign({ player_id: 'student1', scopes: [] }, 'ZjIwMzI0NDEtMDlhMi00YWEwLTk1NjItNTc0MGMyOGU1MmI1OGFhM2Q2ODAtZmVlMC0xMWU0LWFlMDktYjk2NGFlZTI3MTBl', { algorithm: 'HS256', expiresInSeconds: 3600 })
token = 'MmRkYmJkZWItY2M0My00NTNlLWFiZDEtYWZiNTIxYTgwYjIx' + ':' + token
console.log(token);
