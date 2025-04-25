import { Field, Position } from "../modules/drawning.js"
import { colors } from "../modules/conts.js" 

class Point {
    constructor (position, weight) {
        this.position = position;
        this.weight = weight;
        this.clusters = {};
    }
}

class Cluster {
    constructor (position, name, color) {
        this.position = position;
        this.name = name;
        this.color = color;
    }
}

function clear_clustering(algorithm) {
    for (let point of points) {
        if (point.visited) {
            point.visited = false;
        }
        if (point.clusters.hasOwnProperty(algorithm)) {
            delete point.clusters[algorithm];
        }
    }
}

function getRandomHexColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');

    return `#${hexR}${hexG}${hexB}`;
}

function findNeighbors(point) {
    return points.filter(otherPoint => field.getPointsDistance(point.position, otherPoint.position) <= epsilon);
}

function DBSCAN() {
    clear_clustering("dbscan");
    let i = 0;
    for (let point of points) {
        if (point.visited) continue;
        point.visited = true;

        const neighbors = findNeighbors(point);

        if (neighbors.length > minPts) {
            point.clusters["dbscan"] = new Cluster(null, i, getRandomHexColor());
            expandCluster(point, neighbors, point.clusters["dbscan"]);
            i++;
        }
    }
    sync_points_and_objects();
    field.display();
}

function expandCluster(seed, neighbors, cluster) {
    seed.clusters["dbscan"] = cluster;

    for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (!neighbor.visited) {
            neighbor.visited = true;
            const neighborNeighbors = findNeighbors(neighbor);
            if (neighborNeighbors.length >= minPts) {
                for (let current_neighbor of neighborNeighbors) {
                    current_neighbor.clusters["dbscan"] = cluster;
                    neighbors.push(current_neighbor);
                }
            }
        }
    }
}


const reset_button = document.getElementById("reset_button");
const export_button = document.getElementById("export_button");
const set_point_radio = document.getElementById("set_point");
const remove_point_radio = document.getElementById("remove_point");
const explore_radio = document.getElementById("explore_field");
const cluster_count_range = document.getElementById("cluster_count");
const radius_range = document.getElementById("point_radius");
const set_scale_range = document.getElementById("set_scale");
const set_scale_label = document.getElementById("set_scale_label");
const point_radius_label = document.getElementById("point_radius_label");
const cluster_count_label = document.getElementById("cluster_count_label");
const k_means_button = document.getElementById("k_means_button");
const dbscan_button = document.getElementById("dbscan_button")
const import_button = document.getElementById("import_button");
const epsilon_label = document.getElementById("epsilon_label");
const epsilon_range = document.getElementById("epsilon");
const minpts_label = document.getElementById("minpts_label");
const minpts_range = document.getElementById("minpts");;

let cluster_count = cluster_count_range.value;
let points = [];

let previous_cursor_position = new Position(0, 0);
let radius = radius_range.value;
let translating = false;
let scale = 1;

let epsilon = epsilon_range.value;
let minPts = minpts_range.value;

let field = new Field("field");
field.canvas.style.cursor = "none";

let mode = "Set";
let mode_action = {
    "Set": set_point,
    "Remove": remove_point,
    "Explore": show_point_configuration
}

let mode_cursor = {
    "Set": "none",
    "Remove": "default",
    "Explore": "default"
}

function k_means() {
    clear_clustering("k-means");
    let clusters = new Array(cluster_count);
    let checked = new Array(points.length).fill(false);
    let index;
    for (let i = 0; i < cluster_count; i++) {
        index = parseInt(Math.random() * points.length);
        while (checked[index]) {
            index = parseInt(Math.random() * points.length);
        }
        checked[index] = true;
        let position = new Position(points[index].position.x, points[index].position.y)
        let cluster = new Cluster(position, i + 1, colors[i]);
        clusters[i] = cluster;
    }

    for (let i = 0; i < 10000; i++) {
        for (let point of points) {
            let minDistance = 100000;
            for (let cluster of clusters) {
                let currentDistance = field.getPointsDistance(point.position, cluster.position) - point.weight;

                if (currentDistance < minDistance) {
                    minDistance = currentDistance;
                    point.clusters["k-means"] = cluster;
                }
            }
        }

        for (let cluster of clusters) {
            let count = 0;
            let sumX = 0;
            let sumY = 0;
            for (let point of points) {
                if (point.clusters["k-means"].name == cluster.name) {
                    count++;
                    sumX += point.position.x;
                    sumY += point.position.y;
                }
            }

            cluster.position.x = parseInt(sumX / count);
            cluster.position.y = parseInt(sumY / count);
        }
    }

}

