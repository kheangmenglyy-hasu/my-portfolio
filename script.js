(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Footer year */
  $('#year').textContent = new Date().getFullYear();

  /* Sticky navbar border + back-to-top visibility */
  var nav = $('#nav'), toTop = $('#totop');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 8);
    toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); burger.focus(); }
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* Active nav indicator */
  var links = $$('.nav__links a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* Scroll reveal */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* Theme toggle (light default, remembers choice) */
  var themeBtn = $('#theme');
  themeBtn.addEventListener('click', function () {
    var next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    doc.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Contact form validation */
  var form = $('#form'), status = $('#status');
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@example.com.'; },
    subject: function (v) { return v.trim().length >= 3 ? '' : 'Add a short subject.'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'Write at least 10 characters so I know how to help.'; }
  };

  function check(input) {
    var msg = rules[input.name](input.value);
    var field = input.closest('.field');
    field.classList.toggle('invalid', !!msg);
    $('.err', field).textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }

  $$('input, textarea', form).forEach(function (input) {
    input.addEventListener('blur', function () { check(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('invalid')) check(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var bad = $$('input, textarea', form).filter(function (i) { return !check(i); });
    if (bad.length) { bad[0].focus(); return; }

    /* Demo only: connect to Formspree, EmailJS or your own backend here. */
    var d = new FormData(form);
    var mail = 'mailto:hello@example.com?subject=' + encodeURIComponent(d.get('subject')) +
      '&body=' + encodeURIComponent(d.get('message') + '\n\n— ' + d.get('name') + ' (' + d.get('email') + ')');
    window.location.href = mail;
    status.textContent = 'Thanks, ' + d.get('name').trim() + '. Your email app should open with the message ready to send.';
    form.reset();
  });
})();
