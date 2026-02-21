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
