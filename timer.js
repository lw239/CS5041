var startTime = Date.now();
var timerDuration = ((60 / 72) * 4) * 2; // duration in seconds

var timer = setInterval(function () {
    var elapsedTime = Math.floor((Date.now() - startTime) / 1000); // elapsed time in seconds
    var remainingTime = timerDuration - elapsedTime;

    if (remainingTime <= 0) {
        clearInterval(timer);
        document.getElementById("timer").textContent = "0:00";
        // Add code to execute when the countdown timer reaches 0
    } else {
        var seconds = Math.floor(remainingTime);
        var milliseconds = Math.floor((remainingTime - seconds) * 1000);
        document.getElementById("timer").textContent = seconds + ":" + (milliseconds < 10 ? "0" : "") + milliseconds;
    }
}, 50); // update timer display every 50 milliseconds