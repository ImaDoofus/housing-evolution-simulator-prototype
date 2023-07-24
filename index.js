import Command from "./js/Command.js";
import Terrain from "./js/terrain.js";

const table = document.getElementById("command-fitness-ranking-table");
const hoveredCommandID = document.getElementById("hovered-command-id");
const hoveredCommandFitness = document.getElementById(
  "hovered-command-fitness"
);
const hoveredCommandText = document.getElementById("hovered-command-text");
const hoveredCommandGeneration = document.getElementById(
  "hovered-command-generation"
);
const populationCount = document.getElementById("population-count");

const simulationIteration = document.getElementById("simulation-iteration");
const simulationGeneration = document.getElementById("simulation-generation");
const simulationLikenessToTarget = document.getElementById(
  "simulation-likeness-to-target"
);

const TERRAIN_SIZE = 100;
Command.TERRAIN_SIZE = TERRAIN_SIZE;
const CANVAS_UPSCALE = 4.5;
const targetCanvas = document.getElementById("target-canvas");
const currentCanvas = document.getElementById("current-canvas");

const imageUpload = document.getElementById("image-upload");

targetCanvas.style.width =
  targetCanvas.style.height =
  currentCanvas.style.width =
  currentCanvas.style.height =
    TERRAIN_SIZE * CANVAS_UPSCALE + "px";

targetCanvas.width =
  targetCanvas.height =
  currentCanvas.width =
  currentCanvas.height =
    TERRAIN_SIZE;

const targetTerrain = new Terrain(TERRAIN_SIZE);
const currentTerrain = new Terrain(TERRAIN_SIZE);

function drawTerrainToCanvas(terrain, canvas) {
  const ctx = canvas.getContext("2d");
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let z = 0; z < TERRAIN_SIZE; z++) {
      const hasBlock = terrain.getBlock(x, z);
      ctx.fillStyle = hasBlock ? "black" : "white";
      ctx.fillRect(x, z, 1, 1);
    }
  }
}

imageUpload.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const ctx = targetCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, TERRAIN_SIZE, TERRAIN_SIZE);
      for (let x = 0; x < TERRAIN_SIZE; x++) {
        for (let z = 0; z < TERRAIN_SIZE; z++) {
          const pixelData = ctx.getImageData(x, z, 1, 1).data;
          const isBlack =
            (pixelData[0] + pixelData[1] + pixelData[2]) / 3 < 128;
          targetTerrain.setBlock(x, z, isBlack ? 1 : 0);
        }
      }
      resetPopulation();
      test();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

const TERRAIN_FREQUENCY = 100;

noise.seed(Math.random());

function generatePerlinTerrain(terrain) {
  for (let x = 0; x < TERRAIN_SIZE; x++) {
    for (let z = 0; z < TERRAIN_SIZE; z++) {
      const value = noise.simplex2(
        x / TERRAIN_FREQUENCY,
        z / TERRAIN_FREQUENCY
      );
      if (value > 0) {
        terrain.setBlock(x, z, 1);
      }
    }
  }
  resetPopulation();
  test();
}

const POPULATION_SIZE = 69;

let population = [];
function resetPopulation() {
  population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const command = Command.generateRandom(TERRAIN_SIZE);
    command.calculateFitness(currentTerrain, targetTerrain);
    population.push(command);
  }
}

function addTableRow(command) {
  //   const row = table.insertRow(-1);
  //   row.onmouseover = () => {
  //     previewCommandOnCanvas(command, currentTerrain, currentCanvas);
  //     hoveredCommandID.innerHTML = command.id;
  //     hoveredCommandFitness.innerHTML = command.fitness;
  //     hoveredCommandText.innerHTML = command.toString();
  //     hoveredCommandGeneration.innerHTML = command.generation;
  //   };
  //   const commandText = row.insertCell(0);
  //   const fitnessText = row.insertCell(1);
  //   commandText.innerHTML = command.toString();
  //   fitnessText.innerHTML = command.fitness;
}

