//var barLines = ??
//Note to Lauren: Bars have 5 lines

let canvas;
function setup() {
    canvas = createCanvas(660, 360);
    line(40, 50, 500, 50);
    line(40, 100, 500, 100);
    line(40, 150, 500, 150);
    line(40, 200, 500, 200);
    line(40, 250, 500, 250);

    canvas.mousePressed(drawNote)
    
}


// let cRange, dRange, eRange, fRange, gRange, aRange, bRange, c2Range, inputRange;


function drawNote() {

    ellipse(50,225, 65, 45);

}
