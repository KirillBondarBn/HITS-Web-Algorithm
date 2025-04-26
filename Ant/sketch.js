var canvas = document.getElementById("MyCanvas")
var paintcanvas = document.getElementById("PaintCanvas")
canvas.width = 1200
canvas.height = 600
var ctx = canvas.getContext("2d")
var pctx = paintcanvas.getContext("2d", { willReadFrequently: true})
var pImageData = pctx.getImageData(0,0, canvas.width, canvas.height).data;
var myColor = "blue"
var pi = Math.PI
var mouseX
var mouseY

var isdraw = true

var mousemode = 'anthill'
var colonynums = 0
var ants=[]
var foods=[]
var pheromones=[]
var pheromones2=[]
var walls = []
var anthills = []

const mysin = new Float32Array(721)
const mycos = new Float32Array(721)

for (let i = 0; i < 720; i++) {
    const angle = (i / 180) * Math.PI
    mysin[i] = Math.sin(angle)
    mycos[i] = Math.cos(angle)
}

class Sprite{
    constructor({position, velocity, homesize, home, color = myColor, height = 30, width = 30, image = 'ant.png', PheromonStock = 200, colony = 0, type = 'guard'}){
        this.position = position
        this.velocity = velocity
        this.color = color
        this.height = height
        this.width = width
        this.colony = colony
        this.speed = 2
        this.type = type

        this.directionChangeTime = 4000 / this.speed //Через сколько смена направления
        this.currentDirectionDuration = 0 //Сколько бегаем
        this.pheromoneChangeTime = 20 / this.speed 
        this.currentPheromonDuration = 0
        this.PheromonStock = PheromonStock
        this.currentPheromonStock = this.PheromonStock
        this.route = [] // Теперь не нужно?
        //this.route = position
        //this.home = {x: position.x, y: position.y}
        this.home = {x: position.x, y: position.y}
        //console.log(this.colony)
        //console.log(anthills)
        //this.homesize = anthills[this.colony-1].size //Не пишет
        this.homesize = width
        this.isReturningHome = false
        this.radiusDist = 30 * this.speed //Видимость муравья

        this.image = new Image()
        this.image.src = image

        this.setRandomVelocity()
        this.pheroChance = 0.9
    }
    draw(){
        //const angle = Math.atan2(this.velocity.y, this.velocity.x) // Вычисляем угол

        ctx.fillStyle = this.color
        ctx.strokeStyle = this.color

        //ctx.save()
        //ctx.translate(this.position.x, this.position.y)
        //ctx.rotate(angle)
        ctx.drawImage(this.image, this.position.x-7.5, this.position.y-7.5, 15, 15)
        //ctx.restore()

        //ctx.fillStyle = this.color
        //ctx.strokeStyle = this.color
        //ctx.fillRect(this.position.x, this.position.y,100,100)
        //ctx.beginPath()
        //ctx.arc(this.position.x, this.position.y, 5, 0, 2*pi, false)
        //ctx.stroke()
        //ctx.fill()
    }
    update(){
        this.currentDirectionDuration += 50
        if (this.colony != 0){
            this.homesize = anthills[this.colony-1].size
        }

        if (this.type == 'guard'){
            if (this.isReturningHome) {
                this.guardHome()
            }
            else {
                if (this.currentPheromonStock > 0) {
                    this.currentPheromonStock -= 2
                }
                this.guardWalk()
                }

            if (this.currentPheromonDuration > this.pheromoneChangeTime) {
                    pheromones2.push(new Pheromone2({x: this.position.x, y: this.position.y}, 0.001 * this.currentPheromonStock))
                    this.currentPheromonDuration = 0
            }
            else {
                this.currentPheromonDuration += 3
            }


            this.draw()
            return
        }


        //Возвращение через рандомный поиск дома
        //console.log(this.home)
        if (this.isReturningHome) {
            const dist = Math.hypot(this.position.x - this.home.x, this.position.y - this.home.y)
            //console.log(this.homesize)
            if (dist >= (this.homesize)) { // Проверка на дом
                if (this.currentPheromonDuration > this.pheromoneChangeTime) {
                    pheromones.push(new Pheromone({x: this.position.x, y: this.position.y}, this.currentPheromonStock/this.PheromonStock))
                    this.currentPheromonDuration = 0
                }
                else {
                    this.currentPheromonDuration += 1
                }
                
                var Path = this.checkNearbyPheromones(pheromones2)
                //var nearbyPheromones = this.checkNearbyPheromones0(pheromones2);
                //console.log(nearbyPheromones)
                if (Path != null) {
                    //this.currentDirectionDuration += 500
                    if (this.currentPheromonStock == 0){
                        this.currentPheromonStock = this.PheromonStock / 2
                    }
                    if (this.currentDirectionDuration < this.directionChangeTime){
                    //var Path = this.getFeromonPath(nearbyPheromones)
                    //var Path = this.checkNearbyPheromones(pheromones2)
                    //this.turnAnt(Path)
                    //this.setRotateVelocity(Path, this.sideRotate(Path))
                    //console.log(Path)
                    //this.velocity.x = Path.x + Math.random()/2-0.25
                    //this.velocity.y = Path.y + Math.random()/2-0.25
                    //this.velocity.x = Path.x
                    //this.velocity.y = Path.y
                    //this.followPheromone(Path);
                    //this.followPheromone({x: nearbyPheromones[0].position.x, y: nearbyPheromones[0].position.y})
                    //this.currentDirectionDuration = 1000
                    this.turnAnt(Path)
                    }
                    else {
                    //var Path0 = this.getFeromonPath(nearbyPheromones)
                    //var Path = this.checkNearbyPheromones(pheromones2)
                    this.turnAnt(Path)

                    //this.setRotateVelocity(Path0, this.sideRotate(Path0))
                    //this.setRandomVelocity45()

                    //this.velocity.x = Path.x
                    //this.velocity.y = Path.y
                    this.currentDirectionDuration = 0
                        //if (this.currentDirectionDuration <= 5000){
                            //this.setRandomVelocity45()
                            //this.currentDirectionDuration = 5000
                        //}
                        //else {
                            //if (this.currentDirectionDuration > 5050){
                            //this.currentDirectionDuration = 0
                            //}
                        //}
                    }
                }
                else {
                    if (this.currentPheromonStock > 0) {
                    this.currentPheromonStock -= 1
                    }
                    if (this.currentDirectionDuration >= this.directionChangeTime) {
                    this.setRandomVelocity()
                    this.currentDirectionDuration = 0 // Сбрасываем таймер
                    }
                }

            }
             else {
                //console.log('456')
                // Достигли дома
                this.isReturningHome = false
                this.homePosition = null
                this.currentDirectionDuration = 0
                this.velocity.x = -this.velocity.x
                this.velocity.y = -this.velocity.y
                anthills[this.colony-1].size += 0.1
                if (Math.random() < 0.1){
                    ants.push(new Sprite({
                    position: {
                        x: this.home.x,
                        y: this.home.y
                    },
                    velocity: {
                        x: 0,
                        y: 0 
                    },
                    colony: this.colony,
                    home: this.home,
                    homesize: this.size,
                    type: 'worker'
                    }))
                }


            }
            this.checkBounds()
            this.checkWalls()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
            ctx.fillStyle = 'green'
            ctx.beginPath()
            ctx.arc(this.position.x, this.position.y, 3, 0, 2*pi, false)
            ctx.stroke()
            ctx.fill()

            this.draw()
            return
        }

        var Path = this.checkNearbyPheromones(pheromones)
        //var nearbyPheromones = this.checkNearbyPheromones0(pheromones);
        if (Path != null) {
            if (this.currentPheromonStock == 0){
                //this.currentPheromonStock = this.PheromonStock / 2
            }
            if (this.currentDirectionDuration < this.directionChangeTime){
            //console.log(nearbyPheromones)
            //var Path = this.getFeromonPath(nearbyPheromones)
            //var Path0 = this.getFeromonPath(nearbyPheromones)
            this.turnAnt(Path)

            //ctx.beginPath()
            //ctx.arc(this.position.x + this.velocity.x * 100, this.position.y + this.velocity.y * 100, 5, 0, 2*pi, false)
            //ctx.stroke()
            //ctx.fill()
            //ctx.moveTo (this.position.x,this.position.y);
            //ctx.lineTo (this.position.x + Path.x * 5,this.position.x + Path.y * 5)
            //ctx.stroke()
            //this.followPheromone(Path)
            //this.setRotateVelocity(Path, this.sideRotate(Path))
            //this.velocity.x = Path0.x + Math.random()/2-0.25
            //this.velocity.y = Path0.y + Math.random()/2-0.25
            //this.velocity.x = Path.x
            //this.velocity.y = Path.y

            //if (Math.random() < 0.5) {
            //setRandomVelocity45()
            //}
            //console.log(Path.x)
            //console.log(Path.y)
            //this.currentDirectionDuration = 1000
            }
            else {
                //var Path0 = this.getFeromonPath(nearbyPheromones)
                //var Path = this.checkNearbyPheromones(pheromones)
                this.turnAnt(Path)
                //this.setRandomVelocity45()
                //this.setRotateVelocity(Path0, this.sideRotate(Path0))
                //this.velocity.x = Path.x
                //this.velocity.y = Path.y
                this.currentDirectionDuration = 0
                // if (this.currentDirectionDuration <= 5000){
                //     this.setRandomVelocity45()
                //     this.currentDirectionDuration = 5000
                // }
                // else {
                //     if (this.currentDirectionDuration > 5500){
                //     this.currentDirectionDuration = 1000
                //     }
                // }
            }
        }
        else {
            if (this.currentPheromonStock > 0) {
            this.currentPheromonStock -= 1
            }
            //Установка нового направления
            if (this.currentDirectionDuration >= this.directionChangeTime) {
            this.setRandomVelocity()
            this.currentDirectionDuration = 0
            }
        }

        if (this.currentPheromonDuration > this.pheromoneChangeTime) {
                    pheromones2.push(new Pheromone2({x: this.position.x, y: this.position.y}, this.currentPheromonStock/this.PheromonStock))
                    this.currentPheromonDuration = 0
        }
        else {
            this.currentPheromonDuration += 1
        }

        // const currentPosition = { x: Math.round(this.position.x), y: Math.round(this.position.y) };
        //  // Проверяем, есть ли текущая позиция в маршруте
        // const index = this.route.findIndex(routePoint => routePoint.x === currentPosition.x && routePoint.y === currentPosition.y);
        
        // if (index !== -1) {
        //     // Если найдено совпадение, удаляем все координаты до найденного индекса
        //     this.route.splice(index); // Удаляем все элементы после индекса
        // } else {
        //     // Если нет совпадения, добавляем текущую позицию в маршрут
        //     //this.route.push(currentPosition);
        // }

        //this.route.push({ x: this.position.x, y: this.position.y });
        this.checkBounds()
        this.checkWalls()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        for (let food of foods) {
            const dist = Math.hypot(this.position.x - food.position.x, this.position.y - food.position.y);
            if (dist <= (food.size)) { // Проверка на столкновение с едой, ням-ням
                //console.log('123')
                this.isReturningHome = true
                this.currentPheromonStock = this.PheromonStock
                this.velocity.x = -this.velocity.x
                this.velocity.y = -this.velocity.y
                food.capacity -= 1
                break;
            }
        }

        this.draw()
    }



