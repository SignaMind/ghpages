"use strict";

//Alpine JS and plugins import
import Alpine from "alpinejs"
import intersect from "@alpinejs/intersect"
import collapse from '@alpinejs/collapse';
import persist from "@alpinejs/persist";
import 'iconify-icon';

window.Alpine = Alpine
//Init intersect plugin
Alpine.plugin(intersect)
//Init persist plugin
Alpine.plugin(persist)
//Init collapse plugin
Alpine.plugin(collapse);
//Init store
Alpine.store("app", {
  init() {
    this.on = window.matchMedia("(prefers-color-scheme: dark)").matches;
  },
  isDark: Alpine.$persist(false),
  isSidebarOpened: Alpine.$persist(false),
  isSiderbarOpen: Alpine.$persist(false),
  isSidebarOpenedMobile: Alpine.$persist(false),
  activeSidebar: Alpine.$persist("dashboard"),
  activeSidebarMenu: Alpine.$persist(""),
  isPanelOpened: Alpine.$persist(false),
});
//Start Alpine JS
Alpine.start()

import { insertBgImages } from "./libs/utils/utils";
import "./libs/components";

document.onreadystatechange = function () {
  if (document.readyState == "complete") {

    //Switch backgrounds
    const changeBackgrounds = insertBgImages();
  }
};

// Scroll-reveal: fade in elements as they enter the viewport
(() => {
  const revealEls = document.querySelectorAll('.is-feature-reveal, .is-title-reveal, .is-icon-reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

// Hero reveal: collapse hero on scroll to reveal content
(() => {
  const hero = document.getElementById('hero-reveal');
  if (!hero) return;

  const onScroll = () => {
    const trigger = 60; // px scrolled before collapsing
    if (window.scrollY > trigger) {
      hero.classList.add('is-collapsed');
    } else {
      hero.classList.remove('is-collapsed');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // run once on load
  onScroll();
})();

// ─── Knowledge-graph canvas ───────────────────────────────────────────────────
(() => {
  const canvas = document.getElementById('kg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PRIMARY = [79, 193, 234];  // #4FC1EA
  const ACCENT  = [243, 146, 0];   // #F39200
  const MAX_NODES = 80;
  const mouse = { x: null, y: null };
  let nodes = [];

  function col(c) { return c.join(','); }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Node {
    constructor(x, y, hub = false) {
      const angle = Math.random() * Math.PI * 2;
      const spd   = hub ? 0.12 : 0.22;
      this.x     = x !== undefined ? x : Math.random() * canvas.width;
      this.y     = y !== undefined ? y : Math.random() * canvas.height;
      this.vx    = Math.cos(angle) * spd;
      this.vy    = Math.sin(angle) * spd;
      this.hub   = hub;
      this.r     = hub ? 4 + Math.random() * 4 : 1.5 + Math.random() * 1.5;
      this.baseA = hub ? 0.10 + Math.random() * 0.06 : 0.02 + Math.random() * 0.03;
      this.a     = 0;
      this.targetA = this.baseA;
      this.color = (hub && Math.random() < 0.2) ? ACCENT : PRIMARY;
      this.phase = Math.random() * Math.PI * 2;
    }

    update() {
      this.phase += 0.018;
      this.a += (this.targetA - this.a) * 0.06;
      this.x += this.vx;
      this.y += this.vy;

      const pad = 60;
      if (this.x < -pad)               this.x = canvas.width  + pad;
      if (this.x > canvas.width  + pad) this.x = -pad;
      if (this.y < -pad)               this.y = canvas.height + pad;
      if (this.y > canvas.height + pad) this.y = -pad;

      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        const R  = 120;
        if (d < R && d > 0) {
          const f = ((R - d) / R) * 2;
          this.x += (dx / d) * f;
          this.y += (dy / d) * f;
        }
      }

      if (this.hub) this.targetA = this.baseA + Math.sin(this.phase) * 0.05;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.a;
      if (this.hub) {
        ctx.shadowColor = `rgba(${col(this.color)},0.4)`;
        ctx.shadowBlur  = 8;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${col(this.color)})`;
      ctx.fill();
      ctx.restore();
    }
  }

  function drawEdges() {
    const MAX = 155;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < MAX) {
          ctx.save();
          ctx.globalAlpha = (1 - d / MAX) * 0.18 * Math.min(a.a, b.a) * 10;
          ctx.strokeStyle = `rgb(${col(PRIMARY)})`;
          ctx.lineWidth   = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function spawnNode(x, y) {
    if (nodes.length >= MAX_NODES) nodes.shift();
    nodes.push(new Node(x, y, Math.random() < 0.2));
  }

  function init() {
    resize();
    const area  = canvas.width * canvas.height;
    const small = Math.max(15, Math.min(40, Math.floor(area / 15000)));
    const hubs  = Math.max(6,  Math.min(15, Math.floor(area / 50000)));
    nodes = [];
    for (let i = 0; i < small; i++) nodes.push(new Node());
    for (let i = 0; i < hubs;  i++) nodes.push(new Node(undefined, undefined, true));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEdges();
    nodes.forEach(n => { n.update(); n.draw(); });
    requestAnimationFrame(animate);
  }

  // Global mouse tracking for repulsion effect
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // Click anywhere (except hero/contact) to add a node
  const excludeIds = ['hero-reveal', 'contact'];
  document.addEventListener('click', e => {
    const inExcluded = excludeIds.some(id => {
      const el = document.getElementById(id);
      return el && el.contains(e.target);
    });
    if (!inExcluded) spawnNode(e.clientX, e.clientY);
  });

  // Hide canvas when scrolled into hero or contact sections
  function updateVisibility() {
    const heroEl    = document.getElementById('hero-reveal');
    const contactEl = document.getElementById('contact');
    const vy = window.scrollY;
    const vh = window.innerHeight;
    const inHero    = heroEl    && vy < heroEl.offsetTop + heroEl.offsetHeight;
    const inContact = contactEl && vy + vh > contactEl.offsetTop;
    canvas.style.opacity = (inHero || inContact) ? '0' : '1';
  }

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();

  window.addEventListener('resize', init, { passive: true });
  init();
  animate();
})();
