var canvas = document.getElementById("MyCanvas");
var ctx = canvas.getContext("2d");
canvas.width = 800
canvas.height = 600
var myColor = "blue";
var pi = Math.PI;

var route=[]
var towns = []
var isworking = false
let abortController = new AbortController();


let POPULATION_SIZE = 100;
let MUTATION_RATE = 0.05;
let MAX_GENERATIONS = 500;
let ANIMATION_DELAY = 10;

const TOURNAMENT_SIZE = 3

const PATH_COLOR = '#3498db';
const PATH_WIDTH = 3;
let isAnimating = false;
var useAdaptiveMutation = true

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
  const length = towns.length
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
    //window.requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let town of towns) {
        town.draw()
    }

}

function drawPath(route, towns, generation = 0, distance = 0, mutationRate = MUTATION_RATE) {
  if (isAnimating) return;
  isAnimating = true;
  
  animate();
  
  ctx.beginPath();
  ctx.strokeStyle = PATH_COLOR;
  ctx.lineWidth = PATH_WIDTH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  const firstTown = towns[route[0]];
  ctx.moveTo(firstTown.position.x, firstTown.position.y);
  
  for (let i = 1; i < route.length; i++) {
    let town = towns[route[i]];
    
    ctx.lineTo(town.position.x, town.position.y);
    ctx.stroke();
    
  }
    ctx.lineTo(firstTown.position.x, firstTown.position.y);
    ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Поколение: ${generation}`, 20, 30);
  ctx.fillText(`Длина: ${distance.toFixed(2)}`, 20, 50);
  ctx.fillText(`Мутация: ${(mutationRate * 100).toFixed(1)}%`, 20, 70);
  isAnimating = false
}



function createRandomIndividual(cities) {
  const individual = [...Array(cities.length).keys()];
  for (let i = individual.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp = individual[j]
    individual[j] = individual[i]
    individual[i] = temp
  }
  return individual;
}

function initializePopulation(cities) {
  return Array.from({ length: POPULATION_SIZE }, () => createRandomIndividual(cities));
}

function calculateTotalDistance(individual, distanceMatrix) {
  let distance = 0;
  for (let i = 0; i < individual.length - 1; i++) {
    distance += distanceMatrix[individual[i]][individual[i + 1]];
  }
  distance += distanceMatrix[individual[individual.length - 1]][individual[0]];
  return distance;
}

function selectParents(population, distanceMatrix) {
  const parents = [];
  for (let i = 0; i < 2; i++) {
    let best = null;
    let bestDistance = Infinity;
    for (let j = 0; j < TOURNAMENT_SIZE; j++) {
      const candidate = population[Math.floor(Math.random() * population.length)];
      const distance = calculateTotalDistance(candidate, distanceMatrix);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    }
    parents.push(best);
  }
  return parents;
}

function crossover(parent1, parent2) {
  const start = Math.floor(Math.random() * parent1.length);
  const end = Math.floor(Math.random() * (parent1.length - start)) + start;
  const child = new Array(parent1.length).fill(-1);

  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }

  let pointer = 0;
  for (let i = 0; i < parent2.length; i++) {
    if (!child.includes(parent2[i])) {
      while (pointer < child.length && child[pointer] !== -1) pointer++;
      if (pointer >= child.length) break;
      child[pointer] = parent2[i];
    }
  }
  return child;
}

function mutate(individual, mutationRate = MUTATION_RATE) {
  if (Math.random() < mutationRate) {
    let start = Math.floor(Math.random() * (individual.length - 3)) + 1;
    let end = start + Math.floor(Math.random() * (individual.length - start - 2));
    
    let left = start, right = end;
    while (left < right) {
      [individual[left], individual[right]] = [individual[right], individual[left]];
      left++;
      right--;
    }
  }
  return individual;
}

function targetedMutation(route, distanceMatrix, attempts = 100) {
  let bestRoute = [...route];
  let bestDistance = calculateTotalDistance(route, distanceMatrix);
  
  for (let n = 0; n < attempts; n++) {
    const i = Math.floor(Math.random() * (route.length - 3)) + 1;
    const j = Math.floor(Math.random() * (route.length - 3)) + 1;
    
    if (Math.abs(i-j) < 2) continue;
    
    const newRoute = [...route];
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    
    const newDistance = calculateTotalDistance(newRoute, distanceMatrix);
    if (newDistance < bestDistance) {
      bestRoute = newRoute;
      bestDistance = newDistance;
    }
  }
  
  return bestRoute;
}

async function geneticAlgorithm(cities, distanceMatrix, signal) {
  let population = initializePopulation(cities);
  let bestIndividual = null;
  let bestDistance = Infinity;
  let stagnationCounter = 0;
  let currentMutationRate = MUTATION_RATE;

  for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
    if (signal.aborted) {
      console.log("Алгоритм остановлен пользователем");
      return { path: bestIndividual, distance: bestDistance };
    }
    let generationImproved = false;
    const newPopulation = [];

    for (let i = 0; i < POPULATION_SIZE; i++) {
      if (signal.aborted) {
        break
      }
      const [parent1, parent2] = selectParents(population, distanceMatrix);
      let child = crossover(parent1, parent2);
      child = mutate(child, currentMutationRate);
      newPopulation.push(child);

      const distance = calculateTotalDistance(child, distanceMatrix);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndividual = [...child];
        generationImproved = true;
      }
    }

    population = newPopulation;

    if (generationImproved) {
      stagnationCounter = 0;
      currentMutationRate = Math.max(0.01, currentMutationRate * 0.95);
    } else {
      stagnationCounter++;
      if (stagnationCounter > 10) {
        currentMutationRate = Math.min(0.5, currentMutationRate * 1.5);
        stagnationCounter = 0;
      }
    }

    if (generation % 20 === 0 && bestIndividual) {
      const optimized = twoOptOptimize([...bestIndividual], distanceMatrix);
      const optimizedDist = calculateTotalDistance(optimized, distanceMatrix);
      if (optimizedDist < bestDistance) {
        bestIndividual = optimized;
        bestDistance = optimizedDist;
      }
    }

    await drawPath(bestIndividual, cities, generation, bestDistance, currentMutationRate);
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
  }

  bestIndividual = hybridOptimization(bestIndividual, distanceMatrix);
  bestDistance = calculateTotalDistance(bestIndividual, distanceMatrix);
  bestIndividual.push(bestIndividual[0])
  return { path: bestIndividual, distance: bestDistance };

}

function twoOptOptimize(route, distanceMatrix) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length - 1; j++) {
        const current = distanceMatrix[route[i-1]][route[i]] + 
                       distanceMatrix[route[j]][route[j+1]];
        const proposed = distanceMatrix[route[i-1]][route[j]] + 
                         distanceMatrix[route[i]][route[j+1]];
        
        if (proposed < current) {
          const newRoute = [...route];
          let left = i, right = j;
          while (left < right) {
            [newRoute[left], newRoute[right]] = [newRoute[right], newRoute[left]];
            left++;
            right--;
          }
          route = newRoute;
          improved = true;
        }
      }
    }
  }
  return route;
}


function threeOptSwap(route, distanceMatrix) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 4; i++) {
      for (let j = i + 2; j < route.length - 2; j++) {
        for (let k = j + 2; k < route.length - 1; k++) {
          const current = distanceMatrix[route[i-1]][route[i]] 
                        + distanceMatrix[route[j-1]][route[j]]
                        + distanceMatrix[route[k-1]][route[k]];
          
          const variant1 = distanceMatrix[route[i-1]][route[j-1]] 
                         + distanceMatrix[route[i]][route[j]]
                         + distanceMatrix[route[k-1]][route[k]];

          const variant2 = distanceMatrix[route[i-1]][route[j]] 
                         + distanceMatrix[route[j-1]][route[i]]
                         + distanceMatrix[route[k-1]][route[k]];

          if (variant1 < current || variant2 < current) {
            if (variant1 < variant2) {
              route = [...route.slice(0, i), ...route.slice(i, j).reverse(), ...route.slice(j)];
            } else {
              route = [...route.slice(0, i), ...route.slice(j, k), ...route.slice(i, j), ...route.slice(k)];
            }
            improved = true;
          }
        }
      }
    }
  }
  return route;
}

function hybridOptimization(route, distanceMatrix) {
  let optimizedRoute = [...route];
  
  optimizedRoute = threeOptSwap(optimizedRoute, distanceMatrix);
  
  optimizedRoute = targetedMutation(optimizedRoute, distanceMatrix);
  
  optimizedRoute = twoOptOptimize(optimizedRoute, distanceMatrix);
  
  return optimizedRoute;
}


 document.getElementById('findPath').onclick = async function(){
  //-------База-------//
  const button = this
  
  if (isworking) {
    // Останавливать выполнение
    abortController.abort();
    button.value = "Найти путь"
    isworking = false
    abortController = new AbortController()
    return;
  }

  if (towns.length < 2) {
    alert('Добавьте хотя бы 2 города!')
    return;
  }

  isworking = true;
  button.value = "Остановить"
  button.disabled = false



var LengthArr = CreateRoads(towns)
for (let i = 0; i<towns.length; i++) {
route[i] = i
}
//---------------------------//

 try {
    const LengthArr = CreateRoads(towns);
    const result = await geneticAlgorithm(towns, LengthArr, abortController.signal);
    console.log("Лучший путь:", result.path);
    console.log("Длина:", result.distance);
    alert("Лучший путь: " + result.path + "\nДлина: " + result.distance)
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Ошибка:", error);
    }
  } finally {
    if (!abortController.signal.aborted) {
      button.value = "Найти путь";
      isworking = false;
    }
  }

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

document.getElementById('populationSlider').addEventListener('input', function() {
  POPULATION_SIZE = parseInt(this.value);
  document.getElementById('populationValue').textContent = POPULATION_SIZE;
});

document.getElementById('mutationSlider').addEventListener('input', function() {
  MUTATION_RATE = parseFloat(this.value) / 100;
  document.getElementById('mutationValue').textContent = this.value + '%';
});

document.getElementById('generationsSlider').addEventListener('input', function() {
  MAX_GENERATIONS = parseInt(this.value);
  document.getElementById('generationsValue').textContent = MAX_GENERATIONS;
});

document.getElementById('delaySlider').addEventListener('input', function() {
  ANIMATION_DELAY = parseInt(this.value);
  document.getElementById('delayValue').textContent = ANIMATION_DELAY;
});


document.getElementById('clearAll').onclick = function(){
  if (isworking){
    alert('Сперва остановите выполнение')
    return
  }
  ctx.beginPath();
  towns.splice(0, towns.length)
  ctx.clearRect(0, 0, 800, 600);
}