    guardHome(){
        if (this.route.length > 0) {
            const nextPosition = this.route.pop();
            this.position.x = nextPosition.x;
            this.position.y = nextPosition.y;
        } 
        else {
            // Достигли дома
            this.isReturningHome = false;
            this.currentPheromonStock = this.PheromonStock
        }
    }

    guardWalk(){
        this.route.push({ x: this.position.x, y: this.position.y });
        if (this.currentDirectionDuration >= this.directionChangeTime) {
            this.setRandomVelocity()
            this.currentDirectionDuration = 0
        }
        if (this.route.length > 100 && Math.random() < 0.1) {
            this.isReturningHome = true;
        }
        this.checkBounds()
        this.checkWalls()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }



    checkBounds() {
        if (this.position.y + this.height + this.velocity.y > canvas.height) {
            this.velocity.y = -this.velocity.y
        } else if (this.position.y + this.velocity.y < 0) {
            this.velocity.y = -this.velocity.y
        }

        if (this.position.x + this.width + this.velocity.x > canvas.width) {
            this.velocity.x = -this.velocity.x
        } else if (this.position.x + this.velocity.x < 0) {
            this.velocity.x = -this.velocity.x
        }
    }
    checkWalls() {
        let x = Math.round(this.position.x + this.velocity.x)
        let y = Math.round(this.position.y + this.velocity.y)
        let red = pImageData[(canvas.width * y + x) * 4];
        let green = pImageData[(canvas.width * y + x) * 4 + 1];
        let blue = pImageData[(canvas.width * y + x) * 4 + 2];

        if (red == 128 && green == 128 && blue == 128){
            this.velocity.x = -this.velocity.x
            this.velocity.y = -this.velocity.y
        }
        else {
           const dist = Math.hypot(this.position.x - this.home.x, this.position.y - this.home.y)
            if (dist <= (this.homesize)) { // Проверка на дом
            this.currentPheromonStock = this.PheromonStock
            }
        }

    }

