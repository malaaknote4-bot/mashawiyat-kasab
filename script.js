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

// ===== سلة الطلب والطلب عبر واتساب =====
(() => {
  const WA_NUMBER = '966532211249';
  const KEY = 'kasab-cart';
  const plusIco = '<svg class="ico-plus" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
                  '<svg class="ico-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };

  const parsePrice = (txt) => {
    const t = txt.replace('ريال', '').trim();
    if (t === '½') return 0.5;
    return parseFloat(t) || 0;
  };
  const fmt = (n) => (Math.round(n * 100) / 100).toString();
  const money = (n) => fmt(n) + ' ريال';

  const makeBtn = (name, price) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'add-btn';
    b.innerHTML = plusIco;
    b.setAttribute('aria-label', 'أضف ' + name + ' إلى السلة');
    b.title = 'أضف إلى السلة';
    b.dataset.name = name;
    b.addEventListener('click', () => {
      add(name, price);

    });
    return b;
  };

  // أزرار الإضافة في بطاقات الصور
  document.querySelectorAll('.dish-card .dish-label').forEach((label) => {
    const name = label.querySelector('h4').textContent.trim();
    const price = parsePrice(label.querySelector('.price').textContent);
    label.appendChild(makeBtn(name, price));
  });
  // أزرار الإضافة في القائمة الكاملة
  document.querySelectorAll('.price-head').forEach((h) => h.appendChild(document.createElement('span')));
  document.querySelectorAll('.price-list li').forEach((li) => {
    const name = li.querySelector('.item').textContent.trim();
    const price = parsePrice(li.querySelector('.pr').textContent);
    li.appendChild(makeBtn(name, price));
  });

  // عناصر السلة
  const drawer = document.getElementById('cart');
  const overlay = document.querySelector('.cart-overlay');
  const list = drawer.querySelector('.cart-items');
  const empty = drawer.querySelector('.cart-empty');
  const totalEl = document.getElementById('cart-total');
  const send = document.getElementById('cart-send');
  const bar = document.querySelector('.cart-bar');
  const badge = document.querySelector('.cart-count');
  const toast = document.querySelector('.toast');
  const form = document.getElementById('cart-form');
  const addressBox = drawer.querySelector('.cart-address');

  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const total = () => cart.reduce((s, i) => s + i.qty * i.price, 0);

  function add(name, price) {
    const found = cart.find((i) => i.name === name);
    if (found) found.qty += 1; else cart.push({ name, price, qty: 1 });
    save(); render();
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
    showToast('أُضيف ' + name + ' إلى السلة');
  }

  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function message() {
    const f = new FormData(form);
    const lines = ['السلام عليكم، أرغب بطلب من مشويات كسب:', ''];
    cart.forEach((i) => lines.push('• ' + i.name + ' × ' + i.qty + ' = ' + money(i.qty * i.price)));
    lines.push('', 'الإجمالي: ' + money(total()));
    const name = (f.get('name') || '').trim();
    const mode = f.get('mode') || 'توصيل';
    const address = (f.get('address') || '').trim();
    const notes = (f.get('notes') || '').trim();
    lines.push('');
    if (name) lines.push('الاسم: ' + name);
    lines.push('طريقة الاستلام: ' + mode);
    lines.push('طريقة الدفع: ' + (f.get('pay') || 'كاش عند الاستلام'));
    if (mode === 'توصيل' && address) lines.push('العنوان: ' + address);
    if (notes) lines.push('ملاحظات: ' + notes);
    return lines.join('\n');
  }

  function updateLink() {
    if (!cart.length) {
      send.href = 'https://wa.me/' + WA_NUMBER;
      send.setAttribute('aria-disabled', 'true');
      send.tabIndex = -1;
      return;
    }
    send.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message());
    send.removeAttribute('aria-disabled');
    send.removeAttribute('tabindex');
  }

  function render() {
    document.querySelectorAll('.add-btn').forEach((btn) => {
      const inCart = cart.find((i) => i.name === btn.dataset.name);
      btn.classList.toggle('added', !!inCart);
      btn.title = inCart ? 'في السلة (' + inCart.qty + ') · اضغط لإضافة واحد آخر' : 'أضف إلى السلة';
    });
    list.innerHTML = '';
    cart.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<div><p class="ci-name"></p><p class="ci-unit"></p></div>' +
        '<p class="ci-line"></p>' +
        '<div class="qty"><button type="button" class="q-plus">+</button><span></span><button type="button" class="q-minus">−</button></div>';
      li.querySelector('.ci-name').textContent = item.name;
      li.querySelector('.ci-unit').textContent = money(item.price) + ' للواحد';
      li.querySelector('.ci-line').textContent = money(item.qty * item.price);
      li.querySelector('.qty span').textContent = item.qty;
      li.querySelector('.q-plus').setAttribute('aria-label', 'زيادة ' + item.name);
      li.querySelector('.q-minus').setAttribute('aria-label', item.qty > 1 ? 'إنقاص ' + item.name : 'حذف ' + item.name);
      li.querySelector('.q-plus').addEventListener('click', () => { item.qty++; save(); render(); });
      li.querySelector('.q-minus').addEventListener('click', () => {
        item.qty--;
        if (item.qty <= 0) cart = cart.filter((i) => i !== item);
        save(); render();
      });
      list.appendChild(li);
    });
    const n = count();
    empty.hidden = n > 0;
    totalEl.textContent = money(total());
    badge.textContent = n;
    badge.hidden = n === 0;
    bar.hidden = n === 0 || drawer.classList.contains('open');
    bar.querySelector('.cart-bar-count').textContent = n + (n === 1 ? ' صنف' : ' أصناف');
    bar.querySelector('.cart-bar-total').textContent = money(total());
    updateLink();
  }

  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    bar.hidden = true;
    document.querySelector('.nav-links').classList.remove('open');
    toast.classList.remove('show');
    setTimeout(() => drawer.querySelector('.cart-close').focus(), 50);
  }
  function closeCart() {
    drawer.classList.remove('open');
    drawer.setAttribute('inert', '');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    render();
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('[data-cart-open]').forEach((b) => b.addEventListener('click', openCart));
  document.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', closeCart));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  // "اطلب الآن": يفتح السلة إذا فيها أصناف، وإلا ينتقل للمنيو
  document.querySelectorAll('.js-order').forEach((a) => a.addEventListener('click', (e) => {
    if (count() > 0) { e.preventDefault(); openCart(); }
  }));

  const syncMode = () => {
    addressBox.hidden = !document.getElementById('mode-delivery').checked;
    updateLink();
  };
  form.addEventListener('input', updateLink);
  form.addEventListener('change', syncMode);
  form.addEventListener('submit', (e) => e.preventDefault());
  // التحقق من البيانات قبل الإرسال (الملاحظات اختيارية)
  const nameIn = document.getElementById('cart-name');
  const addrIn = document.getElementById('cart-address');
  const warn = document.getElementById('cart-warn');
  function validate(show) {
    const isDelivery = document.getElementById('mode-delivery').checked;
    const problems = [];
    if (!nameIn.value.trim()) problems.push([nameIn, 'err-name']);
    if (isDelivery && !addrIn.value.trim()) problems.push([addrIn, 'err-address']);
    [[nameIn, 'err-name'], [addrIn, 'err-address']].forEach(([el, id]) => {
      const bad = problems.some((p) => p[0] === el);
      if (show || !bad) {
        el.classList.toggle('invalid', bad);
        document.getElementById(id).hidden = !bad;
      }
    });
    if (show) warn.hidden = problems.length === 0;
    else if (!problems.length) warn.hidden = true;
    return problems;
  }
  form.addEventListener('input', () => validate(false));
  form.addEventListener('change', () => validate(false));
  send.addEventListener('click', (e) => {
    const problems = validate(true);
    if (problems.length) {
      e.preventDefault();
      problems[0][0].focus();
      problems[0][0].scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    updateLink();
  });

  syncMode();
  render();
})();

// ===== حالة الدوام (بتوقيت الرياض): من 11 صباحاً حتى 1:30 ليلاً =====
(() => {
  const el = document.getElementById('open-status');
  if (!el) return;
  const update = () => {
    const now = new Date();
    const riyadh = (now.getUTCHours() + 3) % 24 * 60 + now.getUTCMinutes();
    const open = riyadh >= 11 * 60 || riyadh < 90;
    el.textContent = open ? 'مفتوح الآن' : 'مغلق الآن · نفتح 11 صباحاً';
    el.classList.toggle('is-open', open);
    el.classList.toggle('is-closed', !open);
  };
  update();
  setInterval(update, 60000);
})();
