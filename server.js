const express = require('express');
const path = require('path');

const app = express();

let cors = require('cors');
let whitelist = ['http://192.168.0.147:8000', 'http://localhost:3000', 'https://adminedeliverynew.appemporio.net' , 'https://edeliverydemo.appemporio.net', 'http://localhost:4000', 'http://localhost:5000' , 'http://localhost:8000' , '' , '' ]
let corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = {origin: true} // reflect (enable) the requested origin in the CORS response
  } else {
      corsOptions = {origin: false} // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}


app.use(cors(corsOptionsDelegate))


app.use(express.static(__dirname + '/dist/vien-angular'));

app.get('/*', (req, res) =>{
  res.sendFile(path.join(__dirname, '/dist/vien-angular/index.html'));
});

app.listen(4000);