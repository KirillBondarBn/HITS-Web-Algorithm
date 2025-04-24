var canvas = document.getElementById("MyCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 800
canvas.height = 600
var myColor = "blue";
var pi = Math.PI;

var route=[]
var towns = []
var isworking = false

class Town {
    constructor(position, size = 5) {
        this.position = position
        this.size = size
        this.draw()
    }

    draw() {
        ctx.fillStyle = myColor;
        ctx.beginPath();
        ctx.lineWidth = 7;
        ctx.strokeStyle = myColor;
        ctx.arc(this.position.x, this.position.y, 5, 0, 2*pi, false);
        ctx.stroke();
        ctx.fill();
    }
}





function CreateRoads(towns){

  let LengthArr = [];
  let length = towns.length
    for(let i = 0; i < length; i++){
        LengthArr[i] = [];
    }
  for (let i = 0; i < length; i++) {
    for (let j = i; j< length; j++) {
    let dist = findDist(towns[i].position, towns[j].position)
    LengthArr[i][j] = dist
    LengthArr[j][i] = dist
    }
  }
  return LengthArr
}


function findDist(City1, City2){
        var deltaX = City1.x - City2.x
        var deltaY = City1.y - City2.y
        let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
        return distance;
      }

function animate(){
    window.requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let town of towns) {
        town.draw()
    }
}


function drawPath(route, towns){ //Финальная отрисовка пути
  let length = towns.length
  for (let kf = 0; kf<length-1; kf++) {
    let x1 = towns[route[kf]].position.x;
    let x2 = towns[route[kf+1]].position.x;
    let y1 = towns[route[kf]].position.y;
    let y2 = towns[route[kf+1]].position.y;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2,y2)
    ctx.stroke();
    ctx.fill(); 
  }
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(towns[route[length-1]].position.x, towns[route[length-1]].position.y);
    ctx.lineTo(towns[route[0]].position.x,towns[route[0]].position.y);
    ctx.stroke();
    ctx.fill(); 
}


 document.getElementById('findPath').onclick = function(){
  //-------База-------//
if (isworking){
  console.log('Процесс уже идет')
  return
}

isworking = true

var LengthArr = CreateRoads(towns)
for (let i = 0; i<towns.length; i++) {
route[i] = i
}
drawPath(route, towns)
//---------------------------//

isworking = false

}

document.getElementById("color").oninput = function(){
  myColor = this.value; 
  ctx.beginPath()
}


canvas.onmousedown = function(event) {
    var x = event.offsetX;
    var y = event.offsetY;

    towns.push(new Town({x: x, y: y})) 


}


document.getElementById('clearAll').onclick = function(){
  ctx.beginPath();
  towns.splice(0, towns.length)
  ctx.clearRect(0, 0, 800, 600);
}