    followPheromone(pheromone) {
        // Логика движения к феромону
        const angleToPheromone = Math.atan2(pheromone.y - this.position.y, pheromone.x - this.position.x)
        //const speed = 2

        this.velocity.x = Math.cos(angleToPheromone) * this.speed
        this.velocity.y = Math.sin(angleToPheromone) * this.speed
    }

    checkNearbyPheromones0(pheromones) {
        const visiblePheromones = []
        const angleOfView = 120
        const halfAngle = angleOfView / 2

        const antDirection = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI)
        for (const pheromone of pheromones) {
            const dx = pheromone.position.x - this.position.x
            const dy = pheromone.position.y - this.position.y
            const distanceToPheromon = Math.sqrt(dx * dx + dy * dy)

            if (distanceToPheromon <= this.radiusDist) {
                //угол к еде
                const pheromoneDirection = Math.atan2(dy, dx) * (180 / Math.PI)
                var angleDifference = Math.abs(antDirection - pheromoneDirection)

                if (angleDifference > 180) {
                    angleDifference = 360 - angleDifference;
                }

                //Проверка, попадает ли угол в диапазон видимости
                if (angleDifference <= halfAngle) {
                    if (!this.isBlockedByWall(this.position, pheromone.position)) {
                    visiblePheromones.push(pheromone);
                    }
                }
            }
        }
        return visiblePheromones;
    }

   checkNearbyPheromones(pheromones) {
    let leftStrength = 0;
    let rightStrength = 0;
    let centerStrength = 0;
    
    const visionAngle = 120 * (Math.PI / 180)
    
    const antAngle = Math.atan2(this.velocity.y, this.velocity.x);
    
    for (const pheromone of pheromones) {
        const dx = pheromone.position.x - this.position.x;
        const dy = pheromone.position.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.radiusDist) continue
        
        const pheromoneAngle = Math.atan2(dy, dx);
        
        let angleDiff = pheromoneAngle - antAngle;
        angleDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI
        
        if (Math.abs(angleDiff) > visionAngle / 2) continue
        
        if (this.isBlockedByWall(this.position, pheromone.position)) continue
        
        const influence = pheromone.smellpower * (1 - distance / this.radiusDist)
        
        if (angleDiff < -0.17) {
            leftStrength += influence;
        } else if (angleDiff > 0.17) {
            rightStrength += influence;
        } else {
            centerStrength += influence;
        }
    }
    
    if (leftStrength + rightStrength + centerStrength === 0) return null;
    
    if (leftStrength > rightStrength && leftStrength > centerStrength) {
        return -1
    } else if (rightStrength > leftStrength && rightStrength > centerStrength) {
        return 1
    } else {
        return 0
    }
}

