const prev = document.querySelector("#Preview");
const addTrack = document.querySelector("#add-track");
const stopButton = document.querySelector("#stop-preview"); // Move stopButton declaration here
const tempoSelect = document.querySelector("#tempo-select");
const barSelect = document.querySelector("#bar-select");
const timeline = document.querySelector(".timeline");
const timelineRuler = document.querySelector(".timeline-ruler");

let trackCount = 0;
let tempo = 88; // Default tempo
let tracks = [];

tempoSelect.value = tempo; // Set the tempo select value initially

tempoSelect.addEventListener("change", () => {
  tempo = parseInt(tempoSelect.value);
});

const audioArray = [
  "sounds/CB_Kick.wav",
  "sounds/CB_Snare.wav",
  "sounds/CB_Hat.wav",
  "sounds/2Pac_Keys.wav",
  "sounds/hh1.wav",
  "sounds/Eminem BD.wav",
  "sounds/Eminem BD2.wav",
  "sounds/Eminem BD string layer.wav",
];

const createTrack = (barCount) => {
  trackCount++;
  const trackPanel = document.createElement("div");
  trackPanel.classList.add("track-panel");

  const trackName = document.createElement("div");
  trackName.innerHTML = `
  <i class="fa-solid fa-circle-info info"></i>
  <div class="tool-tip">${audioArray[trackCount - 1]}</div>
  <div class="audio"><i class="fa-solid fa-volume-high"></i>
  <input type="range" class="volume" min="0" max="100" data-track="${trackCount}">
  </div>
                        
                           Track ${trackCount}`;
  trackName.classList.add("track-name");

  const track = document.createElement("div");
  track.classList.add("track");

  const audio = new Audio();
  audio.src = audioArray[trackCount - 1];

  const speaker = document.querySelectorAll(".audio");
  const volumes = document.querySelectorAll(".volume");
  volumes.forEach((volume) => {
    volume.addEventListener("change", (event) => {
      const trackNumber = event.target.dataset.track;
      const currentVolume = event.target.value;
      // Adjust volume for the corresponding track
      tracks[trackNumber - 1].audio.volume = currentVolume / 100;
      // Save the volume state to localStorage
      localStorage.setItem(`volume_${trackNumber}`, currentVolume);
    });

    // Retrieve and set the initial volume state from localStorage
    const trackNumber = volume.dataset.track;
    const storedVolume = localStorage.getItem(`volume_${trackNumber}`);
    if (storedVolume !== null && volume.value === "") {
      volume.value = storedVolume;
      tracks[trackNumber - 1].audio.volume = storedVolume / 100;
    }
  });

  timeline.appendChild(trackPanel);
  trackPanel.appendChild(trackName);
  trackPanel.appendChild(track);
  const bars = [];

  const trackData = { name: trackName.innerHTML, bars: [], audio: audio }; // Include audio object in track data

  for (let i = 1; i <= barCount; i++) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    track.appendChild(bar);
    bars.push(bar);

    bar.addEventListener("click", () => {
      bar.classList.toggle("present");
    });
  }

  tracks.push(trackData); // Push track data to tracks array

  const initial = document.querySelector(".bar").offsetLeft;
  let count = initial - 30;
  timelineRuler.style.left = `${initial - 30}px`;

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
        count = initial - 30;
      }
    };

    updateTimelineRuler();
    updateBarsColor();
  };

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
for (let i = 0; i < audioArray.length; i++) {
  createTrack(barCount);
}
addTrack.addEventListener("click", () => createTrack(barCount));
