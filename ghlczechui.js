/* =============================================================================
   HighLevel UI -> Czech (cs-CZ) translation layer
   Built for: Keytone Services (app.keytoneservices.com)

   WHY THIS EXISTS: HighLevel's platform language list does not include Czech.
   This script translates the application chrome (navigation, buttons, tabs,
   column headers, common modals) client-side using a curated glossary.

   SAFETY MODEL
   - Whole-string exact matches only. Never substring replacement, so a contact
     named "New" or a company called "Centene" is never altered.
   - Hard skip list for anything that holds customer data: inputs, textareas,
     rich-text editors, message bodies, contenteditable regions.
   - No network calls. No CRM data leaves the browser. No API key, no cost.

   v16 - based on Tom Keyser's edited file. His DICT additions are preserved
   verbatim except for two corrections noted in CHANGES-v8.md.
   Gated to the clean sub-account SbA5m1DElMNEKBVnixsX only.

   KNOWN LIMITATION - IFRAMED SCREENS  (investigated, closed, do not re-dig)
   Some Settings screens - Settings > Business Profile (/settings/company) is
   the confirmed example - render inside a CROSS-ORIGIN iframe (id
   "settings-app"). This script runs in the parent page, and the browser
   forbids a page from reading or modifying a cross-origin frame's DOM. Those
   screens therefore CANNOT be translated by this script. Adding terms for
   them produces a bigger file and zero visible change. This is a browser
   security boundary, not a bug and not a missing feature.

   Being a Settings page does NOT predict this either way: Settings > Custom
   fields (/settings/fields) renders in the main document and translates
   fully. Before investigating any "missing translation", check first:

       document.querySelectorAll('iframe')

   If the content sits in a cross-origin iframe, stop - nothing here can fix
   it. The only workaround is a userscript manager (e.g. Tampermonkey) with
   @match on the iframe's own origin and all-frames enabled, which trades
   account-wide coverage for a per-browser install. Deliberately not done.

   If that route is ever taken: allowedHere() below gates on
   location.pathname containing /location/<id>. Inside the iframe the path
   differs, so the gate would silently disable the script there - relax it
   first, or you will debug a script that is working exactly as written.

   KILL SWITCH  (use this first if anything looks wrong)
     Add  ?nocs=1  to the URL  -> disables the layer permanently for that browser
     Add  ?nocs=0  to the URL  -> re-enables it
   Example: https://app.keytoneservices.com/v2/location/XXXX/launchpad?nocs=1
============================================================================= */

