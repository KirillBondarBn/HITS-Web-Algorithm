import { Field, Position, Rectangle } from "../modules/drawning_r.js"
import { PriorityQueue } from "../modules/PriorityQueue.js";
import { generate } from "../aStar/maze_generator.js";
import * as SOURCE from "../modules/conts.js";

function delay(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

class Graph {
    constructor (vertices) {
        this.adjacencyList = new Array(vertices);
        this.size = vertices;
        for (let i = 0; i < vertices; i++) {
            this.adjacencyList[i] = new Array();
        }
    }

    addEdge (vertex, adjacencyIndex) {
        this.adjacencyList[vertex].push(adjacencyIndex);
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    async Astar(start, finish) {
        let frontier = new PriorityQueue();
        let cost_so_far = {};
        let came_from = {};

        frontier.put(start, 0);
        came_from[start] = null;
        cost_so_far[start] = 0;

        while (!frontier.isEmpty()) {
            let current = frontier.pop();
            
            if (current === finish) {
                break;
            }

            for (let vertex of this.adjacencyList[current]) {
                let posA = maze.objects[vertex].position;
                let posB = maze.objects[finish].position;
                let new_cost = cost_so_far[current] + this.heuristic(posA, posB) ** 4;
                if (!(vertex in cost_so_far) || (new_cost < cost_so_far[vertex])) {
                    cost_so_far[vertex] = new_cost;
                    frontier.put(vertex, cost_so_far[vertex]);
                    came_from[vertex] = current;
                }

                maze.objects[vertex].color = "gray";
                maze.display();
                await delay(0);
            }
        }

        let current_vertex = finish;
        while (current_vertex != null) {
            console.log(current_vertex);
            maze.objects[current_vertex].color = "orange";
            current_vertex = came_from[current_vertex];
            maze.display();
            await delay(10); 
        }

        maze.display();
    }

    initFromList(list) {
        let n = list.length;
        for (let i = 0; i < n; i++) {
            if (list[i].color != SOURCE.WALL_COLOR) {
                if (i >= maze_size) {
                    let index = i - maze_size;
    
                    if (list[index].color != SOURCE.WALL_COLOR) {
                        this.addEdge(i, index);
                    }
                }
                if (i < n - maze_size - 1) { // -2 TODO?
                    let index = i + maze_size;
    
                    if (list[index].color != SOURCE.WALL_COLOR) {
                        this.addEdge(i, index);
                    }
                }
                if (i % maze_size > 0) {
                    let index = i - 1;
    
                    if (list[index].color != SOURCE.WALL_COLOR) {
                        this.addEdge(i, index);
                    }
                }
                if (i % maze_size < maze_size - 1) {
                    let index = i + 1;
    
                    if (list[index].color != SOURCE.WALL_COLOR) {
                        this.addEdge(i, index);
                    }
                }
            }
        }
    }
}

const MODE = {
    Source: "Source",
    Destination: "Destination",
    Wall: "Wall",
    Space: "Space"
}

const MODE_ACTION = {
    "Source": setSource,
    "Destination": setDestination,
    "Wall": setWall,
    "Space": setSpace
}

const maze_size_label = document.getElementById("maze_size_label");
const maze_size_range = document.getElementById("maze_size");
const set_source_radio = document.getElementById("set_source");
const set_destination_radio = document.getElementById("set_destination");
const set_wall_radio = document.getElementById("set_wall"); 
const set_space_radio = document.getElementById("set_space"); 
const solve_button = document.getElementById("solve"); 
const clear_solution_button = document.getElementById("clear");
const generate_button = document.getElementById("generate");  
const canvas = document.getElementById("field");

const maze = new Field("field");

let mode = MODE.Wall;
let draw = false;

canvas.height = canvas.clientHeight;
canvas.width = canvas.clientWidth; 

let maze_size = parseInt(maze_size_range.value);
let cell_size = (canvas.width / maze_size);

let maze_matrix = []

let source, destination;

generateField();

function solve() {
    let graph = new Graph(maze.objects.length);
    graph.initFromList(maze.objects);
    graph.Astar(parseInt(source.position.y / cell_size) * maze_size + parseInt(source.position.x / cell_size), parseInt(destination.position.y / cell_size) * maze_size + parseInt(destination.position.x / cell_size));
}

function getUserClickPosition (event) {
    const rectangle = canvas.getBoundingClientRect();
    let x = event.clientX - rectangle.left;
    let y = event.clientY - rectangle.top;

    let position = new Position(x, y);
    return position;
}
 
function generateField() {
    maze.clear();
    cell_size = (canvas.width / maze_size);
    maze_matrix = generate(maze_size);
    for (let y = 0; y < maze_size; y++) {
        for (let x = 0; x < maze_size; x++) {
            const cell = new Rectangle(new Position(x * cell_size, y * cell_size), (maze_matrix[y][x]) ? SOURCE.SPACE_COLOR : SOURCE.WALL_COLOR, cell_size, cell_size)
            maze.appendObject(cell);
        }
    }
    maze.display();
    maze.display();
}

function clearSolution() {
    source = undefined;
    destination = undefined;
    for (let object of maze.objects) {
        if (object.color !== SOURCE.WALL_COLOR) {
            object.color = SOURCE.SPACE_COLOR;
        }
    }
    maze.display();
    maze.display(); // Какого-то хуя не стирает границы, если не обновить дважды... REFACTOR
}

function setWall(cell, indexes) {
    if (cell === source) {
        source = undefined;
    }
    else if (cell === destination) {
        destination = undefined;
    }
    cell.color = SOURCE.WALL_COLOR;
    maze_matrix[indexes[0]][indexes[1]] = false;
}

function setSpace(cell, indexes) {
    if (cell === source) {
        source = undefined;
    }
    else if (cell === destination) {
        destination = undefined;
    }
    cell.color = SOURCE.SPACE_COLOR;
    maze_matrix[indexes[0]][indexes[1]] = true;
}

function setSource(cell, indexes) {
    if (!maze_matrix[indexes[0]][indexes[1]]) {
        alert("Firstly remove wall");
        return;
    }
    if (source) {
        source.color = SOURCE.SPACE_COLOR;
    }
    cell.color = SOURCE.SOURCE_COLOR;
    source = cell;
}

function setDestination(cell, indexes) {
    if (!maze_matrix[indexes[0]][indexes[1]]) {
        alert("Firstly remove wall");
        return;
    }
    if (destination) {
        destination.color = SOURCE.SPACE_COLOR;
    }
    cell.color = SOURCE.DESTINATION_COLOR;
    destination = cell;
}

function clickAction(event) {
    const cursorPosition = getUserClickPosition(event);
    const cell = maze.findByPosition(cursorPosition);

    MODE_ACTION[mode](cell, [cell.position.y / cell_size, cell.position.x / cell_size]);
    maze.display();
    maze.display(); // Почему это нужно?...
}


generate_button.addEventListener("click", generateField);

canvas.addEventListener("mousemove", (event) => { 
    if (draw) {
        clickAction(event);
    }
 });
canvas.addEventListener("mouseup", () => { draw = false; });
canvas.addEventListener("mousedown", () => { draw = true; });

clear_solution_button.addEventListener("click", clearSolution);

solve_button.addEventListener("click", () => {
    solve();
});

set_source_radio.addEventListener("input", () => {
    mode = MODE.Source;
});

set_destination_radio.addEventListener("input", () => {
    mode = MODE.Destination;
});

set_wall_radio.addEventListener("input", () => {
    mode = MODE.Wall;
});

set_space_radio.addEventListener("input", () => {
    mode = MODE.Space;
});

maze_size_range.addEventListener("input", () => {
    maze_size = parseInt(maze_size_range.value);
    maze_size_label.innerText = `Maze size: ${maze_size}`;
});