const Types = {
    Circle: 'Circle',
    Rectangle: 'Rectangle'
};

export class Position {
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Object {
    constructor (position, type, colors, size) {
        this.position = position;
        this.type = type;
        this.colors = colors;
        this.size = size;
    }
}

export class Field {
    constructor (canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.context = this.canvas.getContext('2d');

        this.objects = new Array();
        this.scale = 1;
        this.transform_x = 0;
        this.transform_y = 0;
    }

    resize() {
        // получаем размер HTML-элемента canvas
        var displayWidth  = this.canvas.clientWidth;
        var displayHeight = this.canvas.clientHeight;
        
        // проверяем, отличается ли размер canvas
        if (this.canvas.width  != displayWidth ||
            this.canvas.height != displayHeight - 4) {
       
          // подгоняем размер буфера отрисовки под размер HTML-элемента
          this.canvas.width  = displayWidth;
          this.canvas.height = displayHeight;
        }
    }

    getUserClickPosition (event) {
        const rectangle = this.canvas.getBoundingClientRect();
        let x = event.clientX - rectangle.left;
        let y = event.clientY - rectangle.top;

        let position = new Position(x, y);
        return position;
    }

    getPointsDistance (positionA, positionB) {
        return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2));
    }

    createObject (cursorPosition, type, colors, size) {
        let position = new Position((cursorPosition.x - this.transform_x) / this.scale, (cursorPosition.y - this.transform_y) / this.scale);
        let object = new Object(position, type, colors, size);
        this.objects.push(object);
    }

    appendObject(position, type, colors, size) {
        this.objects.push(new Object(position, type, colors, size));
    }

    removeObject (cursorPosition) {
        cursorPosition = new Position((cursorPosition.x - this.transform_x) / this.scale , (cursorPosition.y - this.transform_y) / this.scale)
        for (let i = 0; i < this.objects.length; i++) {
            let objectPosition = this.objects[i].position;
            if (this.objects[i].type == Types.Circle) {
                if (this.getPointsDistance(cursorPosition, objectPosition) <= this.objects[i].size * this.scale) {
                    this.objects = this.objects.slice(0, i).concat(this.objects.slice(i + 1));
                    return i;
                } 
            }
        }
    }

    getPointIndexByPositionOrNull(cursorPosition) {
        cursorPosition = new Position((cursorPosition.x - this.transform_x) / this.scale , (cursorPosition.y - this.transform_y) / this.scale)
        for (let i = 0; i < this.objects.length; i++) {
            let objectPosition = this.objects[i].position;
            if (this.objects[i].type == Types.Circle) {
                if (this.getPointsDistance(cursorPosition, objectPosition) <= this.objects[i].size * this.scale) {
                    return i;
                } 
            }
            else if (this.objects[i].type == Types.Square) {
                if (cursorPosition.x >= objectPosition.x && cursorPosition.x <= objectPosition.x + this.objects[i].size[0] &&
                    cursorPosition.y >= objectPosition.y && cursorPosition.y <= objectPosition.y + this.objects[i].size[1]) {
                    return i;
                } 
            }
        }

        return null;
    }

    display () {
        this.resize();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let object of this.objects) {
            if (object.type == Types.Circle) {
                let n = object.colors.length;
                for (let i = 0; i < n; i++) {
                    this.context.fillStyle = object.colors[i];

                    this.context.beginPath();
                    this.context.moveTo(object.position.x * this.scale + this.transform_x, object.position.y * this.scale + this.transform_y);
                    this.context.arc(object.position.x * this.scale + this.transform_x, object.position.y * this.scale + this.transform_y, object.size * this.scale, 2 * Math.PI / n * i, 2 * Math.PI / n * i + 2 * Math.PI / n);
                    this.context.closePath();
                    this.context.fill();
                }
            }
            else if (object.type === Types.Rectangle) {
                this.context.fillStyle = object.colors;
                this.context.beginPath();
                this.context.rect(object.position.x, object.position.y, object.size[0], object.size[1]);
                this.context.fill();
            }
        }
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
    }
}