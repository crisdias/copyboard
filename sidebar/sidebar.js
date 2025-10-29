// Application state
let notes = [];
let draggedElement = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Copyboard sidebar loaded');
  init();
});

function init() {
  setupEventListeners();
  loadNotes();
}

function setupEventListeners() {
  const addButton = document.getElementById('add-note');
  addButton.addEventListener('click', addNote);
}

// ============ ADD NOTE ============
function addNote() {
  const note = {
    id: generateId(),
    content: '',
    createdAt: Date.now()
  };

  notes.unshift(note); // Add to beginning of array
  saveNotes();
  renderNotes();

  // Immediately put note in edit mode
  setTimeout(() => {
    const noteElement = document.querySelector(`[data-note-id="${note.id}"]`);
    if (noteElement) {
      startEditMode(noteElement, note.id);
    }
  }, 100);
}

// ============ RENDER NOTES ============
function renderNotes() {
  const container = document.getElementById('notes-container');
  container.innerHTML = '';

  notes.forEach(note => {
    const noteElement = createNoteElement(note);
    container.appendChild(noteElement);
  });
}

function createNoteElement(note) {
  const div = document.createElement('div');
  div.className = 'note';
  div.setAttribute('data-note-id', note.id);
  div.setAttribute('draggable', 'true');

  const isTruncated = note.content.split('\n').length > 6 || note.content.length > 300;

  div.innerHTML = `
    <div class="note-content ${isTruncated ? 'note-truncated' : ''}">${escapeHtml(note.content)}</div>
    <div class="note-actions">
      <button class="note-action-btn edit" title="Editar">✏️</button>
      <button class="note-action-btn delete" title="Apagar">🗑️</button>
    </div>
  `;

  // Event listeners
  div.addEventListener('click', (e) => {
    if (!e.target.closest('.note-actions')) {
      copyToClipboard(note.content, div);
    }
  });

  const editBtn = div.querySelector('.edit');
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startEditMode(div, note.id);
  });

  const deleteBtn = div.querySelector('.delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showDeleteConfirmation(note.id);
  });

  // Drag and drop
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('drop', handleDrop);
  div.addEventListener('dragend', handleDragEnd);

  return div;
}

// ============ COPY TO CLIPBOARD ============
function copyToClipboard(text, element) {
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    // Visual feedback
    element.classList.add('copied');
    setTimeout(() => {
      element.classList.remove('copied');
    }, 500);
    console.log('Text copied to clipboard');
  }).catch(err => {
    console.error('Error copying:', err);
  });
}

// ============ EDIT NOTE ============
function startEditMode(noteElement, noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  const contentDiv = noteElement.querySelector('.note-content');
  const actions = noteElement.querySelector('.note-actions');

  // Hide actions during edit
  actions.style.display = 'none';

  // Create textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'note-textarea';
  textarea.value = note.content;

  // Replace content with textarea
  contentDiv.style.display = 'none';
  noteElement.insertBefore(textarea, contentDiv);
  textarea.focus();
  textarea.select();

  // Function to save and exit edit mode
  const saveAndExit = () => {
    note.content = textarea.value;
    saveNotes();
    renderNotes();
  };

  // Save on blur
  textarea.addEventListener('blur', saveAndExit);

  // Save with Ctrl+Enter or Esc to cancel
  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      saveAndExit();
    } else if (e.key === 'Escape') {
      renderNotes(); // Cancel edit
    }
  });
}

// ============ DELETE NOTE ============
function showDeleteConfirmation(noteId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-title">Delete note?</div>
      <div class="modal-message">This action cannot be undone.</div>
      <div class="modal-actions">
        <button class="modal-btn cancel">Cancel</button>
        <button class="modal-btn confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector('.cancel');
  const confirmBtn = modal.querySelector('.confirm');

  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });

  confirmBtn.addEventListener('click', () => {
    deleteNote(noteId);
    modal.remove();
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function deleteNote(noteId) {
  notes = notes.filter(note => note.id !== noteId);
  saveNotes();
  renderNotes();
}

// ============ DRAG AND DROP ============
function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';

  const container = document.getElementById('notes-container');
  const afterElement = getDragAfterElement(container, e.clientY);

  if (afterElement == null) {
    container.appendChild(draggedElement);
  } else {
    container.insertBefore(draggedElement, afterElement);
  }

  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  // Update note order based on visual order
  const container = document.getElementById('notes-container');
  const noteElements = Array.from(container.querySelectorAll('.note'));

  const newOrder = noteElements.map(el => {
    const id = el.getAttribute('data-note-id');
    return notes.find(note => note.id === id);
  }).filter(note => note !== undefined);

  notes = newOrder;
  saveNotes();

  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============ STORAGE ============
function saveNotes() {
  browser.storage.local.set({ notes: notes }).then(() => {
    console.log('Notes saved');
  }).catch(err => {
    console.error('Error saving notes:', err);
  });
}

function loadNotes() {
  browser.storage.local.get('notes').then(result => {
    if (result.notes) {
      notes = result.notes;
      console.log(`${notes.length} notes loaded`);
    } else {
      notes = [];
      console.log('No saved notes');
    }
    renderNotes();
  }).catch(err => {
    console.error('Error loading notes:', err);
    notes = [];
    renderNotes();
  });
}

// ============ UTILITIES ============
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