function changeClusterColor(cluster_name, algorithm, new_color) {
    for (let i = 0; i < points.length; i++) {
        if (points[i].clusters[algorithm].name == cluster_name) {
            points[i].clusters[algorithm].color = new_color
        }
    }

    sync_points_and_objects();
    field.display();
}

function sync_points_and_objects() {
    let point_colors;
    for (let i = 0; i < points.length; i++) {
        point_colors = [];
        for (let cluster in points[i].clusters) {
            point_colors.push(points[i].clusters[cluster].color);
        }

        field.objects[i].colors = (point_colors.length != 0) ? point_colors : ["black"];
        field.objects[i].size = points[i].weight;
    }
}

function import_txt(file) {
    reset();

    const reader = new FileReader();
    reader.onload = function () {
        let lines = reader.result.split("\n").slice(0, -1);
        let x, y, weight, position;
        for (let line of lines) {
            [x, y, weight] = line.split(' ').map(Number);

            position = new Position(x, y);
            set_point(position, weight)
        }
        field.display();
    };
    reader.readAsText(file);
}

function export_txt() {
    let content = "";
    for (let point of points) {
        content += `${point.position.x} ${point.position.y} ${point.weight}\n`;
    }

    var data = new Blob([content], {type: 'text/plain'});
    let a = create_element_a_download(data);

    a.click();
}

function reset() {
    reset_information_field();
    reset_radius();
    reset_clusters_count();
    reset_scale();
    reset_mode();

    field.transform_x = 0;
    field.transform_y = 0;
    
    points = [];
    
    field.clear();
}

function reset_mode() {
    mode = "Set";
    field.canvas.style.cursor = mode_cursor[mode];
    set_point_radio.checked = true;
}

function reset_radius() {
    radius_range.value = 10;
    radius = radius_range.value;
    point_radius_label.innerText = `Point radius: ${radius}`;
}

function reset_clusters_count() {
    cluster_count_range.value = 2;
    cluster_count = cluster_count_range.value;
    cluster_count_label.innerText = `Clusters count: ${cluster_count}`;
}

function reset_scale() {
    scale = 1;
    field.scale = scale;
    set_scale_label.innerText = `Scale: ${scale}`;
}

function reset_information_field() {
    document.getElementById("point_config").remove();

    let div_point_configuration = create_element_div("point_config");
    let header_point_configuration = create_element_h("Point configuration", "point_configuration_h1", 1);
    let p_message = create_element_p('Select "Explore field" mode to view point configurations.', "info_p");

    document.body.appendChild(div_point_configuration);
    div_point_configuration.appendChild(header_point_configuration);
    div_point_configuration.appendChild(p_message);
}

function clusterize() {
    if (points.length < cluster_count) {
        alert("There cannot be more clusters than points");
        return;
    }

    k_means();
    sync_points_and_objects();
    field.display();
}

function set_point(position, weight=radius) {
    let point = new Point(position, weight);
    points.push(point);

    field.createObject(position, "Circle", ["black"], weight);
}

function remove_point(position) {
    let index = field.removeObject(position);
    points = points.slice(0, index).concat(points.slice(index + 1));
}

function create_element_div(id) {
    let div = document.createElement("div");
    div.id = id;
    return div
}

function create_element_h(value, id, level) {
    let h1 = document.createElement(`h${level}`);
    h1.innerText = value;
    h1.id = id;
    return h1;
}

function create_element_p(value, id) {
    let p = document.createElement("p");
    p.innerText = value;
    p.id = id;
    return p;
}

function create_element_label(value, id) {
    let label = document.createElement("label");
    label.innerText = value;
    label.id = id;
    return label;
}

function create_element_a_download(data) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = "points.txt";
    return a;
}

function remove_element(id) {
    document.getElementById(id).remove();
}