turnAnt(direction) {
    const maxTurnSpeed = 0.1
    const randomness = 0.05
    
    let turnAngle = 0;
    
    if (direction === -1) {
        turnAngle = -maxTurnSpeed;
    } else if (direction === 1) {
        turnAngle = maxTurnSpeed;
    } else if (direction === 0) { 
        turnAngle = (Math.random() * 2 - 1) * randomness;
    } else {
        turnAngle = (Math.random() * 2 - 1) * randomness * 2;
    }
    
    const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
    const newAngle = currentAngle + turnAngle;
    
    this.velocity.x = Math.cos(newAngle) * this.speed;
    this.velocity.y = Math.sin(newAngle) * this.speed;
}


    getFeromonPath(_pheromones) {
        let totalVector = { x: 0, y: 0 };

        _pheromones.forEach(pheromone => {
            const vectorToPheromone = {
                x: pheromone.position.x - this.position.x,
                y: pheromone.position.y - this.position.y
            };

            const normalizedVector = normalize(vectorToPheromone);
            totalVector.x += normalizedVector.x;
            totalVector.y += normalizedVector.y;
            //totalVector = normalize(totalVector)
        });

        // Нормализуем итоговый вектор
        totalVector = normalize(totalVector)
        totalVector.x *= this.speed
        totalVector.y *= this.speed
        return totalVector;
    }

        // Метод для проверки наличия стен по цвету
    isBlockedByWall(start, end) {
    const steps = 10; // Количество шагов для проверки
    const dx = (end.x - start.x) / steps;
    const dy = (end.y - start.y) / steps;

    for (let i = 0; i <= steps; i++) {
        const tempX = Math.round(start.x + dx * i)
        const tempY = Math.round(start.y + dy * i)

        //const imageData = pctx.getImageData(x,y, 1, 1);
        let r = pImageData[(canvas.width * tempY + tempX) * 4]
        let g = pImageData[(canvas.width * tempY + tempX) * 4 + 1]
        let b = pImageData[(canvas.width * tempY + tempX) * 4 + 2]

        if (r === 128 && g === 128 && b === 128) {
            return true
        }
    }
    return false
    }

    sideRotate(rotate){
         const currentAngle = Math.atan2(this.velocity.y, this.velocity.x)  * (180 / Math.PI)
         const rotateAngle = Math.atan2(rotate.y, rotate.x)  * (180 / Math.PI)
         const newAngle = currentAngle - rotateAngle
         return newAngle
    }

    setRotateVelocity(Angle, side){
        const currentAngle = Math.atan2(this.velocity.y, this.velocity.x)
        const turnDirection = side < 0 ? -1 : 1
        const randomTurnAngle = Math.PI / 12 + (Math.random() * Math.PI / 18)
        const turnAngle = turnDirection * randomTurnAngle
        const newAngle = currentAngle + turnAngle
        this.velocity.x = Angle.x
        this.velocity.y = Angle.y
        this.velocity = normalize(this.velocity)
        this.velocity.x *= this.speed
        this.velocity.y *= this.speed
    }

    setRandomVelocity() {
        const speed = this.speed
        const currentAngle = Math.atan2(this.velocity.y, this.velocity.x)
        const randomTurnAngle = (Math.random() * Math.PI / 3)
        const turnDirection = Math.random() < 0.5 ? -1 : 1
        const turnAngle = turnDirection * randomTurnAngle

        const newAngle = currentAngle + turnAngle
        this.velocity.x = Math.cos(newAngle)
        this.velocity.y = Math.sin(newAngle)
        this.velocity = normalize(this.velocity)
        this.velocity.x *= speed
        this.velocity.y *= speed
    }

    setRandomVelocity45() {
        const speed = this.speed
        const currentAngle = Math.atan2(this.velocity.y, this.velocity.x)
        const randomTurnAngle = ((Math.random()*0.5+0.5) * Math.PI / 8)
        const turnDirection = Math.random() < 0.5 ? -1 : 1
        const turnAngle = turnDirection * randomTurnAngle

        const newAngle = currentAngle + turnAngle
        this.velocity.x = Math.cos(newAngle)
        this.velocity.y = Math.sin(newAngle)
        this.velocity = normalize(this.velocity)
        this.velocity.x *= speed
        this.velocity.y *= speed
    }


}

