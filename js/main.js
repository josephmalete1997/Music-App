const prev = document.querySelector("#Preview");
const addTrack = document.querySelector("#add-track");
const stopButton = document.querySelector("#stop-preview");
const backward = document.querySelector("#reset-preview");
const tempoSelect = document.querySelector("#tempo-select");
const barSelect = document.querySelector("#bar-select");
const wave = document.querySelector("#waveform");
const timeline = document.querySelector(".timeline");
const timelineRuler = document.querySelector(".timeline-ruler");
const line = document.querySelector(".line");
const toolTop = document.querySelector(".top-tool");
const undoBtn = document.querySelector(".undo");
const redoBtn = document.querySelector(".redo");

const audioArray = [
  "sounds/CB_Kick.wav",
  "sounds/CB_Snare.wav",
  "sounds/Eminem Clap.wav",
  "sounds/Dr. Dre_Yeah.wav",
  "sounds/hh1.wav",
  "sounds/Eminem BD.wav",
  "sounds/Eminem Synth8.wav",
  "sounds/Eminem BD2.wav",
  "sounds/Eminem BD string layer.wav",
];

let instru = ["fa-drum", "fa-drum", "fa-drum"];

const soundName = audioArray.map((name) => {
  return name.slice(7).split(".")[0];
});

console.log(soundName);

let trackHistory = []; // Array to store track history for undo/redo
let currentIndex = -1; // Current index in the track history array

// Function to save the current state of bars to history

let trackCount = 0;
let tempo = localStorage.getItem("tempo") || 88; // Default tempo
let tracks = JSON.parse(localStorage.getItem("tracks")) || [];

tempoSelect.value = tempo; // Set the tempo select value initially

tempoSelect.addEventListener("change", () => {
  window.location.reload();
  tempo = parseInt(tempoSelect.value);
  localStorage.setItem("tempo", tempo);
});

const createTrack = (barCount, trackData = null) => {
  trackCount++;
  const trackPanel = document.createElement("div");
  trackPanel.classList.add("track-panel");
  const light = document.createElement("div");
  light.classList.add("light");

  const trackName = document.createElement("div");
  const speaker = document.createElement("i");
  speaker.style.marginLeft = "10px";
  speaker.style.cursor = "pointer";
  speaker.classList.add("fa-solid");
  speaker.classList.add("fa-volume-high");

  const optionList = document.createElement("div");
  optionList.classList.add("option-list");

  trackName.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent the default context menu from showing up

    // Get all option lists
    var allOptionLists = document.querySelectorAll(".option-list");

    // Close all other option lists
    allOptionLists.forEach(function (optionList) {
      optionList.style.display = "none";
    });

    // Toggle the display of the current option list
    if (optionList.style.display === "none") {
      optionList.style.display = "block";
    } else {
      optionList.style.display = "none";
    }
  });

  const clear = document.createElement("div");
  clear.innerHTML = `<i class="fa-solid fa-cut"></i> Clear`;
  const add2 = document.createElement("div");
  add2.innerHTML = `Add every 2`;
  const add4 = document.createElement("div");
  add4.innerHTML = `Add every 4`;
  const add8 = document.createElement("div");
  add8.innerHTML = `Add every 8`;
  optionList.appendChild(clear);
  optionList.appendChild(add2);
  optionList.appendChild(add4);
  optionList.appendChild(add8);
  trackName.innerHTML = `
    <!--<i class="fa-solid fa-circle-info info"></i>-->
    <i class="fa-solid ${instru[trackCount - 1]}"></i>
    <div class="tool-tip">${soundName[trackCount - 1]}</div>
    <div class="audio">
    <input type="range" class="volume" min="0" max="100" data-track="${trackCount}">
    </div>

    Track ${[trackCount - 1]}`;
  trackName.classList.add("track-name");
  trackName.appendChild(light);
  trackName.appendChild(speaker);
  trackName.appendChild(optionList);
  const track = document.createElement("div");
  track.classList.add("track");

  const audio = new Audio();
  audio.src = audioArray[trackCount - 1];

  speaker.addEventListener("click", () => {
    speaker.classList.toggle("fa-volume-high");
    speaker.classList.toggle("fa-volume-low");
    if (!speaker.classList.contains("fa-volume-high")) audio.volume = 0;
    if (speaker.classList.contains("fa-volume-high")) audio.volume = 1;
  });

  timeline.appendChild(trackPanel);
  trackPanel.appendChild(trackName);
  trackPanel.appendChild(track);

  const bars = [];

  const trackDataObj = { name: trackName.innerHTML, bars: [], audio: audio }; // Include audio object in track data

  for (let i = 1; i <= barCount; i++) {
    const bar = document.createElement("div");
    const barId = `track${trackCount}-bar${i}`;
    bar.id = barId;
    bar.classList.add("bar");
    if ((i - 1) % 8 < 4) {
      bar.classList.add("bar2");
    }
    track.appendChild(bar);
    bars.push(bar);

    // Check if "present" class exists in localStorage for this bar
    const isPresent = localStorage.getItem(barId);
    if (isPresent === "true") {
      bar.classList.add("present");
    }

    bar.addEventListener("click", () => {
      bar.classList.toggle("present");
      if (bar.classList.contains("present")) {
        localStorage.setItem(barId, true);
        saveToHistory;
      } else {
        localStorage.removeItem(barId); // Remove the item from local storage
      }
    });
    clear.addEventListener("click", () => {
      bar.classList.remove("present");
      localStorage.removeItem(barId);
    });
    function addButtonClickListener(button, condition) {
      button.addEventListener("click", () => {
        bar.classList.remove("present");
        localStorage.removeItem(barId);
        optionList.style.display = "none";
        if (condition) {
          bar.classList.add("present");
          localStorage.setItem(barId, true);
          saveToHistory;
        }
      });
    }
    addButtonClickListener(add2, (i + 1) % 2 === 0);
    addButtonClickListener(add4, (i - 1) % 4 === 0);
    addButtonClickListener(add8, (i - 1) % 8 === 0);
  }

  tracks.push(trackDataObj); // Push track data to tracks array

  const twenty = 20;
  const initial = document.querySelectorAll(".bar")[0].offsetLeft - twenty;
  let count = initial - twenty;
  let countLine = 0;
  timelineRuler.style.left = `${initial - twenty}px`;
  line.style.left = `-20px`;

  const previewMusic = () => {
    const updateTimelineRuler = () => {
      count += twenty; // Adjust for 1/16 note grid
      countLine += twenty; // Adjust for 1/16 note grid
      timelineRuler.style.left = `${count}px`;
      line.style.left = `${countLine}px`;
    };

    const updateBarsColor = () => {
      const rulerLeft = parseInt(timelineRuler.style.left);
      const barStart = bars[5].offsetLeft;
      const barEnd = bars[bars.length - 1].offsetLeft;

      bars.forEach((bar, index) => {
        const barLeft = bar.offsetLeft;
        const barWidth = bar.offsetWidth;

        if (barLeft <= rulerLeft && rulerLeft < barLeft + barWidth) {
          if (bar.classList.contains("present")) {
            bar.classList.add("bar-hit");
            light.classList.add("add-red");
            audio.currentTime = 0;
            audio.play();
          } else {
            bar.classList.remove("bar-hit");
            light.classList.remove("add-red");
          }
        } else {
          bar.classList.remove("bar-hit");
        }
      });
      //New line
      if (rulerLeft === barEnd) {
        count = initial - twenty;
        countLine = 0 - twenty;
      }

      const barLeftLast = bars[bars.length - 1].offsetLeft;
      const barWidthLast = bars[bars.length - 1].offsetWidth;

      if (rulerLeft === barLeftLast + barWidthLast - twenty) {
        count = initial;
      }
    };

    backward.addEventListener("click", () => {
      count = initial - twenty;
      countLine = 0 - twenty;
    });

    updateTimelineRuler();
    updateBarsColor();
    rollCollision();
  };

  function rollCollision() {
    const newRoll = document.querySelectorAll(".new-roll");
    const lineLeft = line.offsetLeft;
    newRoll.forEach((roll) => {
      const rollLeft = roll.offsetLeft;
      const rollWidth = roll.offsetWidth;

      if (rollLeft <= lineLeft && lineLeft < rollLeft + rollWidth) {
        roll.classList.add("hit");
        playNoteWithOctaveAndKey(roll.getAttribute("data-note"), true);
      } else {
        roll.classList.remove("hit");
        playNoteWithOctaveAndKey(roll.getAttribute("data-note"), false);
      }
    });
  }

  prev.addEventListener("click", () => {
    prev.disabled = true;
    const intervalDuration = 60000 / tempo / 4; // Divide by 4 for 1/16 note resolution
    const previewInterval = setInterval(previewMusic, intervalDuration);
    stopButton.addEventListener("click", () => {
      prev.disabled = false;
      clearInterval(previewInterval);
    });
  });
};

