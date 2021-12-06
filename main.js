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

var text = "hello world";
var trainingNotes = TWINKLE_TWINKLE;
var sequence_length = 20;
var note_length = 0.5;

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
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    play();
});

const textButton = document.getElementById("submit_text");
textButton.addEventListener('click', function () {
    text = parseSong(document.getElementById('text').value);
}, false);

const lengthButton = document.getElementById("submit_length");
lengthButton.addEventListener('click', function () {
    note_length = parseInt(document.getElementById('length').value);
}, false);

const seqLengthButton = document.getElementById("submit_seq_length");
seqLengthButton.addEventListener('click', function () {
    sequence_length = parseInt(document.getElementById('seq_length').value);
}, false);

const singleButton = document.getElementById("single");
singleButton.addEventListener('click', function () { mode = 'single'; }, false);
const additiveButton = document.getElementById("additive");
additiveButton.addEventListener('click', function () { mode = 'additive'; }, false);
const AMButton = document.getElementById("am");
AMButton.addEventListener('click', function () { mode = 'am'; }, false);
const FMButton = document.getElementById("fm");
FMButton.addEventListener('click', function () { mode = 'fm'; }, false);

const sineButton = document.getElementById("sine");
sineButton.addEventListener('click', function () { waveform = 'sine'; }, false);
const sawtoothButton = document.getElementById("sawtooth");
sawtoothButton.addEventListener('click', function () { waveform = 'sawtooth'; }, false);
const squareButton = document.getElementById("square");
squareButton.addEventListener('click', function () { waveform = 'square'; }, false);
const triangleButton = document.getElementById("triangle");
triangleButton.addEventListener('click', function () { waveform = 'triangle'; }, false);

const lfoOnButton = document.getElementById("lfoOn");
lfoOnButton.addEventListener('click', function () { lfo = true; }, false);
const lfoOffButton = document.getElementById("lfoOff");
lfoOffButton.addEventListener('click', function () { lfo = false; }, false);

function play() {
    playMarkov();
    visualize(TWINKLE_TWINKLE);
}

// visualize(): visualizes series of notes as they play
function visualize(notes) {
    // TODO: edit html page

    var canvas = document.getElementById("canvas");
    var ctx = c.getContext("2d");
    var gradient = ctx.createRadialGradient(75, 50, 5, 90, 60, 100);
    interval = 1 / (notes.length + 1);
    for (i = 0; i < notes.length; i++) {
        gradient.addColorStop(interval * i, getColor(notes[i]));
    }
    gradient.addColorStop(1, "white");
    ctx.fillStyle = gradient;
    ctx.fillRect(20, 20, 500, 250);
}

