var audioCtx;

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
}

function play() {
  
}

const playButton = document.querySelector('button');
playButton.addEventListener('click', function () {
    if (!audioCtx) {
        initAudio();
    }
    play();
});
