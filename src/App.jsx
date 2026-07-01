import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Calculator,
  Check,
  Home,
  Mail,
  Menu,
  Sparkles,
  Utensils,
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
      filamentKg: 24000,
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
      filamentKg: 20,
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
      filamentKg: 18.46,
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
    title: "Cocina y orden",
    text: "Separadores de cajones, porta esponjas, soportes para tapas, ganchos y piezas chicas pensadas para el espacio que tenés.",
    chip: "Medidas a pedido",
  },
  {
    icon: Home,
    title: "Repuestos simples",
    text: "Tapas, clips, topes, adaptadores y piezas que se rompen o ya no se consiguen. Si hay muestra o foto, mejor.",
    chip: "Se revisa antes de imprimir",
  },
  {
    icon: Sparkles,
    title: "Personalizados",
    text: "Nombres, carteles, bases, llaveros y detalles para regalos o eventos. Te paso opciones de tamaño y color antes de hacerlo.",
    chip: "Colores según stock",
  },
];

const useCases = [
  {
    title: "Algo no encaja en la cocina",
    text: "Un porta esponja para esa pileta, una traba para una tapa o un separador de cajón con una medida rara.",
  },
  {
    title: "Se rompió una pieza chica",
    text: "Clips de cortina, patitas, perillas, tapas, guías o adaptadores. La idea es evitar cambiar todo por una pieza mínima.",
  },
  {
    title: "Querés algo con nombre o logo",
    text: "Carteles, llaveros, bases, nombres en 3D o detalles para regalar. Se arma simple, sin vueltas raras.",
  },
];

const processSteps = [
  {
    title: "Me mandás la idea",
    text: "Una foto, medidas aproximadas o un audio contando qué pieza necesitás. No hace falta tener un plano.",
  },
  {
    title: "Reviso si conviene imprimirla",
    text: "Vemos tamaño, material, color y si la pieza va a aguantar el uso. Si no tiene sentido, te lo digo antes.",
  },
  {
    title: "Imprimo y coordinamos",
    text: "La pieza se imprime, se revisa y después arreglamos retiro o envío. Las piezas simples suelen salir en 48-72 hs.",
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
  const [contactResult, setContactResult] = useState("");
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [form, setForm] = useState({
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
  });

  const currencyConfig = currencyData[currency];
  const web3FormsAccessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
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
    const costBeforeSupplies =
      materialCost + electricityCost + machineWear + errorMarginCost;
    const totalCost =
      costBeforeSupplies + money("supplies");
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

  const handleContactSubmit = async (event) => {
    event.preventDefault();

    if (!web3FormsAccessKey) {
      setContactResult("Falta configurar la clave de envío del formulario.");
      return;
    }

    setIsContactSubmitting(true);
    setContactResult("Enviando consulta...");

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", web3FormsAccessKey);
    formData.append("subject", "Nueva consulta desde Eze en 3D");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setContactResult("Consulta enviada correctamente. Te respondemos pronto.");
        event.currentTarget.reset();
      } else {
        setContactResult("No se pudo enviar la consulta. Probá de nuevo.");
      }
    } catch {
      setContactResult("No se pudo enviar la consulta. Revisá tu conexión.");
    } finally {
      setIsContactSubmitting(false);
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#inicio" aria-label="Eze en 3D inicio">
            <span className="brand-mark" aria-hidden="true">
              <img src="/logo.png" alt="" />
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
              <p className="eyebrow">Eze en 3D</p>
              <h1>
                Piezas impresas en 3D para casa y repuestos chicos
              </h1>
              <p className="lead">
                Trabajo por pedido: soportes, adaptadores, organizadores y
                personalizados. Si tenés una pieza rota o una idea dando vueltas,
                mandame una foto con medidas y vemos si conviene imprimirla.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#contacto">
                  Mandar consulta
                  <ArrowRight size={17} />
                </a>
                <a className="button button-secondary" href="#calculadora">
                  Usar calculadora
                  <Calculator size={17} />
                </a>
              </div>
              <div className="hero-meta" aria-label="Datos del servicio">
                <span>
                  <strong>48-72 hs</strong> para piezas simples
                </span>
                <span>
                  <strong>PLA y PETG</strong> según uso y stock
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="section-block">
          <div className="container">
            <SectionHeading
              kicker="Qué suelo imprimir"
              title="Piezas útiles, no catálogo infinito"
              subtitle="Trabajo mejor cuando hay una necesidad concreta: una medida rara, un repuesto que falta o un accesorio que no encaja."
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
                <p className="eyebrow">Calculadora de costos</p>
                <h2>Sacá un precio base sin pelearte con una planilla</h2>
                <p>
                  Cargá material, horas, luz, desgaste e insumos. Sirve para
                  presupuestar una impresión antes de pasar precio.
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
              <p className="eyebrow">Pedidos típicos</p>
              <h2>Casos donde la impresión 3D viene bien</h2>
              <p className="section-copy">
                No necesitás saber de diseño 3D. Mandás el problema y vemos una
                forma simple de resolverlo.
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

          </div>
        </section>

        <section id="proceso" className="section-block process-section">
          <div className="container">
            <SectionHeading
              kicker="Cómo trabajamos"
              title="Proceso corto y claro"
              subtitle="La idea es no marearte: vemos si se puede hacer, acordamos precio y recién ahí se imprime."
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
                Mandame tu consulta. Puede ser una foto, una referencia o una
                explicación corta de la pieza que necesitás.
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

            <form className="contact-form" onSubmit={handleContactSubmit}>
              <label>
                Nombre
                <input type="text" name="name" placeholder="Ej: Ana" required />
              </label>
              <label>
                Email
                <input type="email" name="email" placeholder="tu@correo.com" required />
              </label>
              <label>
                Idea o problema a resolver
                <textarea
                  name="message"
                  placeholder="Contanos qué te gustaría imprimir o qué problema querés resolver."
                  required
                />
              </label>
              <button
                className="button button-primary full-width"
                type="submit"
                disabled={isContactSubmitting}
              >
                <Mail size={17} />
                {isContactSubmitting ? "Enviando..." : "Enviar consulta"}
              </button>
              {contactResult && (
                <span className="form-status" role="status" aria-live="polite">
                  {contactResult}
                </span>
              )}
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

createRoot(document.getElementById("root")).render(<App />);
