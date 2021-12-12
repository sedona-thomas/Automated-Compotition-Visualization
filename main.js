const TWINKLE_TWINKLE = {
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

const SHAKESPEARE = "From fairest creatures we desire increase, That thereby beauty's rose might never die, But as the riper should by time decease, His tender heir might bear his memory: But thou contracted to thine own bright eyes, Feed'st thy light's flame with self-substantial fuel";

const CSS_COLOR_NAMES = ["AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure",
    "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown",
    "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue",
    "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray",
    "DarkGrey", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange",
    "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray",
    "DarkSlateGrey", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray",
    "DimGrey", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia",
    "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Grey", "Green", "GreenYellow",
    "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush",
    "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow",
    "LightGray", "LightGrey", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen",
    "LightSkyBlue", "LightSlateGray", "LightSlateGrey", "LightSteelBlue", "LightYellow", "Lime",
    "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid",
    "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise",
    "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite",
    "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod",
    "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink",
    "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue",
    "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver",
    "SkyBlue", "SlateBlue", "SlateGray", "SlateGrey", "Snow", "SpringGreen", "SteelBlue",
    "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke",
    "Yellow", "YellowGreen"
];

// Ordered in how long you would pause after each one (increasing in time).
// TODO: Include ellipsis? "..."
const PUNCTUATION_MARKS = ["—", ",", ";", ":", "!", "?", "."]
const PUNCTUATION_INCREMENT = 0.1
// 120 bpm is moderate tempo. Assume 4/4 time signature; each quarter note lasts 0.5 seconds.
const DEFAULT_NOTE_LENGTH = 0.5
// Average word length: 4.79 letters (http://norvig.com/mayzner.html) -- round up to 5.
const AVERAGE_WORD_LENGTH = 5

const TRAINING_TEXT = "mmmmm lllll ppppp"
// Middle C. 
const BASE_PITCH = 60;

var text = "hello world";
var trainingNotes = processText(TRAINING_TEXT);
var sequence_length = 20;
var note_length = 0.5;
var states;
var markovChain;
var markovChain_order1;
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

// Not sure why it takes a while for sound to start playing but this syncs up sound/visuals.
const DRAW_TIME_OFFSET = 1000

const playExampleButton = document.getElementById("play_example");
playExampleButton.addEventListener('click', function () {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    play(SHAKESPEARE);
}, false);

const textButton = document.getElementById("submit_text");
textButton.addEventListener('click', function () {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    let textInput = document.getElementById("text").value
    if (textInput.length > 0) {
        play(textInput);
    }
}, false);

// play(): processes text input, performs automated composition, and plays with visuals
function play(textInput) {
    let notes = processText(textInput);
    let fullNotesList = automateComposition(notes);
    playNotes(fullNotesList);
    visualize(fullNotesList);
}

// playNotes(): plays the inputted series of notes
function playNotes(notes) {
    notes.notes.forEach(note => {
        playNote(note);
    });
}

// automateComposition(): creates the series of notes to play
function automateComposition(notes) {
    let markovNotes = processMarkov(notes);
    console.log(markovNotes);
    return markovNotes;
}

// processText(): creates notes series from raw text input
function processText(rawInput) {
    timeElapsed = 0.0
    notes = []
    const wordsArray = rawInput.split(" ")
    for (let word of wordsArray) {
        if (word.length > 0) {
            new_note = {}
            new_note.startTime = timeElapsed

            // Look at word length. 
            let note_duration = word.length / AVERAGE_WORD_LENGTH * DEFAULT_NOTE_LENGTH;
            timeElapsed += note_duration;
            new_note.endTime = timeElapsed;

            // Determine pitch by the first letter of the word (mapping it onto a set range of frequencies.)
            // Distance from "m." 
            // "m" maps to middle C perfectly. 
            console.log("word:", word)
            let d = word[0].toLowerCase().charCodeAt(0) - "m".charCodeAt(0)
            new_note.pitch = BASE_PITCH + d

            // Determine gap between words by looking if the word ends in punctuation.
            // Assume the input is grammatically correct for now (no period, comma, semicolon, colon, question mark, or exclamation mark without a space).
            // TODO(?): Account for punctuation in the middle of an input (like "wo,rd wo!rd wo.rd"). 
            let last_char = word.charAt(word.length - 1)
            if (PUNCTUATION_MARKS.includes(last_char)) {
                timeElapsed += PUNCTUATION_MARKS.indexOf(last_char) * PUNCTUATION_INCREMENT
            }

            // TODO: Incorporate POS tagging. 

            notes.push(new_note)
        }
    }
    let output = { notes, totalTime: timeElapsed }
    output.notes.forEach(note => {
        note.startTime = Math.floor(note.startTime * 10) / 10;
        note.endTime = Math.floor(note.endTime * 10) / 10;
    });
    output.totalTime = Math.floor(output.totalTime * 10) / 10;
    console.log("processText() output: ", output)
    return output;
}

// visualize(): visualizes series of notes as they play
function visualize(notesList) {
    size = 500;
    canvas = document.getElementById("visualization");
    canvasCtx = canvas.getContext("2d");
    getStates(notesList);
    radialPattern(canvasCtx, size, notesList);
}

// TODO: Add more options for patterns.

// radialPattern(): creates a tree ring pattern for a series of notes
function radialPattern(canvasCtx, size, notesList) {
    gradient = canvasCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    increment = 10;
    interval = 1 / (notesList.notes.length + 1);
    colors = getColors(Object.keys(states).length);
    for (i = 0; i < notesList.notes.length; i++) {
        let pitch = notesList.notes[i].pitch
        let startTime = notesList.notes[notesList.notes.length - i - 1].startTime * 1000 + DRAW_TIME_OFFSET
        let gradientInterval = i * interval
        setTimeout(function () {
            gradient.addColorStop(gradientInterval, getColor(colors, pitch));
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(0, 0, size, size);
            console.log("timing out");
        }, startTime);
    }
    gradient.addColorStop(1, "white");
    canvasCtx.fillStyle = gradient;
    canvasCtx.fillRect(0, 0, size, size);
}

// getColors(): selects a random set of colors of length size
function getColors(size) {
    colors = [];
    for (i = 0; i < size; i++) {
        colors.push(CSS_COLOR_NAMES[Math.floor(Math.random() * CSS_COLOR_NAMES.length)]);
    }
    return colors;
}

// getColor(): selects a color given a pitch and color list
function getColor(colors, pitch) {
    return colors[states[pitch]];
}

// getStates(): generates a states list for the inputted notes list
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

// processMarkov(): generates a series of notes using a markov chain trained with Twinkle Twinkle Little Star
function processMarkov(notes) {
    makeMarkovChain(TWINKLE_TWINKLE);
    let song = genNotes(notes);
    return song;
}

// genNotes(): generates a series of notes for the current markov chain
function genNotes(noteList) {
    let newNotes = { notes: [], totalTime: 0 };
    noteList.notes.forEach(note => {
        newNotes.notes.push(note);
        newNotes.totalTime = note.endTime;
    });
    let currentEnd = newNotes.totalTime;
    let sequenceEnd = newNotes.notes.length + sequence_length;
    for (i = newNotes.notes.length; i < sequenceEnd; i++) {
        let newNoteCopy = {};
        newNoteCopy.pitch = getNextNote(noteList.notes[i - 1]);
        newNoteCopy.startTime = currentEnd;
        newNoteCopy.endTime = currentEnd + note_length;
        newNotes.notes.push(newNoteCopy);
        newNotes.totalTime = currentEnd + note_length;
        currentEnd += note_length
    }
    return newNotes;
}

// makeMarkovChain(): creates markov chain from inputted notes series
function makeMarkovChain(noteList) {
    getStates(noteList);
    makeMarkovChainOrder1(noteList);
    makeMarkovChainOrderN();
}

// makeMarkovChainOrderN(): creates markov chain of the current specified order
function makeMarkovChainOrderN() {
    markovChain = makeIdentityMatrix(Object.keys(states).length);
    for (i = 0; i < order; i++) {
        markovChain = multiplyMatrices(markovChain, markovChain_order1);
    }
}

// makeMarkovChainOrder1(): creates markov chain of order 1
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

// getNGramCounts(): gets unigram, bigram, and trigram counts for a note list
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
    if (noteList.notes.length > 1) {
        bigram = [states[noteList.notes[i].pitch], states[noteList.notes[i + 1].pitch]];
        bigram_counts[bigram[0]][bigram[1]]++;
        unigram_counts[bigram[0]]++;
        i++;
    }
    if (noteList.notes.length > 0) {
        unigram = [states[noteList.notes[i].pitch]];
        unigram_counts[unigram[0]]++;
    }
    return [unigram_counts, bigram_counts, trigram_counts];
}

