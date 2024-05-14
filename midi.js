function saveAsMIDI() {
  const { Midi } = require("@tonejs/midi");

  const midi = new Midi();

  // Set tempo
  midi.header.tempos.push({ ticks: 0, bpm: tempo });

  // Add tracks
  tracks.forEach((trackData, trackIndex) => {
    const track = new Midi.Track();
    trackData.bars.forEach((bar, barIndex) => {
      if (bar.classList.contains("present")) {
        const note = new Midi.NoteEvent({
          pitch: 60 + trackIndex, // Example pitch, you might need to adjust this
          duration: "16n", // 1/16 note duration
          time: `${barIndex}:0:0`, // Bar position
          velocity: 100, // Example velocity, you might need to adjust this
        });
        track.addEvent(note);
      }
    });
    midi.addTrack(track);
  });

  // Convert MIDI object to binary MIDI file
  const midiData = midi.toArray();

  // Download the MIDI file
  const blob = new Blob([midiData], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "song.mid";
  a.click();
  window.URL.revokeObjectURL(url);
}
