/**
 * San Soluções e Negócios - JavaScript Global (global.js)
 * =========================================================
 * Efeitos interativos 1 e 2:
 *   1) Header dinâmico (scroll → fundo branco)
 *   2) Reveal de elementos ao entrar na viewport (Intersection Observer)
 *
 * Inclui: menu mobile, ano do rodapé
 * Possibilidades de melhoria durante o desenvolvimento.
 *
 * Autor: Antonio Santos
 * Data: 2024-06-14
 */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------- */
  /* 1. EFEITO INTERATIVO: Header dinâmico ao rolar      */
  /* -------------------------------------------------- */
  const header = document.getElementById('site-header');

  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    // Verifica na carga e a cada scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // estado inicial
  }

  /* -------------------------------------------------- */
  /* 2. EFEITO INTERATIVO: Reveal ao entrar na viewport  */
  /* -------------------------------------------------- */
  // Usa Intersection Observer para adicionar classe .visible
  // em elementos marcados com [data-reveal]
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // para de observar após revelar
          }
        });
      },
      {
        threshold: 0.15,    // 15% visível já aciona
        rootMargin: '0px 0px -40px 0px', // pequena margem inferior
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* -------------------------------------------------- */
  /* 3. MENU MOBILE (hamburguer)                         */
  /* -------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Fecha o menu ao clicar em um link
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------------------------------------- */
  /* 4. ANO DINÂMICO NO RODAPÉ                           */
  /* -------------------------------------------------- */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
