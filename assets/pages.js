/* Behaviour for the site's text pages: theme switch, menu, scroll percentage and the footer year.
   The home page does the same things from site.js, together with its animations. */
(function () {
  var body = document.body;
  var THEME_KEY = 'isDarkMode'; // shared with the home page; "true" means body.dark, which is the light appearance

  function onActivate(el, fn) {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fn(event);
      }
    });
  }

  // ---- theme
  var themeToggles = document.querySelectorAll('[data-theme-toggle]');
  function syncTheme() {
    var darkLook = !body.classList.contains('dark');
    themeToggles.forEach(function (el) { el.setAttribute('aria-pressed', String(darkLook)); });
  }
  themeToggles.forEach(function (el) {
    onActivate(el, function () {
      var on = !body.classList.contains('dark');
      body.classList.toggle('dark', on);
      try { localStorage.setItem(THEME_KEY, String(on)); } catch (e) {}
      syncTheme();
    });
  });
  window.addEventListener('storage', function (event) {
    if (event.key === THEME_KEY && event.newValue != null) {
      body.classList.toggle('dark', event.newValue === 'true');
      syncTheme();
    }
  });
  syncTheme();

  // ---- menu
  var menu = document.querySelector('.menu');
  var menuButton = document.querySelector('.header__menu');
  var menuText = document.querySelector('.header__menu-txt');
  if (menu && menuButton) {
    var setMenu = function (open) {
      menu.classList.toggle('is-open', open);
      menuButton.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      if (menuText) menuText.textContent = open ? 'Close' : 'Menu';
    };
    onActivate(menuButton, function () { setMenu(!menu.classList.contains('is-open')); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (event) {
      if (!menu.classList.contains('is-open')) return;
      if (event.target.closest('.menu__wrap') && !event.target.closest('a')) return;
      if (event.target.closest('.header__main')) return;
      setMenu(false);
    });
  }

  // ---- scroll percentage in the header pill
  var progress = document.getElementById('progress');
  if (progress) {
    var queued = false;
    var update = function () {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var value = max > 0 ? Math.min(Math.max(window.scrollY / max * 100, 0), 100) : 0;
      progress.textContent = Math.round(value) + '%';
    };
    var schedule = function () { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }

  // ---- contact form: check the fields, send to the form service, show the result in place
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-contact-status]');
    var done = document.querySelector('[data-contact-done]');
    var thanks = document.querySelector('[data-contact-thanks]');
    var submit = form.querySelector('[type="submit"]');
    var fields = ['name', 'email', 'message'].map(function (name) {
      var input = form.elements[name];
      return { name: name, input: input, error: document.getElementById(input.id + '-error') };
    });
    var problems = {
      name: function (v) { return v ? '' : 'Please enter your name.'; },
      email: function (v) { return !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.'; },
      message: function (v) { return v ? '' : 'Please write your message.'; }
    };
    var check = function (field) {
      var text = problems[field.name](field.input.value.trim());
      field.error.textContent = text;
      field.input.closest('.contact__field').classList.toggle('is-invalid', !!text);
      if (text) {
        field.input.setAttribute('aria-invalid', 'true');
        field.input.setAttribute('aria-describedby', field.error.id);
      } else {
        field.input.removeAttribute('aria-invalid');
        field.input.removeAttribute('aria-describedby');
      }
      return !text;
    };
    var showDone = function (name) {
      thanks.textContent = name ? 'Thank you, ' + name + '. Your message has been sent.' : 'Thank you. Your message has been sent.';
      form.hidden = true;
      done.hidden = false;
      done.focus();
    };
    var busy = false;

    form.noValidate = true; // our own messages replace the browser's bubbles (without JavaScript the browser still checks)
    fields.forEach(function (field) {
      field.input.addEventListener('input', function () { if (field.input.hasAttribute('aria-invalid')) check(field); });
      field.input.addEventListener('blur', function () { if (field.input.value.trim()) check(field); });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (busy) return;
      status.textContent = '';
      var firstBad = null;
      fields.forEach(function (field) { if (!check(field) && !firstBad) firstBad = field; });
      if (firstBad) { firstBad.input.focus(); return; }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = typeof value === 'string' ? value.trim() : value; });
      delete data.redirect; // only for the no-JavaScript path
      var name = data.name;
      if (data.botcheck) { showDone(name); return; } // a hidden box only a bot would tick
      if (!data.access_key) { status.textContent = 'The form is not connected yet. Please try again later.'; return; }

      busy = true;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      var abort = new AbortController();
      var timer = setTimeout(function () { abort.abort(); }, 20000);
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: abort.signal
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok || !body.success) throw new Error(body.message || 'Request failed');
          form.reset();
          showDone(name);
        });
      }).catch(function () {
        status.textContent = 'Sorry, your message could not be sent. Please check your connection and try again.';
      }).then(function () {
        clearTimeout(timer);
        busy = false;
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
    });

    document.querySelector('[data-contact-again]').addEventListener('click', function () {
      done.hidden = true;
      form.hidden = false;
      fields[0].input.focus();
    });
    // arriving back from the service after a no-JavaScript submission
    if (/[?&]sent=1\b/.test(location.search)) showDone('');
  }

  // ---- footer year
  document.querySelectorAll('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
