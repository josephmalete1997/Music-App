const prev = document.querySelector("#Preview");
const addTrack = document.querySelector("#add-track");
const stopButton = document.querySelector("#stop-preview");
const tempoSelect = document.querySelector("#tempo-select");
const timeline = document.querySelector(".timeline");
const timelineRuler = document.querySelector(".timeline-ruler");

let trackCount = 0;
let tempo = localStorage.getItem("tempo"); // Retrieve tempo from localStorage, default to 86 if not found
let tracks = JSON.parse(localStorage.getItem("tracks")) || []; // Retrieve tracks from localStorage

tempoSelect.value = tempo; // Set the tempo select value initially

tempoSelect.addEventListener("change", () => {
  tempo = parseInt(tempoSelect.value);
  localStorage.setItem("tempo", tempo); // Save tempo to localStorage when changed
});

let previewInterval;
const audioArray = ["sounds/kick.wav", "sounds/snare.wav", "sounds/hh1.wav"];

const createTrack = () => {
  trackCount++;
  const trackPanel = document.createElement("div");
  trackPanel.classList.add("track-panel");

  const trackName = document.createElement("div");
  trackName.innerHTML = `<select>
                        <option>Sound</option>
                        <option>Kick</option>
                        <option>Snare</option>
                        <option>Hit-hat</option>
                        <option>Clap</option>
                        </select>
                        Track ${trackCount}`;
  trackName.classList.add("track-name");

  const track = document.createElement("div");
  track.classList.add("track");

  const audio = new Audio();
  audio.src = audioArray[trackCount - 1];

  timeline.appendChild(trackPanel);
  trackPanel.appendChild(trackName);
  trackPanel.appendChild(track);
  const bars = [];

  const trackData = { name: trackName.innerHTML, bars: [] }; // Store track data

  for (let i = 0; i < 16; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    track.appendChild(bar);
    bars.push(bar);

    bar.addEventListener("click", () => {
      bar.classList.toggle("present");
      trackData.bars[i] = bar.classList.contains("present"); // Update track data
    });
  }

  tracks.push(trackData); // Push track data to tracks array

  const stopPreview = () => {
    clearInterval(previewInterval);
  };

  prev.addEventListener("click", () => {
    tempo = parseInt(tempoSelect.value);
    localStorage.setItem("tempo", tempo); // Save tempo to localStorage when changed
    localStorage.setItem("tracks", JSON.stringify(tracks)); // Save tracks to localStorage
    const intervalDuration = 60000 / tempo / 4; // Divide by 4 for 1/16 note resolution
    previewInterval = setInterval(previewMusic, intervalDuration);
  });

  stopButton.addEventListener("click", () => {
    stopPreview();
  });

  const initial = 135;
  let count = initial;

  const previewMusic = () => {
    const updateTimelineRuler = () => {
      count += 30; // Adjust for 1/16 note grid
      timelineRuler.style.left = `${count}px`;
    };

    const updateBarsColor = () => {
      const rulerLeft = parseInt(timelineRuler.style.left);

      bars.forEach((bar, index) => {
        const barLeft = bar.offsetLeft;

        if (barLeft === rulerLeft) {
          if (bar.classList.contains("present")) {
            bar.classList.add("bar-hit");
            audio.currentTime = 0;
            audio.play();
          } else {
            bar.classList.remove("bar-hit");
          }
        } else {
          bar.classList.remove("bar-hit");
        }
      });

      const barLeftLast = bars[bars.length - 1].offsetLeft;

      if (barLeftLast === rulerLeft) {
        count = initial;
      }
    };

    updateTimelineRuler();
    updateBarsColor();
  };
};
createTrack();
addTrack.addEventListener("click", createTrack);
