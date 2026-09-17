// --- 0. Dark Mode ---
(function initTheme() {
  const stored = localStorage.getItem('devhoney-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

function createThemeToggle() {
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle dark mode');
  btn.type = 'button';
  updateToggleIcon(btn);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('devhoney-theme', next);
    updateToggleIcon(btn);
    btn.classList.remove('spin');
    void btn.offsetWidth;
    btn.classList.add('spin');
  });

  return btn;
}

function updateToggleIcon(btn) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelector('.nav-links');
  const appHeader = document.querySelector('.app-header');

  if (navLinks) {
    navLinks.insertBefore(createThemeToggle(), navLinks.querySelector('.nav-btn'));
  } else if (appHeader) {
    appHeader.appendChild(createThemeToggle());
  }
});

// --- 1. Custom Cursor Follower ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorGlow = document.querySelector('.cursor-glow');

window.addEventListener('mousemove', (e) => {
  const { clientX, clientY } = e;
  if (cursorDot) {
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
  }
  if (cursorGlow) {
    cursorGlow.style.left = `${clientX}px`;
    cursorGlow.style.top = `${clientY}px`;
  }
});

// --- 2. 3D Interactive Canvas in Hero Section (Three.js) ---
const container = document.querySelector('.hero-3d-wrapper');
const canvas = document.querySelector('#bg-3d');

if (canvas && container && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();

  let width = container.clientWidth;
  let height = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Glowing Wireframe 3D Shape (terracotta, matches site palette)
  const geometry = new THREE.TorusKnotGeometry(7.5, 2.3, 120, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xc15a34,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  });
  const torusKnot = new THREE.Mesh(geometry, material);
  scene.add(torusKnot);

  // Floating Particles Field (warm gold)
  const particlesCount = 350;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 55;
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.35,
    color: 0xd97757,
    transparent: true,
    opacity: 0.75
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  camera.position.z = 20;

  // Interactive Mouse Movement
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    torusKnot.rotation.x += 0.005 + mouseY * 0.003;
    torusKnot.rotation.y += 0.008 + mouseX * 0.003;

    particleSystem.rotation.y += 0.002;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

// --- 3. 3D Card Hover Tilt Effect ---
const cards = document.querySelectorAll('.tilt-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
  });
});

// --- 4. Formspree AJAX Form Handling ---
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = new FormData(contactForm);

    formStatus.textContent = "Sending message...";
    formStatus.style.color = "#D97757";

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        formStatus.textContent = "Thank you! Message sent successfully.";
        formStatus.style.color = "#3f8a54";
        contactForm.reset();
      } else {
        formStatus.textContent = "Oops! There was a problem submitting your form.";
        formStatus.style.color = "#c1462f";
      }
    } catch (error) {
      formStatus.textContent = "Error sending message. Please try again.";
      formStatus.style.color = "#c1462f";
    }
  });
}

// --- 5a. Scroll Progress Bar ---
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}, { passive: true });

// --- 5b. Button Ripple Effect ---
document.querySelectorAll('.btn-primary, .btn-secondary, .tab-btn, .counter-btn, .add-to-cart').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// --- 5c. Back to Top Button ---
const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 6. Scroll Reveal (2D entrance animation on scroll) ---
const revealTargets = document.querySelectorAll(
  '.bento-card, .menu-card, .product-card, .hud-card, .section-title'
);

revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

// --- 7. Gym HUD: Day Tabs, Hydration Counter, BMI Calculator ---
const workoutData = {
  mon: {
    label: 'Mon',
    routine: [
      ['Barbell Bench Press', '4 x 8'],
      ['Incline Dumbbell Press', '3 x 10'],
      ['Tricep Dips', '4 x 12']
    ]
  },
  tue: {
    label: 'Tue',
    routine: [
      ['Lat Pulldown', '4 x 10'],
      ['Barbell Bent Rows', '3 x 10'],
      ['Hammer Curls', '4 x 12']
    ]
  },
  wed: {
    label: 'Wed',
    routine: [
      ['Barbell Back Squat', '4 x 8'],
      ['Romanian Deadlift', '3 x 10'],
      ['Plank Hold', '3 x 45s']
    ]
  },
  thu: {
    label: 'Thu',
    routine: [
      ['Light Cycling', '20 min'],
      ['Mobility Flow', '15 min'],
      ['Foam Rolling', '10 min']
    ]
  }
};

const tabBtns = document.querySelectorAll('.tab-btn');
const routineList = document.getElementById('routineList');
const currentDayLabel = document.getElementById('currentDay');

if (tabBtns.length && routineList) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const day = btn.dataset.day;
      const data = workoutData[day];
      if (!data) return;

      if (currentDayLabel) currentDayLabel.textContent = data.label;

      routineList.style.opacity = '0';
      setTimeout(() => {
        routineList.innerHTML = data.routine
          .map(([name, sets], i) =>
            `<li style="animation-delay:${i * 0.07}s"><span>${name}</span> <strong>${sets}</strong></li>`
          )
          .join('');
        routineList.style.opacity = '1';
      }, 150);
    });
  });
}

const waterCountEl = document.getElementById('waterCount');
const addGlassBtn = document.getElementById('addGlass');
const removeGlassBtn = document.getElementById('removeGlass');

if (waterCountEl && addGlassBtn && removeGlassBtn) {
  let glasses = parseInt(waterCountEl.textContent, 10) || 0;
  const updateWater = () => {
    waterCountEl.textContent = glasses;
    waterCountEl.parentElement.classList.remove('pulse');
    void waterCountEl.parentElement.offsetWidth;
    waterCountEl.parentElement.classList.add('pulse');
  };
  addGlassBtn.addEventListener('click', () => {
    glasses = Math.min(glasses + 1, 20);
    updateWater();
  });
  removeGlassBtn.addEventListener('click', () => {
    glasses = Math.max(glasses - 1, 0);
    updateWater();
  });
}

const bmiWeight = document.getElementById('bmiWeight');
const bmiHeight = document.getElementById('bmiHeight');
const calcBmiBtn = document.getElementById('calcBmiBtn');
const bmiResult = document.getElementById('bmiResult');

if (calcBmiBtn && bmiResult) {
  calcBmiBtn.addEventListener('click', () => {
    const w = parseFloat(bmiWeight.value);
    const h = parseFloat(bmiHeight.value) / 100;

    if (!w || !h) {
      bmiResult.textContent = 'Enter a valid weight and height.';
      bmiResult.classList.add('show');
      return;
    }

    const bmi = (w / (h * h)).toFixed(1);
    let category = 'Normal range';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese range';

    bmiResult.classList.remove('show');
    void bmiResult.offsetWidth;
    bmiResult.textContent = `BMI: ${bmi} — ${category}`;
    bmiResult.classList.add('show');
  });
}

// --- 8. E-commerce: Add to Cart ---
const addToCartBtns = document.querySelectorAll('.add-to-cart');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');

if (addToCartBtns.length && cartCountEl && cartTotalEl) {
  let count = 0;
  let total = 0;

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      count += 1;
      total += parseFloat(btn.dataset.price) || 0;

      cartCountEl.textContent = count;
      cartTotalEl.textContent = total.toFixed(2);

      const cartStatus = document.querySelector('.cart-status');
      if (cartStatus) {
        cartStatus.classList.remove('bump');
        void cartStatus.offsetWidth;
        cartStatus.classList.add('bump');
      }

      const originalText = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => { btn.textContent = originalText; }, 900);
    });
  });
}
