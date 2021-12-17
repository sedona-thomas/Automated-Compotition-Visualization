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
const PLACEHOLDER = "this is going to be some sample text"
const TAYLOR_SWIFT = "She wears high heels, I wear sneakers/ She's Cheer Captain and I'm on the bleachers/ Dreaming about the day when you wake up and find/ That what you're looking for has been here the whole time"

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
const PUNCTUATION_MARKS = ["'", "’", "—", ",", "/", ";", ":", "!", "?", "."]
const PUNCTUATION_INCREMENT = 0.05
// 120 bpm is moderate tempo. Assume 4/4 time signature; each quarter note lasts 0.5 seconds.
const DEFAULT_NOTE_LENGTH = 0.5
// Average word length: 4.79 letters (http://norvig.com/mayzner.html) -- round up to 5.
const AVERAGE_WORD_LENGTH = 5

const TRAINING_TEXT = "mmmmm lllll ppppp"
// Middle C. 
const BASE_PITCH = 60;
const ALPHABET_SIZE = 26;

const sequenceRowsContainer = document.getElementById("sequence-rows")
const gradientPatternSelector = document.getElementById("gradients")

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

// It takes a while for sound to start playing, so this syncs up sound/visuals.
const DRAW_TIME_OFFSET = 1000

const playExample1Button = document.getElementById("play_example_1");
playExample1Button.addEventListener('click', function () {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    play(SHAKESPEARE);
}, false);

const playExample2Button = document.getElementById("play_example_2");
playExample2Button.addEventListener('click', function () {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    play(PLACEHOLDER);
}, false);

const playExample3Button = document.getElementById("play_example_3");
playExample3Button.addEventListener('click', function () {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);
    play(TAYLOR_SWIFT);
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
    addIntroText(textInput)
    let notes = processText(textInput);
    let fullNotesList = automateComposition(notes);
    playNotes(fullNotesList);
    visualize(fullNotesList);
}

// playNotes(): plays the inputted series of notes
function playNotes(notes) {
    generationMethod = ""
    notes.notes.forEach(note => {
        // If generation method changes, add new text.
        if (note.generated != generationMethod) {
            let generatedText = note.generated
            addGenerationText(generatedText, note.startTime)
            generationMethod = note.generated
        }
        playNote(note);
    });
}

// addIntroText(): adds text to be analyzed to the page
function addIntroText(text) {
    newSequenceRow = document.createElement("div")
    newSequenceRow.classList.add("row")
    newSequenceRow.classList.add("intro-text")
    introText = document.createElement("b")
    introText.innerText = "> Analyzing the following text: "
    newSequenceText = document.createElement("p")
    newSequenceText.innerText = text
    newSequenceRow.appendChild(introText)
    newSequenceRow.appendChild(newSequenceText)
    sequenceRowsContainer.appendChild(newSequenceRow)
}

// addGenerationText(): prints note sequence generated to page
function addGenerationText(generatedText, startTime) {
    setTimeout(function () {
        newSequenceRow = document.createElement("div")
        newSequenceRow.classList.add("row")
        newSequenceRow.classList.add("sequences")
        newSequenceText = document.createElement("p")
        newSequenceText.innerText = "> Playing " + generatedText + " processing..."
        newSequenceRow.appendChild(newSequenceText)
        sequenceRowsContainer.appendChild(newSequenceRow)
    }, startTime * 1000 + DRAW_TIME_OFFSET)
}

// automateComposition(): creates the series of notes to play
function automateComposition(notes) {
    let markovNotes = processMarkov(notes);
    return markovNotes;
}

