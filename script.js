// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Dark / light theme (remembers your choice, otherwise follows the device setting)
const root = document.documentElement;
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

document.querySelector('.theme-toggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Fade sections in as you scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
