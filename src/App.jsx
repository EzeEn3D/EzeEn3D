import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Box,
  Calculator,
  Check,
  Clock,
  Home,
  Mail,
  Menu,
  PackageCheck,
  Sparkles,
  Utensils,
  Wrench,
  X,
} from "lucide-react";
import "./styles.css";

const currencyData = {
  ARS: {
    label: "ARS $",
    symbol: "$",
    locale: "es-AR",
    rate: 1,
    defaults: {
      filamentKg: 20000,
      kwh: 140,
      spareParts: 15000,
      supplies: 0,
    },
  },
  USD: {
    label: "USD US$",
    symbol: "US$",
    locale: "en-US",
    rate: 1200,
    defaults: {
      filamentKg: 16.67,
      kwh: 0.12,
      spareParts: 12.5,
      supplies: 0,
    },
  },
  EUR: {
    label: "EUR €",
    symbol: "€",
    locale: "de-DE",
    rate: 1300,
    defaults: {
      filamentKg: 15.38,
      kwh: 0.11,
      spareParts: 11.54,
      supplies: 0,
    },
  },
};

const moneyFields = ["filamentKg", "kwh", "spareParts", "supplies"];

const navItems = [
  ["Servicios", "#servicios"],
  ["Calculadora", "#calculadora"],
  ["Aplicaciones", "#proyectos"],
  ["Proceso", "#proceso"],
  ["Contacto", "#contacto"],
];

const services = [
  {
    icon: Utensils,
    title: "Accesorios de cocina",
    text: "Organizadores de especias, separadores de cajones, soportes para tapas, ganchos para heladera y adaptadores para electrodomésticos.",
    chip: "Materiales aptos para uso en cocina*",
  },
  {
    icon: Home,
    title: "Orden y mantenimiento del hogar",
    text: "Soportes para cables, colgadores, topes de puertas, adaptadores para mangueras, tapas y piezas que ya no se consiguen.",
    chip: "Repuestos a medida",
  },
  {
    icon: Sparkles,
    title: "Regalos y piezas personalizadas",
    text: "Nombres, logos, bases para trofeos, miniaturas y detalles únicos para sorprender en cumpleaños, casamientos y eventos.",
    chip: "Diseño a partir de tu idea",
  },
];

const useCases = [
  {
    title: "Soportes de cocina que se adaptan a tu espacio",
    text: "Desde porta-esponjas que encajan perfecto en tu pileta hasta soportes para utensilios pensados para tu mesada.",
  },
  {
    title: "Repuestos que dejaron de fabricarse",
    text: "Piezas de heladeras, lavarropas, cortinas o muebles que ya no se consiguen. Las medimos, las modelamos y las volvés a usar.",
  },
  {
    title: "Detalles personalizados para tu casa",
    text: "Nombres en 3D, carteles, soportes para auriculares, docks de carga y pequeños detalles que suman mucho al día a día.",
  },
];

