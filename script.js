const container = document.getElementById('container');
const nodes = Array.from(document.getElementsByClassName('node'));
const verticalLine = document.getElementById('verticalLine');
const horizontalLine = document.getElementById('horizontalLine');

let activeNode = null;
let offsetX, offsetY;

nodes.forEach(node => {
  node.addEventListener('mousedown', onMouseDown);
});

function onMouseDown(event) {
  activeNode = event.target;
  offsetX = event.offsetX;
  offsetY = event.offsetY;
  activeNode.style.cursor = 'grabbing';

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event) {
  if (!activeNode) return;

  const containerRect = container.getBoundingClientRect();
  let x = event.clientX - containerRect.left - offsetX;
  let y = event.clientY - containerRect.top - offsetY;

  activeNode.style.left = `${x}px`;
  activeNode.style.top = `${y}px`;

  showAlignmentLines(activeNode, x, y);
}

function onMouseUp(event) {
  if (!activeNode) return;

  snapToClosestElementOrEdge(activeNode);
  hideAlignmentLines();
  activeNode.style.cursor = 'grab';
  activeNode = null;

  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

function showAlignmentLines(node, x, y) {
  const closestPoints = calculateClosestPoints(node, x, y);
  const containerRect = container.getBoundingClientRect();

  if (closestPoints.horizontal !== null) {
    horizontalLine.style.top = `${closestPoints.horizontal}px`;
    horizontalLine.style.display = 'block';
  } else {
    horizontalLine.style.display = 'none';
  }

  if (closestPoints.vertical !== null) {
    verticalLine.style.left = `${closestPoints.vertical}px`;
    verticalLine.style.display = 'block';
  } else {
    verticalLine.style.display = 'none';
  }
}

function hideAlignmentLines() {
  verticalLine.style.display = 'none';
  horizontalLine.style.display = 'none';
}

function calculateClosestPoints(node, x, y) {
  const snappingPoints = [];
  const containerWidth = 800;
  const containerHeight = 600;
  const nodeCenterX = x + node.offsetWidth / 2;
  const nodeCenterY = y + node.offsetHeight / 2;

  snappingPoints.push({ x: containerWidth / 2, y: nodeCenterY });
  snappingPoints.push({ x: nodeCenterX, y: containerHeight / 2 }); 


  nodes.forEach(otherNode => {
    if (otherNode !== node) {
      const otherNodeCenterX = otherNode.offsetLeft + otherNode.offsetWidth / 2;
      const otherNodeCenterY = otherNode.offsetTop + otherNode.offsetHeight / 2;
      snappingPoints.push({ x: otherNodeCenterX, y: otherNodeCenterY }); 
    }
  });

  let closestHorizontal = null;
  let closestVertical = null;
  let minHorizontalDistance = Infinity;
  let minVerticalDistance = Infinity;

  snappingPoints.forEach(point => {
    const horizontalDistance = Math.abs(nodeCenterY - point.y);
    const verticalDistance = Math.abs(nodeCenterX - point.x);

    if (horizontalDistance < minHorizontalDistance) {
      minHorizontalDistance = horizontalDistance;
      closestHorizontal = point.y;
    }

    if (verticalDistance < minVerticalDistance) {
      minVerticalDistance = verticalDistance;
      closestVertical = point.x;
    }
  });

  return {
    horizontal: closestHorizontal,
    vertical: closestVertical
  };
}

function snapToClosestElementOrEdge(node) {
  const closestPoints = calculateClosestPoints(node, parseInt(node.style.left), parseInt(node.style.top));
  const nodeCenterX = parseInt(node.style.left) + node.offsetWidth / 2;
  const nodeCenterY = parseInt(node.style.top) + node.offsetHeight / 2;

  if (closestPoints.horizontal !== null) {
    node.style.top = `${closestPoints.horizontal - node.offsetHeight / 2}px`;
  }

  if (closestPoints.vertical !== null) {
    node.style.left = `${closestPoints.vertical - node.offsetWidth / 2}px`;
  }
}