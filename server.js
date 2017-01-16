var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var moment = require('moment');

var connection = mysql.createConnection({
	host: "localhost",
	user: "una",
	password: "123",
	database: "una"
});
connection.connect();

function serve_page(req, res) {
	console.log(req.url);
	req.parsed_url = url.parse(req.url, true);
	console.log('\n' + req.parsed_url + '\n');
	var core_url = req.parsed_url.pathname;
	if (core_url == '/') core_url = '/static/html/chat.html';
	if (core_url == '/chat.html') {
		var data = req.parsed_url.query;
		// console.log(data);
		// connection.query(`insert into comment set comment=?`, [data.comment]);
		var date = moment(data.date).format('YYYY-MM-DD HH:mm:ss');
		console.log('date: ' + date);
		connection.query(`insert into chatmessage set name=?, message=?, date=?`, [data.name, data.message, date]);
	}
	if (core_url == '/update.html') {
		var data = req.parsed_url.query;
		console.log('refresh > data: ' + data);
        if (data['message_id'] == "0") {
            var sql = `select id, name, message, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date from chatmessage order by id desc limit 1`;
        } else {
            var sql = `select id, name, message, DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') as date from chatmessage where id > ?`;
		}
        connection.query(sql, [parseInt(data["message_id"])], function(err, rows, fields) {
			if (err) console.log('query error');
			console.log('refresh > json rows: ' + JSON.stringify(rows, null, 2));
			if(JSON.stringify(rows).length > 0) {
				res.writeHead(200, { "Content-Type": "text/json" });
				res.write(JSON.stringify(rows));
				res.end();
			}
		});
	}
	if (core_url != '/message.html' && core_url != '/refresh.html') {
		fs.readFile(
			'.' + core_url, 
			function (err, contents) {
				if (err) {
					console.log('there is an error');
					send_failure(res, 500, err);
				} else {
			
					contents = contents.toString('utf8');
			
					res.writeHead(200, { "Content-Type": "text/html" });
					res.end(contents);
				}
			}
		);
	}
}

function isEmptyObject(object) {
	for (var key in object){
		return false;
	}
	return true;
}

function send_failure(res, code, err) {
	res.writeHead(code, { "Content-Type": "application/json" });
	res.end(JSON.stringify(err) + '\n');
}

http.createServer(serve_page).listen(3000);