class Food {
    constructor(position, capacity = 500) {
        this.position = position
        this.capacity = capacity
        this.size = this.capacity / 10 // Размер еды

         this.currentTime = 0
         this.timeFero = 100
    }

    draw() {
        if (this.capacity < 10){
            this.size = 0
        }
        else {
            this.size = this.capacity / 10 
        }
        this.currentTime += 10
        if (this.currentTime > this.timeFero){
            pheromones.push(new Pheromone({x: this.position.x, y: this.position.y}))
            this.currentTime = 0
        }

        ctx.fillStyle = 'green'
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }

    isEaten(){
        return this.capacity < 10
    }
}

class Pheromone {
    constructor(position, smellpower = 1) {
        this.position = position
        this.size = 2 // Размер феромона
        this.maxlifetime = 55000
        this.lifetime = this.maxlifetime * smellpower
        this.smellpower = smellpower
        this.creationTime = Date.now()
    }

    draw() {

        const elapsedTime = Date.now() - this.creationTime
        const remainingTime = this.lifetime - elapsedTime
        const opacity = Math.max(0, Math.min(1, remainingTime / this.maxlifetime * 1))


        ctx.fillStyle = 'rgba(255, 215, 0,' + opacity
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }

    isExpired() {
        return Date.now() - this.creationTime > this.lifetime
    }
}

