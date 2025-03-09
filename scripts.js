// Initialize stars
function createStars() {
  const starsContainer = document.querySelector('.stars');
  const numberOfStars = 200;

  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random position
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    // Random size
    const size = Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Random animation duration
    star.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
    
    starsContainer.appendChild(star);
  }
}

// Initialize local storage with empty scripts
function initializeDefaultScripts() {
  if (!localStorage.getItem('robloxScripts')) {
    const scripts = []; // Empty array, no default scripts
    saveToLocalStorage(scripts);
  }
}

// Generate a unique ID for each script
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Enhanced error handling for local storage
function saveToLocalStorage(scripts) {
  try {
    localStorage.setItem('robloxScripts', JSON.stringify(scripts));
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    alert('Failed to save scripts. Local storage might be full or disabled.');
    return false;
  }
}

// Enhanced script loading with error handling and animations
function loadScripts() {
  const scriptsContainer = document.getElementById('scriptsContainer');
  let scripts = [];
  
  try {
    scripts = JSON.parse(localStorage.getItem('robloxScripts')) || [];
  } catch (error) {
    console.error('Error loading scripts:', error);
    scripts = [];
  }
  
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  scriptsContainer.innerHTML = '';

  const defaultImage = 'https://i.etsystatic.com/21337306/r/il/5f91a4/6103913221/il_fullxfull.6103913221_cgx5.jpg';
  
  scripts.forEach((script, index) => {
    if (script.name.toLowerCase().includes(searchTerm) || 
        script.description.toLowerCase().includes(searchTerm)) {
      const scriptCard = document.createElement('div');
      scriptCard.className = 'script-card';
      
      const img = new Image();
      img.src = script.imageUrl;
      img.onerror = () => img.src = defaultImage;

      const deleteButton = !script.isDefault ? `
        <button class="delete-button" onclick="deleteScript('${script.id}')">
          <i class='bx bx-trash'></i>
        </button>
      ` : '';
      
      scriptCard.innerHTML = `
        ${deleteButton}
        <img src="${script.imageUrl}" alt="${script.name}" onerror="this.src='${defaultImage}'">
        <h3>${script.name}</h3>
        <p class="script-description">${script.description}</p>
        <button class="play-button" onclick="copyScript(${index})">
          <i class='bx bx-copy'></i>
          Copy Script
        </button>
      `;
      
      scriptsContainer.appendChild(scriptCard);
      
      requestAnimationFrame(() => {
        scriptCard.style.opacity = '1';
        scriptCard.style.transform = 'translateY(0)';
      });
    }
  });
}

