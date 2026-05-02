// === Two Ways of Measuring — Shared JavaScript ===

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMathJax();
});

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('nav')) {
        links.classList.remove('open');
      }
    });
  }

  // Highlight current page
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initMathJax() {
  if (typeof MathJax !== 'undefined') {
    MathJax.typesetPromise?.();
  }
}

// Debounce utility
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
