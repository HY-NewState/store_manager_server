const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { Product } = require("./models/product");
const { Alarm } = require("./models/alarm");
const bodyParser = require("body-parser");
const config = require("./config/dev");
const server = require('http').createServer(app); // HTTP 서버 생성
const io = require('socket.io')(server);


// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('클라이언트가 연결되었습니다.');

    // 클라이언트로 메시지 전송
    socket.emit('serverMessage', '서버로부터의 메시지: 안녕하세요!');
});




app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect(
    config.mongoURI, {
      useNewUrlParser: true
  }
).then(() => console.log('MongoDB Connected...')) //🔥 연결이 잘 됐는지 확인하기
 .catch(err => console.log(err));

//  // 서버에서 클라이언트로 데이터를 보내는 함수
// function sendDataToClient(data) {
//     io.emit('arduinoData', data); // 클라이언트로 데이터를 보냄
// }




app.post("/register", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find({});
        return res.status(200).json({
            success: true,
            products: products
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

app.put('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const update = req.body;
        const options = { new: true };

        const updatedProduct = await Product.findByIdAndUpdate(productId, update, options);

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, updatedProduct });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});
app.post("/alarm/register", async (req, res) => {
    try {
        const alarm = new Alarm(req.body);
        await alarm.save();
        
        // 알람 정보를 클라이언트로 보냄
       // sendDataToClient({ type: 'alarm', message: 'New alarm registered!' });

        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});


app.get("/alarms", async (req, res) => {
    try {
        const alarms = await Alarm.find({});
        return res.status(200).json({
            success: true,
            alarms: alarms
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

const { SerialPort } = require('serialport')
const com6 = new SerialPort({ path: '/dev/cu.usbmodem141401', baudRate: 9600 }) //시리얼포트와 boudrate 지정

let buffer = ''; // 데이터를 버퍼링할 변수

com6.on('open', function () {
    console.log('open serial communication');
    com6.on('data', function(data){
        buffer += data.toString(); // 데이터를 버퍼에 추가
        
        // 개행 문자를 기준으로 데이터를 처리
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) { // 마지막 줄은 처리하지 않음
            const line = lines[i];
            const numbers = line.match(/\d+/g); // 숫자 추출
            if (numbers && numbers.length === 3) { // 정확히 세 개의 숫자가 있어야 함
                const [light, temp, humi] = numbers;
                io.emit('sensorData', { light, temp, humi });
                //io.emit('sensorData', light);
                console.log(light);
                console.log(temp);
                console.log(humi);
            }
        }
        
        buffer = lines.pop(); // 마지막 줄은 다음 이벤트 때 사용하기 위해 버퍼에 남김
    })
});

// io.on('connection', (socket) => {
//     console.log('a user connected');
// });





app.get('/', (req, res) => {
  res.send('Hello World!')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  //io.emit('arduinoData', "ddd");
})
