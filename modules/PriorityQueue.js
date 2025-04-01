export class PriorityQueue {
    constructor () {
        this.queue = []
    }

    put(value, priority) {
        if (this.queue.length == 0) {
            this.queue.push([value, priority]);
            return;
        }

        let flag = true;

        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i][1] > priority) {
                this.queue.splice(i, 0, [value, priority]);
                flag = false;
                break;
            }
        }

        if (flag) {
            this.queue.push([value, priority]);
        }
    }

    pop() {
        const result = this.queue[0][0];
        this.queue = this.queue.slice(1, this.queue.length);
        return result;
    }

    isEmpty() {
        return this.queue.length == 0;
    }
};