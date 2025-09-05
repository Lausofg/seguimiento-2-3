const noteInput = document.getElementById('new-note-input');
const addButton = document.getElementById('add-note-button');
const notesContainer = document.getElementById('notes-container');
const toggleThemeButton = document.getElementById('toggle-theme-button');
const body = document.body;

const colors = ['note-yellow', 'note-blue', 'note-pink', 'note-green', 'note-lilac'];

function randomColorClass() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function createNoteElement(text, colorClass) {
  const noteDiv = document.createElement('div');
  noteDiv.classList.add('note', colorClass);
  const deleteButton = document.createElement('span');
  deleteButton.classList.add('delete-btn');
  deleteButton.setAttribute('role', 'button');
  deleteButton.setAttribute('aria-label', 'Eliminar nota');
  deleteButton.textContent = '×';
  const content = document.createElement('div');
  content.classList.add('note-content');
  content.textContent = text;
  noteDiv.appendChild(deleteButton);
  noteDiv.appendChild(content);
  return noteDiv;
}

function serializeNotes() {
  const items = [];
  document.querySelectorAll('#notes-container .note').forEach(note => {
    const textEl = note.querySelector('.note-content');
    const color = colors.find(c => note.classList.contains(c)) || colors[0];
    items.push({ text: textEl?.textContent ?? '', color });
  });
  return items;
}

function saveNotes() {
  const data = serializeNotes();
  localStorage.setItem('notes', JSON.stringify(data));
}

function loadNotes() {
  const raw = localStorage.getItem('notes');
  if (!raw) return;
  try {
    const notes = JSON.parse(raw);
    notes.forEach(n => {
      const el = createNoteElement(n.text || '', n.color || randomColorClass());
      notesContainer.appendChild(el);
    });
  } catch (e) {
    localStorage.removeItem('notes');
  }
}

function setInitialTheme() {
  const isDarkMode = localStorage.getItem('isDarkMode') === 'true';
  body.classList.toggle('dark-mode', isDarkMode);
  toggleThemeButton.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
  toggleThemeButton.setAttribute('aria-pressed', String(isDarkMode));
}

noteInput.addEventListener('input', () => {
  addButton.disabled = noteInput.value.trim() === '';
});

noteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !addButton.disabled) {
    addButton.click();
  }
});

addButton.addEventListener('click', () => {
  const noteText = noteInput.value.trim();
  if (!noteText) return;
  const el = createNoteElement(noteText, randomColorClass());
  notesContainer.appendChild(el);
  noteInput.value = '';
  addButton.disabled = true;
  saveNotes();
});

notesContainer.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('delete-btn')) {
    target.parentElement.remove();
    saveNotes();
  }
});

notesContainer.addEventListener('dblclick', (event) => {
  const note = event.target.closest('.note');
  if (!note) return;
  const content = note.querySelector('.note-content');
  if (!content) return;
  const currentText = content.textContent;
  note.classList.add('editing');
  note.innerHTML = '';
  const textarea = document.createElement('textarea');
  textarea.value = currentText ?? '';
  note.appendChild(textarea);
  textarea.focus();
  function finishEdit(save = true) {
    const newText = save ? textarea.value.trim() : currentText;
    note.classList.remove('editing');
    note.innerHTML = '';
    const deleteButton = document.createElement('span');
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('role', 'button');
    deleteButton.setAttribute('aria-label', 'Eliminar nota');
    deleteButton.textContent = '×';
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('note-content');
    contentDiv.textContent = newText;
    note.appendChild(deleteButton);
    note.appendChild(contentDiv);
    saveNotes();
  }
  textarea.addEventListener('blur', () => finishEdit(true));
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEdit(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finishEdit(false);
    }
  });
});

toggleThemeButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('isDarkMode', String(isDarkMode));
  toggleThemeButton.textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
  toggleThemeButton.setAttribute('aria-pressed', String(isDarkMode));
});

setInitialTheme();
loadNotes();
addButton.disabled = noteInput.value.trim() === '';