// =====================================
// Alles mit ChatGPT
// =====================================
// =====================================
// 📥 1. Daten aus dem Browser-Speicher (localStorage) laden
// =====================================
const savedData = JSON.parse(localStorage.getItem('packliste')) || {};

// =====================================
// 🔧 2. Hauptbereich (div.packlist) vorbereiten
// =====================================
const main = document.querySelector('.packlist');
main.innerHTML = ''; // Inhalt leeren

// =====================================
// 📂 3. Alle gespeicherten Kategorien anzeigen
// =====================================
Object.keys(savedData).forEach(name => {
  createCategory(name, savedData[name]);
});

// =====================================
// ➕ 4. Neue Kategorie hinzufügen (per Button-Klick)
// =====================================
document.getElementById('add-category').addEventListener('click', () => {
  const nameInput = document.getElementById('new-category-name');
  const name = nameInput.value.trim();
  if (name && !savedData[name]) {
    savedData[name] = [];
    localStorage.setItem('packliste', JSON.stringify(savedData));
    createCategory(name, []);
    nameInput.value = '';
  }
});

// =====================================
// 🧱 5. Funktion zum Erstellen einer neuen Kategoriebox
// =====================================
function createCategory(name, items) {
  const categoryDiv = document.createElement('div');
  categoryDiv.classList.add('category');

  // 📝 Überschrift mit Bearbeiten- und Löschen-Icons
  const heading = document.createElement('h2');
  heading.innerHTML = `${name} <span class="edit-cat">✏️</span> <span class="delete-cat">🗑️</span>`;
  heading.style.cursor = 'default';

  // 🖊️ Kategorie umbenennen
  heading.querySelector('.edit-cat').addEventListener('click', () => {
    const newName = prompt("Kategorie umbenennen:", name);
    if (newName && newName !== name && !savedData[newName]) {
      savedData[newName] = savedData[name];
      delete savedData[name];
      localStorage.setItem('packliste', JSON.stringify(savedData));
      location.reload();
    }
  });

  // ❌ Kategorie löschen
  heading.querySelector('.delete-cat').addEventListener('click', () => {
    const confirmDelete = confirm(`Kategorie "${name}" wirklich löschen?`);
    if (confirmDelete) {
      delete savedData[name];
      localStorage.setItem('packliste', JSON.stringify(savedData));
      location.reload();
    }
  });

  categoryDiv.appendChild(heading);

  // 📋 Liste für Einträge vorbereiten
  const ul = document.createElement('ul');
  ul.classList.add('item-list');

  // 🔁 Bestehende Einträge einfügen
  items.forEach(item => ul.appendChild(createListItem(item, name)));

  // ⌨️ Eingabefeld für neue Einträge
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'new-item';
  input.placeholder = 'Neuer Eintrag...';

  // ➕ Neue Einträge hinzufügen (Enter drücken)
  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
      const newText = this.value.trim();
      savedData[name].push(newText);
      localStorage.setItem('packliste', JSON.stringify(savedData));
      ul.appendChild(createListItem(newText, name));
      this.value = '';
    }
  });

  // ✏️ 🗑️ Einzelne Einträge bearbeiten oder löschen
  ul.addEventListener('click', function (e) {
    const target = e.target;
    const li = target.closest('li');
    const label = li?.querySelector('label');
    if (!label) return;

    // Eintrag löschen
    if (target.classList.contains('delete')) {
      savedData[name] = savedData[name].filter(item => item !== label.textContent);
      localStorage.setItem('packliste', JSON.stringify(savedData));
      li.remove();
    }

    // Eintrag bearbeiten
    if (target.classList.contains('edit')) {
      const oldText = label.textContent;
      const newText = prompt("Eintrag bearbeiten:", oldText);
      if (newText && newText.trim()) {
        label.textContent = newText.trim();
        const index = savedData[name].indexOf(oldText);
        if (index !== -1) savedData[name][index] = newText.trim();
        localStorage.setItem('packliste', JSON.stringify(savedData));
      }
    }
  });

  // Alles einfügen in die Kategorie
  categoryDiv.appendChild(ul);
  categoryDiv.appendChild(input);
  main.appendChild(categoryDiv);
}

// =====================================
// 🧩 6. Funktion zum Erstellen eines einzelnen Listeneintrags
// =====================================
function createListItem(text, category) {
  const li = document.createElement('li');
  const id = 'item-' + Date.now() + Math.random().toString().slice(2, 6);

  li.innerHTML = `
    <input type="checkbox" id="${id}">
    <label for="${id}">${text}</label>
    <span class="icon edit">✏️</span>
    <span class="icon delete">🗑️</span>
  `;
  return li;
}

// =====================================
// 🌗 7. DARK MODE TOGGLE
// =====================================
const toggle = document.getElementById('mode-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const storedMode = localStorage.getItem('theme');
document.body.classList.add(storedMode || (prefersDark ? 'dark' : 'light'));
toggle.checked = document.body.classList.contains('dark');

toggle.addEventListener('change', () => {
  const mode = toggle.checked ? 'dark' : 'light';
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(mode);
  localStorage.setItem('theme', mode);
});

// =====================================
// 📝 8. NOTIZEN speichern
// =====================================
const notes = document.querySelector('.notes');
const saveBtn = document.getElementById('save-notes');
notes.value = localStorage.getItem('notizen') || '';

saveBtn.addEventListener('click', () => {
  localStorage.setItem('notizen', notes.value);
});
