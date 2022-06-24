let canvasX
let canvasY
let backgroundColor
let scalar
let verticalSpacing
let horizontalSpacing
let hexagons
let unselectedColor
let selectedColor
let settingSelected = false
let mouseIsPressed = false
let shapes
let solutionGrid

function setup() {
  canvasX = windowWidth * 0.95
  canvasY = windowHeight * 0.84
  let myCanvas = createCanvas(canvasX, canvasY)
  myCanvas.parent("#canvas")
  backgroundColor = window.getComputedStyle(document.getElementById("canvas")).getPropertyValue('background-color')
  background(backgroundColor)
  
  textSize(canvasX / 40)
  textAlign(RIGHT)

  scalar = min(canvasX, canvasY) / 4000
  verticalSpacing = scalar * 300
  horizontalSpacing = scalar * 300

  unselectedColor = color(50, 50, 50, 255)
  selectedColor = color(0, 0, 200, 100)

  hexagons = []
  for (let i = 0; i < 7; i++) {
    hexagons.push([])
    for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
      hexagons[i].push(new hexagon(canvasX/4 + (j-2)*horizontalSpacing - (3-Math.abs(3-i))*horizontalSpacing/2, canvasY/2 + (i-3)*verticalSpacing, scalar))
    }
  }

  shapes = []
}

function draw() {
  background(backgroundColor)

  // while the mouse is held, update hexes as you scroll over them
  if (mouseIsPressed) {
    hexagons.forEach(row => row.forEach(hex => {
      if (Math.abs(mouseX - hex.x) < horizontalSpacing / 2 && Math.abs(mouseY - hex.y) < verticalSpacing / 2) {
        hex.isSelected = settingSelected
      }
    }))
  }

  hexagons.forEach(row => row.forEach(hex => hex.drawHexagon()))
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].drawShape(i)
  }

  // Draws the grid that the saved shapes are put into
  strokeWeight(3)
  noFill()
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      rect(canvasX * (0.5 + 0.1 * i),canvasY * (0.15 + 0.15 * j), canvasX * 0.1, canvasY * 0.15)
    }
  }

  stroke(1)
  strokeWeight(1)
  let numHexes = 0
  shapes.forEach(obj => numHexes += obj.xIndex.length)
  hexagons.forEach(row => row.forEach(hex => {
    if (hex.isSelected) {
      numHexes++
    }
  }))
  if (numHexes <= 44) {
    fill(0)
  } else {
    fill(color(255, 0, 0))
  }
  text(numHexes + " / 44", 0, canvasY * 0.85, canvasX / 4 + horizontalSpacing)

}

// saves the currently drawn shape to savedShapes
function saveShape() {
  let newShape = new shape()
  let hasHexes = false
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
      if (hexagons[i][j].isSelected) {
        newShape.xIndex.push(j)
        newShape.yIndex.push(i)
        hexagons[i][j].isSelected = false
        hasHexes = true
      }
    }
  }
  if (!hasHexes) {
    return
  }
  shapes.push(newShape)
}

// clears the saved shapes
function clearShapes() {
  hexagons = []
  for (let i = 0; i < 7; i++) {
    hexagons.push([])
    for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
      hexagons[i].push(new hexagon(canvasX/4 + (j-2)*horizontalSpacing - (3-Math.abs(3-i))*horizontalSpacing/2, canvasY/2 + (i-3)*verticalSpacing, scalar))
    }
  }
  shapes = []
}

// finds a valid solution for the given shapes
function solveShapes() {
  // sorts the shapes array
  shapes.sort((a, b) => b.xIndex.length - a.xIndex.length)
  shapes.forEach(obj => {
    let yShift = obj.yIndex[0]
    for (let i = 0; i < obj.xIndex.length; i++) {
      for (let j = 0; j < yShift; j++) {
        if (obj.yIndex[i] > 3) {
          obj.xIndex[i]++
        }
        obj.yIndex[i]--
      }
    }
    let xShift = obj.xIndex[0]
    for (let i = 0; i < obj.xIndex.length; i++) {
      obj.xIndex[i] -= xShift
    }
  })

  solutionGrid = []
  for (let i = 0; i < 7; i++) {
    solutionGrid.push([])
    for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
      solutionGrid[i].push(0)
    }
  }
  if (recursiveSolver(0)) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
        hexagons[i][j].sol = solutionGrid[i][j]
      }
    }
  }
}

