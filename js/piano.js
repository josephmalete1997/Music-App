const pianoBars = document.querySelector(".piano-bars");
const keys = document.querySelectorAll(".key");

// Load rolls state from localStorage
const rollsState = JSON.parse(localStorage.getItem("rollsState")) || {};

const createBars = () => {
  for (let i = 0; i < keys.length; i++) {
    const bar = document.createElement("div");
    bar.classList.add("piano-bar");
    for (let j = 0; j < 32; j++) {
      const roll = document.createElement("div");
      roll.setAttribute("data-note", keys[i].getAttribute("data-note"));
      roll.classList.add("roll");
      const rollId = `track${i}-roll${j}`;
      roll.id = rollId;
      roll.style.zIndex = 0;
      roll.style.position = "absolute";
      if (j > 0) {
        roll.style.marginLeft = `${20 * j}px`;
      }

      // Set roll state from localStorage if available
      if (rollsState[rollId]) {
        roll.classList.add("new-roll");
        roll.style.width = rollsState[rollId].width;
        roll.style.zIndex = rollsState[rollId].zIndex;
      }

      roll.addEventListener("click", () => {
        if (roll.classList.contains("new-roll")) {
          roll.style.zIndex = 10;
        } else {
          roll.style.zIndex = 0;
        }
        roll.classList.add("new-roll");
        // Save roll state when clicked
        rollsState[rollId] = {
          width: roll.style.width,
          zIndex: roll.style.zIndex,
        };
        localStorage.setItem("rollsState", JSON.stringify(rollsState));
      });

      //Remove

      // Create a new mouse event
      roll.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        removeClass();
      });
      function removeClass() {
        roll.classList.remove("new-roll");
        roll.style.width = "20px";
        roll.style.zIndex = 0;
        // Remove roll state when right-clicked
        delete rollsState[rollId];
        localStorage.setItem("rollsState", JSON.stringify(rollsState));
      }
      // resize notes

      let isResizing = false;
      let initialWidth;
      let initialMousePosition;
      let resizingKey;

      function extendWidthOnMouseDown(event) {
        isResizing = true;
        resizingKey = event.target;
        initialWidth = parseFloat(window.getComputedStyle(resizingKey).width);
        initialMousePosition = event.clientX;
      }

      function onMouseMove(event) {
        if (!isResizing) return;

        const mouseDeltaX = event.clientX - initialMousePosition;
        const newWidth = initialWidth + mouseDeltaX;
        resizingKey.style.width = newWidth + "px";
        resizingKey.style.zIndex = 10;
      }

      function onMouseUp() {
        if (!isResizing) return;
        isResizing = false;
        // Save roll state when resizing stops, only if it has the "new-roll" class
        if (resizingKey.classList.contains("new-roll")) {
          roll.style.zIndex = 10;
          rollsState[rollId] = {
            width: resizingKey.style.width,
            zIndex: resizingKey.style.zIndex,
          };
          localStorage.setItem("rollsState", JSON.stringify(rollsState));
        }
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      roll.addEventListener("mousedown", extendWidthOnMouseDown);

      bar.append(roll);
    }
    pianoBars.appendChild(bar);
  }
};
createBars();
