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
    constructor (position) {
        this.position = position;
    }

    draw(context) {};
}

export class Rectangle extends Object {
    constructor (position, color, width, height) {
        super(position);
        this.color = color;
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.rect(this.position.x, this.position.y, this.width, this.height);
        context.fill();
        context.closePath();
    }
}

export class Field {
    constructor (canvasID) {
        this.canvas = document.getElementById(canvasID);
        this.context = this.canvas.getContext('2d');
        this.objects = [];
    }

    findByPosition(position) {
        for (let object of this.objects) {
            if ((object.position.x <= position.x) && ((object.position.x + object.width) >= position.x) &&
                (object.position.y <= position.y) && ((object.position.y + object.height) >= position.y)
                ) {
                return object
            }
        };
    }

    appendObject(object) {
        this.objects.push(object);
    }

    display() {
        this.objects.forEach(object => { object.draw(this.context) });
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
    }
}