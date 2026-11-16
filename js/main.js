/**
 * Valterra Group — Main Interface Scripts
 * Luxury interactions, smooth navigation, and dynamic state management
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navigation on Scroll
  const navHeader = document.querySelector('.nav-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Subtle Ambient Pointer Glow (Desktop only)
  if (window.innerWidth > 900) {
    const ambientGlow = document.createElement('div');
    ambientGlow.className = 'ambient-pointer-glow';
    ambientGlow.style.cssText = `
      position: fixed;
      width: 480px;
      height: 480px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(216, 201, 163, 0.035) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%);
      transition: opacity 0.5s ease;
      opacity: 0;
    `;
    document.body.appendChild(ambientGlow);

    window.addEventListener('mousemove', (e) => {
      ambientGlow.style.opacity = '1';
      ambientGlow.style.left = `${e.clientX}px`;
      ambientGlow.style.top = `${e.clientY}px`;
    });

    window.addEventListener('mouseleave', () => {
      ambientGlow.style.opacity = '0';
    });
  }

  // 4. Contact Form Handling with State Feedback
  const contactForm = document.getElementById('valterra-contact-form');
  const contactStatus = document.getElementById('contact-status-msg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="pulse-dot"></span> Transmitting Inquiry...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Inquiry Dispatched</span>`;
        if (contactStatus) {
          contactStatus.style.display = 'block';
          contactStatus.innerHTML = `
            <div style="padding: 1rem 1.25rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10B981; font-size: 0.88rem; margin-top: 1rem;">
              <strong>Inquiry Received.</strong> A Partner from the designated Valterra practice will review your scope and establish contact within 24 hours.
            </div>
          `;
        }
        contactForm.reset();
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
        }, 5000);
      }, 1200);
    });
  }
});
