class Matrix {
  constructor(data){
    this.data = data;
    this.rows = data.length;
    this.cols = data[0].length;
  }
  static fromArray(arr) {
    let data = arr.map(val => [val]);
    return new Matrix(data);
  }
  toArray(){
    let arr = [];
    for (let i = 0; i < this.rows; i++){
      for (let j = 0; j < this.cols; j++){
        arr.push(this.data[i][j]);
      }
    }
    return arr;
  }
  static subtract(a, b){
    let result = new Matrix(new Array(a.rows)
      .fill(0).map(() => new Array(a.cols).fill(0)));
      for (let i = 0; i < a.rows; i++){
        for (let j = 0; j < a.cols; j++){
          result.data[i][j] = a.data[i][j] - b.data[i][j];
        }
      }
      return result;
  }
  static transpose(matrix) {
    let result = new Matrix(new Array(matrix.cols)
      .fill(0).map(() => new Array(matrix.rows).fill(0)));
    for (let i = 0; i < matrix.rows; i++){
      for (let j = 0; j < matrix.cols; j++){
        result.data[j][i] = matrix.data[i][j];
      }
    }
    return result;
  }
  static multiply(a, b) {
    if (a.cols !== b.rows){
      console.error("Размеры матриц не соответствуют; перемножение невозможно!");
      return undefined;
    }
    let result = new Matrix(new Array(a.rows)
      .fill(0).map(() => new Array(b.cols).fill(0)));
    for (let i = 0; i < a.rows; i++){
      for (let j = 0; j < b.cols; j++){
        let sum = 0;
        for (let k = 0; k < a.cols; k++){
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }
  add(n){
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols){
        console.error("Размеры матриц не соответствуют; сложение невозможно!");
        return undefined;
      }
      for (let i = 0; i < this.rows; i++){
        for (let j = 0; j < this.cols; j++){
          this.data[i][j] += n.data[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.rows; i++){
        for (let j = 0; j < this.cols; j++){
          this.data[i][j] += n;
        }
      }
    }
  }

  static add(a, b){
    let result = new Matrix(new Array(a.rows)
      .fill(0).map(() => new Array(a.cols).fill(0)));
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        result.data[i][j] = a.data[i][j] + b.data[i][j];
      }
    }
    return result;
  }

  map(func) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = func(this.data[i][j]);
      }
    }
  }
  static map(matrix, func) {
    let result = new Matrix(new Array(matrix.rows)
      .fill(0).map(() => new Array(matrix.cols).fill(0)));
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[i][j] = func(matrix.data[i][j]);
      }
    }
    return result;
  }
  static multiplyElementWise(a,b){
    let result = new Matrix(new Array(a.rows)
      .fill(0).map(() => new Array(a.cols).fill(0)));
    for (let i = 0; i < a.rows; i++){
      for (let j = 0; j < a.cols; j++){
        result.data[i][j] = a.data[i][j] * b.data[i][j];
      }
    }
    return result;
  }
  multiplyScalar(n){
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= n;
      }
    }
  }
  static multiplyScalar(matrix, n){
    let result = new Matrix(new Array(matrix.rows)
      .fill(0).map(() => new Array(matrix.cols).fill(0)));
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[i][j] = matrix.data[i][j] * n;
      }
    }
    return result;
  }
}


class NeuralNetwork{
  constructor(inputNodes, hiddenNodes, outputNodes, learningRate){
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    this.learningRate = learningRate;
    this.weights_ih = null;
    this.weights_ho = null;
    this.bias_h = null;
    this.bias_o = null;
  }
  static async createMnistMatrix(url){
    const mnistMatrix = await fetch(url).then(r => r.json());
    const nn = new NeuralNetwork(mnistMatrix.inputNodes, mnistMatrix.hiddenNodes, mnistMatrix.outputNodes, mnistMatrix.learningRate);
    nn.weights_ih = new Matrix(mnistMatrix.weights_ih.data);
    nn.weights_ho = new Matrix(mnistMatrix.weights_ho.data);
    nn.bias_h = new Matrix(mnistMatrix.bias_h.data);
    nn.bias_o = new Matrix(mnistMatrix.bias_o.data);
    return nn;
  }
  sigmoid(x){
    return (1 / (1 + Math.exp(-x)));
  }
  dsigmoid(y){
    return (y * (1 - y));
  }
  feedforward(input_array){
    let inputs = Matrix.fromArray(input_array);
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden = Matrix.add(hidden, this.bias_h);
    hidden.map(this.sigmoid);
    
    let outputs = Matrix.multiply(this.weights_ho, hidden);
    outputs = Matrix.add(outputs, this.bias_o);
    outputs.map(this.sigmoid);

    return outputs.toArray();
  }
  backpropogation(input_array, target_array){
    let inputs = Matrix.fromArray(input_array);
    let hidden = Matrix.multiply(this.weights_ih, inputs);
    hidden = Matrix.add(hidden, this.bias_h);
    hidden.map(this.sigmoid);
    let outputs = Matrix.multiply(this.weights_ho, hidden);
    outputs = Matrix.add(outputs, this.bias_o);
    outputs.map(this.sigmoid);

    let targets = Matrix.fromArray(target_array);
    let output_errors = Matrix.subtract(targets, outputs);
    let gradients = Matrix.map(outputs, this.dsigmoid);
    gradients = Matrix.multiplyElementWise(gradients, output_errors);
    gradients = Matrix.multiplyScalar(gradients, this.learningRate);

    let hidden_B = Matrix.transpose(hidden);
    let weights_ho_deltas = Matrix.multiply(gradients, hidden_B);
    this.weights_ho = Matrix.add(this.weights_ho, weights_ho_deltas);
    this.bias_o = Matrix.add(this.bias_o, gradients);

    let who_B = Matrix.transpose(this.weights_ho);
    let hidden_errors = Matrix.multiply(who_B, output_errors);

    let hidden_gradient = Matrix.map(hidden, this.dsigmoid);
    hidden_gradient = Matrix.multiplyElementWise(hidden_gradient, hidden_errors);
    hidden_gradient = Matrix.multiplyScalar(hidden_gradient, this.learningRate);

    let inputs_B = Matrix.transpose(inputs);
    let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_B);
    this.weights_ih = Matrix.add(this.weights_ih, weight_ih_deltas)
    this.bias_h = Matrix.add(this.bias_h, hidden_gradient);
  }
}
let nn;
NeuralNetwork.createMnistMatrix('mnistMatrix.json').then(instance => {nn = instance, console.log('Нейросеть готова: ', nn)});