function renderCanvases() {
  drawTerrainToCanvas(targetTerrain, targetCanvas);
  drawTerrainToCanvas(currentTerrain, currentCanvas);

  //   render the most fit command
  const command = population[0];
  const ctx = currentCanvas.getContext("2d");
  ctx.fillStyle = command.block
    ? "rgba(0, 100, 0, 0.8)"
    : "rgba(0, 100, 0, 0.2)";
  ctx.fillRect(
    command.x1,
    command.z1,
    command.x2 - command.x1,
    command.z2 - command.z1
  );
}

function previewCommandOnCanvas(command) {
  renderCanvases();

  const ctx = currentCanvas.getContext("2d");
  ctx.fillStyle = command.block
    ? "rgba(100, 0, 0, 0.8)"
    : "rgba(100, 0, 0, 0.2)";
  ctx.fillRect(
    command.x1,
    command.z1,
    command.x2 - command.x1,
    command.z2 - command.z1
  );
}

const MUTATION_RATE = 0.1;
const MUTATION_AMOUNT = 5;
const SURVIVAL_THRESHOLD = 0.1;

function simulateGeneration() {
  const survivalCount = Math.floor(POPULATION_SIZE * SURVIVAL_THRESHOLD);
  population = population.slice(0, survivalCount);

  for (let i = 0; i < POPULATION_SIZE - survivalCount; i++) {
    if (Math.random() < 0.5) {
      const command = Command.generateRandom(TERRAIN_SIZE);
      command.calculateFitness(currentTerrain, targetTerrain);
      population.push(command);
    } else {
      const command = population[i].reproduce();
      command.mutate(MUTATION_RATE, MUTATION_AMOUNT);
      command.calculateFitness(currentTerrain, targetTerrain);
      population.push(command);
    }
  }

  populationCount.innerHTML = population.length;
  table.innerHTML = "";
  population.sort((a, b) => b.fitness - a.fitness);
  population.forEach((command) => addTableRow(command));

  simulationGeneration.innerHTML = parseInt(simulationGeneration.innerHTML) + 1;
}

const previousGeneration = document.getElementById("prev");
const nextGeneration = document.getElementById("next");

nextGeneration.onclick = () => {
  simulateGeneration();
  renderCanvases();
};

const executeCommand = document.getElementById("execute");
executeCommand.onclick = () => {
  const command = population[0];
  currentTerrain.setRegion(
    command.x1,
    command.z1,
    command.x2,
    command.z2,
    command.block
  );
  renderCanvases();

  simulationIteration.innerHTML = parseInt(simulationIteration.innerHTML) + 1;
  simulationGeneration.innerHTML = 0;

  resetPopulation();

  const likenessPercent =
    currentTerrain.getLikeness(targetTerrain) / (TERRAIN_SIZE * TERRAIN_SIZE);
  simulationLikenessToTarget.innerHTML = likenessPercent;
};

// let generations = 0;
// let iterations = 0;
// let interval = setInterval(() => {
//   nextGeneration.click();
//   generations++;
//   if (generations > 50) {
//     generations = 0;
//     executeCommand.click();
//     iterations++;
//     if (iterations >= 500) {
//       clearInterval(interval);
//     }
//   }
// }, 2);
let generations = 0;
let iterations = 0;
const test = () => {
  nextGeneration.click();
  generations++;
  if (generations > 100) {
    generations = 0;
    executeCommand.click();
    iterations++;
    if (iterations >= 250) {
      return;
    }
  }
  setTimeout(test, 0);
};

// do new generations as fast as possible for 3 seconds then execute the best command
// let generations = 0;
// let start = Date.now();
// const test = () => {
//   nextGeneration.click();
//   generations++;
//   if (Date.now() - start > 3000) {
//     start = Date.now();
//     executeCommand.click();
//     generations = 0;
//   }
//   setTimeout(test, 0);
// };

// generatePerlinTerrain(targetTerrain);
