var net = require('net');
var request = require('request');
var xml2js = require('xml2js');

var yrUrl = 'http://www.yr.no/place/Norway/Møre_og_Romsdal/Kristiansund/Kristiansund/forecast.xml'

function parseWind(xml, cb) {
	xml2js.parseString(xml, function(err, res) {
		if (err) {
			console.log(err);
			cb("ERR");
			return;
		}
		try {
			var next = res.weatherdata.forecast[0].tabular[0].time[10];
			var deg = next.windDirection[0].$.deg;
			var mps = next.windSpeed[0].$.mps;
			cb(mps + "@" + deg);
		} catch(e) {
			console.log(e)
			cb("ERR");
		}
	});
}

function tcpResponse(reply) {
	request(yrUrl, function(err, resp, body) {
		if (resp && resp.statusCode == 200) {
			parseWind(body, reply);
		} else {
			reply("ERR");
		}
	});
}

function responder(socket) {
	return function(body) {
		socket.write(body);
		socket.destroy();
	};
}

var server = net.createServer(function(socket) {
	tcpResponse(responder(socket));
});

server.listen(1337, '127.0.0.1');
