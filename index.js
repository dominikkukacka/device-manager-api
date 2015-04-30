var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

app.get('/', function(req, res) {
  res.send('test');
});

app.get('/devices', function(req, res) {
  var exec = require('child_process').exec;

  child = exec('adb devices', function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      res.send(error);
    }

    var lines = stdout.split("\n");
    lines.pop();
    lines.pop();
    lines.shift();

    lines = lines.map(function(a) {
      var b = a.split("\t");
      return b[0];
    });

    res.send(lines);
  });

});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