// getNextNote(): randomly generates a note given markov probabilities
function getNextNote(pitch) {
    if (Object.keys(states).includes(pitch)) {
        randomNote = Math.random();
        note = [0, markovChain[states[pitch]][0]];
        while (note[1] < randomNote) {
            note[0]++;
            note[1] += markovChain[states[pitch]][note[0]];
        }
        return parseInt(Object.keys(states)[note[0]]);
    }
    else {
        randomChoice = Math.floor(Math.random() * Object.keys(states).length);
        return parseInt(Object.keys(states)[randomChoice]);
    }
}

// perplexity(): calculates the perplexity of the given input
function perplexity(corpus) {
    prob = [];
    m = 0;
    corpus.forEach(unit => {
        m += len(unit) + 1
        prob.push(sentenceTrigramLogprob(s))
    });
    return 2 ** ((-1 / m) * sum(prob));
}

// sequenceTrigramLogprob(): gets the logprob of the sequence
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

// smoothedTrigramProbability(): smooths the probability of the given trigram
function smoothedTrigramProbability(trigram) {
    counts = getNGramCounts(noteList);
    lambda = [1 / 3.0, 1 / 3.0, 1 / 3.0];
    a = lambda[2] * counts[2][trigram[0]][trigram[1]][trigram[2]] / counts[1][trigram[0]][trigram[1]]
    b = lambda[1] * counts[1][trigram[0]][trigram[1]] / counts[0][trigram[0]]
    c = lambda[0] * counts[0][trigram[0]] / sum(counts[0]);
    return a + b + c;
}

