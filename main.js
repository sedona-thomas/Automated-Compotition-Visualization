TWINKLE_TWINKLE = {
    notes: [
        { pitch: 60, startTime: 0.0, endTime: 0.5 },
        { pitch: 60, startTime: 0.5, endTime: 1.0 },
        { pitch: 67, startTime: 1.0, endTime: 1.5 },
        { pitch: 67, startTime: 1.5, endTime: 2.0 },
        { pitch: 69, startTime: 2.0, endTime: 2.5 },
        { pitch: 69, startTime: 2.5, endTime: 3.0 },
        { pitch: 67, startTime: 3.0, endTime: 4.0 },
        { pitch: 65, startTime: 4.0, endTime: 4.5 },
        { pitch: 65, startTime: 4.5, endTime: 5.0 },
        { pitch: 64, startTime: 5.0, endTime: 5.5 },
        { pitch: 64, startTime: 5.5, endTime: 6.0 },
        { pitch: 62, startTime: 6.0, endTime: 6.5 },
        { pitch: 62, startTime: 6.5, endTime: 7.0 },
        { pitch: 60, startTime: 7.0, endTime: 8.0 },
    ],
    totalTime: 8
};

var trainingNotes = TWINKLE_TWINKLE;
var sequence_length = 20;
var note_length = 0.5;

var markovChain;
var markovChain_order1;
var states;
var order = 1;

var audioCtx;
var activeOscillators = {};
var activeGainNodes = {};

var offset = 1;
var mode = 'single';
var waveform = 'sine';
var lfo = false;
var numberOfPartials = 5;
var partialDistance = 15;
var modulatorFrequencyValue = 100;
var modulationIndexValue = 100;
var lfoFreq = 2;

const playButton = document.querySelector('button');
playButton.addEventListener('click', function () {
    if (!audioCtx) {
        initAudio();
    }
    play();
});

function play() {
  
}

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
}

// visualize(): visualizes series of notes as they play
function visualize(notes) {
    // TODO: edit html page
    
    
}

// automateComposition(): creates the series of notes to play
function automateComposition(notes) {
    // TODO: generate audio from input notes
    
    
    
}

// processText(): creates notes series from raw text input
function processText(rawInput) {
    notes = {
        notes: [
            { pitch: 0, startTime: 0.0, endTime: 0.0 }
        ],
        totalTime: 0
    };
    
    // TODO: write method
    
    
    
    return notes;
}

function playNote(note) {
    if (mode == "single") {
        playNoteSingle(note);
    }
    else if (mode == "additive") {
        playNoteAdditive(note);
    }
    else if (mode == "am") {
        playNoteAM(note);
    }
    else if (mode == "fm") {
        playNoteFM(note);
    }

    if (activeOscillators[note]) {
        stopNote(note);
    }
}


function playNoteSingle(note) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    const osc = audioCtx.createOscillator();
    osc.frequency.setValueAtTime(midiToFreq(note.pitch), audioCtx.currentTime);
    osc.type = waveform;
    osc.connect(gainNode).connect(audioCtx.destination);
    osc.start();

    activeGainNodes[note] = [gainNode];
    activeOscillators[note] = [osc];

    if (lfo) {
        let lfo = audioCtx.createOscillator();
        lfo.frequency.value = lfoFreq;
        let lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain).connect(osc.frequency);
        lfo.start();
        activeOscillators[note].push(lfo);
    }

    let gainNodes = Object.keys(activeGainNodes).length;
    gainNode.gain.setTargetAtTime(0.8 / gainNodes, note.startTime + offset, 0.01);
}