// processText(): creates notes series from raw text input
function processText(rawInput) {
    timeElapsed = 0.0
    notes = []
    const wordsArray = rawInput.split(" ")
    letterDiversity = getLetterDiversity(wordsArray)

    // Use letter diversity to determine waveform type.
    if (letterDiversity >= 0 && letterDiversity < 0.2) {
        // Based on test inputs, very unlikely to happen with natural text (and more like "aaa").
        console.log("triangle: ", letterDiversity)
        waveform = "triangle"
    } else if (letterDiversity < 0.3) {
        // Based on test inputs, unlikely to happen with natural text (and more like "abbabababa").
        console.log("square: ", letterDiversity)
        waveform = "square"
    } else if (letterDiversity < 0.35) {
        // Based on test inputs, most values fall into this range between 0.34 and 0.36. 
        // So it will vary between playing sine and sawtooth most often. 
        console.log("sawtooth: ", letterDiversity)
        waveform = "sawtooth"
    } else {
        console.log("sine: ", letterDiversity)
        waveform = "sine"
    }

    wordLengthStdDev = getWordLengthStdDev(wordsArray)
    numberOfPartials = Math.floor(5 *wordLengthStdDev)

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
            let d = word[0].toLowerCase().charCodeAt(0) - "m".charCodeAt(0)
            new_note.pitch = BASE_PITCH + d

            // Determine gap between words by looking if the word ends in punctuation.
            // Assume the input is grammatically correct for now (no period, comma, semicolon, colon, question mark, or exclamation mark without a space).
            let last_char = word.charAt(word.length - 1)
            if (PUNCTUATION_MARKS.includes(last_char)) {
                timeElapsed += PUNCTUATION_MARKS.indexOf(last_char) * PUNCTUATION_INCREMENT
            }

            new_note.generated = "text"

            // Put additive synthesis if the word starts with a capital letter.
            if (word.charAt(0) === word.charAt(0).toUpperCase()) {
                new_note.capitalized = true
            }

            notes.push(new_note)
        }
    }

    let output = { notes, totalTime: timeElapsed }
    output.notes.forEach(note => {
        note.startTime = Math.floor(note.startTime * 10) / 10;
        note.endTime = Math.floor(note.endTime * 10) / 10;
    });
    output.totalTime = Math.floor(output.totalTime * 10) / 10;
    console.log("processText() output: ", output);

    adjustPerplexity(output);

    return output;
}

// adjustPerplexity(): fixes the mode and lfo for the current perplexity
function adjustPerplexity(output) {
    if (output.notes.length >= 3) {
        // Use perplexity of text generated notes to determine synthesis type and LFO
        // Perplexity evaluates how well the model predicts an input
        notePerplexity = perplexity(output);
        console.log("perplexity: ", notePerplexity)
        if (notePerplexity < 0.02) {
            mode = 'single';
            lfo = false;
        } else if (notePerplexity < 0.05) {
            mode = 'am';
            lfo = false;
        } else if (notePerplexity < 0.07) {
            mode = 'fm';
            lfo = false;
        } else if (notePerplexity < 0.1) {
            mode = 'am';
            lfo = true;
        } else {
            mode = 'fm';
            lfo = true;
        }
    }

    console.log("LFO: ", lfo);
    console.log("Mode: ", mode);
}

// visualize(): visualizes series of notes as they play
function visualize(notesList) {
    size = 500;
    canvas = document.getElementById("visualization");
    canvasCtx = canvas.getContext("2d");
    getStates(notesList);
    if (gradientPatternSelector.value == "radial") {
        radialPattern(canvasCtx, size, notesList);
    } else if (gradientPatternSelector.value == "diagonal") {
        linearPattern(canvasCtx, size, size, notesList)
    } else if (gradientPatternSelector.value == "horizontal") {
        linearPattern(canvasCtx, 0, size, notesList)
    } else {
        linearPattern(canvasCtx, size, 0, notesList)
    }
}

// linearPattern(): creates a linear gradient pattern for a series of notes. 
// Depending on inputs, will draw diagonal, horizontal, or vertical lines. 
function linearPattern(canvasCtx, endX, endY, notesList) {
    gradient = canvasCtx.createLinearGradient(0, 0, endX, endY);
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
}

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
        newNoteCopy.generated = "markov"
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

// getLetterDiversity(): calculates the "diversity" of the letters in a list of words. 
// Even if many letters aren't used, the input is considered "diverse" if the letters are distributed evenly.
// The more diverse the word list, the higher the letter diversity score. 
// The letter diversity score ranges from 0 (if the input contains only one letter) to 0.5 (perfectly distributed between two letters).
function getLetterDiversity(wordList) {
    // Initialize an array of 26 zeroes to store letter counts.
    const letterCounts = []
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        letterCounts.push(0)
    }

    totalLetterCounts = 0
    for (let word of wordList) {
        for (let letter of word) {
            // Ignore case.
            let index = letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
            // Ignore punctuation; if it's not a letter, then do not count it. 
            if (index >= 0 && index < 26) {
                letterCounts[index] += 1
                totalLetterCounts += 1
            }
        }
    }

    let letterDiversityScore = 1
    for (let value of letterCounts) {
        letterDiversityScore *= (1 - value / totalLetterCounts)
    }

    console.log("letter diversity score: ", letterDiversityScore)
    return letterDiversityScore
}

