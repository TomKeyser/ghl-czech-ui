/* =============================================================================
   lang/es.js — SPANISH PACK

   THIS PACK IS A DIFFERENT SHAPE FROM cs-CZ.js, AND THE DIFFERENCE MATTERS.
   HighLevel does not ship Czech at all, so lang/cs-CZ.js supplies an entire
   language (5,029 entries). HighLevel DOES ship Spanish — 8,761 strings, ~94.6%
   of their key set — so this pack does NOT re-translate the product. It only:
       1. FILLS the gaps HighLevel left in English, and
       2. FIXES Spanish HighLevel got wrong.
   That is why it is small. A big Spanish pack would mean we were duplicating
   work HighLevel already did, and fighting their translations for control of
   the same nodes.

   PREREQUISITE, OPERATIONAL: the sub-account's HighLevel platform language must
   be set to Spanish. Then HighLevel renders ~95% Spanish and this pack finishes
   the job. On an English platform this pack does almost nothing — you would be
   asking it to translate 8,905 strings it does not contain.

   TWO KINDS OF ENTRY, BOTH KEYED ON WHAT IS RENDERED:
     English -> Spanish   for strings HighLevel leaves in English.
     Spanish -> Spanish   for strings HighLevel renders in WRONG Spanish.
   The engine matches rendered text, so a bad-Spanish key is as valid as an
   English one. The second kind is the differentiator: gap-filling is obvious
   and any competitor can do it, but nobody else is correcting their grammar.

   REGISTER — MEASURED FROM HIGHLEVEL'S OWN 8,761 STRINGS, NOT ASSUMED, so our
   additions blend in rather than clashing:
     · Peninsular vocabulary but safely neutral: móvil 18 / celular 0,
       ordenador 1 / computadora 0, and ZERO vosotros forms.
     · Buttons and actions use the INFINITIVE (Guardar, Cancelar, Eliminar,
       Seleccionar) — 538 instances, the dominant convention. Follow it.
     · Their prose mixes usted (149) and tú (78). We avoid second person where
       possible rather than pick a side and add to the inconsistency.
     · Glossary: contacto (223), correo electrónico (195, not "email"),
       flujo de trabajo (44), etiqueta (42), embudo (8).

   GLOSSARY DECISION WE MAKE AND THEY DID NOT: "Opportunity" is split almost
   evenly in their bundle between "oportunidad" (34) and "cliente potencial"
   (33). Those are DIFFERENT OBJECTS in a CRM — cliente potencial means lead.
   We use OPORTUNIDAD for Opportunity throughout and leave cliente potencial
   for actual leads. Do not "fix" this back toward their usage.
============================================================================= */

