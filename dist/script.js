import {Ease} from 'https://assets.codepen.io/3919397/ease.js';
import {Utils} from 'https://assets.codepen.io/3919397/utilities.js';

let gui, canvas, c, width, height, id, ease, shapes, size, scale, number, gridNumber, maxDist, circlePoints, trianglePoints, squarePoints, hexPoints;

const setupGui = () => {
  gui = new dat.GUI();
  
  gui.params = {
    timeScale: 0.0003,
    ease: 'easeInSine',
    gridNumber: 3,
    number: 36,
    size: 200,
    particleSize: 12,
    start: () => start(),
    stop: () => stop()
  };

  gui.ctrls = {
    timeScale: gui.add(gui.params, 'timeScale', 0.0001, 0.005, 0.0001),
    ease: gui.add(gui.params, 'ease', Ease.returnEaseType())
      .onChange(() => initialize()),
    gridNumber: gui.add(gui.params, 'gridNumber', 1, 30, 1)
      .onChange(() => initialize()),
    number: gui.add(gui.params, 'number', 1, 360, 1)
      .onChange(() => initialize()),
    size: gui.add(gui.params, 'size', 1, 500, 1)
      .onChange(() => initialize()),
    particleSize: gui.add(gui.params, 'particleSize', 1, 50),
    start: gui.add(gui.params, 'start'),
    stop: gui.add(gui.params, 'stop')
  };
  
  gui.close();
};

const setupCanvas = () => {
  canvas = document.createElement('canvas');
  document.getElementsByTagName('body')[0].appendChild(canvas);
  c = canvas.getContext('2d');
};

const initialize = () => {
  if (id) {
    cancelAnimationFrame(id);
  }

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  ease = Ease.returnEaseFunc(gui.params.ease);
  
  size = gui.params.size;
  gridNumber = gui.params.gridNumber;
  number = gui.params.number;
  maxDist = 0;
  
  circlePoints = getPolygonPoints(number, 36);
  trianglePoints = getPolygonPoints(number, 3);
  squarePoints = getPolygonPoints(number, 4)
  hexPoints = getPolygonPoints(number, 6);
  
  draw(0);
};

const getPolygonPoints = (number, poly) => {
  const tmp = new Array();
  
  for (let j = 0; j < poly; j++) {
    for (let i = 0; i < number / poly; i++) {
      const x = Math.cos(j / poly * Math.PI * 2);
      const y = Math.sin(j / poly * Math.PI * 2);
      
      let nx, ny;
      
      if (j === poly - 1) {
        nx = Math.cos(0);
        ny = Math.sin(0);
      } else {
        nx = Math.cos((j + 1) / poly * Math.PI * 2);
        ny = Math.sin((j + 1) / poly * Math.PI * 2);
      }
      
      const sx = x + (nx - x) * (i / (number / poly));
      const sy = y + (ny - y) * (i / (number / poly));
      
      tmp.push([sx, sy]);
    } 
  }
  
  return tmp;
};

const getNewPoints = (scaledT) => {
  const tmp = new Array();
  
  for (let i = 0; i < number; i++) {
    let x, y;
    
    if (scaledT < 0.125) {
      x = Utils.map(scaledT, 0, 0.125, circlePoints[i][0], circlePoints[i][0]);
      y = Utils.map(scaledT, 0, 0.125, circlePoints[i][1], circlePoints[i][1]);
    } else if (scaledT >= 0.125 && scaledT < 0.25) {
      x = Utils.map(scaledT, 0.125, 0.25, circlePoints[i][0], trianglePoints[i][0]);
      y = Utils.map(scaledT, 0.125, 0.25, circlePoints[i][1], trianglePoints[i][1]);
    } else if (scaledT >= 0.25 && scaledT < 0.375) {
      x = Utils.map(scaledT, 0.25, 0.375, trianglePoints[i][0], trianglePoints[i][0]);
      y = Utils.map(scaledT, 0.25, 0.375, trianglePoints[i][1], trianglePoints[i][1]);
    } else if (scaledT >= 0.375 && scaledT < 0.5) {
      x = Utils.map(scaledT, 0.375, 0.5, trianglePoints[i][0], squarePoints[i][0]);
      y = Utils.map(scaledT, 0.375, 0.5, trianglePoints[i][1], squarePoints[i][1]);
    } else if (scaledT >= 0.5 && scaledT < 0.625) {
      x = Utils.map(scaledT, 0.5, 0.625, squarePoints[i][0], squarePoints[i][0]);
      y = Utils.map(scaledT, 0.5, 0.625, squarePoints[i][1], squarePoints[i][1]);
    } else if (scaledT >= 0.625 && scaledT < 0.75) {
      x = Utils.map(scaledT, 0.625, 0.75, squarePoints[i][0], hexPoints[i][0]);
      y = Utils.map(scaledT, 0.625, 0.75, squarePoints[i][1], hexPoints[i][1]);
    } else if (scaledT >= 0.75 && scaledT < 0.875) {
      x = Utils.map(scaledT, 0.75, 0.875, hexPoints[i][0], hexPoints[i][0]);
      y = Utils.map(scaledT, 0.75, 0.875, hexPoints[i][1], hexPoints[i][1]);
    } else {
      x = Utils.map(scaledT, 0.875, 1, hexPoints[i][0], circlePoints[i][0]);
      y = Utils.map(scaledT, 0.875, 1, hexPoints[i][1], circlePoints[i][1]);
    }
    
    tmp.push([x, y]);
  }
  
  return tmp;
};

