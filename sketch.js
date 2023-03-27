// Create a p5 canvas (learn more at p5js.org)
let myCanvas = null;

// Declare kinectron
let usingKinectron = false;
let kinectron = null;
let cursorPos = null;
let gamePhase = 0;

const intervalHeight = 25;
const noteFreqs = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 to C5

let notes = [];                               // Array to store notes
let durations = [];                           // Array to store durations
let noteStarts = [];                          // Array to store start times of notes
let tempo = 72;                               // Default tempo (Adagio)
let quarterNoteDuration = 60000 / tempo;      // Duration of a quarter note in milliseconds
let quarterNoteWidth = 100;                   // Width of a quarter note in pixels
let musicTimer = 0;                           // Time elapsed since start of music
let maxMusicTime = 8 * quarterNoteDuration;   // Total time of music
let minNoteDuration = 0.5;                    // Default note duration
let startTime;                                // Time when mouse is clicked
let isRecording = false;                      // Flag to indicate if recording is in progress
let osc;                                      // Oscillator to play notes
let env;     
let controlType;                                  // Envelope to control volume of notes
//kinectControls
//arduinoControls


let hovering = false;
let timer = 0;
let maxTimer = 50;

function setup() {
  // Create a p5 canvas
  myCanvas = createCanvas(windowWidth, windowHeight);
  env = new p5.Envelope(0.01, 0.5, 0.1, 0.5);
  env.setRange(1, 0);
  osc = new p5.SinOsc();
  osc.setType('sine');    // Set oscillator waveform
  osc.amp(0.5);
  // osc.start();            // Start oscillator

  // Set background color
  background(0);

  // Initialize Kinectron
  if (usingKinectron) {
    initKinectron();
  } else {
    // Set up a mouse cursor
    cursorPos = createVector(width / 2, height / 2);
  }

  // Menu Button

  menuButton = createButton("Start");
  menuButton.position(windowWidth/2, windowHeight/2);
  menuButton.class("menuButton");
  menuButton.mouseOver(() => {
    hovering = true;
    timer = maxTimer;
  });
  menuButton.mouseOut(() => {
    hovering = false;
  });
  menuButton.mousePressed(() => {
    console.log("Pressed");	
  });
  

  // Retry Button

    retryButton = createButton("Try again");
    retryButton.position(windowWidth / 2, windowHeight / 2);
    retryButton.class("retryButton");
    retryButton.mouseOver(() => {
      hovering = true;
      timer = maxTimer;
    });
    retryButton.mouseOut(() => {
      hovering = false;
    });
    retryButton.mousePressed(() => {
      console.log("Pressed");
    });
  

}

function draw() {
  // Set the drawing color
  clear();
  cursorPos = createVector(mouseX, mouseY);
  
  // Draw the game
  switch (gamePhase) {
    case 0:
      drawMenu();
      break;
    case 1:
      drawGame();
      break;
    case 2:
      drawEnd();
      break;
  }
}

function drawMenu() {
  // Draw the menu
  fill(0);
  textSize(32);
  text("Menu", 10, 30);

  if (hovering && timer > 0) {
    arc(cursorPos.x, cursorPos.y, 30, 30, 0, map(timer, 0, maxTimer, TWO_PI, 0));
    timer -= 1;
    if (timer == 0) {
      gamePhase = 1;
      musicTimer = millis();
      // osc.start();
      select(".menuButton").remove();
    }
  }

  // Draw the circle
  drawCursor();
}

function drawCursor() {
  fill(255);
  ellipse(cursorPos.x, cursorPos.y, 15, 15);
}

