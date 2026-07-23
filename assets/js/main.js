// Elétrica Maia — protótipo: interações simples (menu mobile e formulário demo)
(function () {
  "use strict";

  // Menu mobile
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Formulário de orçamento (protótipo — sem envio real)
  var form = document.querySelector("[data-demo-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector("[data-form-message]");
      if (msg) {
        msg.hidden = false;
        msg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }
})();