let barCount = 32;

barSelect.addEventListener("change", () => {
  barCount = parseInt(barSelect.value);
});

const renderTracks = (tracksToRender = tracks) => {
  // Clear existing tracks
  timeline.innerHTML = "";
  trackCount = 0;

  // Render tracks from the provided tracks array
  for (let i = 0; i < tracksToRender.length; i++) {
    createTrack(barCount, tracksToRender[i]);
  }
};

for (let i = 0; i < audioArray.length; i++) {
  createTrack(barCount);
}
addTrack.addEventListener("click", () => createTrack(barCount));

const saveButton = document.createElement("button");
saveButton.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save`;
saveButton.classList.add("add-instrument");
saveButton.id = "save-tracks-button";
toolTop.appendChild(saveButton);

saveButton.addEventListener("click", () => {
  saveTracksToFile();
});

const saveTracksToFile = () => {
  const jsonTracks = JSON.stringify(tracks, null, 2);
  const blob = new Blob([jsonTracks], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tracks.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

document.body.addEventListener("click", () => {
  document.querySelectorAll(".option-list").forEach((option) => {
    option.style.display = "none";
  });
});

// Track audio context
function playNoteWithOctaveAndKey(key, shouldPlay) {
  const sounds = {
    C: "piano/A.wav",
    "C#": "piano/C#.wav",
    D: "piano/D.wav",
    "D#": "piano/D#.wav",
    E: "piano/E.wav",
    F: "piano/F.wav",
    "F#": "piano/F#.wav",
    G: "piano/G.wav",
    "G#": "piano/G#.wav",
    A: "piano/A.wav",
    "A#": "piano/A#.wav",
    B: "piano/B.wav",
  };

  const audio = new Audio();
  audio.src = sounds[key];
  audio.volume = 0.5;

  if (shouldPlay) {
    audio.play();
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}

const keyButtons = document.querySelectorAll(".key");
keyButtons.forEach((key) => {
  key.addEventListener("click", () => {
    playNoteWithOctaveAndKey(key.dataset.note, true);
  });
});