const processSteps = [
  {
    title: "Nos contás tu idea",
    text: "Puede ser una foto, un dibujo rápido o un mensaje describiendo el problema: necesito un soporte para...",
  },
  {
    title: "Te proponemos una solución",
    text: "Definimos diseño, tamaño, material y color. Te pasamos precio estimado y tiempo de entrega antes de imprimir.",
  },
  {
    title: "Imprimimos y entregamos",
    text: "Producimos la pieza en 3D, la revisamos y coordinamos envío o retiro. Para piezas simples, solemos estar listos en 48-72 hs.",
  },
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const isMoneyField = (field) => moneyFields.includes(field);

const convertMoneyFromARS = (value, targetCurrency) => {
  if (value === "") return "";

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";

  const converted = parsed / currencyData[targetCurrency].rate;
  return targetCurrency === "ARS" ? parsed : Number(converted.toFixed(4));
};

const convertMoneyToARS = (value, sourceCurrency) => {
  if (value === "") return "";

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";

  return parsed * currencyData[sourceCurrency].rate;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currency, setCurrency] = useState("ARS");
  const [calculationCount, setCalculationCount] = useState(0);
  const [form, setForm] = useState({
    filamentKg: 20000,
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
  });

  const currencyConfig = currencyData[currency];
  const visibleForm = useMemo(
    () =>
      moneyFields.reduce(
        (current, field) => ({
          ...current,
          [field]: convertMoneyFromARS(form[field], currency),
        }),
        form
      ),
    [currency, form]
  );

  useEffect(() => {
    if (!window.location.hash) return;
    window.requestAnimationFrame(() => {
      document
        .querySelector(window.location.hash)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, []);

  const results = useMemo(() => {
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
    const totalCost =
      materialCost +
      electricityCost +
      machineWear +
      errorMarginCost +
      money("supplies");
    const totalToCharge = totalCost * toNumber(form.profitMultiplier);

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
  }, [currencyConfig.rate, form]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: isMoneyField(field) ? convertMoneyToARS(value, currency) : value,
    }));
  };

  const switchCurrency = (nextCurrency) => {
    if (nextCurrency === currency) return;
    setCurrency(nextCurrency);
  };

  const resetDefaults = () => {
    const defaults = currencyData.ARS.defaults;
    setForm((current) => ({
      ...current,
      filamentKg: defaults.filamentKg,
      kwh: defaults.kwh,
      spareParts: defaults.spareParts,
      supplies: defaults.supplies,
      watts: 120,
      machineHours: 4300,
      errorMargin: 30,
      printHours: 1,
      printMinutes: 0,
      grams: 100,
      profitMultiplier: 4,
    }));
  };

  const runCalculation = () => {
    setCalculationCount((count) => count + 1);
    document
      .querySelector("#calculator-results")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const formatMoney = (value) =>
    `${currencyConfig.label} ${new Intl.NumberFormat(currencyConfig.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#inicio" aria-label="Eze en 3D inicio">
            <span className="brand-mark" aria-hidden="true">
              <Box size={19} strokeWidth={2.4} />
            </span>
            <span>Eze en 3D</span>
          </a>

          <nav className="nav-links" aria-label="Navegación principal">
            {navItems.map(([label, href]) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
            <a className="button button-ghost" href="#contacto">
              Pedir presupuesto
            </a>
          </nav>

          <button
            className="icon-button menu-button"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-menu" aria-label="Menú móvil">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="inicio">
        <section className="hero section-band">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="badge">
                <span className="badge-dot" />
                Impresión 3D bajo demanda para tu día a día
              </div>
              <p className="eyebrow">Imprimí ideas, no solo objetos</p>
              <h1>
                Soluciones 3D para <span>casa, cocina y organización</span>
              </h1>
              <p className="lead">
                Diseñamos y fabricamos piezas en 3D para que tu hogar sea más
                práctico, ordenado y único: desde accesorios de cocina hasta
                soportes, organizadores y piezas personalizadas.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#contacto">
                  Enviar mi idea
                  <ArrowRight size={17} />
                </a>
                <a className="button button-secondary" href="#calculadora">
                  Calcular impresión
                  <Calculator size={17} />
                </a>
              </div>
              <div className="hero-meta" aria-label="Datos del servicio">
                <span>
                  <strong>48 hs</strong> aprox. para prototipos simples
                </span>
                <span>
                  <strong>Pedidos pequeños y grandes</strong> sin mínimo
                </span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Muestra de piezas 3D">
              <div className="visual-toolbar">
                <span>Plano de pieza</span>
                <span>PLA+ / PETG</span>
              </div>
              <div className="object-board">
                <div className="object-card object-card-large">
                  <div className="printed-object organizer" />
                  <span>Organizador</span>
                </div>
                <div className="object-card">
                  <div className="printed-object hook" />
                  <span>Soporte</span>
                </div>
                <div className="object-card">
                  <div className="printed-object cap" />
                  <span>Repuesto</span>
                </div>
              </div>
              <div className="hero-tags">
                <span>Cocina y hogar</span>
                <span>Repuestos difíciles</span>
                <span>Regalos personalizados</span>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="section-block">
          <div className="container">
            <SectionHeading
              kicker="Qué podemos imprimir para vos"
              title="Servicios pensados para la vida cotidiana"
              subtitle="Si lo podés imaginar, podemos diseñarlo y llevarlo a tu mesa, tu cocina o tu escritorio."
            />

            <div className="features-grid">
              {services.map(({ icon: Icon, title, text, chip }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-icon" aria-hidden="true">
                    <Icon size={21} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="feature-chip">{chip}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="calculadora" className="calculator-section section-band">
          <div className="container">
            <div className="calculator-intro">
              <div>
                <p className="eyebrow">Calculadora de costos de impresión 3D</p>
                <h2>Calculá material, luz, desgaste y ganancia en segundos</h2>
                <p>
                  Cargá los datos de la pieza y ajustá los gastos fijos. Los
                  resultados se actualizan automáticamente para ayudarte a
                  presupuestar con más criterio.
                </p>
              </div>
              <div className="currency-switch" aria-label="Cambiar moneda">
                {Object.entries(currencyData).map(([code, item]) => (
                  <button
                    key={code}
                    className={currency === code ? "active" : ""}
                    type="button"
                    onClick={() => switchCurrency(code)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="calculator-shell">
              <div className="calculator-forms">
                <FormPanel title="Gastos fijos">
                  <NumberField
                    label={`Precio KG (${currencyConfig.label})`}
                    value={visibleForm.filamentKg}
                    onChange={(value) => updateField("filamentKg", value)}
                    step={currency === "ARS" ? "1" : "0.01"}
                  />
                  <NumberField
                    label={`Precio kWh (${currencyConfig.label})`}
                    value={visibleForm.kwh}
                    onChange={(value) => updateField("kwh", value)}
                    step={currency === "ARS" ? "1" : "0.01"}
                  />
                  <NumberField
                    label="Consumo real por hora (W)"
                    value={form.watts}
                    onChange={(value) => updateField("watts", value)}
                  />
                  <NumberField
                    label="Desgaste máquina (horas)"
                    value={form.machineHours}
                    onChange={(value) => updateField("machineHours", value)}
                  />
                  <NumberField
                    label={`Precio repuestos (${currencyConfig.label})`}
                    value={visibleForm.spareParts}
                    onChange={(value) => updateField("spareParts", value)}
                    step={currency === "ARS" ? "1" : "0.01"}
                  />
                  <NumberField
                    label="Margen de error (%)"
                    value={form.errorMargin}
                    onChange={(value) => updateField("errorMargin", value)}
                  />
                </FormPanel>

                <FormPanel title="Pieza">
                  <div className="field-row">
                    <NumberField
                      label="Horas"
                      value={form.printHours}
                      onChange={(value) => updateField("printHours", value)}
                    />
                    <NumberField
                      label="Minutos"
                      value={form.printMinutes}
                      onChange={(value) => updateField("printMinutes", value)}
                      max={59}
                    />
                  </div>
                  <NumberField
                    label="Gramos de filamento"
                    value={form.grams}
                    onChange={(value) => updateField("grams", value)}
                  />
                  <NumberField
                    label={`Insumos (${currencyConfig.label})`}
                    value={visibleForm.supplies}
                    onChange={(value) => updateField("supplies", value)}
                    step={currency === "ARS" ? "1" : "0.01"}
                  />
                </FormPanel>

                <FormPanel title="Ganancia">
                  <NumberField
                    label="Margen de ganancia (multiplicador)"
                    value={form.profitMultiplier}
                    onChange={(value) => updateField("profitMultiplier", value)}
                    step="0.1"
                  />
                  <p className="panel-note">
                    Referencia: minorista x4, mayorista x3 y llaveros x5.
                  </p>
                  <button
                    className="button button-primary full-width calculate-button"
                    type="button"
                    onClick={runCalculation}
                  >
                    <Calculator size={17} />
                    Calcular
                  </button>
                  <button
                    className="button button-secondary full-width"
                    type="button"
                    onClick={resetDefaults}
                  >
                    Restaurar valores base
                  </button>
                </FormPanel>
              </div>

              <aside
                id="calculator-results"
                className="result-panel"
                aria-live="polite"
                data-calculations={calculationCount}
              >
                <div className="result-heading">
                  <span>Resultados</span>
                  <Calculator size={20} />
                </div>
                <ResultLine label="Precio material" value={formatMoney(results.materialCost)} />
                <ResultLine label="Precio luz" value={formatMoney(results.electricityCost)} />
                <ResultLine
                  label="Desgaste máquina"
                  value={formatMoney(results.machineWear)}
                />
                <ResultLine
                  label="Margen de error"
                  value={formatMoney(results.errorMarginCost)}
                />
                <ResultLine label="Insumos" value={formatMoney(results.supplies)} />
                <ResultLine
                  label="Costo luz y material"
                  value={formatMoney(results.costLightAndMaterial)}
                />
                <ResultLine
                  label="Costo total (con insumos)"
                  value={formatMoney(results.totalCost)}
                  highlight
                />
                <div className="total-card">
                  <span>Total a cobrar</span>
                  <strong>{formatMoney(results.totalToCharge)}</strong>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="proyectos" className="section-block">
          <div className="container usecases-grid">
            <div>
              <p className="eyebrow">Ideas para inspirarte</p>
              <h2>Aplicaciones reales en tu casa</h2>
              <p className="section-copy">
                No necesitás saber de diseño 3D. Nos contás el problema,
                buscamos una solución simple y te la entregamos lista para usar.
              </p>

              <div className="usecases-list">
                {useCases.map((item) => (
                  <article className="usecase-item" key={item.title}>
                    <span className="check-icon" aria-hidden="true">
                      <Check size={15} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="project-board" aria-label="Muestra de proyectos">
              <div className="project-tabs">
                <span>Impresiones reales</span>
                <span>Varios colores</span>
                <span>Texturas matte</span>
              </div>
              <div className="mini-gallery">
                <ProjectTile title="Organizador de cajón" meta="Cocina / 2 días" />
                <ProjectTile title="Soporte para especias" meta="Módulo apilable" />
                <ProjectTile title="Clip para cortina" meta="Repuesto personalizado" />
              </div>
              <p>
                Las muestras son representaciones de tipos de piezas. Podés
                enviarnos fotos o medidas y trabajamos sobre eso.
              </p>
            </aside>
          </div>
        </section>

        <section id="proceso" className="section-block process-section">
          <div className="container">
            <SectionHeading
              kicker="Cómo trabajamos"
              title="De tu idea al objeto en pocos pasos"
              subtitle="Buscamos hacer el proceso simple y transparente, para que sepas siempre qué esperar."
            />
            <div className="process-grid">
              {processSteps.map((step, index) => (
                <article className="process-step" key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="contact-section">
          <div className="container contact-grid">
            <div>
              <p className="eyebrow">Presupuesto sin compromiso</p>
              <h2>¿Tenés una idea o un problema para resolver?</h2>
              <p>
                Mandanos tu consulta. Podemos partir de una foto, una referencia
                de internet o simplemente de lo que te gustaría mejorar en tu casa.
              </p>
              <div className="contact-list">
                <span>
                  <Check size={16} /> Presupuestos claros antes de imprimir
                </span>
                <span>
                  <Check size={16} /> Descuentos por pedidos múltiples
                </span>
                <span>
                  <Check size={16} /> Atención personalizada por chat o mail
                </span>
              </div>
            </div>

            <form className="contact-form">
              <label>
                Nombre
                <input type="text" name="nombre" placeholder="Ej: Ana" />
              </label>
              <label>
                Email
                <input type="email" name="email" placeholder="tu@correo.com" />
              </label>
              <label>
                Idea o problema a resolver
                <textarea
                  name="mensaje"
                  placeholder="Contanos qué te gustaría imprimir o qué problema querés resolver."
                />
              </label>
              <button className="button button-primary full-width" type="submit">
                <Mail size={17} />
                Enviar consulta
              </button>
              <p>
                También podés escribirnos por WhatsApp o Instagram si preferís
                mandar fotos directamente.
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <span>© {new Date().getFullYear()} Eze en 3D. Impresiones 3D para tu hogar.</span>
          <nav aria-label="Navegación de pie">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#calculadora">Calculadora</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function FormPanel({ title, children }) {
  return (
    <section className="form-panel" aria-label={title}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function NumberField({ label, value, onChange, max, step = "1" }) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ResultLine({ label, value, highlight = false }) {
  return (
    <div className={highlight ? "result-line highlight" : "result-line"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProjectTile({ title, meta }) {
  return (
    <article className="project-tile">
      <div className="tile-visual" />
      <h3>{title}</h3>
      <span>{meta}</span>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