function getColor(note) {
    return "black";
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

/*
 * Deals with Markov Chain
 */

var markovChain;
var markovChain_order1;
var states;
var order = 1;

function playMarkov() {
    makeMarkovChain(trainingNotes);
    let song = genNotes(trainingNotes);
    song.notes.forEach(note => {
        playNote(note);
    });
    console.log(song);
}

function genNotes(noteList) {
    let newNotes = copyNoteList(noteList);
    let sequenceEnd = newNotes.notes.length + sequence_length;
    for (i = newNotes.notes.length; i < sequenceEnd; i++) {
        const newNoteCopy = newNote(newNotes);
        newNotes.notes.push(newNoteCopy);
        newNotes.totalTime = newNoteCopy.endTime;
    }
    return newNotes;
}

// NOT SURE HOW THIS WILL BE USED YET
function perplexity(corpus) {
    prob = [];
    m = 0;
    corpus.forEach(unit => {
        m += len(unit) + 1
        prob.push(sentenceTrigramLogprob(s))
    });
    return 2 ** ((-1 / m) * sum(prob));
}

function sequenceTrigramLogprob(sequence) {
    counts = getNGramCounts(noteList);
    prob = [];
    counts[2].forEach(t => {
        p = smoothedTrigramProbability(t);
        if (p > 0) {
            prob.push(Math.log2(p));
        }
    });
    return sum(prob);
}

function smoothedTrigramProbability(trigram) {
    counts = getNGramCounts(noteList);
    lambda = [1 / 3.0, 1 / 3.0, 1 / 3.0];
    a = lambda[2] * counts[2][trigram[0]][trigram[1]][trigram[2]] / counts[1][trigram[0]][trigram[1]]
    b = lambda[1] * counts[1][trigram[0]][trigram[1]] / counts[0][trigram[0]]
    c = lambda[0] * counts[0][trigram[0]] / sum(counts[0]);
    return a + b + c;
}

function makeMarkovChain(noteList) {
    getStates(noteList);
    makeMarkovChainOrder1(noteList);
    makeMarkovChainOrderN();
}

function makeMarkovChainOrderN() {
    markovChain = makeIdentityMatrix(Object.keys(states).length);
    for (i = 0; i < order; i++) {
        markovChain = multiplyMatrices(markovChain, markovChain_order1);
    }
}

function makeMarkovChainOrder1(noteList) {
    numOfNotes = Object.keys(states).length;
    markovChain_order1 = makeZeroSquareMatrix(numOfNotes, numOfNotes);
    counts = getNGramCounts(noteList);
    for (i = 0; i < numOfNotes; i++) {
        for (j = 0; j < numOfNotes; j++) {
            markovChain_order1[i][j] = counts[1][i][j] / counts[0][i];
        }
    }
}

function getStates(noteList) {
    states = {};
    let pitchSet = [];
    noteList.notes.forEach(note => {
        if (!pitchSet.includes(note.pitch)) {
            pitchSet.push(note.pitch);
        }
    });
    pitchSet.sort();
    for (i = 0; i < pitchSet.length; i++) {
        states[pitchSet[i]] = i;
    }
}

function getNGramCounts(noteList) {
    numOfNotes = Object.keys(states).length;
    unigram_counts = new Array(numOfNotes).fill(0);
    bigram_counts = makeZeroSquareMatrix(numOfNotes, numOfNotes);
    trigram_counts = makeZeroCubeMatrix(numOfNotes, numOfNotes, numOfNotes);
    let i;
    for (i = 0; i < noteList.notes.length - 2; i++) {
        trigram = [states[noteList.notes[i].pitch], states[noteList.notes[i + 1].pitch], states[noteList.notes[i + 2].pitch]];
        unigram_counts[trigram[0]]++;
        bigram_counts[trigram[0]][trigram[1]]++;
        trigram_counts[trigram[0]][trigram[1]][trigram[2]]++;
    }
    if (noteList.notes.length > 0) {
        bigram_counts[noteList.notes[i].pitch][noteList.notes[i + 1].pitch]++;
        unigram_counts[noteList.notes[i].pitch]++;
        i++;
    }
    if (noteList.notes.length > 0) {
        unigram_counts[noteList.notes[i].pitch]++;
    }
    return [unigram_counts, bigram_counts, trigram_counts];
}

function newNote(noteList) {
    let newNote = JSON.parse(JSON.stringify(noteList.notes[i - 1]));
    newNote.pitch = getNextNote(newNote.pitch);
    newNote.startTime = newNote.endTime;
    newNote.endTime = newNote.startTime + note_length;
    return newNote;
}

function getNextNote(pitch) {
    randomNote = Math.random();
    note = [0, markovChain[states[pitch]][0]];
    while (note[1] < randomNote) {
        note[0]++;
        note[1] += markovChain[states[pitch]][note[0]];
    }
    return parseInt(Object.keys(states)[note[0]]);
}

function copyNoteList(noteList) {
    let notesCopy = { notes: [], totalTime: 0 };
    noteList.notes.forEach(note => {
        notesCopy.notes.push(note);
        notesCopy.totalTime = note.endTime;
    });
    return notesCopy;
}

/*
 * Deals with playing a note
 */

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

function multiplyMatrices(m1, m2) {
    let dim = [m1.length, m2[0].length];
    let product = makeZeroSquareMatrix(dim[0], dim[1]);
    for (r = 0; r < dim[0]; ++r) {
        for (c = 0; c < dim[1]; ++c) {
            for (i = 0; i < m1[0].length; ++i) {
                product[r][c] += m1[r][i] * m2[i][c];
            }
        }
    }
    return product;
}

function makeZeroSquareMatrix(n0, n1) {
    m = [];
    for (i = 0; i < n0; i++) {
        row = new Array(n1).fill(0);
        m.push(row);
    }
    return m;
}

function makeZeroCubeMatrix(n0, n1, n2) {
    m0 = []
    for (i = 0; i < n0; i++) {
        m1 = [];
        for (i = 0; i < n1; i++) {
            row = new Array(n2).fill(0);
            m1.push(row);
        }
        m0.push(m1);
    }
    return m0;
}

function makeIdentityMatrix(size) {
    m = makeZeroSquareMatrix(size, size);
    for (i = 0; i < size; i++) {
        m[i][i] = 1;
    }
    return m;
}

function sum(arr) {
    s = 0;
    for (i = 0; i < arr.length; i++) {
        s += arr[i];
    }
    return s;
}

function midiToFreq(m) { return Math.pow(2, (m - 69) / 12) * 440; }

function updateOrder(value) { order = value; };
function updateTrainingNotes(file) { trainingNotes = blobToNoteSequence(file); }
function updatePartialNum(value) { numberOfPartials = value; };
function updatePartialDistance(value) { partialSize = value; };
function updateFreq(value) { modulatorFrequencyValue = value; };
function updateIndex(value) { modulationIndexValue = value; };
function updateLfo(value) { lfoFreq = value; };