(function () {
  'use strict';

  /* ===== BUMP THIS WHENEVER YOU CHANGE THE FILE =====================
     It is the fastest way to tell whether GitHub Pages has finished
     deploying your edit. After committing, refresh HighLevel and check
     the browser console, or just type   __ghlCzechVersion   there.
     If it still shows the old value, the Pages build has not landed yet. */
  var VERSION = 'v16';

  if (window.__ghlCzechActive) return;
  window.__ghlCzechActive = true;
  window.__ghlCzechVersion = VERSION;

  /* ---------- which sub-accounts get Czech --------------------------------
     HighLevel's Custom JS box lives at the AGENCY level, so without this gate
     the layer would switch on for every sub-account under the agency.
     Listed here = Keytone Services only.
     To roll it out agency-wide later, set this to an empty array: []          */
  var ONLY_LOCATIONS = ['SbA5m1DElMNEKBVnixsX'];

  function allowedHere() {
    if (!ONLY_LOCATIONS.length) return true;
    var path = window.location.pathname;
    for (var i = 0; i < ONLY_LOCATIONS.length; i++) {
      if (path.indexOf('/location/' + ONLY_LOCATIONS[i]) !== -1) return true;
    }
    return false;
  }

  /* ---------- kill switch ---------------------------------------------- */
  try {
    var qs = window.location.search;
    if (qs.indexOf('nocs=1') !== -1) localStorage.setItem('ghl_cs_off', '1');
    if (qs.indexOf('nocs=0') !== -1) localStorage.removeItem('ghl_cs_off');
    if (localStorage.getItem('ghl_cs_off') === '1') {
      console.info('[cs-CZ] translation layer disabled via kill switch');
      return;
    }
  } catch (e) { /* private mode: carry on */ }

  /* ---------- glossary -------------------------------------------------- */
  var DICT = {
    /* --- primary navigation --- */
    'Launchpad': 'Rychlý start',
    'Dashboard': 'Nástěnka',
    'Conversations': 'Konverzace',
    'Calendars': 'Kalendáře',
    'Contacts': 'Kontakty',
    'Opportunities': 'Příležitosti',
    'Payments': 'Platby',
    'AI Studio': 'AI Studio',
    'AI Agents': 'AI agenti',
    'Marketing': 'Marketing',
    'Automation': 'Automatizace',
    'Sites': 'Weby',
    'Memberships': 'Členství',
    'Media Storage': 'Úložiště médií',
    'Reputation': 'Reputace',
    'Reporting': 'Reporty',
    'App Marketplace': 'Katalog aplikací',
    'Settings': 'Nastavení',
    'Ask AI': 'Zeptat se AI',
    'Ask AI Assistant': 'Zeptat se AI asistenta',
    'Language Detector': 'Detektor jazyka',

    /* --- top bar / account --- */
    'Search': 'Hledat',
    'Support': 'Podpora',
    'Notifications': 'Oznámení',
    'View Notifications': 'Zobrazit oznámení',
    'View Changelog': 'Zobrazit novinky',
    'Signout': 'Odhlásit se',
    'Sign out': 'Odhlásit se',
    'Login As': 'Přihlásit se jako',
    'Login as another user': 'Přihlásit se jako jiný uživatel',
    'Open Profile Menu': 'Otevřít nabídku profilu',
    'Need Help?': 'Potřebujete pomoc?',
    'Access Help & Support': 'Nápověda a podpora',
    'Collapse sidebar': 'Sbalit postranní panel',
    'Skip to main content': 'Přejít na hlavní obsah',
    'Quick Actions': 'Rychlé akce',
    'Press Ctrl + K to open': 'Otevřete stisknutím Ctrl + K',
    'Report Translation Issue': 'Nahlásit chybu překladu',

    /* --- launchpad / setup guide --- */
    'Setup Guide': 'Průvodce nastavením',
    'Foundational setup': 'Základní nastavení',
    'Marketing & lead generation': 'Marketing a získávání kontaktů',
    'Sales & conversations': 'Prodej a konverzace',
    'Website & monetization': 'Web a monetizace',
    'Ecommerce': 'E-commerce',
    'Watch the Tutorial': 'Zhlédnout návod',
    'Skip for Now': 'Zatím přeskočit',
    'Create a new contact': 'Vytvořit nový kontakt',
    'Launch an Email Campaign': 'Spustit e-mailovou kampaň',

    /* --- universal buttons & controls --- */
    'Cancel': 'Zrušit',
    'Close': 'Zavřít',
    'Close modal': 'Zavřít okno',
    'Save': 'Uložit',
    'Save changes': 'Uložit změny',
    'Submit': 'Odeslat',
    'Delete': 'Smazat',
    'Edit': 'Upravit',
    'Add': 'Přidat',
    'New': 'Nový',
    'Next': 'Další',
    'Previous': 'Předchozí',
    'Back': 'Zpět',
    'Continue': 'Pokračovat',
    'Confirm': 'Potvrdit',
    'Okay': 'OK',
    'Import': 'Importovat',
    'Export': 'Exportovat',
    'Filters': 'Filtry',
    'Clear all': 'Vymazat vše',
    'Select all': 'Vybrat vše',
    'Load More': 'Načíst další',
    'Manage view': 'Spravovat zobrazení',
    'All': 'Vše',
    'Actions': 'Akce',
    'Duplicate': 'Duplikovat',
    'Refresh': 'Obnovit',
    'Apply': 'Použít',
    'Reset': 'Obnovit výchozí',
    'Search...': 'Hledat...',
    'Loading fresh data...': 'Načítání aktuálních dat...',
    'Initializing...': 'Inicializace...',

    /* --- contacts --- */
    'Smart Lists': 'Chytré seznamy',
    'Custom Fields': 'Vlastní pole',
    'Companies': 'Společnosti',
    'Groups': 'Skupiny',
    'Tasks': 'Úkoly',
    'Users': 'Uživatelé',
    'Contact details': 'Detaily kontaktu',
    'Manual Actions': 'Ruční akce',
    'Trigger Links': 'Spouštěcí odkazy',
    'Snippets': 'Textové šablony',
    'Tags': 'Štítky',
    'Notes': 'Poznámky',
    'Activity': 'Aktivita',
    'First Name': 'Jméno',
    'Last Name': 'Příjmení',
    'Email': 'E-mail',
    'Phone': 'Telefon',
    'Address': 'Adresa',
    'City': 'Město',
    'State': 'Kraj',
    'Country': 'Země',
    'Postal Code': 'PSČ',
    'Owner': 'Vlastník',
    'Status': 'Stav',
    'Source': 'Zdroj',
    'Created': 'Vytvořeno',
    'Updated': 'Aktualizováno',
    'User not assigned': 'Uživatel nepřiřazen',

    /* --- conversations --- */
    'Add conversation': 'Přidat konverzaci',
    'Filter conversations': 'Filtrovat konverzace',
    'Sort conversations': 'Řadit konverzace',
    'Filter messages': 'Filtrovat zprávy',
    'Delete Conversation': 'Smazat konverzaci',
    'Star Conversation': 'Označit hvězdičkou',
    'Add to Favorites': 'Přidat k oblíbeným',
    'Mark as read': 'Označit jako přečtené',
    'Unread': 'Nepřečtené',
    'Starred': 'Oblíbené',
    'Recent': 'Nedávné',
    'Recents': 'Nedávné',
    'Team inbox': 'Týmová schránka',
    'My inbox': 'Moje schránka',
    'Assigned to me': 'Přiřazeno mně',
    'Followed by me': 'Sledované mnou',
    'Unassigned conversations': 'Nepřiřazené konverzace',

    /* --- generic accessibility labels (screen-reader only, but they surface
           in tooltips and in the a11y tree) --- */
    'Icon only button': 'Tlačítko s ikonou',
    'Alternative text for image not provided': 'Alternativní text obrázku není k dispozici',
    'Language Detector icon': 'Ikona detektoru jazyka',
    'mute': 'ztlumit',
    'unmute': 'zrušit ztlumení',
    'loading': 'načítání',
    'close': 'zavřít',
    'Expand Inbox Panel': 'Rozbalit panel schránky',
    'Message menu': 'Nabídka zprávy',
    'View by type': 'Zobrazit podle typu',

    /* --- calling / voice --- */
    'Voice Calling': 'Hlasové volání',
    'Voicemail': 'Hlasová schránka',
    'Keypad': 'Klávesnice',
    'Queue': 'Fronta',
    'Local': 'Místní',
    'Main Line': 'Hlavní linka',
    'Calling From': 'Voláno z',
    'Search Numbers': 'Hledat čísla',
    'Audio Settings': 'Nastavení zvuku',
    'Reset audio': 'Obnovit zvuk',
    'Download Audio': 'Stáhnout nahrávku',
    'Change Playback Speed': 'Změnit rychlost přehrávání',
    'View Transcript': 'Zobrazit přepis',
    'Call': 'Hovor',
    'Call completed': 'Hovor dokončen',

    /* --- calendars --- */
    'Calendar view': 'Zobrazení kalendáře',
    'Appointment list view': 'Seznam schůzek',
    'Calendar settings': 'Nastavení kalendáře',
    'Appointments': 'Schůzky',
    'Create a new calendar': 'Vytvořit nový kalendář',
    'Calendar setup assistant': 'Asistent nastavení kalendáře',
    'AI-powered calendar configuration': 'Konfigurace kalendáře pomocí AI',
    'Discover what calendars can do': 'Objevte možnosti kalendářů',
    'Ask anything about calendars...': 'Zeptejte se na cokoli o kalendářích...',
    'Search users, calendars, or groups': 'Hledat uživatele, kalendáře nebo skupiny',
    'Blocked slots': 'Blokované termíny',
    'Show buffer time': 'Zobrazit rezervu',
    'Week view': 'Týdenní zobrazení',
    'All day': 'Celý den',
    'Today': 'Dnes',

    /* --- opportunities --- */
    'Pipelines': 'Obchodní kanály',
    'Forecast': 'Prognóza',
    'Bulk Actions': 'Hromadné akce',
    'Analytics': 'Analytika',

    /* --- marketing / automation / sites --- */
    'Workflows': 'Pracovní postupy',
    'Campaigns': 'Kampaně',
    'Triggers': 'Spouštěče',
    'Forms': 'Formuláře',
    'Surveys': 'Dotazníky',
    'Funnels': 'Trychtýře',
    'Websites': 'Webové stránky',
    'Blogs': 'Blogy',
    'Templates': 'Šablony',
    'Emails': 'E-maily',
    'Social Planner': 'Plánovač sociálních sítí',
    'Reviews': 'Recenze',
    'Affiliate Manager': 'Správce partnerů',

    /* --- payments / commerce --- */
    'Invoices': 'Faktury',
    'Products': 'Produkty',
    'Subscriptions': 'Předplatná',
    'Orders': 'Objednávky',
    'Transactions': 'Transakce',
    'Coupons': 'Kupóny',
    'Billing': 'Fakturace',

    /* --- settings --- */
    'My Profile': 'Můj profil',
    'Business Profile': 'Profil firmy',
    'Company': 'Společnost',
    'Team': 'Tým',
    'Profile': 'Profil',
    'Integrations': 'Integrace',
    'Phone Numbers': 'Telefonní čísla',
    'Audit Logs': 'Protokoly auditu',
    'Only visible to agency admins': 'Viditelné pouze pro správce agentury',

    /* --- feedback scale --- */
    'Very Satisfied': 'Velmi spokojen',
    'Satisfied': 'Spokojen',
    'Neutral': 'Neutrální',
    'Unsatisfied': 'Nespokojen',
    'Very Unsatisfied': 'Velmi nespokojen',

    'Type a message': 'Napište zprávu',
    'Contact': 'Kontakt',
    'Contact source': 'Zdroj kontaktu',
    'Contact type': 'Typ kontaktu',
    'View contact details': 'Zobrazit detaily kontaktu',
    'General Info': 'Obecné informace',
    'Additional Info': 'Další informace',
    'All fields': 'Všechna pole',
    'Date of birth': 'Datum narození',
    'Followers': 'Odběratelé',
    'Unassigned': 'Nepřiřazeno',
    'Exclude from email verification': 'Vyloučit z ověřování e-mailů',
    'Custom fields organized by folders': 'Vlastní pole uspořádaná do složek',
    'Search fields and folders': 'Hledat pole a složky',
    'Select': 'Vybrat',
    'Select Country': 'Vyberte zemi',
    'Send Options': 'Možnosti odeslání',
    'Request Booking Link': 'Vyžádat odkaz na rezervaci',
    'Request followup call': 'Vyžádat následný hovor',
    'Make sure you have entered a message.': 'Zkontrolujte, zda jste zadali zprávu.',
    'Inbound Call': 'Příchozí hovor',
    'Outbound Call': 'Odchozí hovor',
    'Selected': 'Vybráno',


    /* ===================================================================
       Added from a full sweep of Dashboard, Opportunities, Automation,
       Marketing/Social Planner, Sites, Reputation, Reporting, Media,
       Settings and App Marketplace.

       Deliberately NOT included: your own pipeline/funnel/campaign names,
       uploaded filenames, and third-party product names (WhatsApp, WordPress,
       Google Ads, Canva, Threads) which stay as-is in Czech too.
       =================================================================== */

    /* --- opportunities & pipelines --- */
    'Opportunity': 'Příležitost',
    'Opportunity status': 'Stav příležitosti',
    'Opportunity value': 'Hodnota příležitosti',
    'Add opportunity': 'Přidat příležitost',
    'Open opportunities': 'Otevřené příležitosti',
    'Search opportunities': 'Hledat příležitosti',
    'No opportunities match the current filters': 'Žádné příležitosti neodpovídají filtrům',
    'All pipelines': 'Všechny obchodní kanály',
    'Opportunities & Pipelines': 'Příležitosti a obchodní kanály',
    'Stage distribution': 'Rozložení fází',
    'Open': 'Otevřeno',
    'Won': 'Vyhráno',
    'Lost': 'Prohráno',
    'Abandoned': 'Opuštěno',
    'Won revenue': 'Výnos z vyhraných',
    'Conversion rate': 'Míra konverze',
    'Average sales duration': 'Průměrná délka obchodu',
    'Sales efficiency': 'Efektivita prodeje',
    'Sales velocity': 'Rychlost prodeje',
    'Total sale value': 'Celková hodnota obchodů',
    'Total values': 'Celkové hodnoty',
    'Total revenue': 'Celkové výnosy',
    'Total leads': 'Celkem leadů',
    'Total pending': 'Celkem čekajících',
    'Total pending actions': 'Celkem čekajících akcí',
    'Total spent': 'Celkem utraceno',
    'Total clicks': 'Celkem kliknutí',
    'Total page views': 'Celkem zobrazení stránek',
    'Total views': 'Celkem zobrazení',
    'Total visitors': 'Celkem návštěvníků',

    /* --- common table / filter controls --- */
    'Sort': 'Řadit',
    'Sort By': 'Řadit podle',
    'Sort options': 'Možnosti řazení',
    'Clear filters': 'Vymazat filtry',
    'Update filters': 'Aktualizovat filtry',
    'Quick filters': 'Rychlé filtry',
    'Filter views': 'Filtrovat zobrazení',
    'Manage fields': 'Spravovat pole',
    'Rows per page': 'Řádků na stránku',
    'No data found': 'Nebyla nalezena žádná data',
    'Error while loading data': 'Chyba při načítání dat',
    'Date': 'Datum',
    'Start Date': 'Datum zahájení',
    'End Date': 'Datum ukončení',
    'Date picker': 'Výběr data',
    'Last 30 days': 'Posledních 30 dní',
    'Last updated': 'Naposledy aktualizováno',
    'Due date (ASC)': 'Termín (vzestupně)',
    'DD / MM / YYYY': 'DD / MM / RRRR',
    'Name': 'Název',
    'Type': 'Typ',
    'Subject': 'Předmět',
    'Enter a subject': 'Zadejte předmět',
    'Content': 'Obsah',
    'Comments': 'Komentáře',
    'Overview': 'Přehled',
    'Statistics': 'Statistiky',
    'Sources': 'Zdroje',
    'Widgets': 'Widgety',
    'Sections': 'Sekce',
    'Pending': 'Čeká',
    'Published': 'Publikováno',
    'In Review': 'V kontrole',
    'List': 'Seznam',
    'List view': 'Zobrazení seznamu',
    'Grid view': 'Zobrazení mřížky',
    'Menu': 'Nabídka',
    'More options menu': 'Nabídka dalších možností',
    'Folder options menu': 'Nabídka možností složky',
    'Breadcrumb': 'Drobečková navigace',
    'Breadcrumb Home': 'Drobečková navigace – domů',
    'dropdown icon': 'ikona rozbalení',
    'User selection': 'Výběr uživatele',
    'All users': 'Všichni uživatelé',
    'Attach file': 'Přiložit soubor',
    'Send Message': 'Odeslat zprávu',
    'Import Data': 'Importovat data',
    'From': 'Od',

    /* --- media library --- */
    'Media': 'Média',
    'My Media': 'Moje média',
    'Files': 'Soubory',
    'Folders': 'Složky',
    'Create folder': 'Vytvořit složku',
    'New Folder': 'Nová složka',
    'Move to folder': 'Přesunout do složky',
    'Move to trash': 'Přesunout do koše',
    'Rename': 'Přejmenovat',
    'Replace': 'Nahradit',
    'Upload': 'Nahrát',
    'Upload file': 'Nahrát soubor',
    'Upload folder': 'Nahrát složku',
    'Upload media': 'Nahrát média',
    'Upload URL': 'Nahrát URL',

    /* --- settings --- */
    'Go Back': 'Zpět',
    'MY BUSINESS': 'MOJE FIRMA',
    'BUSINESS SERVICES': 'FIREMNÍ SLUŽBY',
    'OTHER SETTINGS': 'OSTATNÍ NASTAVENÍ',
    'My Staff': 'Můj tým',
    'Email Services': 'E-mailové služby',
    'Phone System': 'Telefonní systém',
    'Objects': 'Objekty',
    'Custom Values': 'Vlastní hodnoty',
    'Private Integrations': 'Soukromé integrace',
    'Domains & URL Redirects': 'Domény a přesměrování URL',
    'External Tracking': 'Externí sledování',
    'Client Portal': 'Klientský portál',
    'Chat Widget': 'Chatovací widget',
    'Branded Mobile App': 'Značková mobilní aplikace',
    'Preference Management Hub': 'Centrum správy preferencí',
    'Manage Scoring': 'Spravovat skórování',
    'Global Workflow Settings': 'Globální nastavení postupů',

    /* --- reporting --- */
    'Appointment report': 'Report schůzek',
    'Call report': 'Report hovorů',
    'Attribution report': 'Report atribuce',
    'Lead source report': 'Report zdrojů leadů',
    'Google Ads report': 'Report Google Ads',
    'Google Analytics report': 'Report Google Analytics',
    'Facebook Ads report': 'Report Facebook Ads',
    'Meta Ads (Facebook Ads) report': 'Report Meta Ads (Facebook Ads)',
    'Custom reports': 'Vlastní reporty',
    'Create new dashboard': 'Vytvořit novou nástěnku',
    'Edit dashboard': 'Upravit nástěnku',
    'Dashboard header': 'Záhlaví nástěnky',
    'Dashboard widgets': 'Widgety nástěnky',
    'Open dashboard selector': 'Otevřít výběr nástěnky',
    'Create Widget': 'Vytvořit widget',
    'Summarize dashboard with AI': 'Shrnout nástěnku pomocí AI',
    'My Stats': 'Moje statistiky',
    'Calls': 'Hovory',
    'Bookings': 'Rezervace',

    /* --- social planner --- */
    'Social': 'Sociální sítě',
    'Socials': 'Sociální sítě',
    'Connect socials': 'Připojit sociální sítě',
    'Post composer': 'Editor příspěvku',
    'New Post': 'Nový příspěvek',
    'Native post': 'Nativní příspěvek',
    'Social Post': 'Příspěvek na sociální síti',
    'Planner': 'Plánovač',
    'Planner view': 'Zobrazení plánovače',
    'Caption': 'Popisek',
    'Search by caption (min 3 chars)': 'Hledat podle popisku (min. 3 znaky)',
    'Social Planner Settings': 'Nastavení plánovače',
    'Social Planner Feedback': 'Zpětná vazba k plánovači',
    'Social Listening': 'Naslouchání sociálním sítím',
    'Organic views': 'Organická zobrazení',
    'Paid views': 'Placená zobrazení',
    'Direct views': 'Přímá zobrazení',
    'Social views': 'Zobrazení ze sociálních sítí',
    'Connect Canva': 'Připojit Canvu',
    'Connect to Threads': 'Připojit k Threads',
    'Open Content AI': 'Otevřít Content AI',

    /* --- reputation --- */
    'Requests': 'Žádosti',
    'Review request': 'Žádost o recenzi',
    'Review response': 'Odpověď na recenzi',
    'Review widget': 'Widget recenzí',
    'Reviews and ratings trend': 'Trend recenzí a hodnocení',
    'Send Review Request': 'Odeslat žádost o recenzi',
    'Send First Review Request': 'Odeslat první žádost o recenzi',
    'Start Collecting Reviews': 'Začít sbírat recenze',
    'Begin sending review requests.': 'Začněte odesílat žádosti o recenze.',
    'Track your review performance.': 'Sledujte výkon svých recenzí.',
    'Video testimonials': 'Video reference',
    'Video Testimonials': 'Video reference',
    'No video reviews yet.': 'Zatím žádné video recenze.',
    'No responses yet.': 'Zatím žádné odpovědi.',
    'No widget activity detected.': 'Nebyla zjištěna žádná aktivita widgetu.',
    'No QR scans yet.': 'Zatím žádné skeny QR kódu.',
    'QR Codes': 'QR kódy',
    'QR code scans': 'Skeny QR kódu',
    'Generate QR Code': 'Vygenerovat QR kód',
    'Create a Collector': 'Vytvořit sběrač',
    'Listings': 'Zápisy',
    'Listing Management': 'Správa zápisů',
    'Activate Listings': 'Aktivovat zápisy',
    'GBP Optimization': 'Optimalizace GBP',
    'Search (desktop & mobile)': 'Vyhledávání (desktop a mobil)',
    'Maps (desktop & mobile)': 'Mapy (desktop a mobil)',

    /* --- sites & funnels --- */
    'Funnel': 'Trychtýř',
    'Funnel steps': 'Kroky trychtýře',
    'New funnel': 'Nový trychtýř',
    'Search for funnels': 'Hledat trychtýře',
    'Quizzes': 'Kvízy',
    'Webinars': 'Webináře',
    'Stores': 'Obchody',
    'Countdown Timers': 'Odpočty',
    'Website visits': 'Návštěvy webu',
    'Build with AI': 'Vytvořit pomocí AI',

    /* --- automation --- */
    'Workflow': 'Pracovní postup',
    'Workflow Builder': 'Editor pracovních postupů',
    'Workflow selection': 'Výběr pracovního postupu',
    'Campaign': 'Kampaň',
    'Campaign selection': 'Výběr kampaně',
    'Go to manual actions': 'Přejít na ruční akce',
    'Pending phone actions': 'Čekající telefonní akce',
    'Pending SMS actions': 'Čekající SMS akce',

    /* --- misc --- */
    'What\'s new': 'Novinky',
    'Contact updates': 'Aktualizace kontaktů',
    'Feedback': 'Zpětná vazba',
    'Have any ideas, troubles or questions?': 'Máte nápady, potíže nebo dotazy?',
    'Talk to us!': 'Napište nám!',
    'Ad Manager': 'Správce reklam',
    'Affiliate': 'Partner',
    'Prospecting': 'Vyhledávání klientů',
    'Payout': 'Výplata',
    'Relocated Item': 'Přesunutá položka',


    /* ===================================================================
       Right-hand panel rail on the Conversations screen: Contact,
       Activities, Associations, Opportunities, Tasks, Notes, Appointments,
       Documents, Payments, Agent Logs, Layout info, Keyboard shortcuts.
       =================================================================== */
    'Associations': 'Vazby',
    'Manage associations': 'Spravovat vazby',
    'Link existing': 'Propojit existující',
    'Create new': 'Vytvořit nový',
    'No Company associated': 'Není přiřazena žádná společnost',
    'Agent Logs': 'Protokoly agenta',
    'No agent logs found': 'Nebyly nalezeny žádné protokoly agenta',
    'Documents': 'Dokumenty',
    'Add documents': 'Přidat dokumenty',
    'No documents yet': 'Zatím žádné dokumenty',
    'Upload or send documents to see them listed here.': 'Nahrajte nebo odešlete dokumenty a zobrazí se zde.',
    'Search by document name': 'Hledat podle názvu dokumentu',
    'Add task': 'Přidat úkol',
    'No tasks yet': 'Zatím žádné úkoly',
    'Stay organized by creating your first task.': 'Udržte si přehled vytvořením prvního úkolu.',
    'Search by title': 'Hledat podle názvu',
    'Add note': 'Přidat poznámku',
    'Search notes': 'Hledat poznámky',
    'Add Appointment': 'Přidat schůzku',
    'No appointments yet': 'Zatím žádné schůzky',
    'Keep things moving by creating your first appointment.': 'Pokračujte vytvořením první schůzky.',
    'Search by Calendar Name': 'Hledat podle názvu kalendáře',
    'Upcoming': 'Nadcházející',
    'Past': 'Proběhlé',
    'No activities yet!': 'Zatím žádné aktivity!',
    'No Opportunities Yet': 'Zatím žádné příležitosti',
    'Estimates': 'Cenové nabídky',
    'No estimates found': 'Nebyly nalezeny žádné cenové nabídky',
    'No invoices found': 'Nebyly nalezeny žádné faktury',
    'No subscriptions found': 'Nebyla nalezena žádná předplatná',
    'No transactions found': 'Nebyly nalezeny žádné transakce',
    'No transactions yet! Create a new payment now': 'Zatím žádné transakce! Vytvořte novou platbu',
    'Amount': 'Částka',
    'Received': 'Přijato',
    'Sent': 'Odesláno',
    'Internal': 'Interní',
    'Other': 'Ostatní',
    'Pin': 'Připnout',
    'Unpin': 'Odepnout',
    'Show less': 'Zobrazit méně',
    'Show more': 'Zobrazit více',
    'Composer': 'Editor zprávy',
    'Contact Actions': 'Akce kontaktu',
    'Conversation Actions': 'Akce konverzace',
    'Search Conversation': 'Hledat konverzaci',
    'Search messages or agent': 'Hledat zprávy nebo agenta',
    'Select all conversations': 'Vybrat všechny konverzace',
    'Select multiple conversations': 'Vybrat více konverzací',
    'Please select a from number': 'Vyberte odesílací číslo',
	
	/* --- added by Tom Keyser --- */
	
	/*  random status messages */
    'Inbound SMS': 'Příchozí SMS',
	'DnD enabled by customer for': 'Zákazník povolil DnD pro',
	'This message was generated by Conversation AI':'Tato zpráva byla vygenerována systémem Konverzační AI.',
	'All Caught Up!':'Všechno dohnáno!',
	'You don\'t have any unread Internal chat conversations right now':'Momentálně nemáte žádné nepřečtené konverzace v interním chatu.',
	'No Internal Chat Selected':'Nebyl vybrán žádný interní chat',
	'View All Internal chat Conversations':'Zobrazit všechny interní chatové konverzace',
	'Select an inbox or start a new conversation':'Vyberte složku doručené pošty nebo zahajte novou konverzaci.',
	'Not verified':'Neověřeno',
	'Email is Not verified and you can':'E-mail není ověřen a můžete',
	'Verify here':'Ověřte zde',
	'Minimum 3 characters required':'Vyžadují se minimálně 3 znaky.',
	'Filter':'Filtr',
	'Invoice':'Faktura',
	'AI Action logs':'Protokoly akcí AI',
	'Activities':'Aktivity',
	'WhatsApp Permission':'WhatsApp Povolení',
	'More Options':'Další možnosti',
	'Request Payment':'Požádat o platbu',
	'Upload from System':'Nahrát ze systému',
	'Search Snippit':'Hledat šablonu',
	'Search Snippet':'Hledat šablonu',
	'Search Trigger Link':'Hledat spouštěcí odkaz',
	'Full Name':'Celé jméno',
	'Address Line 1':'Adresa – 1. řádek',
	'Phone (raw format)':'Telefon (neformátovaný)',
	'Company Name':'Název společnosti',
	'Contact Name':'Jméno kontaktní osoby',
	'Business Name':'Název firmy',
	'Last activity':'Poslední aktivita',
	'Add Contact':'Přidat kontakt',
	'Add Smart List':'Přidat chytrý seznam',
	'Search Contacts':'Hledat kontakty',
	'Unsaved changes':'Neuložené změny',
	
	
	/* missed icons & drop downs */
	'Internal Comment':'Interní komentář',
	'Internal chat':'Interní chat',
	'Create view':'Vytvořit pohled',
	'Views':'Zobrazení',
	'New conversation':'Nová konverzace',
	'No Conversations':'Žádné konverzace',
	
	
	/* --- end added by Tom Keyser --- */
	

    /* --- keyboard shortcuts modal --- */
    'Keyboard Shortcuts': 'Klávesové zkratky',
    'Navigation': 'Navigace',
    'Navigate between conversations': 'Přecházet mezi konverzacemi',
    'Navigate between conversation tabs': 'Přecházet mezi záložkami konverzace',
    'Switch between the Contacts tabs': 'Přepínat mezi záložkami kontaktů',
    'Switch right panel tabs': 'Přepínat záložky pravého panelu',
    'Expand / Close Left Sidebar': 'Rozbalit / zavřít levý panel',
    'Expand / Close Right Sidebar': 'Rozbalit / zavřít pravý panel',
    'or': 'nebo',


    /* ===================================================================
       Creation modals and editors: Add task, Add note, Book appointment,
       the shared rich-text toolbar, and the phone-number setup flow.
       Opened read-only during a sweep; nothing was saved.
       =================================================================== */

    /* --- add task / note --- */
    'Title': 'Název',
    'Enter': 'Zadejte',
    'Enter a title': 'Zadejte název',
    'Add description': 'Přidat popis',
    'Remove description': 'Odebrat popis',
    'Description': 'Popis',
    'Setup recurring tasks': 'Nastavit opakované úkoly',
    'Assign to': 'Přiřadit',
    'Select assignee': 'Vyberte řešitele',
    'Associated objects': 'Přiřazené objekty',
    'Associate to': 'Přiřadit k',
    'Create': 'Vytvořit',
    'Add internal note': 'Přidat interní poznámku',
    'Internal notes': 'Interní poznámky',

    /* --- shared rich-text toolbar --- */
    'Bold': 'Tučné',
    'Italic': 'Kurzíva',
    'Underline': 'Podtržené',
    'Strike': 'Přeškrtnuté',
    'Text Color': 'Barva textu',
    'Text Highlight': 'Zvýraznění textu',
    'Add Link': 'Přidat odkaz',
    'Add Image': 'Přidat obrázek',
    'Disc List': 'Odrážkový seznam',
    'Decimal List': 'Číslovaný seznam',
    'Undo': 'Zpět',
    'Redo': 'Znovu',
    'Color': 'Barva',
    'Select blue color': 'Vybrat modrou barvu',
    'Select cyan color': 'Vybrat azurovou barvu',
    'Select fuchsia color': 'Vybrat fuchsiovou barvu',
    'Select gray color': 'Vybrat šedou barvu',
    'Select green color': 'Vybrat zelenou barvu',
    'Select orange color': 'Vybrat oranžovou barvu',
    'Select pink color': 'Vybrat růžovou barvu',
    'Select purple color': 'Vybrat fialovou barvu',
    'Select teal color': 'Vybrat tyrkysovou barvu',
    'Select yellow color': 'Vybrat žlutou barvu',

    /* --- book appointment --- */
    'Book appointment': 'Rezervovat schůzku',
    'Appointment title': 'Název schůzky',
    'Calendar': 'Kalendář',
    'Team member': 'Člen týmu',
    'Date & time': 'Datum a čas',
    'Slot': 'Termín',
    'Meeting location': 'Místo schůzky',
    'Calendar default': 'Výchozí dle kalendáře',
    'Custom': 'Vlastní',
    'Default': 'Výchozí',
    'As configured in the calendar': 'Podle nastavení kalendáře',
    'Set specific to this appointment': 'Nastavit pouze pro tuto schůzku',
    'Attendees': 'Účastníci',
    'Contact\'s local time': 'Místní čas kontaktu',
    'Confirmed': 'Potvrzeno',
    'Unconfirmed': 'Nepotvrzeno',
    'Select Date': 'Vyberte datum',

    /* --- phone number setup --- */
    'Buy phone number': 'Koupit telefonní číslo',
    'Connect a phone number': 'Připojit telefonní číslo',
    'Use your existing phone number': 'Použít stávající telefonní číslo',
    'You\'ll need a phone number to get started.': 'Pro začátek budete potřebovat telefonní číslo.',
    'No numbers found': 'Nebyla nalezena žádná čísla',
    'Outbound and inbound calls': 'Odchozí i příchozí hovory',
    'Outbound calls only. Test call in 60 seconds': 'Pouze odchozí hovory. Testovací hovor za 60 sekund',
    'Help me decide': 'Pomozte mi vybrat',

    /* --- misc a11y --- */
    'Icon only toggle': 'Přepínač s ikonou',
    'search icon': 'ikona hledání',


    /* ===================================================================
       v8 -- sweep of the clean sub-account (SbA5m1DElMNEKBVnixsX).
       With no records present, HighLevel shows its onboarding and empty
       states, which is where most of the remaining English lived.

       Excluded: the business-profile data on the settings page, social
       network names (Facebook, Instagram, LinkedIn, TikTok, Pinterest,
       Threads, Bluesky, YouTube, WhatsApp, WordPress) and leaked i18n keys
       (titleConversionRate, titleLeadSources, titleTasks ...) which are
       HighLevel bugs -- translating them would only disguise them.
       =================================================================== */

    /* --- sidebar / icon alt text --- */
    'Launchpad icon': 'Ikona rychlého startu',
    'Dashboard icon': 'Ikona nástěnky',
    'Conversations icon': 'Ikona konverzací',
    'Calendars icon': 'Ikona kalendářů',
    'Contacts icon': 'Ikona kontaktů',
    'Opportunities icon': 'Ikona příležitostí',
    'Payments icon': 'Ikona plateb',
    'AI Agents icon': 'Ikona AI agentů',
    'Marketing icon': 'Ikona marketingu',
    'Automation icon': 'Ikona automatizace',
    'Sites icon': 'Ikona webů',
    'Memberships icon': 'Ikona členství',
    'Media Storage icon': 'Ikona úložiště médií',
    'Reputation icon': 'Ikona reputace',
    'Reporting icon': 'Ikona reportů',
    'App Marketplace icon': 'Ikona katalogu aplikací',
    'Settings icon': 'Ikona nastavení',
    'Quick actions icon': 'Ikona rychlých akcí',
    'Google Drive icon': 'Ikona Google Drive',
    'Customizer Icon': 'Ikona přizpůsobení',
    'No file icon': 'Ikona bez souboru',
    'agency logo': 'logo agentury',
    'Fingerprint Image': 'Obrázek otisku prstu',

    /* --- opportunities empty state --- */
    'Create a New Pipeline to Get Started!': 'Začněte vytvořením nového obchodního kanálu!',
    'Organize Deals, track Progress, and turn Leads into Customers with a clear view of every Stage.': 'Organizujte obchody, sledujte průběh a měňte leady v zákazníky s přehledem o každé fázi.',
    'Create New Pipeline': 'Vytvořit nový obchodní kanál',
    'No pipeline available': 'Není k dispozici žádný obchodní kanál',

    /* --- calendars onboarding --- */
    'Create my first booking calendar': 'Vytvořit první rezervační kalendář',
    'Your booking page will appear here': 'Vaše rezervační stránka se zobrazí zde',
    'Set my working hours': 'Nastavit pracovní dobu',
    'Connect Google/Outlook & video apps': 'Připojit Google/Outlook a video aplikace',
    'Skip setup': 'Přeskočit nastavení',
    'Chat to get started': 'Začněte konverzací',
    'Calendar AI can make mistakes. Double check important information.': 'AI kalendáře může chybovat. Důležité informace si ověřte.',

    /* --- custom objects / settings --- */
    'Add custom object': 'Přidat vlastní objekt',
    'Create your own custom object': 'Vytvořte si vlastní objekt',
    'Create a new custom object to match your unique business needs.': 'Vytvořte vlastní objekt podle potřeb vaší firmy.',
    'Standard objects': 'Standardní objekty',
    'Contains list of all businesses, their details, and contact information.': 'Obsahuje seznam všech firem, jejich údajů a kontaktních informací.',
    'Contains list of all deals, their stages, statuses and pipeline progress.': 'Obsahuje seznam všech obchodů, jejich fází, stavů a průběhu.',
    'Contains list of all leads, their details, and specifications': 'Obsahuje seznam všech leadů, jejich údajů a specifikací',
    'Additional Settings': 'Další nastavení',
    'Email Settings': 'Nastavení e-mailu',
    'Email notifications': 'E-mailová oznámení',
    'Email health report': 'Report stavu e-mailů',
    'Branding': 'Branding',
    'Brand Name': 'Název značky',
    'Brand Boards': 'Nástěnky značky',
    'Credentials': 'Přihlašovací údaje',
    'Regulatory Bundles': 'Regulační balíčky',
    'Trust Center': 'Centrum důvěry',
    'Domain setup': 'Nastavení domény',
    'Messaging': 'Zprávy',
    'Voice': 'Hlas',
    'Competitor Analysis': 'Analýza konkurence',

    /* --- social planner onboarding --- */
    'Connect your social accounts': 'Připojte své účty na sociálních sítích',
    'Grow your audience by posting across platforms in minutes': 'Rozšiřte publikum publikováním napříč platformami během minut',
    'Everything you need to manage social': 'Vše, co potřebujete pro správu sociálních sítí',
    'Powerful features designed for modern marketers': 'Výkonné funkce pro moderní marketéry',
    'Pick where you want to publish. You can add or remove networks anytime.': 'Vyberte, kam chcete publikovat. Sítě můžete kdykoli přidat nebo odebrat.',
    'Bulk schedule': 'Hromadné plánování',
    'Bulk Scheduling with CSV': 'Hromadné plánování pomocí CSV',
    'Category queue': 'Fronta kategorií',
    'Evergreen Queue Post': 'Příspěvek ve stálé frontě',
    'Recurring Post': 'Opakovaný příspěvek',
    'Recurring schedule': 'Opakovaný plán',
    'Generate Feed from RSS Post': 'Vygenerovat feed z RSS příspěvku',
    'RSS feed': 'RSS kanál',
    'Connect Drive': 'Připojit Drive',
    'Also available': 'Také k dispozici',
    'Weekly': 'Týdně',
    'Call, record, transcribe, automate follow-ups and more - all in one place.': 'Volejte, nahrávejte, přepisujte, automatizujte follow-upy a další – vše na jednom místě.',

    /* --- memberships / client portal --- */
    'Client Portal App': 'Aplikace klientského portálu',
    'Client portal URL': 'URL klientského portálu',
    'What is a client portal?': 'Co je klientský portál?',
    'Creating a protected online gateway for client interactions': 'Vytvoření chráněné online brány pro komunikaci s klienty',
    'Invite to client portal': 'Pozvat do klientského portálu',
    'Invite': 'Pozvat',
    'Invited': 'Pozváno',
    'Generate magic link': 'Vygenerovat magic link',
    'Send login email': 'Odeslat přihlašovací e-mail',
    'Courses': 'Kurzy',
    'Course Builder': 'Editor kurzů',
    'Communities': 'Komunity',
    'Community': 'Komunita',
    'Offers': 'Nabídky',
    'Launch your white-label app with courses and communities': 'Spusťte svou white-label aplikaci s kurzy a komunitami',
    'Your Brand. Your App.': 'Vaše značka. Vaše aplikace.',

    /* --- media library --- */
    'No media files found': 'Nebyly nalezeny žádné mediální soubory',
    'Search the entire media library or explore stock images': 'Prohledejte celou knihovnu médií nebo procházejte stock fotografie',
    'Search the entire media library or explore stock images.': 'Prohledejte celou knihovnu médií nebo procházejte stock fotografie.',
    'Modified: Newest First': 'Změněno: nejnovější první',

    /* --- counted labels (used with the COUNT_ patterns above) --- */
    'Pending phone calls': 'Čekající telefonní hovory',
    'Pending SMS': 'Čekající SMS',
    'Advanced filters': 'Pokročilé filtry',
    'Attachments': 'Přílohy',

    /* --- misc --- */
    'Please Select': 'Vyberte',
    'Send': 'Odeslat',
    'Generate': 'Vygenerovat',
    'Ok': 'OK',
    'Loading widget data': 'Načítání dat widgetu',


    /* ===================================================================
       v9 -- Settings > Custom fields (/settings/fields).
       Everything on that screen is HighLevel default content: the field
       group headings, the default field names, and the field types. None of
       it is customer data, so all of it is translated.
       =================================================================== */

    /* --- page chrome --- */
    'Create and manage custom fields for your objects to capture and organize data': 'Vytvářejte a spravujte vlastní pole svých objektů pro sběr a organizaci dat',
    'Fields': 'Pole',
    'Business': 'Firma',
    'Create field': 'Vytvořit pole',
    'Search fields': 'Hledat pole',
    'Fields per page': 'Polí na stránku',
    'Field name': 'Název pole',
    'Field type': 'Typ pole',
    'Folder name': 'Název složky',
    'Key': 'Klíč',

    /* --- default field names --- */
    'Opportunity name': 'Název příležitosti',
    'Pipeline': 'Obchodní kanál',
    'Stage': 'Fáze',
    'Lead value': 'Hodnota leadu',
    'Opportunity source': 'Zdroj příležitosti',
    'Lost reason': 'Důvod prohry',
    'Forecast expected close date': 'Předpokládané datum uzavření',
    'Forecast probability': 'Pravděpodobnost prognózy',
    'Street address': 'Ulice a číslo popisné',
    'Website': 'Webová stránka',
    'Timezone': 'Časové pásmo',

    /* --- default folder names --- */
    'Opportunity Details': 'Detaily příležitosti',

    /* --- field types (full list from the Create field picker) --- */
    'Single line': 'Jeden řádek',
    'Multi line': 'Více řádků',
    'Text box list': 'Seznam textových polí',
    'Number': 'Číslo',
    'Monetary': 'Peněžní',
    'Dropdown (single)': 'Rozbalovací (jedna volba)',
    'Dropdown (multiple)': 'Rozbalovací (více voleb)',
    'Radio select': 'Přepínač',
    'Checkbox': 'Zaškrtávací pole',
    'File upload': 'Nahrání souboru',
    'Signature': 'Podpis',

    /* --- create custom field panel --- */
    'Create custom field': 'Vytvořit vlastní pole',
    "Customize your field's details and see live preview": 'Upravte detaily pole a sledujte živý náhled',
    'Field details': 'Detaily pole',
    'Enter name': 'Zadejte název',
    'Add a short description to explain this field': 'Přidejte krátký popis vysvětlující toto pole',
    'Set default value': 'Nastavit výchozí hodnotu',
    'Capture short text inputs like names or titles': 'Zachyťte krátké texty, jako jsou jména nebo názvy',
    'Placeholder text': 'Zástupný text',
    'Provide a hint for users to know what kind of information to provide': 'Napovězte uživatelům, jaké informace mají zadat',
    'Live preview': 'Živý náhled',
    'Add to object': 'Přidat k objektu',
    'Select object': 'Vyberte objekt',
    'Select folder': 'Vyberte složku',
    'Due date and time': 'Termín a čas',


    /* ===================================================================
       v11 -- triple-dot menus, their dialogs, the Folders tab and tooltips
       on Settings > Custom fields. Opened read-only; nothing was saved.
       =================================================================== */
    'Edit searchable fields': 'Upravit prohledávatelná pole',
    'Changes to searchable fields will affect search functionality for all users and apply globally': 'Změny prohledávatelných polí ovlivní vyhledávání pro všechny uživatele a projeví se globálně',
    'Edit unique fields': 'Upravit jedinečná pole',
    'Choose a custom object to manage its unique fields. Changes will apply to all records': 'Vyberte vlastní objekt pro správu jeho jedinečných polí. Změny se projeví u všech záznamů',
    'Learn more': 'Zjistit více',
    'Search folders': 'Hledat složky',
    'Number of fields': 'Počet polí',
    'Folders per page': 'Složek na stránku',
    'Default folders cannot be edited or deleted': 'Výchozí složky nelze upravovat ani mazat',


    /* ===================================================================
       v13 -- Contacts smart list: bulk-action bar, empty state, grid
       pagination, the Filters panel taxonomy and the Manage fields panel.
       All HighLevel defaults; the sub-account holds no contact records.
       =================================================================== */

    /* --- bulk action bar --- */
    'Trigger automation': 'Spustit automatizaci',
    'Send email': 'Odeslat e-mail',
    'Add tags': 'Přidat štítky',
    'More': 'Více',
    'Select Row': 'Vybrat řádek',

    /* --- empty state --- */
    'It\'s so lonely in here!': 'Je tu prázdno!',
    'No Contacts in sight! Ready to create a fresh one?': 'Žádné kontakty! Chcete vytvořit nový?',

    /* --- grid pagination --- */
    'Page Size': 'Velikost stránky',
    'First': 'První',
    'Prev': 'Předchozí',
    'Last': 'Poslední',
    'First Page': 'První stránka',
    'Prev Page': 'Předchozí stránka',
    'Next Page': 'Další stránka',
    'Last Page': 'Poslední stránka',

    /* --- manage fields panel --- */
    'Fields in table': 'Pole v tabulce',
    'Add fields': 'Přidat pole',
    'Add custom field': 'Přidat vlastní pole',
    'Search field': 'Hledat pole',

    /* --- filters: contact information --- */
    'Contact information': 'Informace o kontaktu',
    'Age': 'Věk',
    'Created by': 'Vytvořil',
    'Email status': 'Stav e-mailu',
    'Last email clicked date': 'Datum posledního kliknutí na e-mail',
    'Last email opened date': 'Datum posledního otevření e-mailu',
    'Last updated by': 'Naposledy upravil',
    'Postal zip code': 'PSČ',
    'Source type': 'Typ zdroje',
    'Tag': 'Štítek',
    'Whatsapp status': 'Stav WhatsApp',
    'Wildcard name': 'Zástupný název',

    /* --- filters: DND (kept as the established abbreviation) --- */
    'Calls & Voicemails DND': 'Nerušit – hovory a hlasové zprávy',
    'DND all': 'Nerušit vše',
    'Email DND': 'Nerušit – e-mail',
    'FB messenger DND': 'Nerušit – FB Messenger',
    'GMB messenger DND': 'Nerušit – GMB Messenger',
    'Inbound DND': 'Nerušit – příchozí',
    'SMS DND': 'Nerušit – SMS',
    'WhatsApp DND': 'Nerušit – WhatsApp',

    /* --- filters: contact activity --- */
    'Contact activity': 'Aktivita kontaktu',
    'Last activity type': 'Typ poslední aktivity',
    'Last appointment': 'Poslední schůzka',
    'Workflow (active)': 'Pracovní postup (aktivní)',
    'Workflow (finished)': 'Pracovní postup (dokončený)',

    /* --- filters: opportunity --- */
    'Opportunity information': 'Informace o příležitosti',
    'Opportunity pipeline': 'Obchodní kanál příležitosti',
    'Opportunity stage': 'Fáze příležitosti',
    'Offer': 'Nabídka',
    'Product': 'Produkt',

    /* --- filters: attribution --- */
    'Attribution': 'Atribuce',
    'Attribution FB click ID': 'Atribuce – FB click ID',
    'Attribution google click ID': 'Atribuce – Google click ID',
    'Attribution medium': 'Atribuce – médium',
    'Attribution source': 'Atribuce – zdroj',
    'Attribution UTM ad group ID': 'Atribuce – UTM ad group ID',
    'Attribution UTM ad ID': 'Atribuce – UTM ad ID',
    'Attribution UTM campaign': 'Atribuce – UTM kampaň',
    'Attribution UTM campaign ID': 'Atribuce – UTM campaign ID',
    'Attribution UTM content': 'Atribuce – UTM obsah',
    'Attribution UTM keyword': 'Atribuce – UTM klíčové slovo',
    'Attribution UTM match type': 'Atribuce – UTM typ shody',
    'Attribution UTM medium': 'Atribuce – UTM médium',
    'Attribution UTM source': 'Atribuce – UTM zdroj',
    'Attribution UTM term': 'Atribuce – UTM termín',
    'First attribution': 'První atribuce',
    'Last attribution': 'Poslední atribuce',


    /* ===================================================================
       v14 -- deep pass on Contacts: Tasks tab, Companies tab, Bulk actions
       tab, the Add contact form and the Import screen.
       =================================================================== */

    /* --- tasks tab --- */
    'Due today': 'Termín dnes',
    'Overdue': 'Po termínu',
    'Assignee': 'Řešitel',
    'Assignee: Any': 'Řešitel: Libovolný',
    'Status: All': 'Stav: Vše',
    'Due Date: Any': 'Termín: Libovolný',
    'Due Date': 'Termín',
    'Mark as done': 'Označit jako hotové',
    'Mark as pending': 'Označit jako čekající',
    'Associated Contacts': 'Přiřazené kontakty',
    'No Tasks in sight! Ready to create a fresh one?': 'Žádné úkoly! Chcete vytvořit nový?',
    'Search for task title': 'Hledat název úkolu',
    'Select all visible rows': 'Vybrat všechny viditelné řádky',

    /* --- companies tab --- */
    'Add Company': 'Přidat společnost',
    'Created At': 'Vytvořeno',
    'Updated At': 'Aktualizováno',
    'No Companies found': 'Nebyly nalezeny žádné společnosti',

    /* --- bulk actions tab --- */
    'Track progress and results for bulk actions.': 'Sledujte průběh a výsledky hromadných akcí.',
    'All statuses': 'Všechny stavy',
    'All actions': 'Všechny akce',
    'Action label': 'Označení akce',
    'Operation': 'Operace',
    'User': 'Uživatel',
    'Completed': 'Dokončeno',
    'No bulk actions found': 'Nebyly nalezeny žádné hromadné akce',
    'There are no bulk actions matching your current filters.': 'Žádné hromadné akce neodpovídají aktuálním filtrům.',
    'From date': 'Datum od',
    'To date': 'Datum do',

    /* --- add contact form --- */
    'Contact image': 'Obrázek kontaktu',
    'Customize form': 'Přizpůsobit formulář',
    'Enter First name': 'Zadejte jméno',
    'Enter Last name': 'Zadejte příjmení',
    'Please enter email address': 'Zadejte e-mailovou adresu',
    '+ Add email': '+ Přidat e-mail',
    'Enter phone number': 'Zadejte telefonní číslo',
    '+ Add phone': '+ Přidat telefon',
    'Select Contact type': 'Vyberte typ kontaktu',
    'Time zone': 'Časové pásmo',
    'Select Time zone': 'Vyberte časové pásmo',
    'DND all channels': 'Nerušit – všechny kanály',
    'Channels': 'Kanály',
    'Text messages': 'Textové zprávy',
    'Calls & voicemail': 'Hovory a hlasová schránka',
    'Inbound calls and SMS': 'Příchozí hovory a SMS',
    'Save and add another': 'Uložit a přidat další',

    /* --- import screen --- */
    'Choose an import method': 'Vyberte způsob importu',
    'Import records from CSV': 'Importovat záznamy z CSV',
    'Upload a CSV file, map fields, review your data, and import records.': 'Nahrajte CSV soubor, namapujte pole, zkontrolujte data a importujte záznamy.',
    'Start CSV import': 'Zahájit import CSV',
    'Import from HubSpot': 'Importovat z HubSpotu',
    'Connect your HubSpot account to import data, including records, custom fields, and associations.': 'Připojte účet HubSpot pro import dat včetně záznamů, vlastních polí a vazeb.',
    'Connect HubSpot': 'Připojit HubSpot',
    'Import history': 'Historie importů',
    'Track import progress, results, and errors.': 'Sledujte průběh, výsledky a chyby importů.',
    'Imported by': 'Importoval',
    'Records found': 'Nalezené záznamy',
    'Errors': 'Chyby',
    'Started': 'Zahájeno',
    'No imports yet': 'Zatím žádné importy',
    'All imports, including CSV uploads and HubSpot imports, will show up here.': 'Zde se zobrazí všechny importy, včetně nahrání CSV a importů z HubSpotu.',


    /* --- v15: sort panel + add smart list panel --- */
    'Select field': 'Vyberte pole',
    'Clear': 'Vymazat',
    'Sort by': 'Řadit podle',
    'List name': 'Název seznamu',
    'New smart list': 'Nový chytrý seznam',
    'Sharing & permissions': 'Sdílení a oprávnění',
    'Delete list': 'Smazat seznam',

    /* --- month names (also used by the date reformatter below) --- */
    'January': 'leden', 'February': 'únor', 'March': 'březen', 'April': 'duben',
    'May': 'květen', 'June': 'červen', 'July': 'červenec', 'August': 'srpen',
    'September': 'září', 'October': 'říjen', 'November': 'listopad', 'December': 'prosinec'
  };

  /* Czech months in the genitive form used inside a date ("1. září 2026") */
  var MONTH_GEN = {
    January: 'ledna', February: 'února', March: 'března', April: 'dubna',
    May: 'května', June: 'června', July: 'července', August: 'srpna',
    September: 'září', October: 'října', November: 'listopadu', December: 'prosince'
  };
  var DATE_RE = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})$/;

  /* ---------- CSS pseudo-element labels ----------------------------------
     Some sidebar labels are not DOM text at all -- they are drawn by CSS
     `content` on a ::before pseudo-element. A text-node translator can never
     reach those, so they need a CSS override instead.

     SPECIFICITY WARNING: HighLevel's own rule beats `#sb_launchpad .nav-title`
     (id + class). The selector must include element types to outrank it, e.g.
     `a#sb_launchpad span.nav-title`. Dropping the `a` / `span` silently fails.

     To find others, paste this in DevTools on any HighLevel screen:

       [...document.querySelectorAll('*')].flatMap(e =>
         ['::before','::after'].map(ps => {
           const c = getComputedStyle(e, ps).content;
           return (c && c !== 'none' && c !== 'normal' &&
                   !/^["']\\\\/.test(c) && /[A-Za-z]{2,}/.test(c))
             ? {text: c, ps, id: e.id || e.parentElement?.id, cls: e.className} : null;
         })).filter(Boolean)
  */
  var PSEUDO = [
    { selector: 'html body a#sb_launchpad span.nav-title::before', text: 'Rychlý start' }
  ];

  var PSEUDO_STYLE_ID = 'ghl-cs-pseudo';

  function injectPseudoCss() {
    if (!PSEUDO.length) return;
    if (document.getElementById(PSEUDO_STYLE_ID)) return;
    if (!document.head) return;
    var css = '';
    for (var i = 0; i < PSEUDO.length; i++) {
      var esc = String(PSEUDO[i].text).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      css += PSEUDO[i].selector + '{content:"' + esc + '" !important;}\n';
    }
    var el = document.createElement('style');
    el.id = PSEUDO_STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ---------- do-not-touch zones ---------------------------------------- */
  /* Anything holding customer data or user input is never rewritten. */
  /* Two lists, because text and attributes carry different risk.

     A field's *value* is customer data and must never be touched. Its
     *placeholder* ("Type a message") is UI chrome and should be translated.
     Lumping input/textarea/select into one blocklist blocks both, which is why
     placeholders stayed English. So: text nodes use the strict list, attributes
     use the looser one that permits form controls. We only ever write the
     placeholder / title / aria-label attributes -- never `.value`. */

  var CONTENT_ZONES = [
    'code', 'pre', 'script', 'style', 'svg',
    '[contenteditable="true"]', '[contenteditable=""]',
    '.ql-editor', '.ProseMirror', '.CodeMirror', '.monaco-editor',
    '.message-body', '.msg-body', '.message-content', '.conversation-message',
    '.email-body', '.email-content', '.note-body', '.custom-field-value',
    '.contact-name', '.company-name', '.user-name',
    '#claude-agent-glow-border', '#claude-agent-stop-container', '#claude-phantom-cursor'
  ];

  /* attributes: everything above, but form controls are allowed */
  var BLOCKED_ATTR = CONTENT_ZONES.join(',');
  /* text nodes: the above plus form controls, whose text is data.
     `option` is NOT in this list -- native dropdown options are translated,
     but only outside the data pickers listed in DATA_PICKERS below. */
  var BLOCKED_TEXT = CONTENT_ZONES.concat(['input', 'textarea', 'select']).join(',');

  /* Dropdowns whose options are RECORDS, not fixed enums: assignees, users,
     contacts, calendars, pipelines, tags. A person or record in one of these
     could legitimately be named "Open" or "Other" and would otherwise be
     rewritten. Fixed enums (status, type, timezone, direction) are fine. */
  var DATA_PICKERS = [
    '[name*="assignee" i]', '[name*="user" i]', '[name*="contact" i]',
    '[name*="calendar" i]', '[name*="pipeline" i]', '[name*="owner" i]',
    '[name*="tag" i]', '[name*="member" i]', '[name*="team" i]',
    '[id*="assignee" i]', '[id*="user" i]', '[id*="contact" i]',
    '[id*="calendar" i]', '[id*="pipeline" i]', '[id*="owner" i]',
    '[id*="tag" i]', '[id*="member" i]', '[id*="team" i]',
    '[class*="assignee" i]', '[class*="user-select" i]', '[class*="contact-select" i]'
  ].join(',');

  function inDataPicker(el) {
    if (!el || !el.closest) return false;
    var sel = el.closest('select');
    if (sel && sel.matches && sel.matches(DATA_PICKERS)) return true;
    return !!el.closest(DATA_PICKERS);
  }

  var ATTRS = ['placeholder', 'title', 'aria-label'];

  /* ---------- prefilled input values -------------------------------------
     OFF by default everywhere else in this script's history: a field's value
     is normally customer data. Tom asked for prefills (e.g. the smart-list
     name defaulting to "New smart list") to be translated too, accepting the
     risk. Flip this to false to switch the behaviour off in one move.

     Three guards remain, and they matter:
       1. Only plain text/search inputs -- never email, tel, number, password,
          date, hidden or checkbox values.
       2. Never the focused element, so a value is never rewritten mid-typing.
       3. Whole-string glossary match only, and each element is rewritten once.

     Residual risk Tom accepted: a real record whose value happens to equal a
     glossary term exactly (a list literally named "New") would be rewritten. */
  var TRANSLATE_PREFILLS = true;

  var MAX_LEN = 160;

  /* Labels that carry a live count are one text node whose content changes:
       "Pending SMS: 0"   "Companies (0)"   "Contacts (1/10)"   "3 items"
     A fixed glossary can never match those. These three patterns peel the
     number off, translate the label, and put the number back. The numeric part
     is matched strictly as digits (with an optional /n), so nothing that could
     be customer data is ever captured. */
  var COUNT_COLON = /^(.+?):\s*(\d+)$/;              /* "Pending SMS: 0"   */
  var COUNT_PAREN = /^(.+?)\s*\((\d+(?:\/\d+)?)\)$/; /* "Contacts (1/10)" */
  var COUNT_ITEMS = /^(\d+)\s+items?$/i;              /* "0 items"         */
  var ABBR_PAREN  = /^(.+?)\s*\(\s*([A-Z]{2,6})\s*\)$/; /* "Created (PDT)", "Due Date ( CEST )" */
  var COLS_RATIO  = /^(\d+)\/(\d+)\s+columns?$/i;      /* "6/7 columns"     */
  var PLUS_MORE   = /^\+(\d+)\s+more$/i;               /* "+99 more"        */
  var PAGE_OF     = /^Page\s+(\d+)\s+of\s+(\d+)$/i;    /* "Page 1 of 1"     */
  var SHOW_PAGE   = /^Show\s+Page\s+(\d+)$/i;          /* "Show Page 1"     */
  var SELECT_ALL_N= /^Select\s+all\s+(\d+)$/i;         /* "Select all 0"    */
  var N_CONTACTS_SEL = /^(\d+)\s+Contacts?\s+Selected$/i;  /* "0 Contacts Selected" */
  var N_CONTACTS  = /^(\d+)\s+Contacts?$/i;            /* "0 Contacts"      */
  var N_TASKS_SEL = /^(\d+)\s+Tasks?\s+Selected$/i;
  var N_TASKS     = /^(\d+)\s+Tasks?$/i;
  var N_COMP_SEL  = /^(\d+)\s+Companies\s+Selected$/i;
  var N_COMP      = /^(\d+)\s+Companies$/i;
  var PAGE_N      = /^Page\s+(\d+)$/i;                 /* "Page 1"          */
  var N_SELECTED  = /^(\d+)\s+selected$/i;             /* "7 selected"      */
  var REMOVE_FILT = /^Remove filter:\s*(.+)$/i;         /* "Remove filter: Date" */
  var RANGE_OF    = /^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)$/i; /* "21 - 25 of 25" */
  /* "Aug 31, 2026 03:28 AM" -> "31. srp 2026 03:28" (Czech uses a 24h clock) */
  var STAMP = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  var MONTH_ABBR = {
    jan: 'led', feb: 'úno', mar: 'bře', apr: 'dub', may: 'kvě', jun: 'čvn',
    jul: 'čvc', aug: 'srp', sep: 'zář', oct: 'říj', nov: 'lis', dec: 'pro'
  };

  /* HighLevel is inconsistent about capitalisation across screens: the same
     label appears as "Contact details" on one and "Contact Details" on
     another, "Audit Logs" here and "audit logs" there. Exact-match alone means
     chasing these one at a time forever, so we also keep a lowercased index
     and fall back to it. Exact matches still win, so a deliberately
     case-specific entry (e.g. an all-caps badge) can override the general one. */
  var LOOKUP = {};
  (function buildLookup() {
    for (var k in DICT) {
      if (!Object.prototype.hasOwnProperty.call(DICT, k)) continue;
      var lower = k.toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(LOOKUP, lower)) LOOKUP[lower] = DICT[k];
    }
  })();

  /* Czech numerals take three forms, unlike English's two:
       1 položka | 2-4 položky | 0, 5+ položek
     Getting this wrong ("3 položek") reads as broken Czech to a native
     speaker, so counted nouns go through here. */
  function czPlural(n, one, few, many) {
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return few;
    return many;
  }

  /* plain glossary hit with no pattern recursion -- used by the count rules */
  function plain(str) {
    var k = str.trim();
    if (!k) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, k)) return DICT[k];
    var l = k.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(LOOKUP, l)) return LOOKUP[l];
    return null;
  }

  function translate(raw) {
    var key = raw.trim();
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];

    var m = DATE_RE.exec(key);
    if (m) return m[2] + '. ' + MONTH_GEN[m[1]] + ' ' + m[3];

    var m2 = COUNT_ITEMS.exec(key);
    if (m2) return m2[1] + ' ' + czPlural(parseInt(m2[1], 10), 'položka', 'položky', 'položek');

    var m3 = COUNT_COLON.exec(key);
    if (m3) {
      var lbl = plain(m3[1]);
      if (lbl !== null) return lbl + ': ' + m3[2];
    }

    var m4 = COUNT_PAREN.exec(key);
    if (m4) {
      var lbl2 = plain(m4[1]);
      if (lbl2 !== null) return lbl2 + ' (' + m4[2] + ')';
    }

    var m5 = COLS_RATIO.exec(key);
    if (m5) return m5[1] + '/' + m5[2] + ' sloupců';

    var m9 = PLUS_MORE.exec(key);
    if (m9) return '+' + m9[1] + ' dalších';

    var p1 = PAGE_OF.exec(key);
    if (p1) return 'Stránka ' + p1[1] + ' z ' + p1[2];

    var p2 = SHOW_PAGE.exec(key);
    if (p2) return 'Zobrazit stránku ' + p2[1];

    var p3 = SELECT_ALL_N.exec(key);
    if (p3) return 'Vybrat vše ' + p3[1];

    /* "0 Contacts Selected" must be tested BEFORE "0 Contacts", or the
       shorter pattern would never be reached for the longer string. */
    var p4 = N_CONTACTS_SEL.exec(key);
    if (p4) return 'Vybráno ' + p4[1] + ' ' +
      czPlural(parseInt(p4[1], 10), 'kontakt', 'kontakty', 'kontaktů');

    var p5 = N_CONTACTS.exec(key);
    if (p5) return p5[1] + ' ' +
      czPlural(parseInt(p5[1], 10), 'kontakt', 'kontakty', 'kontaktů');

    var t1 = N_TASKS_SEL.exec(key);
    if (t1) return 'Vybráno ' + t1[1] + ' ' +
      czPlural(parseInt(t1[1], 10), 'úkol', 'úkoly', 'úkolů');

    var t2 = N_TASKS.exec(key);
    if (t2) return t2[1] + ' ' +
      czPlural(parseInt(t2[1], 10), 'úkol', 'úkoly', 'úkolů');

    var c1 = N_COMP_SEL.exec(key);
    if (c1) return 'Vybráno ' + c1[1] + ' ' +
      czPlural(parseInt(c1[1], 10), 'společnost', 'společnosti', 'společností');

    var c2 = N_COMP.exec(key);
    if (c2) return c2[1] + ' ' +
      czPlural(parseInt(c2[1], 10), 'společnost', 'společnosti', 'společností');

    var pn = PAGE_N.exec(key);
    if (pn) return 'Stránka ' + pn[1];

    var ns = N_SELECTED.exec(key);
    if (ns) return 'Vybráno ' + ns[1];

    /* "Remove filter: Date" -- translate the filter name too when known */
    var rf = REMOVE_FILT.exec(key);
    if (rf) { var inner = plain(rf[1]); return 'Odebrat filtr: ' + (inner !== null ? inner : rf[1]); }

    var m7 = RANGE_OF.exec(key);
    if (m7) return m7[1] + ' – ' + m7[2] + ' z ' + m7[3];

    var m8 = STAMP.exec(key);
    if (m8) {
      var hh = parseInt(m8[4], 10) % 12;
      if (m8[6].toUpperCase() === 'PM') hh += 12;
      return m8[2] + '. ' + MONTH_ABBR[m8[1].toLowerCase()] + ' ' + m8[3] +
             ' ' + (hh < 10 ? '0' + hh : hh) + ':' + m8[5];
    }

    /* "Created (PDT)" -- translate the label, keep the timezone abbreviation */
    var m6 = ABBR_PAREN.exec(key);
    if (m6) {
      var lbl3 = plain(m6[1]);
      if (lbl3 !== null) return lbl3 + ' (' + m6[2] + ')';
    }

    var lower = key.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(LOOKUP, lower)) {
      var out = LOOKUP[lower];
      /* Status chips and section headers render in ALL CAPS ("LOST",
         "MY BUSINESS"). A case-insensitive hit would otherwise hand back
         mixed-case Czech and break the visual rhythm, so match the source. */
      if (key.length > 1 && key === key.toUpperCase() && key !== key.toLowerCase()) {
        return out.toUpperCase();
      }
      return out;
    }
    return null;
  }

  function blockedText(el) {
    if (!el || !el.closest) return true;
    if (el.closest(BLOCKED_TEXT)) return true;
    /* an <option> is allowed unless it belongs to a record picker */
    if (el.tagName === 'OPTION' || el.closest('option')) return inDataPicker(el);
    return false;
  }

  function blockedAttr(el) {
    return !el || (el.closest && el.closest(BLOCKED_ATTR));
  }

  function doTextNode(node) {
    /* Skip if we already wrote this exact value (survives Vue re-renders) */
    if (node.__csDone === node.textContent) return;
    var raw = node.textContent;
    /* 160, not 80: HighLevel's empty-state sentences ("Organize Deals, track
       Progress, and turn Leads into Customers...") run past 80 characters and
       were silently skipped. */
    if (!raw || raw.length > MAX_LEN) return;
    var out = translate(raw);
    if (out === null) return;
    /* preserve surrounding whitespace so layout/spacing is unchanged */
    var lead = raw.match(/^\s*/)[0];
    var tail = raw.match(/\s*$/)[0];
    node.textContent = lead + out + tail;
    node.__csDone = node.textContent;
  }

  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      var v = el.getAttribute(a);
      if (!v || v.length > MAX_LEN) continue;
      var out = translate(v);
      if (out === null || out === v) continue;
      el.setAttribute(a, out);
    }
  }

  function doValues(el) {
    if (!TRANSLATE_PREFILLS) return;
    if (el.tagName === 'INPUT' && el.type && !/^(text|search)$/i.test(el.type)) return;
    if (el === document.activeElement) return;          /* never mid-typing */
    var v = el.value;
    if (!v || v.length > MAX_LEN) return;
    if (el.__csVal === v) return;                       /* already handled */
    var out = translate(v);
    if (out === null || out === v) return;
    el.value = out;
    el.__csVal = out;
    /* Without these the framework's model keeps the English string: the user
       would see Czech and save English, or the next render would revert it. */
    try {
      el.dispatchEvent(new Event('input',  { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {}
  }

  function walk(root) {
    if (!root) return;
    /* re-checked per pass so switching sub-accounts in-app takes effect at once */
    if (!allowedHere()) return;

    if (root.nodeType === 3) {
      if (!blockedText(root.parentElement)) doTextNode(root);
      return;
    }
    if (root.nodeType !== 1) return;
    /* BLOCKED_ATTR is the looser list, so being blocked for attributes means
       being blocked for everything -- safe to bail on the whole subtree. */
    if (blockedAttr(root)) return;

    /* attributes on the root and everything under it (form controls included) */
    doAttrs(root);
    var withAttrs = root.querySelectorAll('[placeholder],[title],[aria-label]');
    for (var i = 0; i < withAttrs.length; i++) {
      if (!blockedAttr(withAttrs[i])) doAttrs(withAttrs[i]);
    }

    /* prefilled values (see TRANSLATE_PREFILLS above) */
    if (TRANSLATE_PREFILLS) {
      if (root.tagName === 'INPUT' || root.tagName === 'TEXTAREA') {
        if (!blockedAttr(root)) doValues(root);
      }
      var fields = root.querySelectorAll('input,textarea');
      for (var v = 0; v < fields.length; v++) {
        if (!blockedAttr(fields[v])) doValues(fields[v]);
      }
    }

    /* text nodes (form controls excluded -- their text is customer data) */
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return blockedText(n.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) doTextNode(n);
  }

  /* ---------- batched observer ------------------------------------------ */
  var queue = [];
  var scheduled = false;

  function flush() {
    scheduled = false;
    if (allowedHere()) injectPseudoCss();   /* cheap; restores it if removed */
    var batch = queue;
    queue = [];
    for (var i = 0; i < batch.length; i++) {
      try { walk(batch[i]); } catch (e) { /* never break the app */ }
    }
  }

  /* Scheduling notes (both of these were real bugs):
     1. Schedulers must be invoked on `window`. An unbound reference throws,
        and requestIdleCallback's 2nd argument is an options object, not a
        delay -- either mistake kills the observer silently.
     2. requestIdleCallback and requestAnimationFrame do NOT run in a
        background tab, and setTimeout is throttled to about once a minute
        there. Using them means the UI sits in English until the tab is
        focused. queueMicrotask always runs, so we use that. The work is
        cheap because we only walk the subtrees that actually changed. */
  var defer = typeof window.queueMicrotask === 'function'
    ? function (fn) { window.queueMicrotask(fn); }
    : function (fn) { Promise.resolve().then(fn); };

  function schedule(node) {
    queue.push(node);
    if (scheduled) return;
    scheduled = true;
    defer(flush);
  }

  function start() {
    if (allowedHere()) injectPseudoCss();
    walk(document.body);

    new MutationObserver(function (muts) {
      try {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'characterData') {
          schedule(m.target);
        } else if (m.type === 'attributes') {
          schedule(m.target);
        } else {
          for (var j = 0; j < m.addedNodes.length; j++) schedule(m.addedNodes[j]);
        }
      }
      } catch (e) { /* never let a mutation kill the layer */ }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });

    console.info('[cs-CZ] Czech UI layer ' + VERSION + ' active — ' +
      Object.keys(DICT).length + ' terms. Disable with ?nocs=1');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