function drawGame() {
  // Draw the game
  fill(0);
  textSize(32);
  text("Game", 10, 30);
  stroke(0);

  if (millis() - musicTimer > maxMusicTime) {
    gamePhase = 2;
  }

  // Draw musical stave lines
  for (let i = 0; i < 6; i++) {
    line(50, i * (2 * intervalHeight), width - 50, i * (2 * intervalHeight));
  }

  // Draw vertical line
  currTime = map(millis() - musicTimer, 0, maxMusicTime, 50, width - 50);
  line(currTime, 50, currTime, 6 * (2 * intervalHeight) + 50);

  // Draw current notes
  for (let i = 0; i < notes.length - 1; i++) {
    let xPos = map(noteStarts[i], 0, maxMusicTime, 50, width - 50);
    let yPos = (12 - notes[i]) * intervalHeight;
    let noteWidth = map(durations[i], 0, maxMusicTime, 0, width - 100);
    circle(xPos, yPos, 20);
    circle(xPos + noteWidth, yPos, 20);
    rect(xPos, yPos - 10, noteWidth, 20);
  }

  // Draw last note (may be currently being recorded...)
  let xPos = map(noteStarts[noteStarts.length - 1], 0, maxMusicTime, 50, width - 50);
  let yPos = (12 - notes[notes.length - 1]) * intervalHeight;
  let noteWidth = isRecording ? map(millis() - startTime, 0, maxMusicTime, 0, width - 100) : map(durations[notes.length - 1], 0, maxMusicTime, 0, width - 100);
  circle(xPos, yPos, 20);
  circle(xPos + noteWidth, yPos, 20);
  rect(xPos, yPos - 10, noteWidth, 20);

  if (mouseY <= 50) {
    drawCursor();
  } else {
    if (!isRecording) {
      drawPotentialNote();
    }
  }
}

function drawPotentialNote() {
  if (musicTimer > 0) {
    let pitch = round(map(min(mouseY, 250), 50, 250, 7, 0));             // Map y-coordinate to pitch
    let xPos = map(millis() - musicTimer, 0, maxMusicTime, 50, width - 50);
    let yPos = (12 - pitch) * intervalHeight;
    fill('gray');
    circle(xPos, yPos, 20);
  }
}

function drawEnd() {
  textSize(32);
  text("End", 10, 30);

  drawCursor();

  if (hovering && timer > 0) {
    arc(cursorPos.x, cursorPos.y, 30, 30, 0, map(timer, 0, maxTimer, TWO_PI, 0));
    timer -= 1;
    if (timer == 0) {
      gamePhase = 1;
      musicTimer = millis();
      // osc.start();
      select(".retryButton").remove();
    }
  }
}

function mousePressed() {
  // Check if mouse is within canvas bounds
  if (mouseY >= 50 && mouseY <= height) {
    isRecording = true;
    startTime = millis();
    noteStarts.push(startTime - musicTimer);
    let pitch = round(map(max(50, min(mouseY, 250)), 50, 250, 7, 0));    // Map y-coordinate to pitch
    notes.push(pitch);
    console.log(noteFreqs[pitch]);
    osc.freq(midiToFreq(noteFreqs[pitch]));                      // Set oscillator frequency based on MIDI note number
    osc.start();                                                 // Start oscillator with envelope
  }
}

function mouseReleased() {
  if (isRecording) {
    // Calculate duration of note as a multiple of 0.5
    let duration = (millis() - startTime);
    durations.push(duration);
    osc.stop();                                      // Stop oscillator with envelope
    isRecording = false;
  }
}

function initKinectron() {
  // Define and create an instance of kinectron
  kinectron = new Kinectron("192.168.56.1");

  // Set Kinect type to windows
  kinectron.setKinectType("windows");

  // Connect with server over peer
  kinectron.makeConnection();

  // Request all tracked bodies and pass data to your callback
  kinectron.setColorCallback(drawColor);
  kinectron.startTrackedBodies(updateSkeleton);
}

function drawColor(img) {
  // Draw the incoming image to the canvas
  image(img, 0, 0, 500, 500);
}

// The incoming "body" argument holds the Kinect skeleton data
function updateSkeleton(body) {
  // Clear the background
  background(0, 20);

  // Draw a circle at the location of each joint
  for (let i = 0; i < body.joints.length; i++) {
    // Get the joint
    let joint = body.joints[i];

    // Set the drawing color
    fill(100);

    // Map Kinect joint data to canvas size; Draw the circle
    cursorPos = createVector(
      joint.depthX * myCanvas.width,
      joint.depthY * myCanvas.height
    );
  }
}