class Pheromone2 {
    constructor(position, smellpower = 1) {
        this.position = position
        this.size = 2 // Размер феромона
        this.maxlifetime = 35000
        this.lifetime = this.maxlifetime * smellpower
        this.smellpower = smellpower
        this.creationTime = Date.now()
    }

    draw() {
        const elapsedTime = Date.now() - this.creationTime
        const remainingTime = this.lifetime - elapsedTime
        const opacity = Math.max(0, Math.min(1, remainingTime / this.maxlifetime * 1))
        ctx.fillStyle = 'rgba(255, 255, 255,' + opacity

        //ctx.fillStyle = "white" // Полупрозрачный желтый цвет
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }

    isExpired() {
        return Date.now() - this.creationTime > this.lifetime
    }
}

class Wall {
    constructor(position) {
        this.position = position
        this.size = 10
        console.log(position)
    }

    draw() {
        ctx.fillStyle = 'grey';
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }
}

class Anthill {
    constructor(position) {
        this.position = position
        this.size = 30
        this.colonynum = ++colonynums
        this.isDestoyed = false

        this.timeFero = 50
        this.currentTime = 0

        for (let i = 0; i < this.size*5; i++){
            ants.push(new Sprite({
            position: {
                x: this.position.x,
                y: this.position.y
            },
            velocity: {
                x: i % 2 == 0 ? -1 : 0,
                y: 0 
            },
            colony: this.colonynum,
            home: this,
            homesize: this.size,
            type: i % 10 == 0 ? 'guard' : 'worker',
            PheromonStock: i % 10 == 0 ? 600 : 200
            }))
        }
    }
    update(){
        //this.size += 0.1
        this.currentTime += 5
        if (this.currentTime > this.timeFero){
            pheromones2.push(new Pheromone2({x: this.position.x, y: this.position.y}))
            this.currentTime = 0
        }
        this.draw()
    }

    draw() {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        ctx.fill()
    }
}



function animate(){
    window.requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let food of foods) {
        food.draw()
    }

    for (let feromon of pheromones) {
        feromon.draw()
    }

    for (let feromon of pheromones2) {
        feromon.draw()
    }

    for (let anthill of anthills) {
        anthill.update()
    }

    for (let ant of ants) {
        //ant.velocity.x = Math.random()*2-1
        //ant.velocity.y = Math.random()*2-1
        ant.update()
    }

    removeExpiredPheromones(pheromones)
    removeExpiredPheromones(pheromones2)
    removeEatenFood(foods)

    for (let wall of walls) {
        wall.draw()
    }
}

