let divs, lock

let state = {
  Spacing: { display: 'range', value: 200, min: 10, max: 1000, onChange: setup, listen: true },
  Shift: { display: 'range', value: 300, min: 0, max: 1000, onChange: setup, listen: true },
  DrawSize: { display: 'range', value: 10, min: 1, max: 100, listen: true },
  Reflections: { display: 'range', value: 6, min: 1, max: 50, listen: true },
  Stagger: { value: true, listen: true, onChange: setup },
  reflectColor: { value: false, listen: true, onChange: setup },
  color1: { display: 'color', value: '#00ccff' },
  color2: { display: 'color', value: '#ff0096' },
  Clear: { value: setup }
}

state = guiGlue(state, { folded: true })

// Nice clearing Functions
function doubleClicked() {
  setup()
}

function deviceShaken() {
  setup()
}

function setup() {
  divs = []
  lock = []
  createCanvas(innerWidth, innerHeight)
  background(10)
  let spacing = state.Spacing / 4
  // Makes the points
  for (let i = spacing - state.Shift; i < width + state.Shift; i += state.Spacing / 1.15) {
    let r = []
    for (let j = spacing - state.Shift; j < height + state.Shift; j += state.Spacing) { r.push(createVector(i, j)) }
    divs.push(r)
  }
  // Staggers the points
  if (state.Stagger) {
    for (let i = 0; i < divs.length; i++) {
      const r = divs[i]
      if (i % 2 == 0) { r.forEach(d => d.y += state.Spacing / 2) }
    }
  }
  angleMode(DEGREES)
}

// Draw the points on top of all
function draw() {
  divs.forEach(r => r.forEach(d => ellipse(d.x, d.y, 10, 10)))
}

// Lock mouse onto closest point
function mousePressed() {
  // Locks the drawing to one point of origin
  lock = findPoint(mouseX, mouseY)
}

// Draw the lines
function mouseDragged() {
  // only draws if over the canvas
  if (document.elementFromPoint(mouseX, mouseY).className === 'p5Canvas') {
    // Gets each bit's distance from relative origin
    let diff = lock.copy().sub(createVector(mouseX, mouseY)).mult(-1)
    push()
    noStroke()
    // Setup the color changing
    let from = color(state.color1)
    let to = color(state.color2)
    // Ticker for the color change
    let tick = dist(mouseX, mouseY, lock.x, lock.y)
    // copy that bit of drawing to all other origins
    divs.forEach(function (r) {
      if (!state.reflectColor) {
        let trans = 100
        let l = tick % trans
        if (l < trans / 2) { fill(lerpColor(from, to, l / (trans / 2))) } else { fill(lerpColor(to, from, l % 50 / (trans / 2))) }
      }
      r.forEach(function (d) {
        push()
        translate(d)
        for (let i = 0; i < state.Reflections; i++) {
          if (state.reflectColor) { fill(lerpColor(from, to, i / state.Reflections)) }
          ellipse(diff.x, diff.y, state.DrawSize, state.DrawSize)
          rotate(360 / state.Reflections)
        }
        pop()
      })
    })
    pop()
  }
  return false
}

// Flattens 2d array into 1d
const flatten = list => list.reduce(
  (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
)

// Finds closest point to the mouse
function findPoint(x, y) {
  if (x > width || y > height) return
  let dists = flatten(divs).map(function (d) {
    return { dist: dist(x, y, d.x, d.y), orig: d }
  })
  let min = Math.min(...dists.map(d => d.dist))
  return dists.filter(function (obj) {
    return obj.dist == min
  })[0].orig
}