// playNote(): plays a note
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

// playNoteSingle(): plays a single note
function playNoteSingle(note) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    const osc = audioCtx.createOscillator();

    console.log("note pitch: ", note.pitch);
    console.log("translated to freq: ", midiToFreq(note.pitch));

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

// playNoteAdditive(): plays a note with additive synthesis
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

// playNoteAM(): plays a note with amplitude modulation
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

// playNoteFM(): plays a note with frequency modulation
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

// stopNote(): stops the current note
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

// multplyMatrices(): multiplies two mtrices
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

// makeZeroSquareMatrix(): makes a zero matrix of size n0 x n1
function makeZeroSquareMatrix(n0, n1) {
    m = [];
    for (i = 0; i < n0; i++) {
        row = new Array(n1).fill(0);
        m.push(row);
    }
    return m;
}

// makeZeroCubeMatrix(): makes a zero matrix of size n0 x n1 x n2
function makeZeroCubeMatrix(n0, n1, n2) {
    m0 = [];
    for (i = 0; i < n0; i++) {
        m1 = [];
        for (j = 0; j < n1; j++) {
            row = new Array(n2).fill(0);
            m1.push(row);
        }
        m0.push(m1);
    }
    return m0;
}

// makeIdentityMatrix(): makes an identity matrix
function makeIdentityMatrix(size) {
    m = makeZeroSquareMatrix(size, size);
    for (i = 0; i < size; i++) {
        m[i][i] = 1;
    }
    return m;
}

// sum(): calculates the sum of the array
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


/*
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
*/