function getWordLengthStdDev(wordList) {
    totalLetters = 0
    for (let word of wordList) {
        totalLetters += word.length
    }

    // Calculate standard deviation of word length.
    averageWordLengthInInput = totalLetters/wordList.length
    sumOfWordLengthDifferences = 0
    
    for (let word of wordList) {
        difference = word.length - averageWordLengthInInput
        sumOfWordLengthDifferences += Math.pow(difference, 2)
    }

    return Math.sqrt(sumOfWordLengthDifferences/wordList.length)
    
}

// getNGramCounts(): gets unigram, bigram, and trigram counts for a note list
function getNGramCounts(noteList) {
    getStates(noteList);
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

// getNGram(): gets unigrams, bigrams, and trigrams for a note list
function getNGrams(noteList) {
    getStates(noteList);
    numOfNotes = Object.keys(states).length;
    unigrams = [];
    bigrams = [];
    trigrams = [];
    let i;
    for (i = 0; i < noteList.notes.length - 2; i++) {
        trigram = [states[noteList.notes[i].pitch], states[noteList.notes[i + 1].pitch], states[noteList.notes[i + 2].pitch]];
        unigrams.push(trigram.slice(0, 1));
        bigrams.push(trigram.slice(0, 2));
        trigrams.push(trigram.slice(0, 3));
    }
    if (noteList.notes.length > 1) {
        bigram = [states[noteList.notes[i].pitch], states[noteList.notes[i + 1].pitch]];
        bigrams.push(bigram.slice(0, 2));
        unigrams.push(bigram.slice(0, 1));
        i++;
    }
    if (noteList.notes.length > 0) {
        unigram = [states[noteList.notes[i].pitch]];
        unigrams.push(unigram.slice(0, 1));
    }
    return [unigrams, bigrams, trigrams];
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
function perplexity(noteList) {
    prob = [];
    prob.push(sequenceTrigramLogprob(noteList))
    return 2 ** ((-1 / noteList.notes.length + 1) * sum(prob));
}

// sequenceTrigramLogprob(): gets the logprob of the sequence
function sequenceTrigramLogprob(noteList) {
    counts = getNGramCounts(noteList);
    trigrams = getNGrams(noteList)[2];
    prob = [];
    trigrams.forEach(trigram => {
        p = smoothedTrigramProbability(noteList, trigram);
        if (p > 0) {
            prob.push(Math.log2(p));
        }
    });
    return sum(prob);
}

// smoothedTrigramProbability(): smooths the probability of the given trigram
function smoothedTrigramProbability(noteList, trigram) {
    counts = getNGramCounts(noteList);
    lambda = [1 / 3.0, 1 / 3.0, 1 / 3.0];
    a = lambda[2] * counts[2][trigram[0]][trigram[1]][trigram[2]] / counts[1][trigram[0]][trigram[1]]
    b = lambda[1] * counts[1][trigram[0]][trigram[1]] / counts[0][trigram[0]]
    c = lambda[0] * counts[0][trigram[0]] / sum(counts[0]);
    return Math.floor(100 * (a + b + c)) / 100;
}

// playNote(): plays a note
function playNote(note) {
    visualizeNote(note)
    if (note.capitalized == true) {
        playNoteAdditive(note);
    } else if (mode == "single") {
        playNoteSingle(note);
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

function visualizeNote(note) {
    setTimeout(function () {
        let rowsList = document.getElementsByClassName("sequences")
        // Append to most recent sequence.
        currentRow = rowsList[rowsList.length - 1]

        currentRow.innerText += " " + note.pitch
    }, note.startTime * 1000 + DRAW_TIME_OFFSET)
}

// playNoteSingle(): plays a single note
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