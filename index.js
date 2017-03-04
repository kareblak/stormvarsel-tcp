const net = require('net');
const request = require('request');
const xml2js = require('xml2js');

const yrUrl = process.env.YRKSU || 'http://www.yr.no/place/Norway/Møre_og_Romsdal/Kristiansund/Kristiansund/forecast.xml';

function parseWind(xml, cb) {
	xml2js.parseString(xml, function(err, res) {
		if (err) {
			console.log(err);
			cb("ERR");
			return;
		}
		try {
			const next = res.weatherdata.forecast[0].tabular[0].time[10];
			const deg = next.windDirection[0].$.deg;
			const mps = next.windSpeed[0].$.mps;
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

const server = net.createServer(function(socket) {
	tcpResponse(responder(socket));
});

server.listen((process.env.PORT || 7155), '127.0.0.1');
