var textPixels = 22;

function setup() {
    createCanvas(300, 300);
}

function draw() {
    background(220, 20, 20)
    textSize(textPixels)
    text("This is example 1: simple", 30, 30)
    text("simple script, in a page", 35, 60)
    rect(width / 3, height / 3, 100, 100)
}

function keyPressed() {
    textPixels -= 1;
}