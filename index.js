var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs');
var temp = require('temp');
temp.track();

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.get('/', function (req, res) {
    res.send('test');
});

app.get('/devices', function (req, res) {

    console.log("---- devices list ----");
    exec('adb devices', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
            res.send(error);
        }

        var lines = stdout.split("\n");
        lines.pop();
        lines.pop();
        lines.shift();

        lines = lines.map(function (a) {
            var b = a.split("\t");
            return b[0];
        });

        res.send(lines);
    });

});

app.post('/devices/:deviceId/install', function (req, res) {

    console.log("---- device install ----");
    var deviceId = req.params.deviceId;
    var file;
    var url = req.body.sourceUrl;
    if (url) {
        console.log('fileUrl:'+url);
        file = temp.path({suffix: '.'+url.substring(url.length-3)});
        request(url).pipe(fs.createWriteStream(file));
        console.log("file: "+file)

    } else {
        file = req.files.file.path;
    }


    if (file.substring(file.length - 3) === 'apk') {
        exec('adb -s ' + deviceId + ' install -r ' + file, function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                res.status(500).send(error);
            }
            res.send(stdout);
        });
    } else if (file.substring(file.length - 3) === 'ipa') {
        exec('ideviceinstaller -i ' + deviceId + ' -g ' + file, function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                res.status(500).send(error);
            }
            res.send(stdout);
        });
    } else {
        res.send('wtf');
    }

});

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
