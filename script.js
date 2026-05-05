/* ============================================================
   Academic AI Lab — Enhanced Frontend v2.0
   ============================================================ */

'use strict';

// ========================
// 1. MOBILE DRAWER (Slide-out Navigation)
// ========================
(function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const navOverlay = document.querySelector('.nav-overlay');
  const drawerClose = document.querySelector('.drawer-close');

  if (!menuToggle || !mobileDrawer) return;

  function openDrawer() {
    mobileDrawer.classList.add('open');
    if (navOverlay) {
      navOverlay.classList.add('open');
      navOverlay.style.pointerEvents = 'auto';
    }
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    if (navOverlay) {
      navOverlay.classList.remove('open');
      navOverlay.style.pointerEvents = 'none';
    }
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (navOverlay) navOverlay.addEventListener('click', closeDrawer);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close drawer on nav link click
  mobileDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
})();

// ========================
// 2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
// ========================
(function initScrollReveal() {
  const elements = document.querySelectorAll('.animate-in');

  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ========================
// 3. BACK TO TOP BUTTON
// ========================
(function initBackToTop() {
  const btn = document.querySelector('.float-top');
  if (!btn) return;

  const handleScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ========================
// 4. ASSISTANT BUBBLE
// ========================
(function initAssistantBubble() {
  const bubble = document.querySelector('.assistant-bubble');
  const closeBtn = document.querySelector('.assistant-close');
  if (!bubble) return;

  // Show after delay
  const showTimer = setTimeout(() => {
    bubble.classList.add('visible');
  }, 2000);

  // Dismiss on close
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      bubble.classList.remove('visible');
      clearTimeout(showTimer);
    });
  }

  // Dismiss on scroll (after user scrolls past hero)
  let dismissed = false;
  window.addEventListener('scroll', () => {
    if (!dismissed && window.scrollY > 600) {
      bubble.classList.remove('visible');
      dismissed = true;
      clearTimeout(showTimer);
    }
  }, { passive: true });
})();

// ========================
// 5. SITE SHARE
// ========================
(function initShareButton() {
  const shareBtn = document.querySelector('.float-share');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: 'Academic AI Lab — Expert-reviewed academic, research, AI, and digital support.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Simple feedback
        shareBtn.style.background = '#059669';
        shareBtn.style.color = '#fff';
        setTimeout(() => {
          shareBtn.style.background = '';
          shareBtn.style.color = '';
        }, 1200);
      }
    } catch {
      // User cancelled or error — silently ignore
    }
  });
})();

// ========================
// 6. STAT COUNTER (Animated)
// ========================
(function initStatCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count) || parseInt(el.textContent.replace(/\D/g, '')) || 0;
        const duration = 1200;
        const start = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current;
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
})();

// ========================
// 7. SMOOTH SCROLL FOR ANCHOR LINKS
// ========================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();

// ========================
// 8. ACTIVE NAV LINK HIGHLIGHT
// ========================
(function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .drawer-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('nav-active');
    }
  });
})();

// ========================
// 9. FORM HANDLING (API)
// ========================
async function postJson(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

function getFriendlyResponse(path, data) {
  if (data.error) return `Please review: ${data.error}`;

  if (path.includes('submit-task')) {
    return `✓ Task submitted successfully. Your Order ID is ${data.order_id || 'AAL-****'}. Our team will review the scope and confirm your quote shortly.`;
  }
  if (path.includes('request-magic-link')) {
    return '✓ Request received. Once messaging is connected, a secure access link will be sent to your email or WhatsApp.';
  }
  if (path.includes('join-expert-network')) {
    return '✓ Application received. Our team will review your expertise and credentials before contacting you.';
  }
  if (path.includes('feedback')) {
    return '✓ Thank you. Your feedback will be verified against the Order ID before publication.';
  }
  return data.message || '✓ Request received successfully.';
}

(function initForms() {
  document.querySelectorAll('[data-api-form]').forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const output = form.querySelector('[data-form-output]');

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing…';
      }
      if (output) output.textContent = 'Submitting…';

      // Build payload
      const payload = Object.fromEntries(new FormData(form).entries());
      const fileInput = form.querySelector('input[type="file"]');

      if (fileInput && fileInput.files.length) {
        payload.file_metadata = [...fileInput.files]
          .map(f => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`)
          .join('; ');
        delete payload.files;
      }

      try {
        const data = await postJson(form.dataset.apiForm, payload);
        if (output) {
          output.textContent = getFriendlyResponse(form.dataset.apiForm, data);
          output.style.color = '#059669';
        }
      } catch (err) {
        if (output) {
          output.textContent = 'Unable to connect. Please try again or contact our support team.';
          output.style.color = '#DC2626';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit';
        }
      }
    });
  });
})();
