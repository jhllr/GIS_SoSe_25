// Für jede Kategorie (div.category)
document.querySelectorAll('.category').forEach(category => {
    const input = category.querySelector('.new-item');
    const list = category.querySelector('.item-list');
  
    // Neuen Eintrag hinzufügen
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
  
    // Löschen und Bearbeiten
    list.addEventListener('click', function (e) {
      const target = e.target;
  
      // Löschen
      if (target.classList.contains('delete')) {
        target.closest('li').remove();
      }
  
      // Bearbeiten
      if (target.classList.contains('edit')) {
        const label = target.previousElementSibling;
        const newText = prompt("Eintrag bearbeiten:", label.textContent);
        if (newText !== null && newText.trim() !== '') {
          label.textContent = newText.trim();
        }
      }
    });
  });
  