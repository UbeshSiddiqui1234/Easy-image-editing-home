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

  // ---- footer year
  document.querySelectorAll('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
