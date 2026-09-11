/* Shared behaviour for the four static pages. Each feature activates only when its markup exists. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '打开导航菜单');
    });
  }

  const slides = [...document.querySelectorAll('.carousel-slide')];
  const dots = [...document.querySelectorAll('.carousel-dots .dot')];
  if (slides.length) {
    let currentSlide = 0;
    let carouselInterval;
    const showSlide = index => {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-pressed', String(i === index));
      });
      currentSlide = index;
    };
    const resetTimer = () => {
      window.clearInterval(carouselInterval);
      if (!reducedMotion) carouselInterval = window.setInterval(() => showSlide((currentSlide + 1) % slides.length), 5000);
    };
    dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.slide)); resetTimer(); }));
    resetTimer();
  }

  document.querySelectorAll('[data-scroll-direction]').forEach(button => button.addEventListener('click', () => {
    const track = document.getElementById('spotTrack');
    const card = track?.querySelector('.spot-card');
    if (!track) return;
    const step = card ? card.offsetWidth + 28 : 350;
    const max = track.scrollWidth - track.clientWidth;
    const right = button.dataset.scrollDirection === 'right';
    const target = right ? (track.scrollLeft >= max - 10 ? 0 : track.scrollLeft + step) : (track.scrollLeft <= 10 ? max : track.scrollLeft - step);
    track.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  }));

  const progressBar = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const updateScrollUI = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) progressBar.style.width = `${height ? (top / height) * 100 : 0}%`;
    if (backToTop) {
      backToTop.classList.toggle('visible', top > 300);
      backToTop.classList.toggle('hidden', top < 30);
    }
  };
  if (progressBar || backToTop) {
    updateScrollUI();
    window.addEventListener('scroll', () => window.requestAnimationFrame(updateScrollUI), { passive: true });
  }
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  document.querySelectorAll('.sidebar a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) { event.preventDefault(); target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }
  }));
  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  if (revealItems.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: .1 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  const cards = [...document.querySelectorAll('.member-card')];
  const consoleAvatar = document.getElementById('consoleAvatar');
  if (cards.length && consoleAvatar) {
    const consoleName = document.getElementById('consoleName');
    const consoleRole = document.getElementById('consoleRole');
    const consoleDesc = document.getElementById('consoleDesc');
    const consoleSkills = document.getElementById('consoleSkills');
    const body = document.querySelector('.console-body');
    const updateConsole = card => {
      cards.forEach(item => item.classList.remove('active'));
      card.classList.add('active');
      if (body) { body.style.opacity = '0'; body.style.transform = 'translateY(8px)'; }
      consoleAvatar.style.opacity = '0'; consoleAvatar.style.transform = 'scale(.85)';
      window.setTimeout(() => {
        consoleName.textContent = card.dataset.name || '';
        consoleRole.textContent = card.dataset.role || '';
        consoleDesc.textContent = card.dataset.desc || '';
        consoleAvatar.src = card.dataset.photo || consoleAvatar.src;
        consoleSkills.replaceChildren(...(card.dataset.skills || '').split(',').filter(Boolean).map(skill => {
          const badge = document.createElement('span'); badge.className = 'skill-badge'; badge.textContent = skill.trim(); return badge;
        }));
        if (body) { body.style.opacity = '1'; body.style.transform = 'translateY(0)'; }
        consoleAvatar.style.opacity = '1'; consoleAvatar.style.transform = 'scale(1)';
      }, reducedMotion ? 0 : 150);
    };
    cards.forEach(card => { card.addEventListener('mouseenter', () => updateConsole(card)); card.addEventListener('click', () => updateConsole(card)); });
  }

  const teacherTrigger = document.getElementById('teacherTrigger');
  const teacherPopup = document.getElementById('teacherPopupCard');
  const teacherImage = document.getElementById('teacherPopupImg');
  if (teacherTrigger && teacherPopup && teacherImage) {
    teacherImage.src = teacherTrigger.dataset.teacherPhoto || teacherImage.src;
    teacherTrigger.addEventListener('mouseenter', () => teacherPopup.classList.add('show'));
    teacherTrigger.addEventListener('mousemove', event => {
      teacherPopup.style.left = `${Math.min(event.clientX + 18, window.innerWidth - 380)}px`;
      teacherPopup.style.top = `${Math.min(event.clientY + 18, window.innerHeight - 300)}px`;
    });
    teacherTrigger.addEventListener('mouseleave', () => teacherPopup.classList.remove('show'));
  }
})();