let trainingData = [];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - rect.left) * (canvas.width / rect.width)),
    y: Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
  };
}
function drawLine(from, to){
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <=steps; i++){
    const x = Math.round(from.x + (dx * i) / steps);
    const y = Math.round(from.y + (dy * i) / steps);
    ctx.fillRect(x, y, brushSize, brushSize);
  }
}

let lastPos = null;
function drawDot(e) {
    const pos = getCanvasPos(e);
    if (lastPos){
      drawLine(lastPos, pos);
    } else{
      ctx.fillRect(pos.x, pos.y, brushSize, brushSize);
    }
    lastPos = pos;
}

function clearCanvas() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  lastPos = null;
}

function normalizePixel(value) {
  return (255 - value) / 255;
}

const brushSize = 3;
let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  drawDot(e);
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  drawDot(e);
});
canvas.addEventListener('mouseup', () => {
  lastPos = null
  isDrawing = false
});
canvas.addEventListener('mouseleave', () => {
  lastPos = null
  isDrawing = false
});
clearBtn.addEventListener('click', clearCanvas);

function getImageDataArray(){
  const offCanvas = document.createElement("canvas");
  offCanvas.width = 50;
  offCanvas.height = 50;
  const offCtx = offCanvas.getContext("2d");
  offCtx.drawImage(canvas, 0, 0, 50, 50);
  const imageData = offCtx.getImageData(0, 0, 50, 50);
  let imgArray = [];
  for (let i = 0; i < imageData.data.length; i += 4){
    imgArray.push(normalizePixel(imageData.data[i]) );
  }
  return imgArray;
}
document.getElementById("saveSample").addEventListener("click", () => {
  const digitLabel = parseInt(document.getElementById("digitLabel").value);
  if (isNaN(digitLabel) || digitLabel < 0 || digitLabel > 9){
    alert("Введите корректную цифру!");
    return;
  }
  const inputArray = getImageDataArray();
  let target = Array(10).fill(0);
  target[digitLabel] = 1;
  trainingData.push({input: inputArray, target: target});
  alert("Образец сохранён, всего образцов - " + trainingData.length);
  clearCanvas();
});

document.getElementById("loadBatch").addEventListener("click", () => {
  const digit = parseInt(document.getElementById("batchDigit").value);
  const files = document.getElementById("batchUpload").files;

  if (isNaN(digit) || digit < 0 || digit > 9) {
    alert("Введите корректную цифру (0–9)");
    return;
  }

  if (files.length === 0) {
    alert("Выберите хотя бы один PNG-файл.");
    return;
  }

  const promises = Array.from(files).map(file => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = function(e) {
        img.onload = function() {
          const offCanvas = document.createElement("canvas");
          offCanvas.width = 50;
          offCanvas.height = 50;
          const offCtx = offCanvas.getContext("2d");
          offCtx.imageSmoothingEnabled = false;
          offCtx.drawImage(img, 0, 0, 50, 50);
          const imageData = offCtx.getImageData(0, 0, 50, 50);
          const threshold = 0.5;
          const arr = [];
          for (let i = 0; i < imageData.data.length; i += 4) {
            const norm = normalizePixel(imageData.data[i]);
            const bin = norm > threshold ? 1 : 0;
            arr.push(bin);
          }
          const target = Array(10).fill(0);
          target[digit] = 1;
          trainingData.push({ input: arr, target: target });

          resolve();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  Promise.all(promises).then(() => {
    alert("Образцы загружены, всего образцов:" + trainingData.length);
  });
});
async function trainEpoch(data, batchSize) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    for (let sample of batch) {
      nn.backpropogation(sample.input, sample.target);
    }
    await new Promise(res => setTimeout(res, 0));
  }
  return;
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
document.getElementById("trainNetwork").addEventListener("click", async () => {
  if (trainingData.length === 0) {
    alert("Образцов ещё нет.");
    return;
  }
  const epochs = 10;
  const batchSize = 32;
  const statusP = document.getElementById("trainingStatus");
  statusP.innerText = "Идёт обучение";

  for (let epoch = 0; epoch < epochs; epoch++) {
    shuffle(trainingData);
    await trainEpoch(trainingData, batchSize);
    statusP.innerText = `Эпоха ${epoch + 1} из ${epochs}`;
    if (epoch % 5 === 0 || epoch === epochs - 1) {
      await new Promise(r => setTimeout(r, 10));
    }
  }
  statusP.innerText = "Обучение завершено!";
  console.log("Обученная сеть: ", nn);
});

document.getElementById("predictDigit").addEventListener("click", () => {
  const inputArray = getImageDataArray();
  const output = nn.feedforward(inputArray);
  let prediction = 0;
  for (let i = 1; i < output.length; i++){
    if (output[i] > output[prediction]){
      prediction = i;
    }
  }
  document.getElementById("result").innerText = "Цифра на экране: " + prediction;
});