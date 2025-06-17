// ===============================
// Urlaubspackliste – Finales script.js
// Backend-Speicherung mit Node.js + SQLite
// ===============================

const main = document.querySelector('.packlist');
main.innerHTML = '';

const toggle = document.getElementById('mode-toggle');
const notes = document.querySelector('.notes');
const saveBtn = document.getElementById('save-notes');

let categories = [];

// === DARK MODE ===
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

// === NOTIZEN LADEN/SPEICHERN ===
fetch('http://localhost:3000/notes')
  .then(res => res.json())
  .then(data => notes.value = data.content || '');

saveBtn.addEventListener('click', () => {
  fetch('http://localhost:3000/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: notes.value })
  });
});

// === KATEGORIEN & ITEMS LADEN ===
fetch('http://localhost:3000/categories')
  .then(res => res.json())
  .then(async data => {
    if (data.length === 0) {
      const defaults = ['Kleidung', 'Kosmetik', 'Technik', 'Dokumente'];
      for (let name of defaults) {
        await fetch('http://localhost:3000/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      }
      return fetch('http://localhost:3000/categories').then(res => res.json());
    }
    return data;
  })
  .then(async data => {
    categories = data;
    for (let cat of categories) {
      const items = await fetch(`http://localhost:3000/items?category_id=${cat.id}`).then(res => res.json());
      createCategory(cat, items);
    }
  });

// === NEUE KATEGORIE HINZUFÜGEN ===
document.getElementById('add-category').addEventListener('click', async () => {
  const input = document.getElementById('new-category-name');
  const name = input.value.trim();
  if (!name) return;

  await fetch('http://localhost:3000/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const newCatList = await fetch('http://localhost:3000/categories').then(res => res.json());
  const last = newCatList[newCatList.length - 1];
  createCategory(last, []);
  input.value = '';
});

function createCategory(cat, items) {
  const div = document.createElement('div');
  div.classList.add('category');

  const heading = document.createElement('h2');
  heading.innerHTML = `${cat.name} <span class="edit-cat">✏️</span> <span class="delete-cat">🗑️</span>`;

  heading.querySelector('.edit-cat').addEventListener('click', async () => {
    const newName = prompt('Kategorie umbenennen:', cat.name);
    if (!newName || newName === cat.name) return;
    await fetch('http://localhost:3000/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id })
    });
    await fetch('http://localhost:3000/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    location.reload();
  });

  heading.querySelector('.delete-cat').addEventListener('click', async () => {
    if (!confirm(`Kategorie "${cat.name}" wirklich löschen?`)) return;
    await fetch('http://localhost:3000/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id })
    });
    location.reload();
  });

  div.appendChild(heading);

  const ul = document.createElement('ul');
  ul.classList.add('item-list');

  items.forEach(item => ul.appendChild(createListItem(item, cat.id)));

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'new-item';
  input.placeholder = 'Neuer Eintrag...';

  input.addEventListener('keypress', async e => {
    if (e.key === 'Enter' && input.value.trim()) {
      const text = input.value.trim();
      await fetch('http://localhost:3000/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: cat.id, text })
      });
      const items = await fetch(`http://localhost:3000/items?category_id=${cat.id}`).then(res => res.json());
      ul.innerHTML = '';
      items.forEach(item => ul.appendChild(createListItem(item, cat.id)));
      input.value = '';
    }
  });

  ul.addEventListener('click', async e => {
    const li = e.target.closest('li');
    const label = li?.querySelector('label');
    if (!label) return;

    const id = li.dataset.id;

    if (e.target.classList.contains('delete')) {
      await fetch('http://localhost:3000/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      });
      li.remove();
    }

    if (e.target.classList.contains('edit')) {
      const oldText = label.textContent;
      const newText = prompt('Eintrag bearbeiten:', oldText);
      if (!newText || newText === oldText) return;
      await fetch('http://localhost:3000/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id), text: newText, checked: 0 })
      });
      label.textContent = newText;
    }
  });

  div.appendChild(ul);
  div.appendChild(input);
  main.appendChild(div);
}

function createListItem(item, categoryId) {
  const li = document.createElement('li');
  li.dataset.id = item.id;
  const id = 'item-' + item.id;

  li.innerHTML = `
    <input type="checkbox" id="${id}" ${item.checked ? 'checked' : ''}>
    <label for="${id}">${item.text}</label>
    <span class="icon edit">✏️</span>
    <span class="icon delete">🗑️</span>
  `;

  return li;
}
