// سنة حقوق النشر في التذييل
document.getElementById('year').textContent = new Date().getFullYear();

// قائمة الجوال
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'فتح القائمة');
}));

// الوضع الفاتح والداكن (يتذكر اختيارك، وإلا يتبع إعداد الجهاز)
const root = document.documentElement;
try {
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
} catch (e) {}
document.querySelector('.theme-toggle').addEventListener('click', () => {
  const current = root.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const next = current === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});
