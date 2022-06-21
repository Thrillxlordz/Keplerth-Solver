

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

function draw() {

}
