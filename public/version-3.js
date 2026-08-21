// VSL Player functionality
const vslPlayer = document.getElementById('vsl-player');
const vslPlayBtn = document.querySelector('.vsl-play-btn');

if (vslPlayer && vslPlayBtn) {
  vslPlayBtn.addEventListener('click', () => {
    vslPlayer.classList.add('playing');
  });
}

// Accordion functionality
const accordionTriggers = document.querySelectorAll('.accordion-trigger');

accordionTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const isActive = item.classList.contains('active');
    
    // Close all other accordion items
    document.querySelectorAll('.accordion-item').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
        otherItem.querySelector('.accordion-content').classList.add('hidden');
      }
    });
    
    // Toggle current item
    if (isActive) {
      item.classList.remove('active');
      content.classList.add('hidden');
    } else {
      item.classList.add('active');
      content.classList.remove('hidden');
    }
  });
});

// Reveal animations using Intersection Observer
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '-60px 0px'
});

revealElements.forEach(element => {
  element.classList.add('opacity-0');
  revealObserver.observe(element);
});

// Update year in footer
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
