// FUNKTIONALITÄT FÜR HINZUFÜGEN, BEARBEITEN, LÖSCHEN
document.querySelectorAll('.category').forEach(category => {
    const input = category.querySelector('.new-item');
    const list = category.querySelector('.item-list');
  
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
        const newText = this.value.trim();
        const id = 'item-' + Date.now();
  
        const li = document.createElement('li');
        li.innerHTML = `
          <input type="checkbox" id="${id}">
          <label for="${id}">${newText}</label>
          <span class="icon edit">✏️</span>
          <span class="icon delete">🗑️</span>
        `;
        list.appendChild(li);
        this.value = '';
      }
    });
  
    list.addEventListener('click', function (e) {
      const target = e.target;
  
      if (target.classList.contains('delete')) {
        target.closest('li').remove();
      }
  
      if (target.classList.contains('edit')) {
        const label = target.previousElementSibling;
        const newText = prompt("Eintrag bearbeiten:", label.textContent);
        if (newText !== null && newText.trim() !== '') {
          label.textContent = newText.trim();
        }
      }
    });
  });
  
  // DARK/LIGHT MODE TOGGLE
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
  