let nums
let notPrimeColor = [255, 0, 0]
let primeColor = [0, 0, 255]
let fps = 30
let numberFont = 50
let numSpacing
let epsilon = 0.0001
let gridSize = 20
let nextNum
let dir
let delayedLeftTurn
let startingSpot

function setup() {
  canvasX = windowWidth * 0.95
  canvasY = windowHeight * 0.84
  let myCanvas = createCanvas(canvasX, canvasY)
  myCanvas.parent("#canvas")
  backgroundColor = window.getComputedStyle(document.getElementById("canvas")).getPropertyValue('background-color')
  background(backgroundColor)

  strokeWeight(1)
  changeFrameRate(fps)
  textFont('courier')
  textAlign('center', 'center')

  initializeObjects()
}

function changeFrameRate(newFPS) {
  console.log(newFPS)
  setFrameRate(newFPS)
}

function initializeObjects() {
  numSpacing = textWidth('A') // finds the pixel width of a character
  notPrimeColor = color(notPrimeColor[0], notPrimeColor[1], notPrimeColor[2], 255)
  primeColor = color(primeColor[0], primeColor[1], primeColor[2], 255)
  nums = []
  nums.push(new number(createVector(canvasX / 2, canvasY / 2), 1, color(notPrimeColor.levels[0], notPrimeColor.levels[1], notPrimeColor.levels[2], notPrimeColor.levels[3])))
  nums[0].fontSize = numberFont * numSpacing / gridSize / getFontAdjustment(nums[0].value)
  startingSpot = createVector(nums[0].spot.x, nums[0].spot.y)
  nums[0].draw()
  nums.push(new number(createVector(canvasX / 2 + gridSize, canvasY / 2), 2, color(primeColor.levels[0], primeColor.levels[1], primeColor.levels[2], primeColor.levels[3]), true))
  nums[1].fontSize = numberFont * numSpacing / gridSize / getFontAdjustment(nums[1].value)
  nextNum = 3
  dir = createVector(0, -gridSize)
}

function draw() {
  background(backgroundColor)
  for (let i = nums.length - 1; i >= 0; i--) {
    nums[i].draw()
    if (!nums[i].prime) {
      nums[i].color = color(nums[i].color.levels[0], nums[i].color.levels[1], nums[i].color.levels[2], nums[i].color.levels[3] - 1)
      if (nums[i].color.levels[3] <= 0) {
        nums.splice(i, 1)
      }
    } else {
      nums[i].color = color(nums[i].color.levels[0] - 1, nums[i].color.levels[1] - 1, nums[i].color.levels[2] - 1, nums[i].color.levels[3])
    }
  }

  let prevNum = nums[nums.length - 1]
  if (delayedLeftTurn) {
    dir = createVector(0, -gridSize)
    delayedLeftTurn = false
  } else if ((prevNum.spot.x - startingSpot.x) == (prevNum.spot.y - startingSpot.y)) {
    if (prevNum.spot.x > startingSpot.x) {
      // The previous number was in the Bottom Right Corner
      delayedLeftTurn = true
    } else {
      // The previous number was in the Top Left Corner
      dir = createVector(0, gridSize)
    }
  } else if ((prevNum.spot.x - startingSpot.x) == (startingSpot.y - prevNum.spot.y)) {
    if (prevNum.spot.x > startingSpot.x) {
      // The previous number was in the Top Right Corner
      dir = createVector(-gridSize, 0)
    } else {
      // The previous number was in the Bottom Left Corner
      dir = createVector(gridSize, 0)
    }
  }

  nums.push(new number(createVector(prevNum.spot.x, prevNum.spot.y), nextNum))
  nums[nums.length - 1].fontSize = numberFont * numSpacing / gridSize / getFontAdjustment(nums[nums.length - 1].value)
  nums[nums.length - 1].spot.add(dir)

  if (nextNum % 2 == 0 || !isPrime(nextNum)) {
    nums[nums.length - 1].color = color(notPrimeColor.levels[0], notPrimeColor.levels[1], notPrimeColor.levels[2], notPrimeColor.levels[3])
  } else {
    nums[nums.length - 1].color = color(primeColor.levels[0], primeColor.levels[1], primeColor.levels[2], primeColor.levels[3])
    nums[nums.length - 1].prime = true
  }

  nextNum++
}

function isPrime(num) {
  let noFactors = true
  for (let i = 3; i * i <= num; i += 2) {
    if (num % i == 0) {
      noFactors = false
      break
    }
  }
  return noFactors
}

function getFontAdjustment(num) {
  if (num < 10) {
    return 1
  } else {
    return 0.4 + getFontAdjustment(num / 10)
  }
}

class number {
  constructor(spot = 0, value = -1, color = -1, prime = false, fontSize = numberFont) {
    this.spot = spot
    this.value = value
    this.color = color
    this.prime = prime
    this.fontSize = fontSize
    this.draw = function() {
      stroke(0)
      fill(0, 0)
      rect(this.spot.x - gridSize / 2, this.spot.y - gridSize / 2, gridSize, gridSize, 5)
      stroke(this.color)
      fill(this.color)
      textSize(this.fontSize)
      text(this.value, this.spot.x, this.spot.y)
    }
  }
}