const drawShape = (newPt, x, y, size, scaledT, color) => {
  c.save();
  
  c.fillStyle = color;
  
  c.translate(x, y);
  
  let angle = 0;
  if (scaledT < 0.125) {
    angle = Utils.map(scaledT, 0, 0.125, 0, 0);
  } else if (scaledT >= 0.125 && scaledT < 0.25) {
    angle = Utils.map(scaledT, 0.125, 0.25, 0, Math.PI / 6);
  } else if (scaledT >= 0.25 && scaledT < 0.375) {
    angle = Utils.map(scaledT, 0.25, 0.375, Math.PI / 6, Math.PI / 6);
  } else if (scaledT >= 0.375 && scaledT < 0.5) {
    angle = Utils.map(scaledT, 0.375, 0.5, Math.PI / 6, Math.PI / 2);
  } else if (scaledT >= 0.5 && scaledT < 0.625) {
    angle = Utils.map(scaledT, 0.5, 0.625, Math.PI / 2, Math.PI / 2);
  } else if (scaledT >= 0.625 && scaledT < 0.75) {
    angle = Utils.map(scaledT, 0.625, 0.75, Math.PI / 2, Math.PI / 2 + Math.PI / 3);
  } else if (scaledT >= 0.75 && scaledT < 0.875) {
    angle = Utils.map(scaledT, 0.75, 0.875, Math.PI / 2 + Math.PI / 3, Math.PI / 2 + Math.PI / 3);
  } else {
    angle = Utils.map(scaledT, 0.875, 1, Math.PI / 2 + Math.PI / 3, Math.PI / 2 + Math.PI / 3);
  }
  c.rotate(angle);
  
  c.translate(-x, -y);
  
  for (let i = 0; i < newPt.length; i++) {
    c.beginPath();
    c.arc(newPt[i][0] * size + x, newPt[i][1] * size + y, gui.params.particleSize, 0, Math.PI * 2, false);
    c.fill();
  }
  
  c.restore();
};

const draw = (t) => {
  t *= gui.params.timeScale;
  
  c.save();
  c.clearRect(0, 0, width, height);
  c.translate(width / 2, height / 2);
  
  c.globalCompositeOperation = 'lighter';
  
  let color;
  
  for (let j = 0; j < 3; j++) {
    if (j === 0) color = "#FF0000";
    if (j === 1) color = "#00FF00";
    if (j === 2) color = "#0000FF";
    
    let scaledT = (t - j / 3 * 0.03) % 1;
    scaledT = ease(Math.abs(scaledT));

    const newPt = getNewPoints(scaledT);

    drawShape(newPt, 0, 0, size, scaledT, color);

  }
  
  c.restore();
  
  id = requestAnimationFrame(draw);
};

const start = () => {
  initialize();
};

const stop = () => {
  if (id) {
    cancelAnimationFrame(id);
    id = null;
  }
};

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    console.clear();

    setupGui();
    setupCanvas();
    
    initialize();
  });

  window.addEventListener('resize', () => {
    initialize();
  });
})();