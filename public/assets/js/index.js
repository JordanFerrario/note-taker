let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

// Show an element
const show = (elem) => {
  elem.style.display = "inline";
};

// Hide an element
const hide = (elem) => {
  elem.style.display = "none";
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// Retrieve notes from server
const getNotes = () =>
  fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        // Checks if the response status is not successful. Logs status afterwards.
        console.error(`Server returned status: ${response.status}`);
        return []; // Then returns an empty array as a fallback
      }
      return response.json(); // Parses JSON content from response body if successful
    })
    .catch((error) => {
      // Catches any network or fetching errors. Logs error afterwards.
      console.error("Error fetching notes:", error);
      return []; // Then returns empty array as a fallback
    });

// Save note to server
const saveNote = (note) =>
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  })
    .then((response) => {
      // Check if the reponse is ok. If not, throw a new error and skip to .catch block
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Error handling
      }
      return response.json(); // Parse JSON content from response body if successful
    })
    .catch((error) => {
      // Log any network or parsing errors to the console
      console.error("Error saving the note:", error);
    });

// Delete note from server by matching its ID
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      // Check if the reponse is ok. If not, throw a new error and skip to .catch block
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      // Log any network or fetch-related errors to the console
      console.error("There's a problem with the fetch operation:", error);
    });

const renderActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);

  if (activeNote.id) {
    show(newNoteBtn);
    noteTitle.setAttribute("readonly", true);
    noteText.setAttribute("readonly", true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(newNoteBtn);
    noteTitle.removeAttribute("readonly");
    noteText.removeAttribute("readonly");
    noteTitle.value = "";
    noteText.value = "";
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };

  saveNote(newNote)
    .then(() => {
      getAndRenderNotes();
      renderActiveNote();
    })
    .catch((error) => {
      console.error("Error saving note:", error); // Logs error to the console
    });
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute("data-note")).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute("data-note"));
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

// Renders the appropriate buttons based on the state of the form
const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = (notes) => {
  if (window.location.pathname === "/notes.html") {
    noteList.forEach((el) => (el.innerHTML = ""));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement("li");
    liEl.classList.add("list-group-item");

    const spanEl = document.createElement("span");
    spanEl.classList.add("list-item-title");
    spanEl.innerText = text;
    spanEl.addEventListener("click", handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement("i");
      delBtnEl.classList.add(
        "fas",
        "fa-trash-alt",
        "float-right",
        "text-danger",
        "delete-note"
      );
      delBtnEl.addEventListener("click", handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (notes.length === 0) {
    noteListItems.push(createLi("No saved Notes", false));
  }

  notes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    noteListItems.push(li);
  });

  if (window.location.pathname === "/notes.html") {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () =>
  getNotes()
    .then(renderNoteList)
    .catch((error) => {
      console.error("Error fetching and rendering notes:", error);
    });

// Loads buttons after DOM has finished loading only if user is on notes.html page
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/notes.html") {
    noteForm = document.querySelector(".note-form");
    noteTitle = document.querySelector(".note-title");
    noteText = document.querySelector(".note-textarea");
    saveNoteBtn = document.querySelector(".save-note");
    newNoteBtn = document.querySelector(".new-note");
    clearBtn = document.querySelector(".clear-btn");
    noteList = document.querySelectorAll(".list-container .list-group");

    // adds event listeners to buttons
    saveNoteBtn.addEventListener("click", handleNoteSave);
    newNoteBtn.addEventListener("click", handleNewNoteView);
    clearBtn.addEventListener("click", renderActiveNote);
    noteForm.addEventListener("input", handleRenderBtns);
    noteTitle.addEventListener("input", handleRenderBtns);
    noteText.addEventListener("input", handleRenderBtns);
  }
});

getAndRenderNotes();
