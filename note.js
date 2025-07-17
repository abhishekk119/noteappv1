const addButton = document.getElementById("add-btn");
const notewrapper = document.getElementById("notewrapper");

addButton.addEventListener("click", function () {
  addANote();
  sortNotesByDate("desc");
});

function addANote() {
  const noteTitle = document.getElementById("title-area").value.trim();
  const noteBody = document.getElementById("take-a-note-textarea").value;
  //check if the note is empty
  if (noteBody === "") {
    return;
  }
  //create note div
  const note = document.createElement("div");
  note.classList.add("note");
  note.setAttribute("tabindex", "0");

  // Add timestamp as data attribute
  const timestamp = new Date();
  note.dataset.createdAt = timestamp.toISOString();
  const dateElement = document.createElement("small");
  dateElement.textContent = timestamp.toLocaleString();
  dateElement.style.display = "block";
  dateElement.style.marginBottom = "8px";
  dateElement.style.opacity = "0.7";

  //create h3 element for title
  const titleElement = document.createElement("h3");
  titleElement.textContent = noteTitle || "Untitled Note";

  //create p element for notebody
  const bodyElement = document.createElement("p");
  bodyElement.innerHTML = noteBody
    .replace(/\n/g, "<br>")
    .replace(/ /g, "&nbsp;"); // <-- Fix here

  //create contentDiv to hold bodyElement
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("note-content");

  //add (append) titleElement and dateElement to note div
  note.appendChild(titleElement);
  note.appendChild(dateElement);
  //append bodyElement to contentDiv
  contentDiv.appendChild(bodyElement);
  //append contentDiv to note
  note.appendChild(contentDiv);

  //create noteoptions div
  const noteOptionsDiv = document.createElement("div");
  noteOptionsDiv.classList.add("noteoptions");

  //create color selector button
  const colorSelectorButton = document.createElement("button");
  colorSelectorButton.style.background = "none";
  colorSelectorButton.style.border = "none";
  colorSelectorButton.style.cursor = "pointer";
  const img = document.createElement("img");
  img.src = "color.png"; // replace with your image URL
  img.alt = "Icon";
  img.style.width = "20px"; // optional styling
  img.style.height = "20px";
  colorSelectorButton.appendChild(img);

  //delete note button option
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.type = "button"; // Prevent form submission
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "delete.png"; // Update this path
  deleteIcon.alt = "Change color";
  deleteIcon.classList.add("delete-icon");
  deleteIcon.style.width = "25px"; // Adjust size as needed
  deleteIcon.style.height = "25px";
  deleteButton.appendChild(deleteIcon);

  //pinned note button
  const pinnedButton = document.createElement("button");
  pinnedButton.classList.add("pin-button");
  pinnedButton.style.background = "none";
  pinnedButton.style.border = "none";
  pinnedButton.style.cursor = "pointer";
  const pinImg = document.createElement("img");
  pinImg.src = "pinned.png"; // replace with your image URL
  pinImg.alt = "Icon";
  pinImg.style.width = "20px"; // optional styling
  pinImg.style.height = "20px";
  pinnedButton.appendChild(pinImg);

  //append colorSelectorButton and deleteButton to noteOptionsDiv
  noteOptionsDiv.appendChild(pinnedButton);
  noteOptionsDiv.appendChild(colorSelectorButton);
  noteOptionsDiv.appendChild(deleteButton);
  //append noteOptionsDiv to note
  note.appendChild(noteOptionsDiv);
  //append note to notewrapper
  notewrapper.appendChild(note);

  deleteButton.addEventListener("click", function (e) {
    e.stopPropagation();
    handleDeleteNote(note);
  });

  note.addEventListener("click", function () {
    openNote(note);
  });

  colorSelectorButton.addEventListener("click", function (e) {
    e.stopPropagation();

    const colorSelector = document.getElementById("color-selector");

    // Make it temporarily visible to measure
    colorSelector.style.display = "flex";
    colorSelector.style.visibility = "hidden";
    colorSelector.style.position = "absolute";

    // Append to body to avoid being clipped by note
    document.body.appendChild(colorSelector);

    // Measure position of the button
    const btnRect = this.getBoundingClientRect();
    const selectorWidth = colorSelector.offsetWidth;
    const selectorHeight = colorSelector.offsetHeight;

    // Calculate position: center over the button, above it
    const top = window.scrollY + btnRect.top - selectorHeight - 6;
    const left =
      window.scrollX + btnRect.left + btnRect.width / 2 - selectorWidth / 2;

    // Set final position and show
    colorSelector.style.top = `${top}px`;
    colorSelector.style.left = `${left}px`;
    colorSelector.style.visibility = "visible";
    colorSelector.style.zIndex = "9999";

    // Store reference
    colorSelector.currentNote = note;
  });

  pinnedButton.addEventListener("click", function (e) {
    e.stopPropagation();
    handleNotePinning(note);
  });

  //make the title and note taking area clear
  document.getElementById("title-area").value = "";
  document.getElementById("take-a-note-textarea").value = "";
}

