(() => {
  "use strict";

  const WEB3FORMS_ACCESS_KEY = "9cd30c6e-e2b0-4636-9478-f7c610752891";
  const SHOP_URL = "https://ezeen3d.mitiendanube.com/";
  const SHOP_PRODUCTS_URL = "https://ezeen3d.mitiendanube.com/productos/";
  const WHATSAPP_URL =
    "https://wa.me/541122762234?text=Hola%20Eze%2C%20quiero%20pedir%20presupuesto%20para%20una%20impresi%C3%B3n%203D%20a%20pedido.";

  const primaryNavItems = [
    ["Inicio", "/"],
    ["Impresión 3D a pedido", "/impresion-3d-a-pedido"],
    ["Repuestos", "/repuestos-impresos-3d"],
    ["Personalizados", "/productos-personalizados"],
    ["Tienda", "/tienda"],
    ["Contacto", "/contacto"],
  ];

  const currencyData = {
    ARS: {
      label: "ARS $",
      locale: "es-AR",
      rate: 1,
      defaults: {
        filamentKg: 24000,
        kwh: 140,
        spareParts: 15000,
        supplies: 0,
      },
    },
    USD: {
      label: "USD US$",
      locale: "en-US",
      rate: 1200,
      defaults: {
        filamentKg: 20,
        kwh: 0.12,
        spareParts: 12.5,
        supplies: 0,
      },
    },
    EUR: {
      label: "EUR €",
      locale: "de-DE",
      rate: 1300,
      defaults: {
        filamentKg: 18.46,
        kwh: 0.11,
        spareParts: 11.54,
        supplies: 0,
      },
    },
  };

  const fieldOrder = [
    "filamentKg",
    "kwh",
    "watts",
    "machineHours",
    "spareParts",
    "errorMargin",
    "printHours",
    "printMinutes",
    "grams",
    "supplies",
    "profitMultiplier",
  ];
  const moneyFields = ["filamentKg", "kwh", "spareParts", "supplies"];
  const moneyLabelByField = {
    filamentKg: "Precio KG",
    kwh: "Precio kWh",
    spareParts: "Precio repuestos",
    supplies: "Insumos",
  };

  const baseForm = {
    filamentKg: 24000,
    kwh: 140,
    watts: 120,
    machineHours: 4300,
    spareParts: 15000,
    errorMargin: 30,
    printHours: 1,
    printMinutes: 0,
    grams: 100,
    supplies: 0,
    profitMultiplier: 4,
  };

  const menuIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16"></path><path d="M4 12h16"></path><path d="M4 17h16"></path></svg>';
  const closeIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initTracking();
    initShopLinks();
    initCalculator();
    initContactForm();
  });

  function initMobileMenu() {
    const button = document.querySelector(".menu-button");
    const header = document.querySelector(".site-header");
    const navContainer = document.querySelector(".site-header .nav");
    if (!button || !header || !navContainer) return;

    let menu = document.getElementById("mobile-menu");
    if (!menu) {
      menu = document.createElement("nav");
      menu.id = "mobile-menu";
      menu.className = "mobile-menu";
      menu.setAttribute("aria-label", "Menú móvil");
      menu.hidden = true;

      const items = [...primaryNavItems, ["Calculadora", "/calculadora", true]];
      for (const [label, href, secondary] of items) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        if (secondary) link.className = "mobile-secondary-link";
        if (normalizePath(window.location.pathname) === href) {
          link.classList.add("active");
        }
        link.addEventListener("click", () => setMenuOpen(false));
        menu.append(link);
      }

      header.insertBefore(menu, navContainer.nextSibling);
    }

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setMenuOpen(button.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", (event) => {
      if (
        button.getAttribute("aria-expanded") === "true" &&
        !header.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });

    function setMenuOpen(open) {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      button.innerHTML = open ? closeIcon : menuIcon;
      menu.hidden = !open;
    }
  }

  function initTracking() {
    document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
      link.addEventListener("click", () => {
        trackConversion("whatsapp_click", {
          location: getLinkLocation(link),
        });
      });
    });

    document
      .querySelectorAll('a[href*="instagram.com"]')
      .forEach((link) => {
        link.addEventListener("click", () => {
          trackConversion("instagram_click", {
            location: getLinkLocation(link),
          });
        });
      });
  }

  function initShopLinks() {
    const shopButtons = [...document.querySelectorAll("a")].filter((link) =>
      link.textContent.toLowerCase().includes("tienda")
    );
    const productButtons = [...document.querySelectorAll("a")].filter((link) =>
      link.textContent.toLowerCase().includes("productos listos para comprar")
    );

    [...shopButtons, ...productButtons].forEach((link) => {
      link.addEventListener("click", () => {
        trackConversion("online_shop_click", {
          location: getLinkLocation(link),
        });
      });
    });

    productButtons.forEach((link) => {
      link.href = SHOP_PRODUCTS_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });

    document.querySelectorAll('a[href="' + WHATSAPP_URL + '"]').forEach((link) => {
      if (!link.textContent.toLowerCase().includes("tienda")) return;
      link.href = SHOP_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.firstChild.textContent = "Abrir tienda online";
    });
  }

  function initCalculator() {
    const resultsPanel = document.getElementById("calculator-results");
    const inputs = [...document.querySelectorAll(".calculator-section input")];
    const currencyButtons = [
      ...document.querySelectorAll(".currency-switch button"),
    ];
    if (!resultsPanel || inputs.length < fieldOrder.length) return;

    let currency = "ARS";
    let calculations = 0;
    let form = { ...baseForm };

    inputs.slice(0, fieldOrder.length).forEach((input, index) => {
      const field = fieldOrder[index];
      input.dataset.field = field;
      input.addEventListener("input", () => {
        updateField(field, input.value);
        updateResults();
      });
    });

    currencyButtons.forEach((button, index) => {
      const code = ["ARS", "USD", "EUR"][index];
      if (!code) return;
      button.dataset.currency = code;
      button.addEventListener("click", () => {
        currency = code;
        currencyButtons.forEach((item) =>
          item.classList.toggle("active", item === button)
        );
        updateInputs();
        updateLabels();
        updateResults();
      });
    });

    document.querySelector(".calculate-button")?.addEventListener("click", () => {
      calculations += 1;
      resultsPanel.dataset.calculations = String(calculations);
      trackConversion("calculator_use", { currency });
      resultsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    [...document.querySelectorAll(".calculator-section button")]
      .find((button) =>
        button.textContent.toLowerCase().includes("restaurar valores base")
      )
      ?.addEventListener("click", () => {
        form = { ...baseForm };
        updateInputs();
        updateResults();
      });

    updateLabels();
    updateResults();

    function updateField(field, value) {
      form = {
        ...form,
        [field]: moneyFields.includes(field)
          ? convertMoneyToARS(value, currency)
          : value,
      };
    }

    function updateInputs() {
      inputs.slice(0, fieldOrder.length).forEach((input) => {
        const field = input.dataset.field;
        input.value = moneyFields.includes(field)
          ? convertMoneyFromARS(form[field], currency)
          : form[field];
        input.step =
          moneyFields.includes(field) && currency !== "ARS" ? "0.01" : input.step;
      });
    }

    function updateLabels() {
      inputs.slice(0, fieldOrder.length).forEach((input) => {
        const field = input.dataset.field;
        const label = input.closest("label")?.querySelector("span");
        if (!label || !moneyFields.includes(field)) return;
        label.textContent = `${moneyLabelByField[field]} (${currencyData[currency].label})`;
      });
    }

    function updateResults() {
      const results = calculateResults(form, currency);
      const resultValues = [
        results.materialCost,
        results.electricityCost,
        results.machineWear,
        results.errorMarginCost,
        results.supplies,
        results.costLightAndMaterial,
        results.totalCost,
      ];

      document
        .querySelectorAll("#calculator-results .result-line strong")
        .forEach((node, index) => {
          node.textContent = formatMoney(resultValues[index], currency);
        });

      const total = document.querySelector("#calculator-results .total-card strong");
      if (total) total.textContent = formatMoney(results.totalToCharge, currency);
    }
  }

  function initContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    let status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      form.append(status);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);

      if (!WEB3FORMS_ACCESS_KEY) {
        status.textContent =
          "El formulario no esta configurado. Escribinos por WhatsApp y te respondemos ahi.";
        return;
      }

      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("subject", "Nueva consulta desde Eze en 3D");

      status.textContent = "Enviando consulta...";
      if (submitButton) submitButton.disabled = true;

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error("No se pudo enviar el formulario");
        }
        form.reset();
        status.textContent =
          "Consulta enviada. Te respondemos apenas podamos.";
        trackConversion("quote_form_submit", { location: "contact_form" });
      } catch (error) {
        status.textContent =
          "No pudimos enviar el formulario. Probá por WhatsApp o Instagram.";
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function calculateResults(form, currency) {
    const currencyConfig = currencyData[currency];
    const money = (field) => toNumber(form[field]) / currencyConfig.rate;
    const totalHours =
      toNumber(form.printHours) + Math.min(toNumber(form.printMinutes), 59) / 60;
    const materialCost = (money("filamentKg") / 1000) * toNumber(form.grams);
    const electricityCost =
      (toNumber(form.watts) / 1000) * totalHours * money("kwh");
    const machineWear =
      toNumber(form.machineHours) > 0
        ? (money("spareParts") / toNumber(form.machineHours)) * totalHours
        : 0;
    const errorMarginCost =
      (materialCost + electricityCost + machineWear) *
      (toNumber(form.errorMargin) / 100);
    const costLightAndMaterial = materialCost + electricityCost;
    const costBeforeSupplies =
      materialCost + electricityCost + machineWear + errorMarginCost;
    const totalCost = costBeforeSupplies + money("supplies");
    const totalToCharge =
      costBeforeSupplies * toNumber(form.profitMultiplier) + money("supplies");

    return {
      materialCost,
      electricityCost,
      machineWear,
      errorMarginCost,
      supplies: money("supplies"),
      costLightAndMaterial,
      totalCost,
      totalToCharge,
    };
  }

  function trackConversion(eventName, params = {}) {
    window.dataLayer?.push({ event: eventName, ...params });
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  }

  function normalizePath(pathname) {
    return pathname.replace(/\/+$/, "") || "/";
  }

  function getLinkLocation(link) {
    if (link.closest(".site-header")) return "header";
    if (link.closest(".whatsapp-float")) return "floating_button";
    if (link.closest(".hero-actions")) return "hero";
    if (link.closest(".cta-actions")) return "cta";
    if (link.closest(".contact-actions")) return "contact";
    if (link.closest(".site-footer")) return "footer";
    return "body";
  }

  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  function convertMoneyFromARS(value, targetCurrency) {
    if (value === "") return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "";
    const converted = parsed / currencyData[targetCurrency].rate;
    return targetCurrency === "ARS" ? parsed : Number(converted.toFixed(4));
  }

  function convertMoneyToARS(value, sourceCurrency) {
    if (value === "") return "";
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "";
    return parsed * currencyData[sourceCurrency].rate;
  }

  function formatMoney(value, currency) {
    const config = currencyData[currency];
    return `${config.label} ${new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  }
})();