// first shape, place it, then go down a level in recursion, and start at second shape until you reach the last shape in shapes
function recursiveSolver(ind) {

  if (ind >= shapes.length) {
    return true
  }

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 8 - Math.abs(i - 3); j++) {
      if (withinBoundaries(shapes[ind], j, i) && notOverlapping(shapes[ind], j, i)) {
        //place the solution
        updateSolution(shapes[ind], j, i, ind + 1)

        if (recursiveSolver(ind + 1)) {
          return true
        } else {
          // unplace the solution
          updateSolution(shapes[ind], j, i, 0)
        }
      }
    }
  }
  return false
}

// changes the current solutionGrid, adding/removing a shape
function updateSolution(obj, xOffset, yOffset, ind) {
  for (let i = 0; i < obj.xIndex.length; i++) {
    let xVal = obj.xIndex[i] + xOffset
    let yVal = obj.yIndex[i] + yOffset
    xVal -= max(0, (yVal - 3 - max(0, yVal - yOffset - 3)))
    solutionGrid[yVal][xVal] = ind
  }
}

// Checks if a given shape is within the boundaries of the grid
function withinBoundaries(obj, xOffset, yOffset) {
  let isValid = true;
  for (let i = 0; i < obj.xIndex.length; i++) {
    let xVal = obj.xIndex[i] + xOffset
    let yVal = obj.yIndex[i] + yOffset
    xVal -= max(0, (yVal - 3 - max(0, yVal - yOffset - 3)))
    let rowLength = 8 - Math.abs(yVal - 3)
    
    if (xVal < 0) {
      isValid = false
    }
    if (xVal >= rowLength) {
      isValid = false
    }
    if (yVal < 0) {
      isValid = false
    }
    if (yVal >= 7) {
      isValid = false
    }
  }
  return isValid
}

// Checks if a given shape is overlapping with other shapes in the solutionGrid
function notOverlapping(obj, xOffset, yOffset) {
  let isValid = true;
  for (let i = 0; i < obj.xIndex.length; i++) {
    let xVal = obj.xIndex[i] + xOffset
    let yVal = obj.yIndex[i] + yOffset
    xVal -= max(0, (yVal - 3 - max(0, yVal - yOffset - 3)))
    if (solutionGrid[yVal][xVal] != 0) {
      isValid = false
    }
  }
  return isValid
}

// on mouse press
function mousePressed() {
  if (mouseX < 0 || mouseX > canvasX || mouseY < 0 || mouseY > canvasY) {
    return
  }

  hexagons.forEach(row => row.forEach(hex => {
    if (Math.abs(mouseX - hex.x) < horizontalSpacing / 2 && Math.abs(mouseY - hex.y) < verticalSpacing / 2) {
      mouseIsPressed = true
      hex.isSelected = !hex.isSelected
      settingSelected = hex.isSelected
    }
  }))
}

// on mouse release
function mouseClicked() {
  mouseIsPressed = false;
}

// A collection of hexes
class shape {
  constructor(xIndex = [], yIndex = []) {
    this.xIndex = xIndex
    this.yIndex = yIndex
    this.drawShape = function(index) {
      stroke(0)
      strokeWeight(150)
      noFill()
      push()
      translate(canvasX * (0.51 + 0.1 * (index % 5)),canvasY * (0.17 + 0.15 * Math.floor(index / 5)))
      scale(scalar / 4)
      beginShape(POINTS)
      for (let i = 0; i < xIndex.length; i++) {
        vertex(xIndex[i]*300 + Math.abs(3-yIndex[i])*150, yIndex[i]*300)
      }
      endShape()
      pop()
    }
  }
}

// The object for each hex
class hexagon {
  constructor(x, y, s, isSelected = false, sol = -1) {
    this.x = x
    this.y = y
    this.s = s
    this.isSelected = isSelected
    this.sol = sol
    this.drawHexagon = function() {
      stroke(0)
      strokeWeight(15)
      if (this.isSelected) {
        fill(selectedColor)
      } else if (this.sol >= 0) {
        //fill((255.0 / shapes.length) * this.sol)
        fill(color(((200 / shapes.length) * this.sol) % 255, ((200 / shapes.length) * this.sol * 3) % 255, ((200 / shapes.length) * this.sol * 5) % 255))
      } else {
        fill(unselectedColor)
      }
      push()
      translate(this.x, this.y)
      scale(this.s)
      beginShape()
      vertex(0, -150)
      vertex(130, -75)
      vertex(130, 75)
      vertex(0, 150)
      vertex(-130, 75)
      vertex(-130, -75)
      endShape(CLOSE)
      pop()
    }
  }
}