function openNote(note) {
  // Check if note is already expanded
  if (note.classList.contains("expanded")) {
    return; // Exit if note is already open
  }

  const placeholder = document.createElement("div");
  placeholder.classList.add("note-placeholder");
  note.parentNode.insertBefore(placeholder, note);

  // Add expanded class
  note.classList.add("expanded");
  note.placeholder = placeholder;

  // Make content editable
  const titleElement = note.querySelector("h3");
  const contentElement = note.querySelector(".note-content p");
  titleElement.contentEditable = true;
  contentElement.contentEditable = true;

  // Show backdrop
  const backdrop = document.getElementById("backdrop");
  backdrop.style.display = "block";

  // Close when clicking backdrop
  backdrop.onclick = () => {
    note.classList.remove("expanded");
    backdrop.style.display = "none";
    // Remove placeholder if it exists
    if (note.placeholder && note.placeholder.parentNode) {
      note.placeholder.parentNode.removeChild(note.placeholder);
    }
    // Save edited content
    note.querySelector("h3").textContent = titleElement.textContent;
    note.querySelector(".note-content p").innerHTML =
      contentElement.innerHTML.replace(/\n/g, "<br>");
  };
}

function sortNotesByDate(order = "desc") {
  const wrapper = document.getElementById("notewrapper");
  // Only select notes that are direct children of notewrapper
  const notes = Array.from(wrapper.querySelectorAll(".note"));

  notes.sort((a, b) => {
    const dateA = new Date(a.dataset.createdAt);
    const dateB = new Date(b.dataset.createdAt);
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Re-append notes in sorted order
  notes.forEach((note) => wrapper.appendChild(note));
}

function handleDeleteNote(noteToDelete) {
  // Remove main note
  notewrapper.removeChild(noteToDelete);
  document.getElementById("backdrop").style.display = "none";
}

function handleColorSelection(colorCode) {
  const colorSelector = document.getElementById("color-selector");
  if (colorSelector.currentNote) {
    colorSelector.currentNote.style.backgroundColor = colorCode;
    colorSelector.currentNote.style.borderColor = colorCode;
  }
  colorSelector.style.display = "none"; // Hide after selection
}

function handleNotePinning(note) {
  const pinnedNotesDiv = document.getElementById("pinned-notes");
  const pinnedNotesArea = document.getElementById("pinned-notes-wrapper");
  pinnedNotesDiv.style.opacity = "1";
  pinnedNotesArea.style.display = "flex";
  pinnedNotesArea.appendChild(note);

  const pinButton = note.querySelector(".pin-button");
  if (pinButton) {
    // Store the original pin button as a data attribute
    pinButton.style.display = "none";

    const unpinButton = document.createElement("button");
    unpinButton.classList.add("unpin-button");
    unpinButton.style.background = "none";
    unpinButton.style.border = "none";
    unpinButton.style.cursor = "pointer";
    const unpinImg = document.createElement("img");
    unpinImg.src = "unpin.png";
    unpinImg.alt = "Unpin";
    unpinImg.style.width = "20px";
    unpinImg.style.height = "20px";
    unpinButton.appendChild(unpinImg);

    // Insert the unpin button before the hidden pin button
    pinButton.parentNode.insertBefore(unpinButton, pinButton);

    unpinButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const noteWrapper = document.getElementById("notewrapper");
      noteWrapper.appendChild(note);
      sortNotesByDate("desc");

      // Remove the unpin button
      unpinButton.remove();
      // Show the original pin button again
      pinButton.style.display = "block";

      if (pinnedNotesArea.children.length === 0) {
        pinnedNotesDiv.style.opacity = "0";
        pinnedNotesArea.style.display = "none";
      }
    });
  }
}
