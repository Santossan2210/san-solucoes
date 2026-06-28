/**
 * San Soluções e Negócios - JavaScript da Home (home.js)
 * =========================================================
 * Efeitos interativos específicos da página inicial:
 *   A) Canvas de partículas (fundo animado do Hero)
 *   B) Contador animado das estatísticas
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------- */
  /* A. CANVAS DE PARTÍCULAS (efeito visual hero) */
  /* ------------------------------------------- */
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  // Ajusta o canvas ao tamanho da janela
  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Classe Partícula
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      // Cor: branco ou dourado
      this.color = Math.random() > 0.85 ? '#F59E0B' : '#FFFFFF';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Reposiciona quando sai dos limites
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle   = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Cria partículas (densidade baseada na tela)
  const createParticles = () => {
    const count = Math.floor((canvas.width * canvas.height) / 10000);
    particles = [];
    for (let i = 0; i < Math.min(count, 120); i++) {
      particles.push(new Particle());
    }
  };

  // Loop de animação
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    // Linhas de conexão entre partículas próximas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 100) * 0.12;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  };

  // Pausa animação quando fora da viewport (performance)
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      },
      { threshold: 0 }
    );
    visObserver.observe(heroSection);
  }

  createParticles();
  animate();

  // Recria partículas após resize
  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  /* ------------------------------------------- */
  /* B. CONTADOR ANIMADO NAS ESTATÍSTICAS         */
  /* ------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  if (statNumbers.length > 0) {
    // Anima o número de 0 até o valor alvo
    const animateCounter = (el, target, duration = 2000) => {
      const start     = performance.now();
      const startVal  = 0;

      const step = (timestamp) => {
        const elapsed  = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutCubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = Math.floor(startVal + (target - startVal) * eased);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target; // garante o valor final exato
        }
      };

      requestAnimationFrame(step);
    };

    // Dispara o contador quando as estatísticas ficam visíveis
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statNumbers.forEach((el) => {
              const target = parseInt(el.dataset.target, 10);
              animateCounter(el, target, 1800);
            });
            statsObserver.disconnect(); // executa apenas uma vez
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) statsObserver.observe(statsSection);
  }

});
