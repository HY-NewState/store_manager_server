const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const port = new SerialPort({ path: '/dev/cu.usbmodem142401', baudRate: 2400 }) //시리얼포트와 boudrate 지정
const parser = new ReadlineParser()
port.pipe(parser)


const express = require('express');
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var fs = require('fs')
var RecordTF = 0;

app.use(express.static('public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + "/public/index.html"); // html 문서를 지정
});



//소켓 연결시
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.emit('result', `${socket.id}로 연결 되었습니다.`);
	parser.on('data', function(data) {
		
			if(RecordTF == 1){
			fs.appendFile('data.txt', data + '\n', function(err) {
				if (err) throw err;
				console.log('Data saved!');
			  });
			}
			socket.emit('data', data);
	});


	socket.on('message', (msg) => { 
		console.log("클라이언트의 요청이 있습니다.");
		console.log(msg);
		if(msg === 'record'){
			RecordTF = 1;
		}
		else if(msg === 'stop'){
			RecordTF = 0;
		}
		socket.emit('result', `수신된 메세지는 "${ msg }" 입니다.`);
	});
});


server.listen(3000, () => {
    console.log("server is listening at localhost: 3000"); //localhost:3000으로 접속
});