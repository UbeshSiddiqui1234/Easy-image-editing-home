/* Page scripts for index.html.
   Each numbered block below was a separate inline <script> in the page. They still run in the same order,
   but only after the preloader (which is pure CSS) has been painted, and one task at a time so the browser
   can keep drawing frames in between. Code that used to wait for DOMContentLoaded registers with onReady()
   and runs, in registration order, once every block has run. */
(function () {
  var readyQueue = [];
  var readyLateQueue = [];
  function onReady(fn) { readyQueue.push(fn); }
  function onReadyLate(fn) { readyLateQueue.push(fn); }

  var blocks = [
  // ---- 1 ----
  function () {
    onReady(() => {
      const field = document.getElementById("dotsField");
      let lastMode = null;

      function getMode() {
        const w = window.innerWidth;

        if (w >= 992) return "desktop";
        if (w >= 768) return "tablet";
        return "mobile";
      }

      function buildDots() {
        const mode = getMode();
        if (mode === lastMode) return;
        lastMode = mode;

        field.innerHTML = "";

        let COLS;
        const ROWS = 14;

        switch (mode) {
          case "desktop":
            COLS = 52;
            break;
          case "tablet":
            COLS = 24;
            break;
          case "mobile":
            COLS = 22;
            break;
        }

        field.style.gridTemplateColumns = `repeat(${COLS}, var(--dot-size))`;

        const total = COLS * ROWS;

        for (let i = 0; i < total; i++) {
          const dot = document.createElement("div");
          dot.className = "dot";

          dot.dataset.index = i;
          dot.dataset.col = i % COLS;
          dot.dataset.row = Math.floor(i / COLS);

          dot.style.setProperty("--i", i);

          field.appendChild(dot);
        }
      }

      buildDots();
      window.addEventListener("resize", buildDots);
    });
  },

  // ---- 2 ----
  function () {
    onReady(() => {
      const dots = Array.from(document.querySelectorAll(".dot"));
      if (!dots.length) return;

      const CLOUD_RADIUS = 12;  
      const TOTAL_DURATION = 1;  
      const FIGURE_PAUSE = 1;   
      const GROUPS = 20;     
      const CHAOS_OPACITY = 0.35;  

      // рассчитываем stagger
      const STAGGER_GROUP = TOTAL_DURATION / GROUPS;
      const STAGGER_INSIDE = STAGGER_GROUP / 4;

      const COLS = Math.max(...dots.map(d => +d.dataset.col)) + 1;
      const ROWS = Math.max(...dots.map(d => +d.dataset.row)) + 1;
      const cx = Math.floor(COLS / 2);
      const cy = Math.floor(ROWS / 2);

      const patterns = [
        [
          "------------------",
          "------------------",
          "------------------",
          "--------11--------",
          "-----1--11--1-----",
          "----111-11-111----",
          "-----11----11-----",
          "------------------",
          "---111------111---",
          "---111------111---",
          "------------------",
          "-----11----11-----",
          "----111-11-111----",
          "-----1--11--1-----",
          "--------11--------",
          "------------------",
          "------------------",
          "------------------"
        ],
        [
          "------------------",
          "------------------",
          "------------------",
          "------------------",
          "------11--11------",
          "----1111111111----",
          "---111111111111---",
          "---111111111111---",
          "---111111111111---",
          "----1111111111----",
          "-----11111111-----",
          "------111111------",
          "-------1111-------",
          "--------11--------",
          "------------------",
          "------------------",
          "------------------",
          "------------------"
        ],
        [
          "------------------",
          "------------------",
          "------------------",
          "--------1---------",
          "--------11--------",
          "--------11--------",
          "-------1111-------",
          "------111111------",
          "----1111--11111---",
          "---11111--1111----",
          "------111111------",
          "-------1111-------",
          "--------11--------",
          "--------11--------",
          "---------1--------",
          "------------------",
          "------------------",
          "------------------"
        ],
        [
          "------------------",
          "------------------",
          "------------------",
          "-------1111-------",
          "------111111------",
          "-----11111111-----",
          "-----11111111-----",
          "-----11111111-----",
          "------111111------",
          "-------1111-------",
          "------111111------",
          "-----111--111-----",
          "----11------11----",
          "----11------11----",
          "----1--------1----",
          "------------------",
          "------------------",
          "------------------"
        ]
      ];

      const states = patterns.map(pattern => {
        const set = new Set();
        pattern.forEach((row, r) => {
          [...row].forEach((c, i) => {
            if (c === "1") set.add(`${cx - 9 + i}:${cy - 9 + r}`);
          });
        });
        return set;
      });

      function showCloud() {
        const shuffled = [...dots].sort(() => Math.random() - 0.5);
        const groupSize = Math.ceil(shuffled.length / GROUPS);
        const groups = [];
        for (let i = 0; i < GROUPS; i++) {
          groups.push(shuffled.slice(i * groupSize, (i + 1) * groupSize));
        }

        groups.forEach((group, gIndex) => {
          group.forEach(dot => {
            const dx = dot.dataset.col - cx;
            const dy = dot.dataset.row - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const coreFactor = Math.max(0, 1 - dist / CLOUD_RADIUS);

            let baseOpacity = 0.15 + coreFactor * 0.7;
            let opacity = baseOpacity + (Math.random() - 0.5) * CHAOS_OPACITY;
            opacity = Math.min(1, Math.max(0.15, opacity));

            gsap.to(dot, {
              opacity,
              duration: TOTAL_DURATION,
              delay: gIndex * STAGGER_GROUP + Math.random() * STAGGER_INSIDE,
              ease: "steps(2)"
            });
          });
        });
      }

      function showPattern(index) {
        const state = states[index];
        const shuffled = [...dots].sort(() => Math.random() - 0.5);
        const groupSize = Math.ceil(shuffled.length / GROUPS);
        const groups = [];
        for (let i = 0; i < GROUPS; i++) {
          groups.push(shuffled.slice(i * groupSize, (i + 1) * groupSize));
        }

        groups.forEach((group, gIndex) => {
          group.forEach(dot => {
            const key = `${dot.dataset.col}:${dot.dataset.row}`;
            const targetOpacity = state.has(key) ? 1 : 0.15;
            gsap.to(dot, {
              opacity: targetOpacity,
              duration: TOTAL_DURATION,
              delay: gIndex * STAGGER_GROUP + Math.random() * STAGGER_INSIDE,
              ease: "steps(2)"
            });
          });
        });
      }

      let index = 0;
      let timer = 0;

      function cycle() {
        showPattern(index);

        timer = setTimeout(() => {
          index = (index + 1) % states.length;
          showCloud(); 
          timer = setTimeout(cycle, TOTAL_DURATION * 1000);
        }, TOTAL_DURATION * 1000 + FIGURE_PAUSE * 1000);
      }

      // The grid sits in the footer. This loop used to start at page load and re-tween every dot
      // (700+ on desktop) forever, even behind the preloader; now it only runs while the grid is near the viewport.
      let visible = false;
      new IntersectionObserver(entries => {
        const now = entries[entries.length - 1].isIntersecting;
        if (now === visible) return;
        visible = now;
        clearTimeout(timer);
        if (visible) {
          showCloud(); 
          timer = setTimeout(cycle, TOTAL_DURATION * 1000);
        }
      }, { rootMargin: '300px 0px' }).observe(document.getElementById('dotsField'));
    });
  },

  // ---- 3 ----
  function () {
    onReady(() => {
      const dots = Array.from(document.querySelectorAll(".dot"));
      if (!dots.length) return;

      const MAX_DISTANCE = 200;
      const MIN_SCALE = 0.25;

      // This used to measure every dot on every mousemove anywhere on the page.
      let fieldVisible = false, queued = false, mouseX = 0, mouseY = 0;
      new IntersectionObserver(entries => {
        fieldVisible = entries[entries.length - 1].isIntersecting;
      }, { rootMargin: '300px 0px' }).observe(document.getElementById('dotsField'));

      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!fieldVisible || queued) return;
        queued = true;
        requestAnimationFrame(update);
      });

      function update() {
        queued = false;

        dots.forEach(dot => {
          const rect = dot.getBoundingClientRect();
          const dotX = rect.left + rect.width / 2;
          const dotY = rect.top + rect.height / 2;

          const dx = dotX - mouseX;
          const dy = dotY - mouseY;
          const dist = Math.sqrt(dx*dx + dy*dy);

          let scale = 1 - (1 - MIN_SCALE) * Math.max(0, (MAX_DISTANCE - dist) / MAX_DISTANCE);
          scale = Math.max(MIN_SCALE, Math.min(1, scale));

          gsap.to(dot, { scale, duration: 0.2, ease: "power2.out" });
        });
      }
    });
  },

  // ---- 4 ----
  function () {
    (() => {
      const STORAGE_KEY="isDarkMode",EVENT_NAME="theme:changed";
      const $=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
      const isCheckbox=el=>el.matches('input[type="checkbox"]');
      const getToggles=()=>$('[data-theme-toggle]');
      const setUI=dark=>getToggles().forEach(el=>{
        if(isCheckbox(el)) el.checked=dark;
        el.setAttribute('aria-pressed',String(dark));
        el.setAttribute('data-theme-state',dark?'dark':'light');
      });
      const applyTheme=(darkOn,emit=true)=>{
        document.body.classList.toggle('dark',darkOn);
        try{localStorage.setItem(STORAGE_KEY,String(darkOn))}catch{}
        setUI(darkOn);
        if(emit&&typeof window!=='undefined') window.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:darkOn}));
      };
      const readInitial=()=>{
        try{const stored=localStorage.getItem(STORAGE_KEY);if(stored==='true'||stored==='false')return stored==='true'}catch{}
        return true;
      };
      const currentIsDark=()=>document.body.classList.contains('dark');
      const onToggle=e=>{
        const el=e.currentTarget,next=isCheckbox(el)?el.checked:!currentIsDark();
        applyTheme(next);
      };
      const bindAll=()=>getToggles().forEach(el=>{
        if(el.__themeBound)return;
        el.__themeBound=true;
        el.addEventListener(isCheckbox(el)?'change':'click',onToggle);
      });
      const init=()=>{
        applyTheme(readInitial(),false);
        bindAll();
        window.addEventListener(EVENT_NAME,e=>{if(e&&typeof e.detail==='boolean')applyTheme(e.detail,false)});
        window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY&&e.newValue!=null)applyTheme(e.newValue==='true',false)});
        new MutationObserver(()=>bindAll()).observe(document.body,{subtree:true,childList:true});
      };
      onReady(init,{once:true});
    })();
  },

  // ---- 5 ----
  function () {
    onReady(() => {
      const darkImages = document.querySelectorAll(".theme-light");

      function toggleImages(isDark) {
        darkImages.forEach(darkImg => {
          const parent = darkImg.parentElement;
          const lightImg = parent.querySelector(".theme-dark");
          if (!lightImg) return;

          if (isDark) {
            darkImg.style.display = "flex";
            lightImg.style.display = "none";
          } else {
            darkImg.style.display = "none";
            lightImg.style.display = "flex";
          }
        });
      }

      toggleImages(document.body.classList.contains("light"));

      window.addEventListener("theme:changed", e => {
        toggleImages(e.detail);
      });
    });
  },

  // ---- 6 ----
  function () {
    (function(){
      const el=document.getElementById("progress");
      let last=null,queued=false;
      function update(){
        queued=false;
        let scrolled=Math.min(Math.max((window.scrollY/(document.documentElement.scrollHeight-window.innerHeight))*100,0),100);
        const text=Math.round(scrolled)+"%";
        if(text!==last){el.textContent=text;last=text;}
      }
      // This used to re-run every frame for the life of the page, forcing a layout each time.
      function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
      window.addEventListener("scroll",schedule,{passive:true});
      window.addEventListener("resize",schedule,{passive:true});
      if(window.ResizeObserver)new ResizeObserver(schedule).observe(document.documentElement);
      update();
    })();
  },

  // ---- 7 ----
  function () {
    onReady(function(){
      const items=document.querySelectorAll(".faq__item");
      items.forEach(item=>{
        const title=item.querySelector(".faq__item-title");
        const content=item.querySelector(".faq__content");
        const icon=item.querySelector(".faq__icon");
        content.style.display="none";
        content.style.height="0px";
        content.style.opacity="0";
        icon.textContent="+";
        title.addEventListener("click",()=>{
          const isOpen=item.classList.contains("active");
          items.forEach(other=>{
            if(other!==item){
              other.classList.remove("active");
              const oc=other.querySelector(".faq__content");
              const oi=other.querySelector(".faq__icon");
              oc.style.height="0px";
              oc.style.opacity="0";
              setTimeout(()=>{oc.style.display="none"},350);
              oi.textContent="+";
            }
          });
          if(!isOpen){
            item.classList.add("active");
            content.style.display="block";
            void content.offsetWidth;
            content.style.height=content.scrollHeight+"px";
            content.style.opacity="1";
            icon.textContent="-";
          }else{
            item.classList.remove("active");
            content.style.height="0px";
            content.style.opacity="0";
            setTimeout(()=>{content.style.display="none"},350);
            icon.textContent="+";
          }
        });
      });
    });
  },

  // ---- 8 ----
  function () {
    onReady(() => {
      const container = document.querySelector(".how__right");
      const titles = container.querySelectorAll(".how__right-title");

      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;

      const fadeFinish = 0.15;

      function animateOpacity() {
        const containerRect = container.getBoundingClientRect();

        titles.forEach(title => {
          const rect = title.getBoundingClientRect();
          const top = rect.top - containerRect.top;
          const bottom = top + rect.height;

          let opacity = 0.2;

          if (bottom > 0 && top < containerHeight) {
            let norm = 1 - (bottom / containerHeight);
            norm = Math.min(Math.max(norm, 0), 1);

            let progress = norm / (1 - fadeFinish);
            progress = Math.min(Math.max(progress, 0), 1);

            opacity = 0.2 + progress * 0.8;
          }

          title.style.opacity = opacity;
        });

        rafId = running ? requestAnimationFrame(animateOpacity) : 0;
      }

      // The loop used to run on every frame forever; now only while the section is near the viewport.
      let running = false, rafId = 0;
      animateOpacity();
      new IntersectionObserver(entries => {
        running = entries[entries.length - 1].isIntersecting;
        if (running && !rafId) animateOpacity();
      }, { rootMargin: '200px 0px' }).observe(container);
    });
  },

  // ---- 9 ----
  function () {
    onReady(() => {
      const header = document.querySelector(".header");
      const footer = document.querySelector(".footer");
      const menu = document.querySelector(".menu"); 
      if (!header || !footer || !menu) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const visible = entry.intersectionRatio;

            const tl = gsap.timeline({ defaults: { duration: 0.2, ease: "power2.out" } });

            if (visible >= 0.5) {
              tl.to(header, { y: "-10rem" }, 0)
                .to(menu, { y: "-10rem" }, 0);
            } else {
              tl.to(header, { y: "0rem" }, 0)
                .to(menu, { y: "0rem" }, 0);
            }
          });
        },
        { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
      );

      observer.observe(footer);
    });
  },

  // ---- 10 ----
  function () {
      const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const errorMessage = document.getElementById('errorMessage');

    /* dropZone click logic removed */
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    }
    );
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFiles(e.dataTransfer.files[0]);
        }
    }
    );
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length)
            handleFiles(fileInput.files[0]);
    }
    );

    async function handleFiles(file) {
        if (!file)
            return;

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        const userHash = crypto.randomUUID();
        const formData = new FormData();
        formData.append('main_looks[]', file);
        formData.append('user_hash', userHash);

        try {
            dropZone.querySelector('p').textContent = 'Uploading...';
            const response = await fetch('https://api.fourmula.ai/v1/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok)
                throw new Error(`Upload failed with status: ${response.status}`);

            const result = await response.json();
            const data = result.data;
            const projectId = data.project_id;

            let pdpId = null;
            if (data.mainLook) {
                pdpId = data.mainLook.pdp_id;
            }

            if (projectId && pdpId) {
                const redirectUrl = `https://app.fourmula.ai/project/create-pdp/preview/?pdpId=${pdpId}&projectId=${projectId}&userHash=${userHash}`;
                window.location.href = redirectUrl;
            } else {
                throw new Error('Missing project_id or pdp_id in response');
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }
  },

  // ---- 11 ----
  function () {
    onReady(() => {
      const el = document.querySelector(".hero__carousel__in");
      if (!el) return;

      gsap.to(el, {
        rotate: 360,
        duration: 32,
        ease: "none",
        repeat: -1
      });
    });
  },

  // ---- 12 ----
  function () {
    onReady(() => {
      const eli = document.querySelectorAll(".hero__carousel__img");
      if (!eli) return;

      gsap.to(eli, {
        rotate: -360,
        duration: 32,
        ease: "none",
        repeat: -1
      });
    });
  },

  // ---- 13 ----
  function () {
      onReady(() => {
        const btn = document.querySelector('.header__menu');
        const txt = document.querySelector('.header__menu-txt');
        const menu = document.querySelector('.menu__wrap');
        const items = menu.querySelectorAll('.menu__item');
        const footer = document.querySelector('.footer');
        const letters = '•';

        if (!btn || !txt || !menu || !footer) return;

        let isOpen = false;

        function getInitialMenuProps() {
          if (window.innerWidth <= 767) {
            return { width: '15.5rem', height: '2.7rem', y: '0.5rem', padding: '0rem', overflow: 'hidden' };
          }

          return { width: '15rem', height: '2.7rem', y: '1.25rem', padding: '0rem', overflow: 'hidden' };
        }

        gsap.set(menu, getInitialMenuProps());
        gsap.set(items, { opacity: 0 });

        function getMenuProps() {
          if (window.innerWidth <= 991) {
            return { width: '16.2rem', height: '39rem', padding: '5rem 1rem 1rem 1rem' };
          }

          return { width: '18rem', height: '39rem', padding: '6.25rem 1.25rem 2.5rem 1.25rem' };
        }

        function scrambleText(newText) {
          const oldText = txt.textContent;
          const length = Math.max(oldText.length, newText.length);
          let frame = 0;
          const totalFrames = 20;

          const interval = setInterval(() => {
            let display = '';

            for (let i = 0; i < length; i++) {
              if (i < newText.length && frame / totalFrames > i / length) {
                display += newText[i];
              } else {
                display += letters[Math.floor(Math.random() * letters.length)];
              }
            }

            txt.textContent = display;
            frame++;

            if (frame > totalFrames) {
              txt.textContent = newText;
              clearInterval(interval);
            }
          }, 20);
        }

        const menuTL = gsap.timeline({ paused: true });
        const props = getMenuProps();

        menuTL
          .to(menu, {
            y: 0,
            width: props.width,
            height: props.height,
            padding: props.padding,
            duration: 0.4,
            ease: 'power2.out',
          })
          .to(
            items,
            {
              opacity: 1,
              stagger: 0.05,
              duration: 0.3,
            },
            '-=0.2',
          );

        function closeMenu(delay = 0) {
          if (!isOpen) return;

          isOpen = false;
          btn.classList.remove('is-open');
          scrambleText('Menu');

          gsap.to([...items].reverse(), {
            opacity: 0,
            stagger: 0.05,
            duration: 0.2,
          });

          menuTL.reverse(delay);
        }

        function openMenu() {
          if (isOpen) return;

          isOpen = true;
          btn.classList.add('is-open');
          scrambleText('Close');
          menuTL.play();
        }

        btn.addEventListener('click', () => {
          if (isOpen) {
            closeMenu(0.3);
          } else {
            openMenu();
          }
        });

        document.addEventListener('click', (e) => {
          if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
            closeMenu(0.3);
          }
        });

        items.forEach((item) => {
          item.addEventListener('click', () => {
            if (isOpen) closeMenu(0.3);
          });
        });

        window.addEventListener('resize', () => {
          if (isOpen) {
            const props = getMenuProps();

            gsap.to(menu, {
              width: props.width,
              height: props.height,
              padding: props.padding,
              duration: 0.2,
            });
          } else {
            gsap.set(menu, getInitialMenuProps());
          }
        });

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.intersectionRatio >= 0.5) {
                closeMenu(0.3);
              }
            });
          },
          {
            threshold: Array.from({ length: 101 }, (_, i) => i / 100),
          },
        );

        observer.observe(footer);
      });
  },

  // ---- 14 ----
  function () {
    onReady(() => {
      const btn = document.querySelector(".header__menu");
      const topLine = document.querySelector(".header__menu-line.is-top");
      const bottomLine = document.querySelector(".header__menu-line.is-bottom");

      if (!btn || !topLine || !bottomLine || typeof gsap === "undefined") return;

      // Настройки закрытого состояния
      const closedTopY = "-0.2rem";
      const closedBottomY = "0.2rem";

      // Настройки открытого состояния
      // Меняйте эти значения, чтобы поймать идеальный крестик.
      // Если надо выше: отрицательное значение, например "-0.02rem".
      // Если надо ниже: положительное значение, например "0.02rem".
      const openTopY = "0.025rem";
      const openBottomY = "-0.025rem";

      gsap.set(topLine, {
        x: 0,
        y: closedTopY,
        rotate: 0,
        transformOrigin: "50% 50%"
      });

      gsap.set(bottomLine, {
        x: 0,
        y: closedBottomY,
        rotate: 0,
        transformOrigin: "50% 50%"
      });

      const tl = gsap.timeline({
        paused: true,
        defaults: {
          duration: 0.25,
          ease: "power2.out"
        }
      });

      tl.to(topLine, {
        y: openTopY,
        rotate: 45
      }, 0)
      .to(bottomLine, {
        y: openBottomY,
        rotate: -45
      }, 0);

      function syncIcon() {
        if (btn.classList.contains("is-open")) {
          tl.play();
        } else {
          tl.reverse();
        }
      }

      syncIcon();

      const observer = new MutationObserver(syncIcon);

      observer.observe(btn, {
        attributes: true,
        attributeFilter: ["class"]
      });
    });
  },

  // ---- 15 ----
  function () {
    const startPreloader = () => {
      const preloader = document.querySelector('.preloader');
      const numberEl = document.querySelector('.preloader__number');
      const images = document.querySelectorAll('.preloader__images-in');

      const VISIT_KEY = 'preloader_visited_v2';
      const isReturningUser = localStorage.getItem(VISIT_KEY) === '1';

      const speed = isReturningUser ? 1 / 5 : 0.4;

      localStorage.setItem(VISIT_KEY, '1');

      window.scrollTo(0, 0);

      const lockScroll = () => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      };

      const unlockScroll = () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      };

      lockScroll();

      let imageInterval;
      if (images.length) {
        let index = 0;
        imageInterval = setInterval(() => {
          images.forEach((img, i) => {
            img.style.zIndex = i === index ? 9 : 1;
          });
          index = (index + 1) % images.length;
        }, 500 * speed);
      }

      if (numberEl) {
        if (isReturningUser) {
          numberEl.textContent = 'Synced';
          gsap.fromTo(
            numberEl,
            { opacity: 0, y: 8, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.2, delay: 0.1, ease: 'power2.out' }
          );
        } else {
          numberEl.textContent = '0';
          const steps = [0, 17, 35, 58, 76, 89, 100];
          const totalDuration = 2.5 * speed;
          const tlNumber = gsap.timeline({ delay: 0.5 * speed });

          steps.forEach((val, i) => {
            const prev = i === 0 ? 0 : steps[i - 1];
            tlNumber.to({ n: prev }, {
              n: val,
              duration: totalDuration / (steps.length - 1),
              ease: 'power2.out',
              onUpdate() {
                numberEl.textContent = Math.round(this.targets()[0].n);
              }
            });
          });
        }
      }

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove('is-loading');
          document.dispatchEvent(new CustomEvent('preloader:done'));
          if (imageInterval) clearInterval(imageInterval);
          gsap.delayedCall(1 * speed, unlockScroll);
        }
      });

      // logo and image are already faded in by CSS; hand their current state over to GSAP
      gsap.utils.toArray('.preloader > .preloader__wrap, .preloader > .preloader__images__wrap').forEach(el => {
        const cs = getComputedStyle(el);
        gsap.set(el, { opacity: cs.opacity, filter: cs.filter === 'none' ? 'blur(0px)' : cs.filter, visibility: 'visible' });
      });
      document.documentElement.classList.add('preloader-js');

      tl.set('.preloader > *', { visibility: 'visible' });

      tl.to(
        '.preloader > *',
        { opacity: 1, filter: 'blur(0px)', duration: 1 * speed, stagger: 0.05 * speed, ease: 'power2.out' }
      );

      tl.to('.preloader > *', {
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1 * speed,
        delay: 2.5 * speed,
        stagger: 0.05 * speed,
        ease: 'power2.in'
      });

      tl.to(preloader, { opacity: 0, duration: 0.6 * speed, ease: 'power2.in' });
    };
    onReady(startPreloader, { once: true });
  },

  // ---- 16 ----
  function () {
    function splitToWords(element) {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach(node => {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();

        words.forEach(word => {
          if (!word.trim()) {
            frag.appendChild(document.createTextNode(word));
          } else {
            const span = document.createElement('span');
            span.className = 'flash-word';
            span.textContent = word;
            frag.appendChild(span);
          }
        });

        node.parentNode.replaceChild(frag, node);
      });
    }

    window.splitToWords = splitToWords;
  },

  // ---- 17 ----
  function () {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.flash-text, [data-flash]').forEach(el => {
      splitToWords(el);

      const words = el.querySelectorAll('.flash-word');

      gsap.set(words, {
        opacity: 0,
        color: '#F94A00'
      });

      gsap.to(words, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        keyframes: [
          { opacity: 1, color: '#F94A00', duration: 0.2, ease: 'power2.out' },
          { color: '#FD7B03', duration: 0.05 },
          { color: 'var(--fonts-100)', duration: 0.1 }
        ],
        stagger: { each: 0.1 }
      });
    });
  },

  // ---- 18 ----
  function () {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-flash-stb]').forEach(el => {
      splitToWords(el);

      const words = el.querySelectorAll('.flash-word');

      gsap.set(words, {
        opacity: 0,
        color: '#F94A00'
      });

      gsap.to(words, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        keyframes: [
          { opacity: 1, color: '#F94A00', duration: 0.2, ease: 'power2.out' },
          { color: '#FD7B03', duration: 0.05 },
          { color: '#FFFFFF', duration: 0.1 }
        ],
        stagger: { each: 0.1 }
      });
    });
  },

  // ---- 19 ----
  function () {
    (function () {

      gsap.set('[data-hero-text]', { opacity: 0 });

      gsap.set(
        '.header__left-link, .header__main, .menu__wrap-main, .is-header-btn',
        { opacity: 0, y: 24, scale: 0.9 }
      );

      gsap.set('.hero__upload, .hero__carousel__item', {
        opacity: 0,
        scale: 0.5
      });

      gsap.set('.hero__slider__item', {
        opacity: 0,
        x: 40,
        scale: 0.9
      });

      function splitHeroWords(element) {
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(node => {
          const words = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();

          words.forEach(word => {
            if (!word.trim()) {
              frag.appendChild(document.createTextNode(word));
            } else {
              const span = document.createElement('span');
              span.className = 'hero-flash-word';
              span.textContent = word;

              const parent50 =
                node.parentElement.closest('.u-fonts-50') ||
                node.parentElement.classList.contains('u-fonts-50');

              span.dataset.finalOpacity = parent50 ? 0.5 : 1;

              frag.appendChild(span);
            }
          });

          node.parentNode.replaceChild(frag, node);
        });
      }

      function playHeroIntro() {

        const tl = gsap.timeline();

        document.querySelectorAll('[data-hero-text]').forEach(el => {
          splitHeroWords(el);

          const words = el.querySelectorAll('.hero-flash-word');

          gsap.set(words, { opacity: 0, color: '#F94A00' });
          gsap.set(el, { opacity: 1 });

          tl.to(words, {
            stagger: 0.2,
            ease: 'power2.out',
            keyframes: [
              { opacity: 1, color: '#F94A00', duration: 0.05 },
              { color: '#FD7B03', duration: 0.05 },
              {
                opacity: i => words[i].dataset.finalOpacity,
                color: 'var(--fonts-100)',
                duration: 0.05
              }
            ]
          }, 0);
        });

        tl.to('.header__left-link', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        }, 0.1);

        tl.to(['.header__main', '.menu__wrap-main'], {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.2);

        tl.to('.is-header-btn', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out'
        }, 0.35);

        tl.to('.hero__upload', {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, 0.25);

        tl.to('.hero__carousel__item', {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out'
        }, 0.3);

        tl.to('.hero__slider__item', {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out'
        }, 0.35);
      }

      document.addEventListener('preloader:done', () => {
        playHeroIntro();
      });

    })();
  },

  // ---- 20 ----
  function () {
    (function () {

      const DEFAULTS = {
        direction: 'up',
        stagger: 0.02,
        duration: 0.2,
        delay: 0,
        ease: 'power1.inOut',
        reverse: true,
        custom: { opacity: 1 }
      };

      function splitToChars(element) {
        return new SplitType(element, { types: 'chars' });
      }

      function zeroState(element, props) {
        const computed = getComputedStyle(element);
        const out = {};

        for (const key in props) {
          if (key === 'opacity') {
            out[key] = 1;
          } else {
            out[key] = props[key].replace(/-?\d+(\.\d+)?/g, '0');
            if (!/\d/.test(props[key])) out[key] = computed[key];
          }
        }
        return out;
      }

      document.querySelectorAll('[hover-stagger]').forEach(el => {
        const hoverTarget = el.closest('[hover-stagger-wrap]') || el;

        el.style.position ||= 'relative';
        el.style.display ||= 'inline-block';
        el.style.overflow = 'hidden';

        el.style.webkitMaskImage = 'linear-gradient(#000 0 0)';
        el.style.maskImage = 'linear-gradient(#000 0 0)';
        el.style.webkitMaskSize = '100% 70%';
        el.style.maskSize = '100% 70%';
        el.style.webkitMaskPosition = 'center';
        el.style.maskPosition = 'center';
        el.style.webkitMaskRepeat = 'no-repeat';
        el.style.maskRepeat = 'no-repeat';

        let tl = null;

        // Built on first hover: doing this for every label up front took ~650ms of main-thread time at load.
        function build() {
          const original = document.createElement('span');
          original.textContent = el.textContent;
          el.textContent = '';
          el.appendChild(original);

          const clone = original.cloneNode(true);
          clone.style.position = 'absolute';
          clone.style.left = 0;
          clone.style.top = DEFAULTS.direction === 'up' ? '100%' : '-100%';
          el.appendChild(clone);

          const splitMain = splitToChars(original);
          const splitClone = splitToChars(clone);

          const toState = zeroState(original, DEFAULTS.custom);
          const move = DEFAULTS.direction === 'up' ? -100 : 100;

          tl = gsap.timeline({
            paused: true,
            defaults: {
              ease: DEFAULTS.ease,
              duration: DEFAULTS.duration,
              stagger: DEFAULTS.stagger,
              delay: DEFAULTS.delay
            }
          });

          tl.fromTo(
            splitMain.chars,
            { yPercent: 0, ...DEFAULTS.custom },
            { yPercent: move, ...toState }
          ).fromTo(
            splitClone.chars,
            { yPercent: 0, ...DEFAULTS.custom },
            { yPercent: move, ...toState },
            '<'
          );

          return tl;
        }

        hoverTarget.addEventListener('mouseenter', () => (tl || build()).restart());
        hoverTarget.addEventListener('mouseleave', () => tl && DEFAULTS.reverse && tl.reverse());
      });

    })();
  },

  // ---- 21 ----
  function () {
    onReady(() => {
      const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saveData = !!(navigator.connection && navigator.connection.saveData);
      const pending = new Set();

      const blocks = Array.from(document.querySelectorAll(".w-background-video"));

      function ensureAttrs(video){
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("webkit-playsinline","");
        video.loop = true;
        video.autoplay = true;
        const poster = video.getAttribute("data-poster");
        if (poster && !video.poster) video.poster = poster;
      }

      function setPosterBgForBlock(block){
        const video = block.querySelector("video");
        const posterDiv = block.querySelector(".video-poster");
        const poster = video?.getAttribute("data-poster") || block.getAttribute("data-poster");
        if (poster && posterDiv){
          posterDiv.style.backgroundImage = `url("${poster}")`;
        }
      }

      function setSources(video){
        const sources = video.querySelectorAll("source[data-src]");
        let applied = 0;
        sources.forEach(s => { if (!s.src) { s.src = s.dataset.src; applied++; }});
        if (applied) video.load();
      }

      function tryPlay(video){
        if (prefersReducedMotion || saveData) return;
        if (video.getAttribute("data-autoplay") === "false") return;

        const play = () => video.play().then(()=>true).catch(()=>false);

        if (video.readyState >= 2) {
          play().then(ok => { if (!ok) pending.add(video); });
        } else {
          video.addEventListener("loadeddata", () => {
            play().then(ok => { if (!ok) pending.add(video); });
          }, { once:true });
        }
      }

      const unlock = () => {
        if (!pending.size) return;
        pending.forEach(v => v.play().catch(()=>{}));
        pending.clear();
      };

      ["touchstart","pointerdown","keydown","scroll"].forEach(ev =>
        window.addEventListener(ev, unlock, { passive:true })
      );

      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          const video = e.target;
          const posterDiv = video.previousElementSibling?.classList?.contains("video-poster")
            ? video.previousElementSibling : null;

          if (e.isIntersecting){
            ensureAttrs(video);
            setSources(video);
            tryPlay(video);

            video.addEventListener("loadeddata", () => {
              if (posterDiv) posterDiv.classList.add("video-faded");
            }, { once:true });
          } else {
            try { video.pause(); } catch(_) {}
          }
        });
      }, { rootMargin:"0px 0px 300px 0px", threshold:0.1 });

      blocks.forEach(block => {
        const video = block.querySelector("video");
        if (!video) return;

        setPosterBgForBlock(block);
        ensureAttrs(video);

        if (block.closest(".x_projects--projects_item")) {
          video.setAttribute("data-autoplay", "false");
          try { video.pause(); } catch(_) {}
        }

        io.observe(video);
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          blocks.forEach(b =>
            b.querySelectorAll("video").forEach(v => {
              try { v.pause(); } catch(_) {}
            })
          );
        }
      });

      const cards = document.querySelectorAll(".x_projects--projects_item");

      cards.forEach(card => {
        const video = card.querySelector(".w-background-video video");
        if (!video) return;

        let prepared = false;

        const prepare = () => {
          if (prepared) return;
          ensureAttrs(video);
          setSources(video);
          prepared = true;
        };

        const canPlay = () => !(prefersReducedMotion || saveData);

        card.addEventListener("mouseenter", () => {
          if (!canPlay()) return;
          prepare();
          video.play().catch(() => pending.add(video));
        });

        const pause = () => { try { video.pause(); } catch(_) {} };

        card.addEventListener("mouseleave", pause);
        card.addEventListener("pointerleave", pause);
        card.addEventListener("focusout", e => {
          if (!card.contains(e.relatedTarget)) pause();
        });

        pause();
      });
    });
  },

  // ---- 22 ----
  function () {
    (function () {

      const IMAGES = [
        '.is-img-anima-1',
        '.is-img-anima-2',
        '.is-img-anima-3',
        '.is-img-anima-4',
        '.is-img-anima-5'
      ];

      gsap.set(IMAGES, {
        opacity: 0,
        scale: 0.96,
        filter: 'blur(6px)'
      });

      const tl = gsap.timeline({
        repeat: -1,
        defaults: {
          ease: 'power2.out'
        }
      });

      IMAGES.forEach(selector => {
        tl.to(selector, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.9
        });
      });

      tl.to({}, { duration: 1.5 });

      IMAGES.forEach(selector => {
        tl.to(selector, {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(6px)',
          duration: 0.8
        });
      });

    })();
  },

  // ---- 23 ----
  function () {
    gsap.registerPlugin(ScrollTrigger);

    onReadyLate(() => {

      const slides = document.querySelectorAll('.list__main__wrap .list__main__slide');

      slides.forEach((slide, index) => {

        if (index === slides.length - 1) return;

        const contentWrapper = slide.querySelector('.list__main__content__wrap');
        const content = slide.querySelector('.list__main__content');

        gsap.to(content, {
          rotationZ: (Math.random() - 0.5) * 10,
          scale: 0.7,
          rotationX: 40,
          ease: 'power1.in',
          scrollTrigger: {
            pin: contentWrapper,
            trigger: slide,
            start: 'top 0%',
            end: '+=' + window.innerHeight,
            scrub: true
          }
        });

        gsap.to(content, {
          autoAlpha: 0,
          ease: 'power1.in',
          scrollTrigger: {
            trigger: content,
            start: 'top -80%',
            end: '+=' + 0.5 * window.innerHeight,
            scrub: true
          }
        });
      });

    });
  }
  ];

  function nextTask() {
    return new Promise(function (resolve) {
      var channel = new MessageChannel();
      channel.port1.onmessage = function () { resolve(); };
      channel.port2.postMessage(0);
    });
  }

  async function runAll(list) {
    for (var i = 0; i < list.length; i++) {
      try { list[i](); } catch (err) { console.error(err); }
      await nextTask();
    }
  }

  var started = false;
  async function start() {
    if (started) return;
    started = true;
    await runAll(blocks);
    await runAll(readyQueue);
    await runAll(readyLateQueue);
  }

  // Let the browser paint the preloader and its first image before any of this runs.
  function afterNextPaint(fn) { requestAnimationFrame(function () { setTimeout(fn, 0); }); }
  var topImage = document.querySelector('.preloader__images-in[fetchpriority="high"]');
  function whenImageReady(fn) {
    if (!topImage || topImage.complete) return fn();
    topImage.addEventListener('load', fn, { once: true });
    topImage.addEventListener('error', fn, { once: true });
  }
  afterNextPaint(function () { whenImageReady(function () { afterNextPaint(start); }); });
  // Slow connection or background tab (no frames are drawn there): do not wait longer than this.
  setTimeout(start, 1200);
})();