function normalize(vector) {
        const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        if (length === 0) return { x: 0, y: 0 }; // Возвращаем нулевой вектор, если длина равна 0
        return { x: vector.x / length, y: vector.y / length };
    }

function normalizeAngle(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
}

//Удаление испарившихся феромонов
function removeExpiredPheromones(pheromone) {
    for (let i = pheromone.length - 1; i >= 0; i--) {
        if (pheromone[i].isExpired()) {
            pheromone.splice(i, 1)
        }
    }
}

function removeEatenFood(food) {
    for (let i = foods.length - 1; i >= 0; i--) {
        if (food[i].isEaten()) {
            food.splice(i, 1)
        }
    }
}

function binarySearch(value){
    let left = 0
    let right = 720
    let center = 0
    console.log(value)
    while (right - left > 1){
        center = (right+left)/2
        if (value <= center){
            right = center
        }
        else{
            left = center
        }
    }
    console.log(left)
    return left
}

document.getElementById("color").oninput = function(){
  myColor = this.value; ctx.beginPath()
}

canvas.onmousedown = function(event){
    switch (mousemode) {
        case 'ant':
        var x = event.offsetX
        var y = event.offsetY
        ants.push(new Sprite({
        position: {
            x: x,
            y: y
        },
        velocity: {
            x: 0,
            y: 0 
        },
        type: 'worker'
        }))
        break
        case 'wall':
        var x = event.offsetX
        var y = event.offsetY
        pctx.lineCap = "round"
        pctx.lineWidth = 30
        if (isdraw){
        pctx.strokeStyle = 'grey'
        pctx.beginPath()
        pctx.moveTo (x,y);
        var x0 = x
        var y0 = y
        }
        else {
            pctx.clearRect(x-15, y-15, 30, 30)
        }
        canvas.onmousemove = function (event){
            var x = event.offsetX
            var y = event.offsetY
            if (x0 == x && y0 == y){

            }
            else {
                if (isdraw){
                pctx.lineTo (x,y)
                pctx.stroke()
                }
                else {
                    pctx.clearRect(x-15, y-15, 30, 30)
                }
                pImageData = pctx.getImageData(0,0, canvas.width, canvas.height).data;
            }

        }
        canvas.onmouseup = function(){
            canvas.onmousemove = null;
        }
        break

        case 'food':
            foods.push(new Food({ x: mouseX, y: mouseY }))
        break
        case 'anthill':
            anthills.push(new Anthill({ x: mouseX, y: mouseY }))
        break
        case 'feromon':
            pheromones.push(new Pheromone({ x: mouseX, y: mouseY }))
        break
    } 
  }

document.getElementById('clearAll').onclick = function(){
    ants.splice(0, ants.length)
    foods.splice(0, foods.length)
    pheromones.splice(0, pheromones.length)
    pheromones2.splice(0, pheromones2.length)
    anthills.splice(0, anthills.length)
    colonynums = 0
    pctx.beginPath()
    pctx.clearRect(0, 0, canvas.width, canvas.height)
}

document.getElementById('addAnt').onclick = function(){
    mousemode = 'ant'
}

document.getElementById('addFood').onclick = function(){
    mousemode = 'food'
}

document.getElementById('addWall').onclick = function(){
    mousemode = 'wall'
}

document.getElementById('addColony').onclick = function(){
    mousemode = 'anthill'
}

document.getElementById('addFero').onclick = function(){
    mousemode = 'feromon'
}

animate()


window.addEventListener('keydown', (event) => {
        switch (event.key){

            case 'e':
            const mousePos = { x: mouseX, y: mouseY }
            foods.push(new Food(mousePos))
            break

            case 'r':
            isdraw = false
            break
        }
    })

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = event.clientX - rect.left
    mouseY = event.clientY - rect.left
})