(function (root) {
  'use strict';

  var pack = {
    locale: 'es',
    name: 'Español',

    /* Sidebar labels drawn by CSS 'content' on a ::before, unreachable by a
       text-node translator. Per-pack since v30 -- this used to be a Czech
       literal in the engine. */
    pseudo: [
      { selector: 'html body a#sb_launchpad span.nav-title::before', text: 'Inicio rápido' }
    ],

    /* Spanish writes 31/8/2026. Unlike Czech there is no genitive month
       problem, so a single numeric frame covers it. */
    dateStyle: 'numeric',

    frames: {
      ago: 'hace {n} {unit}',
      lastPeriod: '(Últimos {n} {unit})',
      numericDate: '{d}/{m}/{y}'
    },

    /* Spanish has only one/other — no few, no many. Compare cs-CZ.js, which
       needs four categories. Intl.PluralRules picks the right one either way,
       which is the whole point of keeping grammar out of the engine. */
    plurals: {
      items:          { one: 'elemento',   other: 'elementos' },
      contacts:       { one: 'contacto',   other: 'contactos' },
      tasks:          { one: 'tarea',      other: 'tareas' },
      companies:      { one: 'empresa',    other: 'empresas' },
      products:       { one: 'producto',   other: 'productos' },
      invoices:       { one: 'factura',    other: 'facturas' },
      opportunities:  { one: 'oportunidad', other: 'oportunidades' },
      pipelines:      { one: 'embudo',     other: 'embudos' },
      unsavedChanges: { one: 'cambio sin guardar', other: 'cambios sin guardar' },
      new:            { one: 'nuevo',      other: 'nuevos' },
      characters:     { one: 'carácter',   other: 'caracteres' },
      words:          { one: 'palabra',    other: 'palabras' },
      segments:       { one: 'segmento',   other: 'segmentos' },
      members:        { one: 'miembro',    other: 'miembros' },
      accounts:       { one: 'cuenta',     other: 'cuentas' },
      periodMonths:   { one: 'mes',        other: 'meses' },
      periodDays:     { one: 'día',        other: 'días' },
      agoSeconds:     { one: 'segundo',    other: 'segundos' },
      agoMinutes:     { one: 'minuto',     other: 'minutos' },
      agoHours:       { one: 'hora',       other: 'horas' },
      agoDays:        { one: 'día',        other: 'días' },
      agoWeeks:       { one: 'semana',     other: 'semanas' },
      agoMonths:      { one: 'mes',        other: 'meses' }
    },

    /* Spanish does not decline month names, so one table serves every position
       — no genitive/nominative split as in Czech. Lowercase is correct: Spanish
       does not capitalise months. */
    months: {
      genitive: {
        January: 'enero', February: 'febrero', March: 'marzo', April: 'abril',
        May: 'mayo', June: 'junio', July: 'julio', August: 'agosto',
        September: 'septiembre', October: 'octubre', November: 'noviembre', December: 'diciembre'
      },
      genitiveAbbr: {
        jan: 'ene', feb: 'feb', mar: 'mar', apr: 'abr', may: 'may', jun: 'jun',
        jul: 'jul', aug: 'ago', sep: 'sep', oct: 'oct', nov: 'nov', dec: 'dic'
      },
      full: {
        jan: 'enero', feb: 'febrero', mar: 'marzo', apr: 'abril',
        may: 'mayo', jun: 'junio', jul: 'julio', aug: 'agosto',
        sep: 'septiembre', oct: 'octubre', nov: 'noviembre', dec: 'diciembre'
      },
      abbr: {
        jan: 'ene', feb: 'feb', mar: 'mar', apr: 'abr', may: 'may', jun: 'jun',
        jul: 'jul', aug: 'ago', sep: 'sep', oct: 'oct', nov: 'nov', dec: 'dic'
      }
    },

    maps: {
      invoiceState: {
        'in draft': 'en borrador', 'in due': 'por cobrar',
        'received': 'recibida', 'overdue': 'vencida'
      }
    },

    /* Pattern templates. Needed even though HighLevel renders most counts in
       Spanish already, because the source rules only fire on ENGLISH text —
       and pagination IS partly English here ("Page Size", "First Page",
       "Show Page 1" all render untranslated). */
    patterns: {
      COUNT_ITEMS:    '{1} {~items:1}',
      COUNT_COLON:    '{=1}: {2}',
      COUNT_PAREN:    '{=1} ({2})',
      COLS_RATIO:     '{1}/{2} columnas',
      PLUS_MORE:      '+{1} más',
      PAGE_OF:        'Página {1} de {2}',
      SHOW_PAGE:      'Mostrar página {1}',
      SELECT_ALL_N:   'Seleccionar todo {1}',
      N_CONTACTS_SEL: '{1} {~contacts:1} seleccionados',
      N_CONTACTS:     '{1} {~contacts:1}',
      N_TASKS_SEL:    '{1} {~tasks:1} seleccionadas',
      N_TASKS:        '{1} {~tasks:1}',
      N_COMP_SEL:     '{1} {~companies:1} seleccionadas',
      N_COMP:         '{1} {~companies:1}',
      PAGE_N:         'Página {1}',
      N_SELECTED:     '{1} seleccionados',
      CAL_GREETING:   '¡Hola {1}! Soy tu asistente de configuración de calendarios. ¿Qué te gustaría hacer?',
      N_PRODUCTS:     '{1} {~products:1}',
      REMOVE_FILT:    'Quitar filtro: {?1}',
      RANGE_OF:       '{1} – {2} de {3}',
      N_OPPS:         '{1} {~opportunities:1}',
      N_PIPES:        '{1} {~pipelines:1}',
      N_APPLIED:      '{1} aplicados',
      OUT_OF:         '{=1} ({2} de {3})',
      POS_OF:         'Actualmente en la posición {1} de {2}',
      DEL_PIPE:       '¿Eliminar el embudo «{1}»?',
      UNSAVED_N:      'Tienes {1} {~unsavedChanges:1}',
      PIPE_DASH:      'Embudo – {1}',
      N_NEW:          '{1} {~new:1}',
      APPROX_COST:    'Coste aproximado: {1}',
      CHARS_WORDS:    '{1} {~characters:1} | {2} {~words:2}',
      SEGS:           '| {1} {~segments:1}',
      PER_PAGE:       '{1} / página',
      SHOWING_OF:     'Mostrando {1}–{2} de {3}',
      N_HRS:          '{1} h',
      TOTAL_MEM:      '{1} {~members:1} en total',
      LAST_UPD:       'Última actualización: {*1}',
      BYTES_USED:     '{1} {2} usados',
      N_ACCOUNTS:     '{1} {~accounts:1}',
      ABBR_PAREN:     '{=1} ({2})'
    }
  };

  /* ---------------------------------------------------------------------
     FIXES — Spanish HighLevel got WRONG. Keyed on the bad Spanish they
     render, replaced with correct Spanish. This is the half a competitor
     doing naive gap-filling will never produce, and the half a native
     speaker notices within seconds of opening the product.
     --------------------------------------------------------------------- */
  pack.dict = {
    /* number and gender agreement */
    '0 Contactos Seleccionado': '0 contactos seleccionados',
    'Contactos Seleccionado': 'contactos seleccionados',
    '0 clientes potenciales seleccionado': '0 clientes potenciales seleccionados',
    'Integraciones Privado': 'Integraciones privadas',
    'No hay ningún Contactos a la vista.': 'No hay ningún contacto a la vista.',
    'No hay ningún Contactos a la vista': 'No hay ningún contacto a la vista',

    /* English title-casing carried into Spanish. Spanish sentence-cases
       common nouns; these render capitalised mid-string. */
    'Añadir Contacto': 'Añadir contacto',
    'Buscar Contactos': 'Buscar contactos',
    'Nombre de Contacto': 'Nombre de contacto',
    'Estado de Oportunidad': 'Estado de la oportunidad',
    'Valor de Oportunidad': 'Valor de la oportunidad',

    /* glossary: Opportunity is an oportunidad, not a cliente potencial
       (which means LEAD — a different CRM object). See the header. */
    'Clientes Potenciales & Pipelines': 'Oportunidades y embudos',
    'Clientes Potenciales y Pipelines': 'Oportunidades y embudos',
    'Clientes Potenciales': 'Oportunidades',
    'Cliente potencial': 'Oportunidad',

    /* outright mistranslation: "Import Data" became "import statistics" */
    'Importar estadísticas': 'Importar datos',

    /* ------------------------------------------------------------------
       GAPS — strings HighLevel leaves in English on a Spanish UI.
       Observed on 17 screens of a live Spanish instance.
       ------------------------------------------------------------------ */

    /* navigation and global chrome */
    'Dashboard': 'Panel',
    'Launchpad': 'Inicio rápido',
    'Contacts': 'Contactos',
    'Opportunities': 'Oportunidades',
    'Companies': 'Empresas',
    'Products': 'Productos',
    'Reviews': 'Reseñas',
    'Messages': 'Mensajes',
    'Media': 'Medios',
    'Analytics': 'Analíticas',
    'Community': 'Comunidad',
    'Collections': 'Colecciones',
    'Coupons': 'Cupones',
    'Gift Cards': 'Tarjetas regalo',
    'Inventory': 'Inventario',
    'Estimate': 'Presupuesto',
    'Payout': 'Pago',
    'Campaign': 'Campaña',
    'Collapse sidebar': 'Contraer barra lateral',

    /* table, list and pagination controls — the cluster your client will
       hit on literally every list view */
    'Filters': 'Filtros',
    'Page Size': 'Tamaño de página',
    'Select Row': 'Seleccionar fila',
    'First': 'Primera',
    'Last': 'Última',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'First Page': 'Primera página',
    'Last Page': 'Última página',
    'Next Page': 'Página siguiente',
    'Prev Page': 'Página anterior',
    'Edit': 'Editar',
    'Delete': 'Eliminar',
    'Close': 'Cerrar',
    'New': 'Nuevo',
    'SELECTED': 'SELECCIONADO',

    /* voice / calling */
    'Voice Calling': 'Llamadas de voz',
    'Voicemail': 'Buzón de voz',
    'Keypad': 'Teclado',
    'Queue': 'Cola',
    'Recents': 'Recientes',
    'Buy phone number': 'Comprar número de teléfono',
    'Connect a phone number': 'Conectar un número de teléfono',
    'Search Numbers': 'Buscar números',
    'No numbers found': 'No se han encontrado números',
    'Calls handled': 'Llamadas atendidas',
    'Outbound and inbound calls': 'Llamadas salientes y entrantes',
    'Audio Settings': 'Ajustes de audio',
    'Help me decide': 'Ayúdame a decidir',

    /* calendars and booking */
    'Availability': 'Disponibilidad',
    'Booked': 'Reservado',
    'Booking confirmed': 'Reserva confirmada',
    'Create a new calendar': 'Crear un calendario nuevo',
    'Calendar setup assistant': 'Asistente de configuración de calendarios',

    /* AI agents area — the least-translated surface in the product */
    'Agent Logs': 'Registros del agente',
    'Sales Agent': 'Agente de ventas',
    'Voice Agent': 'Agente de voz',
    'Review Response Agent': 'Agente de respuesta a reseñas',
    'Review replied': 'Reseña respondida',
    'Workflow Builder': 'Editor de flujos de trabajo',
    'Email Services': 'Servicios de correo electrónico',

    /* misc states */
    'Initializing...': 'Inicializando…',
    'User not assigned': 'Usuario sin asignar',
    'Relocated Item': 'Elemento reubicado',
    'Very High': 'Muy alta',
    'Losing': 'En riesgo',
    'Widgets': 'Widgets',
    'Blogs': 'Blogs'
  };

  /* ---------------------------------------------------------------------
     DELIBERATELY NOT TRANSLATED — recorded so nobody "completes" the list.
     Every one of these appeared in the untranslated harvest and every one
     should stay as it is:

     LEAKED TECHNICAL KEYS, not UI copy. These are HighLevel bugs (a raw key
       reaching the DOM) and translating them would disguise the bug:
         _id  dateUpdated  name  header  footer  loading  all  false  ctrlK

     THIRD-PARTY MARKETPLACE APP NAMES. Someone else's product name, and the
       marketplace listing is not ours to rewrite:
         Appointwise  CloseBot  Kixie PowerCall & SMS  Lumen Studio  Typeform
         Gokollab Marketplace  Slack For LeadConnector  Spintax For Workflow
         WooCommerce For Workflows  Zoom For Workflows  Chat GPT For Workflows
         TikTok Auth Connector  Pinterest Authentication Application
         Leadconnector App for Typeform  Appointment Actions For CRM
         Contact Tags For CRM  WhatsApp ChatBot  Better Sales Made SImple

     BRANDS AND HIGHLEVEL PRODUCT NAMES:
         Bluesky  Pinterest  Threads  Google Ads  Google Contact  GBP  Beta
         Content AI  Conversation AI  Agent Studio  AI Agent  Branded Mobile App
         AI Reputation Manager  Affiliate Manager  Animated Button

     SAMPLE AND LIVE DATA:
         John Doe  Sara Smith  Gym Offer  "👤 170"  "💬 586"  "~34 min"
         "GMT -07:00"  "+$12k–$28k/mo" and the other price ranges

     COMPOSED SENTENCE FRAGMENTS — halves of one sentence split across DOM
       nodes. Spanish word order does not break at the same point, so
       translating each fragment separately produces gibberish. This is
       defect class 4 in the localization audit and needs HighLevel to fix
       the markup, not us:
         "Turn leads into" / "revenue, on autopilot"
         "Never miss a call," / "ever again"
         "Book more appointments," / "on autopilot"

     MIXED-LANGUAGE ARTEFACTS — both languages inside one text node, e.g.
       "Contacts | Contactos", "Keypad | Teclado", "Queue | Cola",
       "Recents | Recientes", "SELECTED | SELECCIONADO". These are the
       vue-i18n staleness bug (see "LOCALE RESOLUTION IS PER-MICRO-FRONTEND"),
       not strings. They disappear on a hard reload. Do not add entries for
       them — you would be encoding a race condition.
     --------------------------------------------------------------------- */

  pack.dictApi = {};   /* nothing derived from HighLevel's API: they ship es */

  /* Highest-risk entries for a native reviewer, in order: the glossary
     decision, then anything where we chose a register. */
  pack.reviewFirst = [
    'Clientes Potenciales', 'Cliente potencial', 'Clientes Potenciales & Pipelines',
    'Estado de Oportunidad', 'Valor de Oportunidad', 'Importar estadísticas',
    'Losing', 'Very High', 'Estimate', 'Payout', 'Media', 'Relocated Item'
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = pack;
  else { root.GhlLangPacks = root.GhlLangPacks || {}; root.GhlLangPacks['es'] = pack; }
})(typeof window !== 'undefined' ? window : globalThis);
