const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { Product } = require('./models/product');
const { Alarm } = require('./models/alarm');
const bodyParser = require('body-parser');
const config = require('./config/dev');
const server = require('http').createServer(app); // HTTP 서버 생성
const io = require('socket.io')(server);
let onoff = false;

app.use(
  cors({
    origin: 'http://localhost:3001/manage',
    methods: ['GET', 'POST'],
    credentials: true, // 필요에 따라 설정
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
  })
  .then(() => console.log('MongoDB Connected...')) //🔥 연결이 잘 됐는지 확인하기
  .catch((err) => console.log(err));

app.post('/test', async (req, res) => {
  try {
    const arrayToUpdate = req.body;
    console.log(arrayToUpdate);

    // 데이터베이스에 있는 모든 상품의 now_amount를 0으로 설정
    await Product.updateMany({}, { $set: { now_amount: 0 } });

    // 배열 요소를 순회하면서 해당 상품의 now_amount를 1로 설정
    for (let name of arrayToUpdate) {
      // 해당 이름의 상품을 찾아 now_amount를 1로 설정
      await Product.updateOne({ name }, { $set: { now_amount: 1 } });
    }

    const today = new Date().toISOString().slice(0, 10); // 오늘 날짜
    const productsOutOfStock = await Product.find({ now_amount: 0 });
    const currentTime = new Date(); // 현재 시간
    const time = `${
      currentTime.getMonth() + 1
    }월 ${currentTime.getDate()}일 ${currentTime.getHours()}시 ${currentTime.getMinutes()}분`;

    for (let product of productsOutOfStock) {
        if (product.name === 'sprite') {
            product.name = '스프라이트';
          }
          if (product.name === 'cola') {
            product.name = '코카 콜라';
          }
          if (product.name === 'welchs') {
            product.name = '웰치스';
          }
          if (product.name === 'swingchip') {
            product.name = '스윙칩';
          }
          if (product.name === 'pepero') {
            product.name = '아몬드 빼빼로';
          }
          if (product.name === 'postick') {
            product.name = '포스틱';
          }
          if (product.name === 'crownsando') {
            product.name = '크라운산도';
          }
          if (product.name === 'oreo') {
            product.name = '오레오';
          }
          if (product.name === 'moncher') {
            product.name = '몽쉘';
          }
      const alarm = new Alarm({
        title: `${product.name}을 주문해주세요.`,
        body: `${product.name}의 재고가 다 떨어졌습니다.`,
        date: today,
      });
      await alarm.save();
      console.log(`${product.name} 알람이 생성되었습니다.`);
    }
    io.emit('dataFromServer', { productsOutOfStock, time });

    return res
      .status(200)
      .json({ success: true, message: '데이터베이스 수정 완료' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/register', async (req, res) => {
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

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    products.forEach((product) => {
      if (product.name === 'sprite') {
        product.name = '스프라이트';
      }
      if (product.name === 'cola') {
        product.name = '코카 콜라';
      }
      if (product.name === 'welchs') {
        product.name = '웰치스';
      }
      if (product.name === 'swingchip') {
        product.name = '스윙칩';
      }
      if (product.name === 'pepero') {
        product.name = '아몬드 빼빼로';
      }
      if (product.name === 'postick') {
        product.name = '포스틱';
      }
      if (product.name === 'crownsando') {
        product.name = '크라운산도';
      }
      if (product.name === 'oreo') {
        product.name = '오레오';
      }
      if (product.name === 'moncher') {
        product.name = '몽쉘';
      }
    });
    return res.status(200).json({
      success: true,
      products: products,
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

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      update,
      options
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, updatedProduct });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/alarm/register', async (req, res) => {
  try {
    const alarm = new Alarm(req.body);
    await alarm.save();


    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.json({ success: false, err });
  }
});

app.get('/alarms', async (req, res) => {
    try {
      const alarms = await Alarm.find().sort({ createdAt: -1 }).limit(20);
      return res.status(200).json({ success: true, alarms: alarms.reverse() });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  

app.post('/onoff', async (req, res) => {
  try {
    const { onoff_now } = req.body;
    onoff = onoff_now;

    console.log(onoff_now);

    if (onoff_now) {
      com6.write('o');
      console.log("Sent 'o' to Arduino");
    } else {
      com6.write('f');
      console.log("Sent 'f' to Arduino");
    }

    return res.status(200).json({ success: true, onoff: onoff_now });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/onoff', (req, res) => {
  res.send(onoff);
});

app.post('/people', async (req, res) => {
  try {
    const people = req.body;
    console.log(people);

    const currentTime = new Date(); // 현재 시간
    const time = `${
      currentTime.getMonth() + 1
    }월 ${currentTime.getDate()}일 ${currentTime.getHours()}시 ${currentTime.getMinutes()}분`;

    const today = new Date().toISOString().slice(0, 10); // 오늘 날짜

    const alarm = new Alarm({
      title: `🚨사람이 무단침입했습니다!!🚨`,
      body: `${time}에 사람이 무단침입했습니다!!`,
      date: today,
    });
    await alarm.save();
    console.log(`${product.name} 알람이 생성되었습니다.`);

    return res
      .status(200)
      .json({ success: true, message: '데이터베이스 수정 완료' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const { SerialPort } = require('serialport');
const com6 = new SerialPort({ path: '/dev/cu.usbmodem1401', baudRate: 9600 }); //시리얼포트와 boudrate 지정

let buffer = ''; // 데이터를 버퍼링할 변수

com6.on('open', function () {
  console.log('open serial communication');
  com6.on('data', function (data) {
    buffer += data.toString(); // 데이터를 버퍼에 추가

    // 개행 문자를 기준으로 데이터를 처리
    const lines = buffer.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      // 마지막 줄은 처리하지 않음
      const line = lines[i];
      const numbers = line.match(/\d+/g); // 숫자 추출
      if (numbers && numbers.length === 3) {
        // 정확히 세 개의 숫자가 있어야 함
        const [light, temp, humi] = numbers;
        io.emit('sensorData', { light, temp, humi });
        //io.emit('sensorData', light);
        console.log(light);
        console.log(temp);
        console.log(humi);
      }
    }

    buffer = lines.pop(); // 마지막 줄은 다음 이벤트 때 사용하기 위해 버퍼에 남김
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  //io.emit('arduinoData', "ddd");
});