// Delete script function
function deleteScript(scriptId) {
  try {
    const scripts = JSON.parse(localStorage.getItem('robloxScripts')) || [];
    const updatedScripts = scripts.filter(script => script.id !== scriptId);
    
    if (saveToLocalStorage(updatedScripts)) {
      loadScripts();
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'toast success';
      toast.innerHTML = '<i class="bx bx-check"></i> Script deleted successfully';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  } catch (error) {
    console.error('Error deleting script:', error);
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.innerHTML = '<i class="bx bx-x"></i> Failed to delete script';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Enhanced copy script function with better feedback
function copyScript(index) {
  const scripts = JSON.parse(localStorage.getItem('robloxScripts'));
  const script = scripts[index];
  
  // Get the actual button that was clicked
  const btn = document.querySelectorAll('.play-button')[index];
  const originalText = btn.innerHTML;
  
  navigator.clipboard.writeText(script.code)
    .then(() => {
      btn.innerHTML = '<i class="bx bx-check"></i>Copied!';
      btn.style.background = '#4CAF50';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy script:', err);
      // Fallback method for copying
      const textarea = document.createElement('textarea');
      textarea.value = script.code;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        btn.innerHTML = '<i class="bx bx-check"></i>Copied!';
        btn.style.background = '#4CAF50';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy script. Please try again.');
      }
      document.body.removeChild(textarea);
    });
}

let editor; // Monaco editor instance

// Initialize Monaco Editor
function initializeMonacoEditor() {
  require.config({ 
    paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }
  });

  require(['vs/editor/editor.main'], function() {
    // Define custom Lua tokens and rules
    monaco.languages.setMonarchTokensProvider('lua', {
      defaultToken: 'invalid',
      tokenPostfix: '.lua',

      keywords: [
        'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
        'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
        'return', 'then', 'true', 'until', 'while', 'loadstring', 'game',
        'wait', 'workspace', 'Players', 'LocalPlayer', 'Character'
      ],

      brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
      ],

      operators: [
        '+', '-', '*', '/', '%', '^', '#', '==', '~=', '<=', '>=', '<', '>', '=',
        ';', ':', ',', '.', '..', '...'
      ],

      symbols:  /[=><!~?:&|+\-*\/\^%]+/,

      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, { 
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/--\[([=]*)\[/, 'comment', '@multiLineComment.$1'],
          [/--.*$/, 'comment'],
        ],

        string: [
          [/[^\\"]+/, 'string'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        multiLineComment: [
          [/\]([=]*)\]/, {
            cases: {
              '$1==$S2': { token: 'comment', next: '@pop' },
              '@default': 'comment'
            }
          }],
          [/./, 'comment']
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
        ],
      }
    });

    // Define custom theme
    monaco.editor.defineTheme('luaCustomTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '#ff79c6', fontStyle: 'bold' },
        { token: 'string', foreground: '#f1fa8c' },
        { token: 'number', foreground: '#bd93f9' },
        { token: 'comment', foreground: '#6272a4', fontStyle: 'italic' },
        { token: 'operator', foreground: '#ff79c6' },
        { token: 'identifier', foreground: '#f8f8f2' },
        { token: 'delimiter.curly', foreground: '#50fa7b' },
        { token: 'delimiter.square', foreground: '#50fa7b' },
        { token: 'delimiter.parenthesis', foreground: '#50fa7b' }
      ],
      colors: {
        'editor.background': '#282a36aa',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#44475a55',
        'editorCursor.foreground': '#f8f8f2',
        'editor.selectionBackground': '#44475a',
        'editor.inactiveSelectionBackground': '#44475a80',
        'editorLineNumber.foreground': '#6272a4',
        'editorLineNumber.activeForeground': '#f8f8f2'
      }
    });

    editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: '-- Paste your Lua script here\n\n-- Example:\n-- loadstring(game:HttpGet("https://example.com/script.lua"))()',
      language: 'lua',
      theme: 'luaCustomTheme',
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 22,
      padding: { top: 15, bottom: 15 },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      roundedSelection: true,
      folding: true,
      lineNumbers: 'on',
      renderIndentGuides: true,
      suggestOnTriggerCharacters: true,
      wordWrap: 'on',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false
      }
    });
  });
}

// Enhanced Modal functions
function toggleAddScriptModal() {
  const modal = document.getElementById('addScriptModal');
  const currentDisplay = modal.style.display;
  modal.style.display = currentDisplay === 'none' ? 'block' : 'none';
  
  if (currentDisplay === 'none') {
    // Initialize editor when opening modal if not already initialized
    if (!editor) {
      initializeMonacoEditor();
    }
  } else {
    // Reset form
    document.getElementById('scriptName').value = '';
    document.getElementById('scriptDescription').value = '';
    document.getElementById('scriptImageUrl').value = '';
    if (editor) {
      editor.setValue('-- Paste your Lua script here');
    }
  }
}

// Updated addNewScript function
function addNewScript() {
  const name = document.getElementById('scriptName').value.trim();
  const description = document.getElementById('scriptDescription').value.trim();
  const imageUrl = document.getElementById('scriptImageUrl').value.trim();
  const code = editor ? editor.getValue().trim() : '';

  if (!name || !description || !code) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const scripts = JSON.parse(localStorage.getItem('robloxScripts')) || [];
    scripts.push({ 
      name, 
      description, 
      imageUrl, 
      code,
      dateAdded: new Date().toISOString(),
      id: generateUniqueId(),
      isDefault: false
    });

    if (saveToLocalStorage(scripts)) {
      toggleAddScriptModal();
      loadScripts();
    }
  } catch (error) {
    console.error('Error adding new script:', error);
    alert('Failed to add script. Please try again.');
  }
}

// Initialize everything with proper error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    createStars();
    initializeDefaultScripts();
    loadScripts();
    
    const modal = document.getElementById('addScriptModal');
    modal.style.display = 'none';
    
    // Initialize Monaco Editor
    initializeMonacoEditor();
    
    // Debounced search with error handling
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        try {
          loadScripts();
        } catch (error) {
          console.error('Error during search:', error);
        }
      }, 300);
    });
  } catch (error) {
    console.error('Error during initialization:', error);
    alert('There was an error initializing the application. Please refresh the page.');
  }
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('addScriptModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}