function playNoteAdditive(note) {
    activeGainNodes[note] = [];
    activeOscillators[note] = [];

    for (let i = 0; i < numberOfPartials; i++) {
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

        const osc = audioCtx.createOscillator();
        let freq = midiToFreq(note.pitch) * (i + 1);
        freq += ((i % 2) * -1) * (i + 1) * partialDistance * Math.random();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.type = waveform;
        osc.connect(gainNode).connect(audioCtx.destination);
        osc.start();
        activeGainNodes[note].push(gainNode);
        activeOscillators[note].push(osc);

        if (lfo) {
            let lfo = audioCtx.createOscillator();
            lfo.frequency.value = lfoFreq;
            let lfoGain = audioCtx.createGain();
            lfoGain.gain.value = 10;
            lfo.connect(lfoGain).connect(osc.frequency);
            lfo.start();
            activeOscillators[note].push(lfo);
        }
    }

    let gainNodes = Object.keys(activeGainNodes).length * numberOfPartials;
    for (let i = 0; i < activeGainNodes[note].length; i++) {
        activeGainNodes[note][i].gain.setTargetAtTime(0.8 / gainNodes, note.startTime + offset, 0.1);
    }
}

function playNoteAM(note) {
    let carrier = audioCtx.createOscillator();
    let modulatorFreq = audioCtx.createOscillator();
    carrier.type = waveform;
    carrier.frequency.setValueAtTime(midiToFreq(note.pitch), audioCtx.currentTime);
    modulatorFreq.frequency.value = modulatorFrequencyValue;

    const modulated = audioCtx.createGain();
    const depth = audioCtx.createGain();
    depth.gain.value = 0.5; //scale modulator output to [-0.5, 0.5]
    modulated.gain.value = 1.0 - depth.gain.value; //a fixed value of 0.5

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    modulatorFreq.connect(depth).connect(modulated.gain);
    carrier.connect(modulated);
    modulated.connect(gainNode).connect(audioCtx.destination);

    carrier.start();
    modulatorFreq.start();

    activeGainNodes[note] = [gainNode, modulated, depth];
    activeOscillators[note] = [carrier, modulatorFreq];

    if (lfo) {
        let lfo = audioCtx.createOscillator();
        lfo.frequency.value = lfoFreq;
        let lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 300;
        lfo.connect(lfoGain).connect(modulatorFreq.frequency);
        lfo.start();
        activeOscillators[note].push(lfo);
    }

    let gainNodes = Object.keys(activeGainNodes).length;
    gainNode.gain.setTargetAtTime(0.8 / gainNodes, note.startTime + offset, 0.1);
}

function playNoteFM(note) {
    let modulatorFreq = audioCtx.createOscillator();
    modulatorFreq.frequency.value = modulatorFrequencyValue;

    let modulationIndex = audioCtx.createGain();
    modulationIndex.gain.value = modulationIndexValue;

    let carrier = audioCtx.createOscillator();
    carrier.type = waveform;
    carrier.frequency.value = midiToFreq(note.pitch);

    modulatorFreq.connect(modulationIndex);
    modulationIndex.connect(carrier.frequency);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    carrier.connect(gainNode).connect(audioCtx.destination);

    carrier.start();
    modulatorFreq.start();

    activeGainNodes[note] = [gainNode, modulationIndex];
    activeOscillators[note] = [carrier, modulatorFreq];

    if (lfo) {
        let lfo = audioCtx.createOscillator();
        lfo.frequency.value = lfoFreq;
        let lfoGain = audioCtx.createGain();
        lfoGain.gain.value = 300;
        lfo.connect(lfoGain).connect(modulatorFreq.frequency);
        lfo.start();
        activeOscillators[note].push(lfo);
    }

    let gainNodes = Object.keys(activeGainNodes).length;
    gainNode.gain.setTargetAtTime(0.8 / gainNodes, note.startTime + offset, 0.1);
}

function stopNote(note) {
    for (let i = 0; i < activeGainNodes[note].length; i++) {
        activeGainNodes[note][i].gain.cancelScheduledValues(note.endTime + offset - 0.05);
        activeGainNodes[note][i].gain.setTargetAtTime(0, note.endTime + offset - 0.05, 0.01);
        delete activeGainNodes[note][i];
    }

    for (let i = 0; i < activeOscillators[note].length; i++) {
        activeOscillators[note][i].stop(note.endTime + offset - 0.05 + 0.1);
        delete activeOscillators[note][i];
    }

    delete activeGainNodes[note];
    delete activeOscillators[note];
}