//need refactoring
function show_point_configuration(position) {
    let point = points[field.getPointIndexByPositionOrNull(position)];
    if (!point) {
        return;
    }

    remove_element("point_config");

    let div_point_config = create_element_div("point_config")
    let point_header = create_element_h("Point configuration", "point_configuration_h1", 1);
    let position_p = create_element_p("Position: ", "position_p");
    let x_p = create_element_p(`x: ${point.position.x}`, "x_p");
    let y_p = create_element_p(`y: ${point.position.y}`, "y_p");
    let clusters_header = create_element_h("Clusters", "clusters_h", 3);
    let weight_p = create_element_label("Weight: ", "weight_label");

    let weight = document.createElement("input");
    weight.type = "number";
    weight.min = "1";
    weight.max = "50";
    weight.value = point.weight;
    weight.addEventListener("change", function() {
        point.weight = weight.value;
        sync_points_and_objects();
        field.display();
    })

    document.body.appendChild(div_point_config);
    div_point_config.appendChild(point_header);
    div_point_config.appendChild(position_p);
    div_point_config.appendChild(x_p);
    div_point_config.appendChild(y_p);
    div_point_config.appendChild(weight_p);
    div_point_config.appendChild(weight);

    let check = false;
    for (let name in point.clusters) {
        if (point.clusters[name] != null) {
            if (!check) {
                div_point_config.appendChild(clusters_header);
                check = true;
            }

            let cluster_name = create_element_p(`Algorithm: ${name}`, "");
            let center = create_element_p("Center:", "");
            div_point_config.appendChild(cluster_name);
            if (point.clusters[name].position) {
                div_point_config.appendChild(center);
                let x_center = create_element_p(`x: ${point.clusters[name].position.x}`, "");
                div_point_config.appendChild(x_center);
                let y_center = create_element_p(`y: ${point.clusters[name].position.y}`, "");
                div_point_config.appendChild(y_center);
            }
            let color_text = create_element_p(`Cluster color: ${point.clusters[name].color}`, "");
            
            let cluster_color = document.createElement("input");
            cluster_color.type = "color";
            cluster_color.value = point.clusters[name].color;
            cluster_color.addEventListener("change", function() {
                changeClusterColor(point.clusters[name].name, name, cluster_color.value);
                color_text.innerText = "Cluster color: " + cluster_color.value;
            });
            
            div_point_config.appendChild(color_text);
            div_point_config.appendChild(cluster_color);
        }
    }
}

function set_mode(new_mode) {
    mode = new_mode;

    field.canvas.style.cursor = mode_cursor[mode];
    field.display();

    reset_information_field();
}

function update_radius() {
    radius = radius_range.value;
    point_radius_label.innerText = `Point radius: ${radius.toString()}`;
}

function update_epsilon() {
    epsilon = epsilon_range.value;
    epsilon_label.innerText = `Epsilon: ${epsilon.toString()}`;
}

function update_minpts() {
    minPts = minpts_range.value;
    minpts_label.innerText = `minPts: ${minPts.toString()}`;
}

function update_clusters_count() {
    cluster_count = cluster_count_range.value;
    cluster_count_label.innerText = `Clusters count: ${cluster_count.toString()}`;
}

function update_scale() {
    scale = set_scale_range.value;
    field.scale = scale;
    set_scale_label.innerText = `Scale: ${scale}`;
    field.display();
}

function transform(cursor_position) {
    field.transform_x += (cursor_position.x - previous_cursor_position.x);
    field.transform_y += (cursor_position.y - previous_cursor_position.y);

}

field.canvas.addEventListener("click", function(event) {
    let cursor_position = field.getUserClickPosition(event);

    mode_action[mode](cursor_position);
    field.display();
});


field.canvas.addEventListener("mousemove", function(event) {
    field.display();
    let cursor_position = field.getUserClickPosition(event);

    if (translating ) {
        transform(cursor_position);
    }
    previous_cursor_position = cursor_position;

    if (mode =="Set") {
        field.context.beginPath();
        field.context.strokeStyle = "gray";
        field.context.arc(cursor_position.x, cursor_position.y, radius * scale, 0, 2 * Math.PI);
        field.context.stroke();
    }

});

field.canvas.addEventListener("mouseup", function(event) {
    if (event.button == 2) {
        translating = false
    }
});

field.canvas.addEventListener("mousedown", function(event) {
    if (event.button == 2) {
        translating = true
    }
});

minpts_range.addEventListener("input", update_minpts);

epsilon_range.addEventListener("input", update_epsilon);

dbscan_button.addEventListener("click", DBSCAN);

k_means_button.addEventListener("click", clusterize);

radius_range.addEventListener("input", update_radius);

cluster_count_range.addEventListener("input", update_clusters_count);

set_scale_range.addEventListener("input", update_scale);

set_point_radio.addEventListener("input", () => set_mode("Set") );

remove_point_radio.addEventListener("input", () => set_mode("Remove"));

explore_radio.addEventListener("input", () => set_mode("Explore"));

reset_button.addEventListener("click", reset);

export_button.addEventListener("click", export_txt);

import_button.addEventListener("change", (event) => import_txt(event.target.files[0]));