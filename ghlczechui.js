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

   v20 - based on Tom Keyser's edited file. His DICT additions are preserved
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
  var VERSION = 'v24';

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
    'Customizer': 'Přizpůsobení',
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


    /* ===================================================================
       v17 -- Payments, deep pass. Nine sub-screens plus the settings area:
       Invoices, Orders, Subscriptions, Transactions, Products, Coupons,
       Gift Cards, Payment Links, Documents & Contracts, and Settings.
       =================================================================== */

    /* --- section nav --- */
    'Get Started': 'Začínáme',
    'Invoices & Estimates': 'Faktury a cenové nabídky',
    'All Invoices': 'Všechny faktury',
    'Recurring Invoices': 'Opakované faktury',
    'Accounting Sync': 'Synchronizace účetnictví',
    'Documents & Contracts': 'Dokumenty a smlouvy',
    'All Documents & Contracts': 'Všechny dokumenty a smlouvy',
    'Abandoned Checkouts': 'Opuštěné košíky',
    'Payment Links': 'Platební odkazy',
    'Collections': 'Kolekce',
    'Inventory': 'Sklad',
    'Gift Cards': 'Dárkové poukazy',

    /* --- invoices --- */
    'Create and manage all invoices generated for your business': 'Vytvářejte a spravujte všechny faktury vaší firmy',
    'Connect at least one payment gateway to start receiving payments': 'Připojte alespoň jednu platební bránu, abyste mohli přijímat platby',
    'Integrate Payment Gateway': 'Připojit platební bránu',
    'Invoice Name': 'Název faktury',
    'Invoice Number': 'Číslo faktury',
    'Customer': 'Zákazník',
    'Issue Date': 'Datum vystavení',
    'No invoices to show yet': 'Zatím žádné faktury k zobrazení',
    'Export as CSV': 'Exportovat jako CSV',
    'Import as CSV': 'Importovat jako CSV',

    /* --- orders --- */
    'Track all order submissions in a single place': 'Sledujte všechny objednávky na jednom místě',
    'Items': 'Položky',
    'Order Date': 'Datum objednávky',
    'No orders to show yet': 'Zatím žádné objednávky k zobrazení',

    /* --- subscriptions --- */
    'Keep track of customer subscriptions created via order forms': 'Sledujte předplatná zákazníků z objednávkových formulářů',
    'Add Subscription': 'Přidat předplatné',
    'Provider': 'Poskytovatel',
    'No subscriptions to show yet': 'Zatím žádná předplatná k zobrazení',

    /* --- transactions --- */
    'Track customer payments at a single place': 'Sledujte platby zákazníků na jednom místě',
    'Transaction Date': 'Datum transakce',
    'No transactions to show yet': 'Zatím žádné transakce k zobrazení',

    /* --- products --- */
    'Create and Manage products for your business.': 'Vytvářejte a spravujte produkty své firmy.',
    'Import from Stripe': 'Importovat ze Stripe',
    'Create Product': 'Vytvořit produkt',
    'Image': 'Obrázek',
    'Product name': 'Název produktu',
    'Product Type': 'Typ produktu',
    'No products to show yet': 'Zatím žádné produkty k zobrazení',

    /* --- coupons --- */
    'Manage coupon discounts to increase conversion': 'Spravujte slevové kupóny pro vyšší konverzi',
    'Create Coupon': 'Vytvořit kupón',
    'Active': 'Aktivní',
    'Scheduled': 'Naplánováno',
    'Expired': 'Vypršelo',
    'Coupon name': 'Název kupónu',
    'Coupon code': 'Kód kupónu',
    'Discount': 'Sleva',
    'Redemption Count': 'Počet uplatnění',
    'No coupons found': 'Nebyly nalezeny žádné kupóny',

    /* --- gift cards --- */
    'Your all-in-one gift card hub for creation, distribution, and redemption.': 'Centrum pro tvorbu, distribuci a uplatnění dárkových poukazů.',
    'View Documentation': 'Zobrazit dokumentaci',
    'Create Gift Card': 'Vytvořit dárkový poukaz',
    'Looks Like Your Gift Card Shelf is Totally Empty.': 'Vypadá to, že nemáte žádné dárkové poukazy.',
    'Click Create Gift Card and start slingin\' digital delights!': 'Klikněte na Vytvořit dárkový poukaz a začněte.',

    /* --- payment links --- */
    'Create and Manage your Payment Links': 'Vytvářejte a spravujte platební odkazy',
    'Create New Payment Link': 'Vytvořit nový platební odkaz',
    'Link Url': 'URL odkazu',
    'Price': 'Cena',
    'Create Link': 'Vytvořit odkaz',

    /* --- documents & contracts --- */
    '(Proposals, Estimates & Contracts)': '(Nabídky, cenové nabídky a smlouvy)',
    'Manage and oversee all documents & contracts created for your business.': 'Spravujte všechny dokumenty a smlouvy vytvořené pro vaši firmu.',
    'Draft': 'Koncept',
    'Waiting for others': 'Čeká na ostatní',
    'Archived': 'Archivováno',
    'Date modified': 'Datum úpravy',
    'Value': 'Hodnota',
    'Time to close a deal!': 'Čas uzavřít obchod!',
    'No drafts in sight! Ready to create a fresh proposal?': 'Žádné koncepty! Chcete vytvořit novou nabídku?',

    /* --- payment settings --- */
    'Receipts': 'Účtenky',
    'Taxes': 'Daně',
    'Customer Notifications': 'Oznámení pro zákazníky',
    'Team Notifications': 'Oznámení pro tým',
    'Shipping & Delivery': 'Doprava a doručení',
    'Shipping and Delivery': 'Doprava a doručení',
    'Shipping Origin': 'Místo odeslání',
    'Shipping origin': 'Místo odeslání',
    'Miscellaneous Charges': 'Ostatní poplatky',
    'Payment Link Customization': 'Přizpůsobení platebního odkazu',
    'Enable automatic sales receipts for payments': 'Zapnout automatické účtenky k platbám',
    'Receipt prefix': 'Předpona účtenky',
    'Prefix to be used while generating all receipts': 'Předpona použitá při generování všech účtenek',
    'Receipt start number': 'Počáteční číslo účtenky',
    'From Name': 'Jméno odesílatele',
    'From Email': 'E-mail odesílatele',
    'Email Template': 'E-mailová šablona',
    'Add Notes / Terms': 'Přidat poznámky / podmínky',
    'Paragraph': 'Odstavec',
    'Payment settings navigation': 'Navigace nastavení plateb',
    'Receipts settings': 'Nastavení účtenek',
    'Tax settings': 'Nastavení daní',


    /* ===================================================================
       v18 -- Sites, deep pass: Funnels, Websites, Stores, Webinars, Forms,
       Surveys, Quizzes, Chat widget, QR codes, Client portal.
       Template gallery names (e.g. "Flooring Quote - Classic") are content,
       not chrome, and are left alone.
       =================================================================== */

    /* --- funnels --- */
    'Create and manage funnels to generate leads, appointments and receive payments.': 'Vytvářejte a spravujte trychtýře pro získávání leadů, schůzek a plateb.',
    'Start by creating a funnel': 'Začněte vytvořením trychtýře',
    'All your funnels and folders will live here.': 'Zde najdete všechny své trychtýře a složky.',

    /* --- websites --- */
    'Build websites to showcase your products and build a trusted brand.': 'Vytvářejte weby pro prezentaci produktů a budování důvěryhodné značky.',
    'New website': 'Nový web',
    'Search for websites': 'Hledat weby',
    'Website pages': 'Stránky webu',
    'Start by creating a website': 'Začněte vytvořením webu',
    'All your websites and folders will live here.': 'Zde najdete všechny své weby a složky.',

    /* --- stores --- */
    'Build an online store to showcase your products and sell across the globe.': 'Vytvořte online obchod pro prezentaci a prodej produktů po celém světě.',
    'New store': 'Nový obchod',
    'Build your store and sell globally in just 6 easy steps!': 'Vytvořte obchod a prodávejte celosvětově v 6 jednoduchých krocích!',
    'Use this personalized guide to get your store up and running.': 'Podle tohoto průvodce svůj obchod snadno spustíte.',
    'Complete setup': 'Dokončit nastavení',
    'Search for stores': 'Hledat obchody',
    'Store pages': 'Stránky obchodu',
    'Start by creating a store': 'Začněte vytvořením obchodu',
    'All your stores and folders will live here.': 'Zde najdete všechny své obchody a složky.',
    'Welcome to Stores!': 'Vítejte v Obchodech!',
    'Quick Store Setup:': 'Rychlé nastavení obchodu:',
    'Secure Payments:': 'Bezpečné platby:',
    'Accept payments securely with multiple gateways, integrated seamlessly into your store.': 'Přijímejte platby bezpečně přes několik bran integrovaných přímo v obchodě.',
    'Flexible Shipping & Tax Setup:': 'Flexibilní doprava a daně:',
    'Configure shipping rates, taxes, and delivery options based on your needs.': 'Nastavte sazby dopravy, daně a možnosti doručení podle svých potřeb.',
    'Ecommerce Automations:': 'E-commerce automatizace:',
    'Automate actions like order updates, abandoned cart reminders, and nurture customer.': 'Automatizujte aktualizace objednávek, připomínky opuštěných košíků a péči o zákazníky.',
    'Start Onboarding': 'Zahájit onboarding',

    /* --- webinars --- */
    'Webinar funnels': 'Webinářové trychtýře',
    'Create and manage webinar funnels': 'Vytvářejte a spravujte webinářové trychtýře',
    'New webinar funnel': 'Nový webinářový trychtýř',
    'Search for webinars': 'Hledat webináře',
    'Webinar pages': 'Stránky webináře',
    'Start by creating a webinar': 'Začněte vytvořením webináře',
    'Create and manage webinar funnels to register prospects and customers for your webinars!': 'Vytvářejte trychtýře pro registraci zájemců a zákazníků na vaše webináře!',

    /* --- forms --- */
    'Easy-peasy powerful forms': 'Snadné a výkonné formuláře',
    'Transform website visitors into valuable leads': 'Proměňte návštěvníky webu v cenné leady',
    'Easily build forms with our drag-and-drop interface': 'Snadno tvořte formuláře přetažením prvků',
    'Set up workflows to instantly engage users once they submit their forms': 'Nastavte postupy, které osloví uživatele hned po odeslání formuláře',
    'Access real-time analytics to measure and improve your forms\' performance': 'Sledujte analytiku v reálném čase a zlepšujte výkon formulářů',
    'Create form': 'Vytvořit formulář',
    'Try form preview': 'Vyzkoušet náhled formuláře',
    'Form features': 'Funkce formulářů',
    'Sell products': 'Prodávejte produkty',
    'Allow customers to make purchases directly through forms': 'Umožněte zákazníkům nakupovat přímo ve formuláři',
    'Extensive elements': 'Široká nabídka prvků',
    'Include dropdowns, checkboxes, radio buttons, image selectors, and more to cater to diverse input requirements': 'Rozbalovací seznamy, zaškrtávací pole, přepínače, výběr obrázků a další pro různé typy vstupů',
    'Math & scoring': 'Výpočty a skórování',
    'Utilize dynamic scoring to perform calculations based on user inputs': 'Využijte dynamické skórování pro výpočty podle vstupů uživatelů',
    'Use template': 'Použít šablonu',

    /* --- surveys --- */
    'Easy-peasy powerful surveys': 'Snadné a výkonné dotazníky',
    'Unlock insights and drive smarter decisions with surveys': 'Získejte poznatky a rozhodujte se chytřeji díky dotazníkům',
    'Easily build surveys with our drag-and-drop interface': 'Snadno tvořte dotazníky přetažením prvků',
    'Set up workflows to instantly engage both completed and abandoned survey users': 'Nastavte postupy pro dokončené i nedokončené dotazníky',
    'Access real-time analytics to measure and improve your surveys\' performance': 'Sledujte analytiku v reálném čase a zlepšujte výkon dotazníků',
    'Create survey': 'Vytvořit dotazník',
    'Try survey preview': 'Vyzkoušet náhled dotazníku',
    'Survey features': 'Funkce dotazníků',
    'Multi & one-question-at-a-time surveys': 'Dotazníky s více otázkami i po jedné',
    'Design surveys with flexibility: display several questions per slide or reveal one question at a time for a more engaging experience': 'Zobrazte více otázek najednou, nebo je odkrývejte po jedné pro poutavější průchod',

    /* --- quizzes --- */
    'Quizzes that do the thinking': 'Kvízy, které myslí za vás',
    'Turn curious visitors into qualified, scored leads': 'Proměňte zvědavé návštěvníky v kvalifikované leady se skóre',
    'Build interactive quizzes with drag-and-drop questions': 'Tvořte interaktivní kvízy přetažením otázek',
    'Show personalized results the instant a quiz is submitted': 'Zobrazte personalizované výsledky ihned po odeslání kvízu',
    'Trigger workflows automatically from every score and category': 'Spouštějte postupy automaticky podle skóre a kategorie',
    'Create quiz': 'Vytvořit kvíz',
    'Try quiz preview': 'Vyzkoušet náhled kvízu',
    'What\'s your main goal?': 'Jaký je váš hlavní cíl?',
    'Grow my email list': 'Rozšířit e-mailový seznam',
    'Book more sales calls': 'Domluvit více obchodních hovorů',
    'Qualify inbound leads': 'Kvalifikovat příchozí leady',
    'Category': 'Kategorie',
    'Growth': 'Růst',
    'Score': 'Skóre',
    'Overall only': 'Pouze celkové',
    'Configure score tiers': 'Nastavit úrovně skóre',
    'Edit or add score tiers': 'Upravit nebo přidat úrovně skóre',
    'Low': 'Nízké',
    'Medium': 'Střední',
    'High': 'Vysoké',
    '+ Add tier': '+ Přidat úroveň',
    'Default quiz': 'Výchozí kvíz',
    'Overall score': 'Celkové skóre',
    'Want to talk about your results?': 'Chcete probrat své výsledky?',
    'If you\'d like to learn more about your score and what it means for your business, let\'s jump on a call.': 'Chcete-li se dozvědět více o svém skóre a co znamená pro vaši firmu, domluvme si hovor.',
    'Book a call': 'Domluvit hovor',
    'Tiers': 'Úrovně',
    'Tier': 'Úroveň',
    'Range': 'Rozsah',
    'Quiz features': 'Funkce kvízů',
    'Scoring & categories': 'Skórování a kategorie',
    'Assign points to every answer and roll them into categories, so each response maps to a clear, qualified outcome': 'Přidělte body každé odpovědi a seskupte je do kategorií pro jasný a kvalifikovaný výsledek',
    'Subscribe': 'Odebírat',
    'Dynamic result pages': 'Dynamické stránky s výsledky',
    'Show personalized messages and a call-to-action for every category, based on every tier': 'Zobrazte personalizované zprávy a výzvu k akci pro každou kategorii a úroveň',
    'Question types': 'Typy otázek',
    'Single Choice': 'Jedna možnost',
    'Multiple Choice': 'Více možností',
    'Single Dropdown': 'Jeden rozbalovací seznam',
    'Extensive question types': 'Široká nabídka typů otázek',
    'Single & multiple choice, dropdowns, rating, file upload and more': 'Jedna i více možností, rozbalovací seznamy, hodnocení, nahrání souboru a další',

    /* --- chat widget --- */
    'Webchat for your website': 'Webový chat pro váš web',
    'Configure a chat widget to convert your website visitors to leads': 'Nastavte chatovací widget a proměňte návštěvníky webu v leady',
    'Updated on': 'Aktualizováno',
    'Chat type': 'Typ chatu',
    'Create your first chat widget': 'Vytvořte svůj první chatovací widget',
    'Give your chat widget a bold new look to enhance engagement!': 'Dejte svému chatovacímu widgetu nový vzhled a zvyšte zapojení!',

    /* --- QR codes --- */
    'Create effortless QRs': 'Snadno tvořte QR kódy',
    'Create custom and dynamic QR codes easily': 'Snadno vytvářejte vlastní a dynamické QR kódy',
    'Get detailed scan analytics and insights': 'Získejte podrobnou analytiku skenů',
    'Customize your QR code design and appearance': 'Přizpůsobte design a vzhled QR kódu',
    'Track who scans your QR codes in real-time': 'Sledujte v reálném čase, kdo skenuje vaše QR kódy',
    'Create QR code': 'Vytvořit QR kód',
    'QR types': 'Typy QR kódů',
    'Bulk QR codes': 'Hromadné QR kódy',
    'Create hundreds of QR codes in seconds with a single CSV upload. Perfect for handling large campaigns, teams, or projects at scale': 'Vytvořte stovky QR kódů během chvilky jedním CSV souborem. Ideální pro velké kampaně, týmy i projekty',
    'Track total and unique QR scans over time, view performance by QR type, and filter data by date - all in real-time': 'Sledujte celkové i unikátní skeny v čase, výkon podle typu QR a filtrujte podle data – vše v reálném čase',

    /* --- client portal --- */
    'Manage your client portal activities': 'Spravujte aktivity klientského portálu',
    'Live': 'Živě',
    'New client portal': 'Nový klientský portál',
    'Your clients can log in anytime to access courses and manage affiliate payouts.': 'Klienti se mohou kdykoli přihlásit ke kurzům a spravovat partnerské výplaty.',

    /* --- rich-text editor toolbar (aria labels) --- */
    'Font size': 'Velikost písma',
    'Font family': 'Rodina písma',
    'Add Line Height': 'Řádkování',
    'Font Color': 'Barva písma',
    'Format selected': 'Formátovat výběr',
    'Format all document': 'Formátovat celý dokument',
    'Align text to Left': 'Zarovnat vlevo',
    'Align text to Center': 'Zarovnat na střed',
    'Align text to Right': 'Zarovnat vpravo',
    'Justify': 'Do bloku',
    'Insert Table': 'Vložit tabulku',
    'toggle': 'přepnout',
    'carousel image': 'obrázek karuselu',


    /* ===================================================================
       v19 -- Calendars, deep pass on the two reachable screens.
       Settings > Calendars (/settings/calendars) is a CROSS-ORIGIN IFRAME,
       so the whole calendar configuration area - Calendars, Service
       calendars, Preferences, My availability, create-calendar, Rentals,
       Connections - cannot be translated. See the header note on iframes.
       =================================================================== */

    /* --- setup assistant --- */
    'Start by telling me what you do in the chat -- I\'ll build your calendar page in real time.': 'Začněte tím, že v chatu popíšete, co děláte – vaši rezervační stránku vytvořím v reálném čase.',
    'Start by telling me what you do in the chat — I\'ll build your calendar page in real time.': 'Začněte tím, že v chatu popíšete, co děláte – vaši rezervační stránku vytvořím v reálném čase.',
    'Guided setup — takes 2 min': 'Průvodce nastavením — 2 minuty',
    'Guided setup -- takes 2 min': 'Průvodce nastavením — 2 minuty',
    'Ask anything about calendars.': 'Zeptejte se na cokoli o kalendářích.',

    /* --- appointment list --- */
    'Meetings': 'Schůzky',
    'New appointment': 'Nová schůzka',
    'Cancelled': 'Zrušené',
    'Smart list': 'Chytrý seznam',
    'Customize list': 'Přizpůsobit seznam',
    'Manage columns': 'Spravovat sloupce',
    'Manage columns for the appointment list view': 'Spravovat sloupce seznamu schůzek',
    'Appointment time': 'Čas schůzky',
    'Appointment owner': 'Vlastník schůzky',
    'Invitees': 'Pozvaní',
    'Date added': 'Datum přidání',
    'Columns': 'Sloupce',
    'Discard changes': 'Zahodit změny',
    'Save as new': 'Uložit jako nový',
    'Enter list name': 'Zadejte název seznamu',
    'No upcoming appointments': 'Žádné nadcházející schůzky',
    'You don\'t have any upcoming appointments right now.': 'Momentálně nemáte žádné nadcházející schůzky.',
    'See all appointments': 'Zobrazit všechny schůzky',
    'No appointments yet – see how it works': 'Zatím žádné schůzky – podívejte se, jak to funguje',
    'No appointments yet - see how it works': 'Zatím žádné schůzky – podívejte se, jak to funguje',
    'Book a test appointment now to experience the booking process for yourself.': 'Vyzkoušejte si rezervační proces objednáním testovací schůzky.',
    'Book a test appointment': 'Objednat testovací schůzku',
    'No cancelled appointments': 'Žádné zrušené schůzky',
    'You don\'t have any cancelled appointments at the moment.': 'Momentálně nemáte žádné zrušené schůzky.',
    'Nothing to see here': 'Není co zobrazit',
    'There are no appointments matching your selected filters. Try updating or clearing the filters to see available data.': 'Vybraným filtrům neodpovídají žádné schůzky. Zkuste filtry upravit nebo vymazat.',
    'Modify filters': 'Upravit filtry',

    /* --- new appointment modal (calendars context) --- */
    'Appointment': 'Schůzka',
    'Blocked off time': 'Blokovaný čas',
    'No calendars found in the location.': 'V této lokalitě nebyly nalezeny žádné kalendáře.',
    '(eg) Appointment with Bob': '(např.) Schůzka s Bobem',
    'Showing slots in this timezone: (Account timezone)': 'Termíny v tomto časovém pásmu: (časové pásmo účtu)',
    'No slots available. Switch to Custom to book outside your availability.': 'Nejsou dostupné žádné termíny. Přepněte na Vlastní pro rezervaci mimo dostupnost.',
    'Select Contact': 'Vyberte kontakt',
    'No Contact found': 'Nebyl nalezen žádný kontakt',
    'Add new Contact': 'Přidat nový kontakt',
    'Search by name, email, or phone': 'Hledat podle jména, e-mailu nebo telefonu',


    /* ===================================================================
       v20 -- recovered by re-running every completed section through a
       CORRECTED harvest filter.

       The old filter tested "is pure ASCII" as a proxy for "still English",
       which silently skipped any English string containing an em/en dash,
       a curly quote, an arrow or an emoji. The filter now tests for the
       ABSENCE of Czech diacritics instead. These are the strings that
       oversight hid.
       =================================================================== */
    'Start with a template 🎬': 'Začněte se šablonou 🎬',
    'Our awesome features 🔥': 'Naše skvělé funkce 🔥',
    'Submit →': 'Odeslat →',
    'Create QR codes for websites, forms, SMS, calls, email, payments, and more — all in one place': 'Vytvářejte QR kódy pro weby, formuláře, SMS, hovory, e-maily, platby a další — vše na jednom místě',
    'Start selling online —easy setup, secure payments, flexible shipping, and powerful automations to grow your business.': 'Začněte prodávat online — snadné nastavení, bezpečné platby, flexibilní doprava a výkonné automatizace pro růst podnikání.',
    'Build and customize your store in minutes with easy-to-use builder — no coding required.': 'Vytvořte a přizpůsobte obchod během minut ve snadno ovladatelném editoru — bez programování.',
    'Company Info': 'Informace o firmě',

    /* --- conversations empty states --- */
    'No conversation selected': 'Není vybrána žádná konverzace',
    'Select a conversation from the list to view contact details.': 'Vyberte konverzaci ze seznamu pro zobrazení detailů kontaktu.',
    'View all conversations': 'Zobrazit všechny konverzace',
    'You don\'t have any unread Team inbox conversations right now.': 'Momentálně nemáte žádné nepřečtené konverzace v týmové schránce.',
    'View All Team inbox Conversations': 'Zobrazit všechny konverzace týmové schránky',

    /* --- OPPORTUNITIES: pipelines list ------------------------------- */
    'Use pipelines to track opportunities and sales progress across stages.': 'Pomocí obchodních kanálů sledujte příležitosti a průběh prodeje napříč fázemi.',
    'Create pipeline': 'Vytvořit obchodní kanál',
    'Pipeline name': 'Název obchodního kanálu',
    'Total stages': 'Počet fází',
    'No pipelines yet': 'Zatím žádné obchodní kanály',
    'Create a pipeline to manage your opportunities, measure progress, and close more deals efficiently.': 'Vytvořte obchodní kanál pro správu příležitostí, měření pokroku a efektivnější uzavírání obchodů.',
    'Learn more about pipelines': 'Více o obchodních kanálech',
    'Pipeline actions': 'Akce obchodního kanálu',

    /* --- OPPORTUNITIES: create/edit pipeline modal -------------------- */
    'Use a unique, descriptive name so you can find this pipeline later': 'Použijte jedinečný a výstižný název, abyste tento obchodní kanál později snadno našli',
    'Pipeline name is required': 'Název obchodního kanálu je povinný',
    'Use opportunity-level probability': 'Používat pravděpodobnost na úrovni příležitosti',
    'When enabled, each opportunity uses its own probability. When disabled, probability is based on the stage.': 'Když je zapnuto, každá příležitost používá vlastní pravděpodobnost. Když je vypnuto, pravděpodobnost se určuje podle fáze.',
    'Set pipeline display colors': 'Nastavit barvy zobrazení obchodního kanálu',
    'Choose how stage colors appear across your pipeline views': 'Zvolte, jak se barvy fází zobrazují v pohledech na obchodní kanál',
    'Stage name': 'Název fáze',
    'Default (no color)': 'Výchozí (bez barvy)',
    'Colored dot': 'Barevná tečka',
    'Background tint': 'Barevné pozadí',
    'Pipeline stages': 'Fáze obchodního kanálu',
    'Add stage': 'Přidat fázi',
    'Show in reports': 'Zobrazit v reportech',
    'Probability (%)': 'Pravděpodobnost (%)',
    'Funnel chart': 'Trychtýřový graf',
    'Select whether each stage should appear in your default dashboard. Disabling all stages hides the pipeline from the dashboard.': 'Zvolte, které fáze se mají zobrazovat na výchozí nástěnce. Vypnutím všech fází skryjete obchodní kanál z nástěnky.',
    /* HighLevel's own typo ("a opportunity") kept verbatim as the lookup key */
    'Probability is the likelihood that a opportunity will be marked as won.': 'Pravděpodobnost vyjadřuje, s jakou šancí bude příležitost označena jako vyhraná.',
    'Enter stage name': 'Zadejte název fáze',
    'Please Input': 'Zadejte hodnotu',
    /* placeholder example on the pipeline-name field (not a real record) */
    'Marketing pipeline': 'Marketingový kanál',
    /* default stage names pre-filled into the new-pipeline form */
    'New Lead': 'Nový zájemce',
    'Contacted': 'Kontaktováno',
    'Proposal Sent': 'Nabídka odeslána',
    'Closed': 'Uzavřeno',

    /* --- OPPORTUNITIES: bulk actions status filter -------------------- */
    'Processing': 'Zpracovává se',
    'Complete': 'Dokončeno',
    'Paused': 'Pozastaveno',
    'Queued': 'Ve frontě',

    /* --- date picker (global: bulk actions, reporting, filters) -------
       Two-letter weekday headers. These are whole-string matches, so a
       stray "We"/"Mo" text node elsewhere would also be rewritten -- in
       practice HighLevel never renders a bare two-letter word anywhere
       else, but that is the trade-off of a whole-string translator. */
    'Su': 'Ne', 'Mo': 'Po', 'Tu': 'Þt', 'We': 'St',
    'Th': 'Čt', 'Fr': 'Pá', 'Sa': 'So',
    /* Three-letter month abbreviations used by the month/year picker.
       NOTE: 'May' can only have ONE mapping. The picker shows abbreviated
       months, so it wins; the full-name reading of "May" is handled by the
       DATE_RE / STAMP date patterns, which match before the dictionary. */
    'Jan': 'led', 'Feb': 'úno', 'Mar': 'bře', 'Apr': 'dub',
    'Jun': 'čvn', 'Jul': 'čvc', 'Aug': 'srp', 'Sep': 'zář',
    'Oct': 'říj', 'Nov': 'lis', 'Dec': 'pro',
    'Month': 'Měsíc',
    'Year': 'Rok',

    /* --- landmark / decorative image labels (screen readers) ---------- */
    'header': 'záhlaví',
    'footer': 'zápatí',

    /* ===================================================================
       OPPORTUNITIES -- deep pass (v22). Reached with a throwaway pipeline
       in the DUMMY sub-account; everything below is default system copy.
       =================================================================== */

    /* --- pipeline row menu + its dialogs ------------------------------ */
    'Copy to sub-accounts': 'Kopírovat do sub-účtů',
    'Manage permissions': 'Spravovat oprávnění',
    'Copy link': 'Kopírovat odkaz',
    'Move to position': 'Přesunout na pozici',
    'Link copied!': 'Odkaz zkopírován!',
    'Edit Pipeline': 'Upravit obchodní kanál',
    'Reorder pipeline': 'Změnit pořadí obchodních kanálů',
    'Select a pipeline': 'Vyberte obchodní kanál',
    'New pipeline': 'Nový obchodní kanál',

    /* --- pipeline sharing & permissions panel ------------------------- */
    /* HighLevel splits this sentence around the pipeline name, so it is two
       separate text nodes; the Czech is worded to read correctly either way. */
    'Set who can view or edit the': 'Nastavte, kdo může zobrazovat nebo upravovat obchodní kanál',
    'pipeline. Admins always have full access.': '– správci mají vždy plný přístup.',
    'Access settings': 'Nastavení přístupu',
    'Share with all users': 'Sdílet se všemi uživateli',
    'Share with selected users': 'Sdílet s vybranými uživateli',
    'Exclude selected users': 'Vyloučit vybrané uživatele',
    'View only': 'Pouze zobrazení',
    'No access': 'Bez přístupu',
    'Add users': 'Přidat uživatele',
    'Select users': 'Vyberte uživatele',
    'Permissions': 'Oprávnění',
    'No users selected': 'Nejsou vybráni žádní uživatelé',
    'Add users to control who can access and manage this pipeline and its opportunities.': 'Přidejte uživatele a určete, kdo má přístup k tomuto obchodnímu kanálu a jeho příležitostem a kdo je může spravovat.',
    'No Data': 'Žádná data',

    /* --- unsaved-changes dialogs (used across the whole app) ---------- */
    'Do you want to discard change(s)?': 'Chcete změny zahodit?',
    'Keep editing': 'Pokračovat v úpravách',
    'If you discard changes, you will lose all the information you had entered.': 'Pokud změny zahodíte, přijdete o všechny zadané informace.',

    /* --- copy pipeline to sub-accounts -------------------------------- */
    'Stages and chart visibility will be copied.': 'Zkopírují se fáze a viditelnost grafů.',
    'Records, custom fields, permissions, smart tags, and automations won’t be copied.': 'Záznamy, vlastní pole, oprávnění, chytré štítky a automatizace se nezkopírují.',
    'Select sub-accounts': 'Vyberte sub-účty',
    'Search sub-accounts': 'Hledat sub-účty',
    'Copy': 'Kopírovat',
    'You can select up to 25 sub-accounts': 'Můžete vybrat až 25 sub-účtů',

    /* --- duplicate pipeline ------------------------------------------- */
    'Duplicate pipeline': 'Duplikovat obchodní kanál',
    'Stages, permissions, colored smart tags, and chart visibility will be copied.': 'Zkopírují se fáze, oprávnění, barevné chytré štítky a viditelnost grafů.',
    'Records, automations, reports, and custom fields won’t be copied.': 'Záznamy, automatizace, reporty a vlastní pole se nezkopírují.',

    /* --- delete pipeline ---------------------------------------------- */
    'Delete pipeline': 'Smazat obchodní kanál',
    'This action will remove the selected pipeline and:': 'Tato akce odstraní vybraný obchodní kanál a:',
    'Permanently remove all opportunities and data inside this pipeline': 'Trvale odstraní všechny příležitosti a data v tomto obchodním kanálu',
    'Stop any active campaigns and workflows linked to it': 'Zastaví všechny aktivní kampaně a workflow, které jsou s ním propojené',
    /* the confirmation word must stay the literal English DELETE or the
       form can never be submitted -- only the instruction is translated */
    'Type “DELETE” to confirm': 'Pro potvrzení napište „DELETE“',
    'Enter DELETE': 'Zadejte DELETE',
    'This action cannot be undone.': 'Tuto akci nelze vrátit zpět.',

    /* --- opportunities board ------------------------------------------ */
    'Try updating or clearing your filters to find opportunities.': 'Zkuste upravit nebo vymazat filtry, abyste našli příležitosti.',
    'Empty state illustration': 'Ilustrace prázdného stavu',
    'Restore opportunities': 'Obnovit příležitosti',
    'Manage smart lists': 'Spravovat chytré seznamy',
    'Dashboard insights': 'Přehledy na nástěnce',
    'Board view': 'Zobrazení tabule',
    'Board': 'Tabule',
    'View opportunities as cards in each stage.': 'Zobrazit příležitosti jako karty v jednotlivých fázích.',
    'View opportunities in a table format.': 'Zobrazit příležitosti v tabulce.',

    /* --- manage views -------------------------------------------------- */
    'Manage views': 'Spravovat zobrazení',
    'Manage where views appear and which views are set as default.': 'Spravujte, kde se zobrazení objevují a která jsou nastavena jako výchozí.',
    'View': 'Zobrazení',
    'Search views': 'Hledat zobrazení',
    'No smart views have been created yet.': 'Zatím nebyla vytvořena žádná chytrá zobrazení.',
    'Create a smart view to organize and manage your opportunities.': 'Vytvořte chytré zobrazení pro uspořádání a správu vašich příležitostí.',

    /* --- dashboard insights modal ------------------------------------- */
    'Add relevant insights to your dashboard': 'Přidejte na nástěnku relevantní přehledy',
    'Select a dashboard and choose widgets tailored to your needs. Widgets will be added instantly for deeper insights.': 'Vyberte nástěnku a zvolte widgety podle svých potřeb. Widgety se přidají okamžitě a poskytnou hlubší přehled.',
    'Select dashboard': 'Vyberte nástěnku',
    'Selected widgets': 'Vybrané widgety',
    'Opportunity count': 'Počet příležitostí',
    'Opened Opportunities': 'Otevřené příležitosti',
    'Won Opportunities': 'Vyhrané příležitosti',
    'Lost Opportunities by reason': 'Prohrané příležitosti podle důvodu',
    'Opportunity counts over time': 'Počet příležitostí v čase',
    'Opportunity revenue over time': 'Tržby z příležitostí v čase',
    'Won Opportunity value': 'Hodnota vyhraných příležitostí',
    'Lost Opportunity value': 'Hodnota prohraných příležitostí',
    'Won Opportunities value this month (for you)': 'Hodnota vyhraných příležitostí tento měsíc (vaše)',
    'Won Opportunities value this month': 'Hodnota vyhraných příležitostí tento měsíc',
    'Confirm & add': 'Potvrdit a přidat',

    /* --- advanced filters --------------------------------------------- */
    'Is any of': 'Je některé z',
    'Is none of': 'Není žádné z',
    'Add nested filter': 'Přidat vnořený filtr',
    'Add filter': 'Přidat filtr',
    'Remove filter': 'Odebrat filtr',
    'Sort by Select field': 'Řadit podle – vyberte pole',

    /* --- opportunity fields (filter picker, sort, card builder) -------- */
    'Last stage change date': 'Datum poslední změny fáze',
    'Last status change date': 'Datum poslední změny stavu',
    'Created on': 'Vytvořeno dne',
    'Expected Close Date': 'Očekávané datum uzavření',
    'Forecast Slippage Count': 'Počet posunů prognózy',
    'Forecast Slippage (Days)': 'Posun prognózy (dny)',
    'Opportunity won on': 'Příležitost vyhrána dne',
    'Opportunity lost on': 'Příležitost prohrána dne',
    'Company (Associated Company)': 'Společnost (přiřazená společnost)',
    'Company (Associated Companies)': 'Společnost (přiřazené společnosti)',
    'Days since last stage change': 'Dní od poslední změny fáze',
    'Days since last status change': 'Dní od poslední změny stavu',
    'Days since last update': 'Dní od poslední aktualizace',
    'Next task due date': 'Termín dalšího úkolu',
    'Days until next task': 'Dní do dalšího úkolu',
    'Engagement score': 'Skóre zapojení',
    'Days until next appointment': 'Dní do další schůzky',
    'Contact’s email': 'E-mail kontaktu',
    'Contact’s phone': 'Telefon kontaktu',
    "Contact's email": 'E-mail kontaktu',
    "Contact's phone": 'Telefon kontaktu',
    'Opportunity owner': 'Vlastník příležitosti',
    'Smart tags': 'Chytré štítky',
    'Other details': 'Další podrobnosti',
    'Primary contact details': 'Údaje hlavního kontaktu',

    /* --- customize card panel ----------------------------------------- */
    'Customize card': 'Přizpůsobit kartu',
    'Card preview': 'Náhled karty',
    'Card layout': 'Rozvržení karty',
    'Compact': 'Kompaktní',
    'Unlabeled': 'Bez popisků',
    'Stale': 'Zastaralé',
    'Business name:': 'Název firmy:',
    'Source:': 'Zdroj:',
    'Value:': 'Hodnota:',
    'Lost reason:': 'Důvod prohry:',
    'Contact:': 'Kontakt:',
    /* demo values inside the card preview (not customer data) */
    'Referral': 'Doporučení',
    'Budget Constraints': 'Rozpočtová omezení',
    'You can only add up to 8 fields.': 'Můžete přidat maximálně 8 polí.',
    'Count for each action will be shown in the card wherever applicable.': 'Počet u každé akce se zobrazí na kartě, kde to dává smysl.',
    'Unread conversations': 'Nepřečtené konverzace',
    'Next confirmed appointment': 'Další potvrzená schůzka',

    /* --- add-opportunity modal ---------------------------------------- */
    'Add new opportunity': 'Přidat novou příležitost',
    'Create new opportunity by filling in details and selecting a contact': 'Vytvořte novou příležitost vyplněním údajů a výběrem kontaktu',
    'Primary contact name': 'Jméno hlavního kontaktu',
    'Primary email': 'Hlavní e-mail',
    'Enter email': 'Zadejte e-mail',
    'Primary phone': 'Hlavní telefon',
    'Enter phone': 'Zadejte telefon',
    'Enter opportunity name': 'Zadejte název příležitosti',
    'Add followers': 'Přidat odběratele',
    'Enter business name': 'Zadejte název firmy',
    'Enter source': 'Zadejte zdroj',
    'Abandon': 'Opuštěno',

    /* --- smart-list side panel ---------------------------------------- */
    'Show in': 'Zobrazit v',
    'Default view': 'Výchozí zobrazení',
    'None': 'Žádné',
    'Selected pipelines': 'Vybrané obchodní kanály',
    'Choose one or more pipelines.': 'Vyberte jeden nebo více obchodních kanálů.',
    'This only controls where the view appears. Filters, fields, and sorting stay the same.': 'Toto určuje pouze, kde se zobrazení objeví. Filtry, pole a řazení zůstávají stejné.',

    /* --- settings > audit logs (reached from "Restore opportunities";
           the full Module dropdown is deferred to the Settings pass) ---- */
    'Track and monitor all system activities, user actions, and data changes across your account': 'Sledujte a monitorujte veškerou aktivitu systému, akce uživatelů a změny dat napříč vaším účtem',
    'Exports': 'Exporty',
    'Search by Document ID': 'Hledat podle ID dokumentu',
    'Module': 'Modul',
    'Action': 'Akce',
    'Done By': 'Provedl',
    'No audit logs found': 'Nebyly nalezeny žádné protokoly auditu',
    'No audit logs match your current filters': 'Žádné protokoly auditu neodpovídají aktuálním filtrům',
    'Action - All': 'Akce – vše',
    'Module - All': 'Modul – vše',
    'Deleted': 'Smazáno',
    'Deleted (Contact Merge)': 'Smazáno (sloučení kontaktů)',
    'Restored': 'Obnoveno',
    'Tag Added': 'Štítek přidán',
    'Tag Removed': 'Štítek odebrán',
    'Updated (Contact Merge)': 'Aktualizováno (sloučení kontaktů)',
    'Agency': 'Agentura',
    'AI Plan': 'AI plán',
    'API Key': 'API klíč',
    'Association': 'Vazba',
    'Calendar Event': 'Událost kalendáře',
    'Calendar Integrations': 'Integrace kalendáře',
    'Tag category': 'Kategorie štítků',
    'Task': 'Úkol',
    'URL Redirects': 'Přesměrování URL',

    /* ===================================================================
       MARKETING -- deep pass (v23).
       NOT COVERABLE (cross-origin iframes, confirmed by contentDocument):
         Marketing > E-maily      -> email-home-prod.leadconnectorhq.com
         Marketing > Spravce partneru (all 7 sub-routes)
                                  -> client-app-affiliate-manager.leadconnectorhq.com
       =================================================================== */

    /* --- social planner ------------------------------------------------ */
    'One unified platform to manage all your social media. Create content once and publish it automatically across Facebook, Instagram, LinkedIn, TikTok, and more.': 'Jedna platforma pro správu všech vašich sociálních sítí. Vytvořte obsah jednou a publikujte jej automaticky na Facebooku, Instagramu, LinkedInu, TikToku a dalších.',
    'Major networks': 'Hlavní sítě',
    '+ Connect': '+ Připojit',
    'Connect': 'Připojit',
    'Import and schedule multiple posts at once using CSV files for efficient content management': 'Importujte a naplánujte více příspěvků najednou pomocí CSV souborů pro efektivní správu obsahu',
    'Create a library of timeless content that automatically recycles to keep your feed fresh': 'Vytvořte knihovnu nadčasového obsahu, který se automaticky opakuje a udržuje váš feed svěží',
    'Set up posts that automatically repeat on a schedule to maintain consistent engagement': 'Nastavte příspěvky, které se automaticky opakují podle plánu a udržují stálé zapojení',
    'Automatically create and share posts from your favorite RSS feeds to stay current': 'Automaticky vytvářejte a sdílejte příspěvky z vašich oblíbených RSS kanálů a zůstaňte v obraze',
    '9:00 AM · Tue & Thu': '9:00 · út a čt',

    /* --- text snippets (shared by Marketing and Conversations) --------- */
    'Create snippets to quickly insert predefined content into messages for faster, consistent communication.': 'Vytvářejte úryvky pro rychlé vkládání předdefinovaného obsahu do zpráv – pro rychlejší a konzistentní komunikaci.',
    'New Snippet': 'Nový úryvek',
    'All Snippets': 'Všechny úryvky',
    'Body': 'Obsah',
    'Folder': 'Složka',
    'Date Updated': 'Datum aktualizace',
    'No data available!': 'Nejsou k dispozici žádná data!',
    'Add Text Snippet': 'Přidat textový úryvek',
    'Add Email Snippet': 'Přidat e-mailový úryvek',
    'Create Text Snippet': 'Vytvořit textový úryvek',
    'Create Email Snippet': 'Vytvořit e-mailový úryvek',
    'Create and reuse text snippets for quick access via shortcuts. Save your go-to phrases and speed up your workflow.': 'Vytvářejte a znovu používejte textové úryvky s rychlým přístupem přes zkratky. Uložte si oblíbené fráze a zrychlete svou práci.',
    'Create and reuse email snippets for quick access via shortcuts. Save your go-to phrases and speed up your workflow.': 'Vytvářejte a znovu používejte e-mailové úryvky s rychlým přístupem přes zkratky. Uložte si oblíbené fráze a zrychlete svou práci.',
    'Enter Snippet Name': 'Zadejte název úryvku',
    'Enter Subject': 'Zadejte předmět',
    'Snippets Body': 'Obsah úryvku',
    'Add Attachment': 'Přidat přílohu',
    'Add file through URL': 'Přidat soubor přes URL',
    'Enter URL': 'Zadejte URL',
    'Test Snippet': 'Otestovat úryvek',
    'Test Email Snippet': 'Otestovat e-mailový úryvek',
    'From Email Address': 'Odesílatel (e-mail)',
    'To Email Address': 'Příjemce (e-mail)',
    'Send Test': 'Odeslat test',
    'Create new folder': 'Vytvořit novou složku',
    'Enter a folder name': 'Zadejte název složky',

    /* --- emoji picker + rich-text toolbar (every editor in the app) ---- */
    'Search emoji': 'Hledat emoji',
    'Recently Used': 'Naposledy použité',
    'Smiles & People': 'Smajlíci a lidé',
    'Animals & Nature': 'Zvířata a příroda',
    'Food & Drink': 'Jídlo a pití',
    'Travel & Places': 'Cestování a místa',
    'Symbols': 'Symboly',
    'Flags': 'Vlajky',
    'Background Color': 'Barva pozadí',
    'Bullet List': 'Odrážkový seznam',
    'Ordered List': 'Číslovaný seznam',
    'Strikethrough': 'Přeškrtnutí',
    'Superscript': 'Horní index',
    'Subscript': 'Dolní index',
    'Inline Code Block': 'Řádkový kód',
    'Code Block': 'Blok kódu',
    'Block Quote': 'Citace',
    'Embed Link': 'Vložit odkaz',
    'Embed Image': 'Vložit obrázek',
    'Heading 1': 'Nadpis 1', 'Heading 2': 'Nadpis 2', 'Heading 3': 'Nadpis 3',
    'Heading 4': 'Nadpis 4', 'Heading 5': 'Nadpis 5', 'Heading 6': 'Nadpis 6',

    /* --- countdown timers ---------------------------------------------- */
    'Countdown Timer': 'Odpočet',
    'Create and manage your countdown timer templates': 'Vytvářejte a spravujte šablony odpočtů',
    'Search timer': 'Hledat odpočet',
    'End Date/Duration': 'Datum konce / trvání',
    'Create your first countdown timer': 'Vytvořte svůj první odpočet',
    'Time’s not ticking yet! Let’s set your first countdown timer.': 'Čas ještě neběží! Nastavme váš první odpočet.',
    "Time's not ticking yet! Let's set your first countdown timer.": 'Čas ještě neběží! Nastavme váš první odpočet.',
    'Expiry status': 'Stav vypršení',
    'Fixed': 'Pevný',
    'Recurring': 'Opakující se',
    'Dynamic': 'Dynamický',
    'Select a template to get started': 'Vyberte šablonu a začněte',
    'Select a template': 'Vyberte šablonu',
    'Minimalist': 'Minimalistický',
    'Simple Timer': 'Jednoduchý odpočet',
    'Progress Timer': 'Odpočet s průběhem',
    'Timer Ring': 'Kruhový odpočet',
    'Countdown Wheel': 'Kolo odpočtu',
    'Deadline Dial': 'Ciferník termínu',
    'Round Grid Timer': 'Kulatý mřížkový odpočet',
    'Array View Timer': 'Odpočet v poli',
    'Square Box Timer': 'Čtvercový odpočet',
    'Continue with this template ->': 'Pokračovat s touto šablonou ->',
    'Untitled countdown timer': 'Nepojmenovaný odpočet',
    'Copy code': 'Kopírovat kód',
    'General': 'Obecné',
    'Styling': 'Vzhled',
    'Timer type': 'Typ odpočtu',
    'Timer end date': 'Datum konce odpočtu',
    /* NOTE: the word "on" that follows this string is left in English on
       purpose -- see the deliberate-skip list in the v23 commit message. */
    'The subscriber’s timer will end at': 'Odpočet odběratele skončí v',
    "The subscriber's timer will end at": 'Odpočet odběratele skončí v',
    'Adapt to Contact’s Time Zone': 'Přizpůsobit časovému pásmu kontaktu',
    "Adapt to Contact's Time Zone": 'Přizpůsobit časovému pásmu kontaktu',
    'Active timer leads to link': 'Aktivní odpočet vede na odkaz',
    'Expired timer leads to link': 'Vypršelý odpočet vede na odkaz',
    'Select Date and Time': 'Vyberte datum a čas',
    'Automatically adapts end time to the Contact’s local time zone for a personalized experience.': 'Automaticky přizpůsobí čas konce místnímu časovému pásmu kontaktu pro osobnější zážitek.',
    "Automatically adapts end time to the Contact's local time zone for a personalized experience.": 'Automaticky přizpůsobí čas konce místnímu časovému pásmu kontaktu pro osobnější zážitek.',
    'Page users will land on after clicking the timer when it’s active.': 'Stránka, na kterou uživatelé přejdou po kliknutí na aktivní odpočet.',
    "Page users will land on after clicking the timer when it's active.": 'Stránka, na kterou uživatelé přejdou po kliknutí na aktivní odpočet.',
    'Page users will land on when the timer expires.': 'Stránka, na kterou uživatelé přejdou po vypršení odpočtu.',
    'Change template': 'Změnit šablonu',
    'Labels': 'Popisky',
    'Days': 'Dny',
    'Hours': 'Hodiny',
    'Minutes': 'Minuty',
    'Seconds': 'Sekundy',
    'Visible': 'Viditelné',
    'Hidden': 'Skryté',
    'Typography': 'Typografie',
    'Counter font': 'Písmo počítadla',
    'Label font': 'Písmo popisku',
    'Corner Radius': 'Zaoblení rohů',
    'Color options': 'Možnosti barev',
    'Counter color': 'Barva počítadla',
    'Label color': 'Barva popisku',
    'Separator color': 'Barva oddělovače',
    'Transparent background (Coming soon)': 'Průhledné pozadí (již brzy)',
    'Expiration image': 'Obrázek po vypršení',
    'Image URL': 'URL obrázku',
    'Padding': 'Vnitřní okraj',
    'Margin': 'Vnější okraj',
    'Hide Timer in Apple Mail': 'Skrýt odpočet v Apple Mail',
    'Slider Handle': 'Táhlo posuvníku',
    'Template preview': 'Náhled šablony',
    'Countdown timer preview': 'Náhled odpočtu',
    'Normal': 'Normální',
    'Bolder': 'Tučnější',
    'Lighter': 'Tenčí',
    'Units of time to indicate the remaining duration': 'Jednotky času udávající zbývající dobu',
    'Edit the font styles used in the timer.': 'Upravte styly písma použité v odpočtu.',
    'Edit the colors used in the timer': 'Upravte barvy použité v odpočtu',
    'Replace the timer with this image in your emails when it expires.': 'Po vypršení nahradí odpočet ve vašich e-mailech tímto obrázkem.',

    /* --- trigger links --------------------------------------------------- */
    'Trigger links allow you to put links inside SMS messages and emails, which allow you to track specific customer actions and trigger events based on when the link is clicked.': 'Spouštěcí odkazy umožňují vkládat odkazy do SMS zpráv a e-mailů, sledovat konkrétní akce zákazníků a spouštět události podle toho, kdy na odkaz kliknou.',
    'Link': 'Odkaz',
    'Analyze': 'Analyzovat',
    'Link Key': 'Klíč odkazu',
    'No links available': 'Nejsou dostupné žádné odkazy',
    'Add Trigger Link': 'Přidat spouštěcí odkaz',
    'Enter Link URL': 'Zadejte URL odkazu',
    'Index': 'Pořadí',
    'Clicks': 'Kliknutí',
    'No records found': 'Nebyly nalezeny žádné záznamy',
    'Refresh Analytics Data': 'Obnovit data analytiky',

    /* --- brand boards ---------------------------------------------------- */
    'Personalize your texts, colors, and other brand essentials': 'Přizpůsobte si texty, barvy a další prvky vaší značky',
    'Global settings': 'Globální nastavení',
    'Design Kit': 'Designová sada',
    'Brand Voice': 'Hlas značky',
    'Customize your brand’s visual identity by managing logos, colors, and design elements for consistent communication across all platforms.': 'Přizpůsobte vizuální identitu své značky správou log, barev a designových prvků pro konzistentní komunikaci na všech platformách.',
    "Customize your brand's visual identity by managing logos, colors, and design elements for consistent communication across all platforms.": 'Přizpůsobte vizuální identitu své značky správou log, barev a designových prvků pro konzistentní komunikaci na všech platformách.',
    'Add Design Kit': 'Přidat designovou sadu',
    'Create your first Brand Board': 'Vytvořte svou první nástěnku značky',
    'Create a new Brand Board with a splash of color': 'Vytvořte novou nástěnku značky s trochou barvy',
    'Define your brand’s tone and messaging guidelines to maintain consistency in all written communication': 'Definujte tón a zásady sdělení vaší značky pro konzistenci ve veškeré písemné komunikaci',
    "Define your brand's tone and messaging guidelines to maintain consistency in all written communication": 'Definujte tón a zásady sdělení vaší značky pro konzistenci ve veškeré písemné komunikaci',
    'Add Brand Voice': 'Přidat hlas značky',
    'Define your Brand Voice': 'Definujte hlas své značky',
    'Set your tone and style to ensure consistent messaging across all channels': 'Nastavte tón a styl pro konzistentní sdělení napříč všemi kanály',
    'Create new Brand Voice': 'Vytvořit nový hlas značky',
    'Define tone and style for your brand.': 'Definujte tón a styl pro vaši značku.',
    'Start from scratch': 'Začít od nuly',
    'Create manually from scratch': 'Vytvořit ručně od nuly',
    'Text or URL': 'Text nebo URL',
    'Auto-fill using scraped data': 'Automaticky vyplnit z načtených dat',
    'UI Modal': 'Dialogové okno',
    'Clone': 'Klonovat',
    'Delete confirmation': 'Potvrzení smazání',
    'Are you sure to delete this Brand Board?': 'Opravdu chcete tuto nástěnku značky smazat?',
    'Centralized configurations that, when modified, can impact existing designs or linked assets.': 'Centrální nastavení, jejichž změna může ovlivnit stávající návrhy nebo propojené prvky.',
    'Custom fonts': 'Vlastní písma',
    'Custom colors': 'Vlastní barvy',
    'Search fonts': 'Hledat písma',
    'Search colors': 'Hledat barvy',
    'Google Fonts may not display in all email clients. A fallback font will be used when needed.': 'Google Fonts se nemusí zobrazit ve všech e-mailových klientech. V případě potřeby se použije záložní písmo.',
    'Upload fonts': 'Nahrát písma',
    'Upload font file': 'Nahrát soubor s písmem',
    'No custom fonts uploaded yet': 'Zatím nebyla nahrána žádná vlastní písma',
    'Custom fonts are fonts you upload to match and maintain your brand’s unique typography.': 'Vlastní písma jsou písma, která nahrajete, aby odpovídala jedinečné typografii vaší značky.',
    "Custom fonts are fonts you upload to match and maintain your brand's unique typography.": 'Vlastní písma jsou písma, která nahrajete, aby odpovídala jedinečné typografii vaší značky.',
    'No global custom colors yet': 'Zatím žádné globální vlastní barvy',
    'Start adding colors to keep your designs in sync.': 'Začněte přidávat barvy, aby vaše návrhy zůstaly jednotné.',
    'Create your Brand Board': 'Vytvořte svou nástěnku značky',
    'Start by importing your brand using your website URL, or choose a preset style to begin.': 'Začněte importem své značky pomocí URL webu, nebo zvolte přednastavený styl.',
    'Pull in your brand colors, logo, and fonts instantly using your website URL.': 'Okamžitě načtěte barvy, logo a písma své značky pomocí URL vašeho webu.',
    'Import Brand Kit': 'Importovat sadu značky',
    'Or choose from below': 'Nebo vyberte z níže uvedených',
    'Choose': 'Vybrat',
    'Start from blank': 'Začít s prázdnou',
    'Earth': 'Země',
    'Lagoon': 'Laguna',
    'Elements': 'Živly',
    'Tender': 'Něžná',
    'Desert': 'Poušť',
    'Dusk': 'Soumrak',
    'Coffee': 'Káva',
    'Template thumbnail': 'Náhled šablony',

    /* --- brand voice builder -------------------------------------------- */
    'New Brand Voice': 'Nový hlas značky',
    'Set as default': 'Nastavit jako výchozí',
    'Save Brand Voice': 'Uložit hlas značky',
    'Business info': 'Informace o firmě',
    'Enter your brand name here': 'Zde zadejte název své značky',
    'Name of the brand, company or account': 'Název značky, firmy nebo účtu',
    'Type of business': 'Typ podnikání',
    'Select business type': 'Vyberte typ podnikání',
    'Pick a niche': 'Vyberte obor',
    'e.g., restaurant, food delivery, catering, etc.': 'např. restaurace, rozvoz jídla, catering apod.',
    'Company website': 'Web firmy',
    'Location and contact info': 'Adresa a kontaktní údaje',
    'Company email': 'E-mail firmy',
    'Company address': 'Adresa firmy',
    'Enter address': 'Zadejte adresu',
    'Phone number': 'Telefonní číslo',
    'Business hours': 'Otevírací doba',
    'Monday - Friday 8 AM - 5 PM, Saturday - Sunday closed': 'Pondělí – pátek 8:00–17:00, sobota a neděle zavřeno',
    'Brand communication and personality': 'Komunikace a osobnost značky',
    'Tone of voice': 'Tón komunikace',
    'Professional': 'Profesionální',
    'Friendly': 'Přátelský',
    'Trustworthy': 'Důvěryhodný',
    'Confident': 'Sebevědomý',
    'Engaging': 'Poutavý',
    'Empathetic': 'Empatický',
    'Innovative': 'Inovativní',
    'Choose a tone that aligns with how you want your audience to perceive your brand': 'Zvolte tón, který odpovídá tomu, jak má vaše publikum vnímat vaši značku',
    'Brand identity and market positioning': 'Identita značky a pozice na trhu',
    'Target audience': 'Cílové publikum',
    'Describe your ideal audience (e.g., young professionals, small business owners)': 'Popište své ideální publikum (např. mladí profesionálové, majitelé malých firem)',
    'Think about who your brand is primarily speaking to': 'Zamyslete se, ke komu vaše značka primárně mluví',
    'Customer pain points': 'Bolestivá místa zákazníků',
    'Describe what problems or frustrations does your audience face?': 'Popište, jaké problémy nebo frustrace vaše publikum řeší.',
    'Identify key challenges that your brand helps solve': 'Určete klíčové problémy, které vaše značka pomáhá řešit',
    'Brand promise': 'Slib značky',
    'Summarize how your brand benefits your audience': 'Shrňte, jaký přínos má vaše značka pro publikum',
    'Focus on the unique value you provide to your audience': 'Zaměřte se na jedinečnou hodnotu, kterou publiku přinášíte',
    'Brand values': 'Hodnoty značky',
    'Highlight what your brand opposes (e.g., poor customer service, inefficiency)': 'Zdůrazněte, proti čemu se vaše značka staví (např. špatná zákaznická podpora, neefektivita)',
    'Identify something your brand does not compromise on': 'Určete něco, v čem vaše značka nedělá kompromisy',
    'What does your brand do?': 'Co vaše značka dělá?',
    'What do you offer? Share a bit about the services or products your brand provides.': 'Co nabízíte? Napište něco o službách nebo produktech vaší značky.',
    'Focus on your brand’s core function': 'Zaměřte se na hlavní funkci vaší značky',
    "Focus on your brand's core function": 'Zaměřte se na hlavní funkci vaší značky',
    'What makes you better than competitors?': 'Čím jste lepší než konkurence?',
    'Highlight your biggest advantage (e.g., better pricing, superior customer service, exclusive features)': 'Zdůrazněte svou největší výhodu (např. lepší ceny, špičková zákaznická podpora, exkluzivní funkce)',
    'Why should customers choose you over others?': 'Proč by si zákazníci měli vybrat právě vás?',
    'Unique selling proposition': 'Jedinečná prodejní nabídka',
    'State what makes your brand stand out': 'Uveďte, čím se vaše značka odlišuje',
    'Define what sets you apart in the market': 'Definujte, čím se na trhu odlišujete',
    'Risks of inaction': 'Rizika nečinnosti',
    'What happens if your audience doesn’t take action? (e.g., lost time, higher costs, missed opportunities)': 'Co se stane, když vaše publikum nezareaguje? (např. ztracený čas, vyšší náklady, promarněné příležitosti)',
    "What happens if your audience doesn't take action? (e.g., lost time, higher costs, missed opportunities)": 'Co se stane, když vaše publikum nezareaguje? (např. ztracený čas, vyšší náklady, promarněné příležitosti)',
    'Create urgency by explaining potential drawbacks of not engaging with your brand': 'Vytvořte naléhavost vysvětlením možných nevýhod toho, když se značkou nezačnou spolupracovat',
    'Call to action': 'Výzva k akci',
    'Describe the action you want users to take (e.g., book a ride, sign up)': 'Popište akci, kterou mají uživatelé provést (např. objednat jízdu, zaregistrovat se)',
    'Specify the most important user action': 'Určete nejdůležitější akci uživatele',

    /* --- ad manager landing --------------------------------------------- */
    'Welcome To Ad Manager': 'Vítejte ve Správci reklam',
    'One Platform. Unlimited Possibilities': 'Jedna platforma. Neomezené možnosti',
    '🚀 Launch and Manage Ads across Facebook, Google & LinkedIn all in one place.': '🚀 Spouštějte a spravujte reklamy na Facebooku, Googlu i LinkedInu z jednoho místa.',
    '📊 Track Performance, Conversions, and ROI with Detailed Analytics.': '📊 Sledujte výkon, konverze a ROI s podrobnou analytikou.',
    '⚙️ Streamline Campaigns with Ready-to-Use Templates and Smart Automation.': '⚙️ Zefektivněte kampaně díky hotovým šablonám a chytré automatizaci.',
    'Activate Ads Manager': 'Aktivovat Správce reklam',
    'Multi-platform campaigns': 'Kampaně napříč platformami',
    'Easily launch and manage ads across facebook, google and linkedin from one place.': 'Snadno spouštějte a spravujte reklamy na Facebooku, Googlu a LinkedInu z jednoho místa.',
    'Proven templates for faster setup': 'Ověřené šablony pro rychlejší nastavení',
    'Choose from ready-to-use ad templates designed to fit different industries and goals.': 'Vyberte si z hotových reklamních šablon navržených pro různé obory a cíle.',
    'Detailed performance analytics': 'Podrobná analytika výkonu',
    'View clear reporting at the campaign, ad group, ad and keyword levels to track ROI.': 'Přehledné reporty na úrovni kampaně, reklamní sestavy, reklamy i klíčového slova pro sledování ROI.',
    'Seamless conversion tracking': 'Bezproblémové sledování konverzí',
    'Set up pixels and event tracking effortlessly to measure leads, sales and conversions.': 'Snadno nastavte pixely a sledování událostí pro měření leadů, prodejů a konverzí.',
    'Granular campaign structure': 'Podrobná struktura kampaní',
    'Create multiple ad groups and ads within a campaign for testing and better performance insights.': 'Vytvářejte v rámci kampaně více reklamních sestav a reklam pro testování a lepší přehled o výkonu.',
    'Easy scaling & management': 'Snadné škálování a správa',
    'Duplicate campaigns, manage multiple ad accounts and streamline workflows for all your clients.': 'Duplikujte kampaně, spravujte více reklamních účtů a zjednodušte procesy pro všechny své klienty.',

    /* --- AUTOMATION (v24) -----------------------------------------------
       NOT COVERABLE: every Automation route -- /automation, /workflows,
       /overview and /workflows/settings -- renders inside one cross-origin
       iframe at client-app-automation-workflows.leadconnectorhq.com.
       Only the parent-document chrome below is reachable. ------------- */
    'Automation updates': 'Novinky v automatizaci',
    'automation': 'automatizace',

    /* ===================================================================
       MEMBERSHIPS -- deep pass (v24).
       Mixed rendering, exactly like Settings: some routes are cross-origin
       iframes, others render in the main document. "Is a Memberships page"
       predicts nothing -- each route has to be probed.
       NOT COVERABLE (backend.memberships.apisystem.tech):
         /memberships/courses/dashboard  and  /courses/dashboard-v2
       =================================================================== */

    /* --- shared chrome / loading states -------------------------------- */
    'Learn More': 'Zjistit více',
    'Logo Image': 'Obrázek loga',
    'Loading...': 'Načítání...',
    'Loading ...': 'Načítání ...',
    'Settings navigation': 'Navigace nastavení',
    'Settings Options': 'Možnosti nastavení',

    /* --- communities ---------------------------------------------------- */
    'Community Groups': 'Skupiny komunity',
    'You don’t have a community yet': 'Zatím nemáte žádnou komunitu',
    "You don't have a community yet": 'Zatím nemáte žádnou komunitu',
    'Connect with others by creating your own community space! Here, you can share insights, discuss ideas, and build connections with people who share your interests.': 'Spojte se s ostatními vytvořením vlastního komunitního prostoru! Můžete zde sdílet poznatky, diskutovat o nápadech a navazovat kontakty s lidmi, které zajímá totéž co vás.',
    'Create a Community': 'Vytvořit komunitu',
    'Create Group': 'Vytvořit skupinu',
    'Create your new community group': 'Vytvořte novou skupinu komunity',
    'Details': 'Podrobnosti',
    'Group Name': 'Název skupiny',
    'Provide a distinct identity to your group': 'Dejte své skupině jedinečnou identitu',
    'Group URL': 'URL skupiny',
    'You can distribute the URL of your group to others for easy sharing': 'URL své skupiny můžete rozeslat ostatním pro snadné sdílení',
    'Group Slug': 'Slug skupiny',
    'Group Description': 'Popis skupiny',
    'Elaborate on the nature of discussions that will take place within the group': 'Popište, jaké diskuze budou ve skupině probíhat',
    'Enter a brief description': 'Zadejte stručný popis',
    'Discovery': 'Objevování',
    'Get discovered by millions of active users. The group will be visible on the discover page once you have more than 10 members.': 'Nechte se objevit miliony aktivních uživatelů. Skupina se zobrazí na stránce objevování, jakmile budete mít více než 10 členů.',
    'Recommended Aspect Ratio 1:1': 'Doporučený poměr stran 1:1',
    'Recommended Aspect Ratio 16:9': 'Doporučený poměr stran 16:9',
    'Click or drag a file to this area to upload': 'Klikněte sem nebo sem přetáhněte soubor k nahrání',
    'SVG, PNG, JPG, JPEG, WEBP, ICO (Aspect Ratio 1:1)': 'SVG, PNG, JPG, JPEG, WEBP, ICO (poměr stran 1:1)',
    'SVG, PNG, JPG, JPEG, WEBP, ICO (Aspect Ratio 16:9)': 'SVG, PNG, JPG, JPEG, WEBP, ICO (poměr stran 16:9)',

    /* --- certificates ---------------------------------------------------- */
    'Certificate AI': 'Certifikáty AI',
    'Design certificates that': 'Navrhujte certifikáty, které',
    'look official': 'vypadají oficiálně',
    'e.g. Course completion certificate, navy and gold theme': 'např. certifikát o dokončení kurzu, tmavě modré a zlaté téma',
    'Course completion': 'Dokončení kurzu',
    'Milestone achieved': 'Dosažený milník',
    'Event participation': 'Účast na akci',
    'Training completed': 'Dokončené školení',
    'Issued Certificates': 'Vydané certifikáty',
    'Issued Badges': 'Vydané odznaky',
    'Expiry Date': 'Datum vypršení',

    /* --- offers ---------------------------------------------------------- */
    'Create and manage offers for your courses': 'Vytvářejte a spravujte nabídky pro své kurzy',
    '+ Create Offer': '+ Vytvořit nabídku',
    'Create Offer': 'Vytvořit nabídku',
    'Visibility': 'Viditelnost',
    'Nothing here!': 'Zde nic není!',
    'Create your first offer to get started': 'Začněte vytvořením první nabídky',

    /* --- courses / products ---------------------------------------------- */
    'Manage or create new courses': 'Spravujte nebo vytvářejte nové kurzy',
    'Search Courses': 'Hledat kurzy',
    'Sort: Newest': 'Řadit: nejnovější',
    'Newest': 'Nejnovější',
    'Oldest': 'Nejstarší',
    'A-Z Title': 'Název A–Z',
    'Z-A Title': 'Název Z–A',
    'Most Members': 'Nejvíce členů',
    'Least Members': 'Nejméně členů',
    'Library Order': 'Pořadí v knihovně',
    'Announcements': 'Oznámení',
    'Start Creating Your First Course': 'Začněte vytvořením prvního kurzu',
    'You haven’t created any courses yet. Click the ‘Create New’ button to get started with your first course.': 'Zatím jste nevytvořili žádné kurzy. Klikněte na tlačítko „Vytvořit nový“ a začněte se svým prvním kurzem.',
    "You haven't created any courses yet. Click the 'Create New' button to get started with your first course.": 'Zatím jste nevytvořili žádné kurzy. Klikněte na tlačítko „Vytvořit nový“ a začněte se svým prvním kurzem.',
    'Create New Course': 'Vytvořit nový kurz',
    'Import from Kajabi': 'Importovat z Kajabi',
    'Create using Ask AI': 'Vytvořit pomocí Zeptat se AI',
    'Manage Comments': 'Spravovat komentáře',
    'Library Sorting': 'Řazení knihovny',

    /* --- course analytics ------------------------------------------------- */
    'Course progress': 'Průběh kurzu',
    'Assessment': 'Hodnocení',
    'Assessments': 'Hodnocení',
    'Member analytics': 'Analytika členů',
    'Members Analytics': 'Analytika členů',
    'Revenue analytics': 'Analytika tržeb',
    'Track your course engagement and learner progress': 'Sledujte zapojení v kurzu a pokrok studentů',
    'Courses: All courses': 'Kurzy: všechny kurzy',
    'Enrollment date: Last 30 days': 'Datum zápisu: posledních 30 dní',
    'You’re viewing sample data. Create your own courses to see real data': 'Prohlížíte si ukázková data. Vytvořte vlastní kurzy a uvidíte skutečná data',
    "You're viewing sample data. Create your own courses to see real data": 'Prohlížíte si ukázková data. Vytvořte vlastní kurzy a uvidíte skutečná data',
    'Create Course': 'Vytvořit kurz',
    'Clear Sample Data': 'Vymazat ukázková data',
    'Overall completion rate': 'Celková míra dokončení',
    'vs previous 30 days': 'oproti předchozím 30 dnům',
    'Average course progress': 'Průměrný průběh kurzu',
    'Average time to complete': 'Průměrná doba dokončení',
    'User conversion funnel': 'Konverzní trychtýř uživatelů',
    'Track how users progress through their learning journey': 'Sledujte, jak uživatelé postupují svou cestou vzdělávání',
    'Started learning': 'Začali se učit',
    'Not started learning': 'Nezačali se učit',
    'Completed course': 'Dokončili kurz',
    'Haven’t completed course': 'Nedokončili kurz',
    "Haven't completed course": 'Nedokončili kurz',
    'New users': 'Noví uživatelé',
    'Search name or email': 'Hledat jméno nebo e-mail',
    'Search Name': 'Hledat jméno',
    'Search by email': 'Hledat podle e-mailu',
    'Members': 'Členové',
    'Progress': 'Průběh',
    'Last accessed': 'Naposledy otevřeno',
    'Last Accessed': 'Naposledy otevřeno',
    'Enrolment date': 'Datum zápisu',
    'Enrollment date': 'Datum zápisu',
    'Session count': 'Počet relací',
    'All of this & more is now in Course progress analytics.': 'Toto vše a více je nyní v analytice Průběh kurzu.',
    'Try it out': 'Vyzkoušet',
    'Keep track of members and their progress': 'Sledujte členy a jejich pokrok',
    'Member Since': 'Člen od',
    'Logins': 'Přihlášení',
    'Total Products': 'Celkem produktů',
    'Member analytics deprecation notice': 'Upozornění na ukončení podpory analytiky členů',
    'Net Revenue': 'Čisté tržby',
    'Statistics of the onetime purchase revenue, excluding tax.': 'Statistiky tržeb z jednorázových nákupů bez daně.',
    'Compare Products': 'Porovnat produkty',
    'Line Chart': 'Spojnicový graf',
    'Bar Chart': 'Sloupcový graf',
    'Per Day Revenue': 'Tržby po dnech',
    'No data found for Offer Revenue': 'Pro tržby z nabídek nebyla nalezena žádná data',
    'Onetime purchase not happened in selected date range. Please try again with different filter.': 'Ve vybraném rozsahu dat neproběhl žádný jednorázový nákup. Zkuste to prosím znovu s jiným filtrem.',
    'Revenue by product': 'Tržby podle produktu',
    'Onetime revenue generated by individual product.': 'Jednorázové tržby vygenerované jednotlivým produktem.',
    'Date Range': 'Rozsah dat',
    'Net Revenue not found for selected date range.': 'Pro vybraný rozsah dat nebyly nalezeny žádné čisté tržby.',
    'less than a minute ago': 'před méně než minutou',

    /* --- course builder settings ------------------------------------------ */
    'Control content creation options and builder behaviour for your courses.': 'Určete možnosti tvorby obsahu a chování editoru pro vaše kurzy.',
    'Video download': 'Stahování videa',
    'Show download option for uploaded video on the course builder.': 'Zobrazit v editoru kurzu možnost stažení nahraného videa.',

    /* --- client portal settings ------------------------------------------- */
    'Client Portal Settings': 'Nastavení klientského portálu',
    'Configure your domain for client portal': 'Nastavte doménu pro klientský portál',
    'Add your personal touch to the client portal': 'Dodejte klientskému portálu osobní nádech',
    'App Permissions': 'Oprávnění aplikací',
    'Enable/ disable an app for your client portal': 'Povolte nebo zakažte aplikaci pro klientský portál',
    'Language Settings': 'Nastavení jazyka',
    'Customize language for your client portal and child apps': 'Přizpůsobte jazyk klientského portálu a podřízených aplikací',
    'Configure your chat widget for your client portal': 'Nastavte chatovací widget pro klientský portál',
    'Customize email notifications for everyone': 'Přizpůsobte e-mailová oznámení pro všechny',

    /* --- gokollab activation ---------------------------------------------- */
    'Create Your First Course or Community': 'Vytvořte svůj první kurz nebo komunitu',
    'Get started by creating your first course or community to engage with your audience': 'Začněte vytvořením prvního kurzu nebo komunity a zapojte své publikum',
    'Why GoKollab Courses?': 'Proč kurzy GoKollab?',
    'Create Courses Faster': 'Vytvářejte kurzy rychleji',
    'Launch professional courses quickly with easy-to-use tools and templates.': 'Spusťte profesionální kurzy rychle díky snadno ovladatelným nástrojům a šablonám.',
    'Customize Your Course Experience': 'Přizpůsobte zážitek ze svého kurzu',
    'Add quizzes, certificates, and drip content—tailored to your teaching style.': 'Přidejte kvízy, certifikáty a postupně uvolňovaný obsah – na míru vašemu stylu výuky.',
    'Earn on Your Terms': 'Vydělávejte podle svých pravidel',
    'Set your own pricing and control your revenue streams.': 'Nastavte si vlastní ceny a mějte tržby pod kontrolou.',
    'Track Performance Easily': 'Snadno sledujte výkon',
    'Get insights with simple analytics to monitor sales, engagement, and student progress.': 'Získejte přehled díky jednoduché analytice sledující prodeje, zapojení a pokrok studentů.',

    /* --- branded mobile app ----------------------------------------------- */
    'Branded Mobile App Builder': 'Tvůrce značkové mobilní aplikace',
    'Customize your mobile app’s icon, and onboarding experience for a fully branded user journey.': 'Přizpůsobte ikonu a úvodní zážitek své mobilní aplikace pro plně značkovou cestu uživatele.',
    "Customize your mobile app's icon, and onboarding experience for a fully branded user journey.": 'Přizpůsobte ikonu a úvodní zážitek své mobilní aplikace pro plně značkovou cestu uživatele.',
    'Branded App Get Started': 'Značková aplikace – začínáme',
    'Branded App Helper': 'Značková aplikace – nápověda',
    'Learn more about setting up a branded app': 'Více o nastavení značkové aplikace',
    'Get started with branded app': 'Začít se značkovou aplikací',

    /* --- month names (also used by the date reformatter below) --- */
    'January': 'leden', 'February': 'únor', 'March': 'březen', 'April': 'duben',
    'May': 'kvě', 'June': 'červen', 'July': 'červenec', 'August': 'srpen',
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

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

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
  /* "Hi Tom! I'm your calendar setup assistant..." - the name is interpolated,
     so this can only be matched as a pattern, never as a literal. */
  var CAL_GREETING = /^Hi\s+(.+?)!\s*I'm your calendar setup assistant\.\s*What would you like to do\?$/i;
  var LAST_PERIOD  = /^\(Last\s+(\d+)\s+(month|months|day|days)\)$/i;  /* "(Last 30 days)" */
  var N_PRODUCTS  = /^(\d+)\s+Products?$/i;
  /* "0 Invoice(s) in Draft" / "in Due" / "received" / "Overdue" */
  var N_INVOICES  = /^(\d+)\s+Invoice\(s\)\s+(in Draft|in Due|received|Overdue)$/i;
  var INVOICE_STATE = { 'in draft':'v konceptu', 'in due':'k úhradě',
                        'received':'přijato', 'overdue':'po splatnosti' };
  var REMOVE_FILT = /^Remove filter:\s*(.+)$/i;         /* "Remove filter: Date" */
  var RANGE_OF    = /^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)$/i; /* "21 - 25 of 25" */
  /* "Aug 31, 2026 03:28 AM" -> "31. srp 2026 03:28" (Czech uses a 24h clock) */
  var STAMP = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  /* "Sep 2026" -- the month/year header inside date pickers */
  var MON_YEAR = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/;
  var MON_FULL_CZ = {
    jan: 'leden', feb: 'únor', mar: 'březen', apr: 'duben',
    may: 'květen', jun: 'červen', jul: 'červenec', aug: 'srpen',
    sep: 'září', oct: 'říjen', nov: 'listopad', dec: 'prosinec'
  };
  /* "4 opportunities" / "1 opportunity" */
  var N_OPPS      = /^(\d+)\s+opportunit(?:y|ies)$/i;
  /* "1 pipeline" / "3 pipelines" */
  var N_PIPES     = /^(\d+)\s+pipelines?$/i;
  /* "1 applied" -- filter/sort chip counters in the smart-list panel */
  var N_APPLIED   = /^(\d+)\s+applied$/i;
  /* "Fields (7 out of 8)" */
  var OUT_OF      = /^(.+?)\s*\((\d+)\s+out of\s+(\d+)\)$/i;
  /* "Currently at position 1 of 1" */
  var POS_OF      = /^Currently at position (\d+) of (\d+)$/i;
  /* Delete pipeline "X"? -- curly or straight quotes */
  var DEL_PIPE    = /^Delete pipeline\s+[“"](.+)[”"]\?$/;
  /* "You have 1 unsaved change(s)" */
  var UNSAVED_N   = /^You have (\d+) unsaved change\(s\)$/i;
  /* "Pipeline - ZZ-TEST" (board header tooltip) */
  var PIPE_DASH   = /^Pipeline - (.+)$/;
  /* "Sep 4, 2026" -- a date cell with no time beside it */
  var DATE_ABBR   = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s*(\d{4})$/;
  /* "Sep 5th, 9:00 pm" -- ordinal date + 12h time (card preview, chips) */
  var ORD_STAMP   = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th),\s*(\d{1,2}):(\d{2})\s*(am|pm)$/i;
  /* "1:04 AM" -- a bare 12h clock cell; Czech uses a 24h clock */
  var TIME_AMPM   = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  /* genitive month names keyed by the 3-letter English abbreviation */
  var MONTH_GEN_ABBR = {
    jan: 'ledna', feb: 'února', mar: 'března', apr: 'dubna',
    may: 'května', jun: 'června', jul: 'července', aug: 'srpna',
    sep: 'září', oct: 'října', nov: 'listopadu', dec: 'prosince'
  };
  function to24(h, ampm) {
    var n = parseInt(h, 10) % 12;
    if (/pm/i.test(ampm)) n += 12;
    return n < 10 ? '0' + n : String(n);
  }

  /* "3 new" -- RSS / notification counters */
  var N_NEW       = /^(\d+)\s+new$/i;
  /* "2m ago" / "15 m ago" -- relative timestamps */
  var AGO         = /^(\d+)\s*([smhdw])\s+ago$/i;
  /* "TechCrunch · 2m ago" -- a name followed by a relative timestamp */
  var NAME_AGO    = /^(.+?)\s*·\s*(\d+)\s*([smhdw])\s+ago$/i;
  /* "Approximate Cost: $0" */
  var APPROX_COST = /^Approximate Cost:\s*(\$[\d.,]*)$/i;
  /* "0 characters | 1 words" */
  var CHARS_WORDS = /^(\d+)\s+characters?\s*\|\s*(\d+)\s+words?$/i;
  /* "| 0 segs" -- the SMS segment counter renders as its own node */
  var SEGS        = /^\|\s*(\d+)\s+segs?$/i;
  /* "10 / page" -- page-size selector */
  var PER_PAGE    = /^(\d+)\s*\/\s*page$/i;
  function agoCz(n, u) {
    u = u.toLowerCase();
    var unit = u === 's' ? czPlural(n, 'sekundou', 'sekundami', 'sekundami')
             : u === 'm' ? czPlural(n, 'minutou', 'minutami', 'minutami')
             : u === 'h' ? czPlural(n, 'hodinou', 'hodinami', 'hodinami')
             : u === 'd' ? czPlural(n, 'dnem', 'dny', 'dny')
             :             czPlural(n, 'týdnem', 'týdny', 'týdny');
    return 'před ' + n + ' ' + unit;
  }

  /* "Showing 1 to 1 of 1 results" -- the older table's pagination footer */
  var SHOWING_OF  = /^Showing (\d+) to (\d+) of (\d+) results?$/i;

  /* "18 Hrs" -- the analytics stat tile */
  var N_HRS       = /^(\d+)\s*Hrs?$/i;
  /* "3 total members" */
  var TOTAL_MEM   = /^(\d+)\s+total members?$/i;
  /* "Last updated: 3 minutes ago" -- the tail is translated recursively */
  var LAST_UPD    = /^Last updated:\s*(.+)$/i;
  /* "3 minutes ago" / "1 hour ago" -- long-form relative timestamps */
  var REL_LONG    = /^(\d+)\s+(second|minute|hour|day|week|month)s?\s+ago$/i;
  function relLongCz(n, u) {
    u = u.toLowerCase();
    var unit = u === 'second' ? czPlural(n, 'sekundou', 'sekundami', 'sekundami')
             : u === 'minute' ? czPlural(n, 'minutou', 'minutami', 'minutami')
             : u === 'hour'   ? czPlural(n, 'hodinou', 'hodinami', 'hodinami')
             : u === 'day'    ? czPlural(n, 'dnem', 'dny', 'dny')
             : u === 'week'   ? czPlural(n, 'týdnem', 'týdny', 'týdny')
             :                  czPlural(n, 'měsícem', 'měsíci', 'měsíci');
    return 'před ' + n + ' ' + unit;
  }

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

    var cg = CAL_GREETING.exec(key);
    if (cg) return 'Ahoj ' + cg[1] + '! Jsem váš asistent nastavení kalendáře. Co byste chtěli udělat?';

    var lp = LAST_PERIOD.exec(key);
    if (lp) {
      var n = parseInt(lp[1], 10);
      var unit = /month/i.test(lp[2])
        ? czPlural(n, 'měsíc', 'měsíce', 'měsíců')
        : czPlural(n, 'den', 'dny', 'dní');
      return '(Posledních ' + n + ' ' + unit + ')';
    }

    var np = N_PRODUCTS.exec(key);
    if (np) return np[1] + ' ' +
      czPlural(parseInt(np[1], 10), 'produkt', 'produkty', 'produktů');

    var ni = N_INVOICES.exec(key);
    if (ni) return ni[1] + ' ' +
      czPlural(parseInt(ni[1], 10), 'faktura', 'faktury', 'faktur') + ' ' +
      INVOICE_STATE[ni[2].toLowerCase()];

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

    var my = MON_YEAR.exec(key);
    if (my) return MON_FULL_CZ[my[1].toLowerCase()] + ' ' + my[2];

    var o1 = N_OPPS.exec(key);
    if (o1) return o1[1] + ' ' +
      czPlural(parseInt(o1[1], 10), 'příležitost', 'příležitosti', 'příležitostí');

    var o2 = N_PIPES.exec(key);
    if (o2) return o2[1] + ' ' +
      czPlural(parseInt(o2[1], 10), 'obchodní kanál', 'obchodní kanály', 'obchodních kanálů');

    var o3 = N_APPLIED.exec(key);
    if (o3) return 'Použito: ' + o3[1];

    var o4 = OUT_OF.exec(key);
    if (o4) {
      var ob = plain(o4[1]);
      if (ob !== null) return ob + ' (' + o4[2] + ' z ' + o4[3] + ')';
    }

    var o5 = POS_OF.exec(key);
    if (o5) return 'Aktuálně na pozici ' + o5[1] + ' z ' + o5[2];

    var o6 = DEL_PIPE.exec(key);
    if (o6) return 'Smazat obchodní kanál „' + o6[1] + '“?';

    var o7 = UNSAVED_N.exec(key);
    if (o7) return 'Máte ' + o7[1] + ' ' +
      czPlural(parseInt(o7[1], 10), 'neuloženou změnu', 'neuložené změny', 'neuložených změn');

    var o8 = PIPE_DASH.exec(key);
    if (o8) return 'Obchodní kanál – ' + o8[1];

    var o9 = ORD_STAMP.exec(key);
    if (o9) return o9[2] + '. ' + MONTH_ABBR[o9[1].toLowerCase()] + ', ' +
                to24(o9[3], o9[5]) + ':' + o9[4];

    var d1 = DATE_ABBR.exec(key);
    if (d1) return d1[2] + '. ' + MONTH_GEN_ABBR[d1[1].toLowerCase()] + ' ' + d1[3];

    var t9 = TIME_AMPM.exec(key);
    if (t9) return to24(t9[1], t9[3]) + ':' + t9[2];

    var q1 = N_NEW.exec(key);
    if (q1) return q1[1] + ' ' +
      czPlural(parseInt(q1[1], 10), 'nový', 'nové', 'nových');

    var q2 = AGO.exec(key);
    if (q2) return agoCz(parseInt(q2[1], 10), q2[2]);

    var q3 = NAME_AGO.exec(key);
    if (q3) return q3[1] + ' · ' + agoCz(parseInt(q3[2], 10), q3[3]);

    var q4 = APPROX_COST.exec(key);
    if (q4) return 'Přibližná cena: ' + q4[1];

    var q5 = CHARS_WORDS.exec(key);
    if (q5) return q5[1] + ' ' + czPlural(parseInt(q5[1], 10), 'znak', 'znaky', 'znaků') +
      ' | ' + q5[2] + ' ' + czPlural(parseInt(q5[2], 10), 'slovo', 'slova', 'slov');

    var q6 = SEGS.exec(key);
    if (q6) return '| ' + q6[1] + ' ' +
      czPlural(parseInt(q6[1], 10), 'segment', 'segmenty', 'segmentů');

    var q7 = PER_PAGE.exec(key);
    if (q7) return q7[1] + ' / stránku';

    var sw = SHOWING_OF.exec(key);
    if (sw) return 'Zobrazeno ' + sw[1] + '–' + sw[2] + ' z celkem ' + sw[3];

    var h1 = N_HRS.exec(key);
    if (h1) return h1[1] + ' h';

    var h2 = TOTAL_MEM.exec(key);
    if (h2) return 'Celkem ' + h2[1] + ' ' +
      czPlural(parseInt(h2[1], 10), 'člen', 'členové', 'členů');

    var h3 = REL_LONG.exec(key);
    if (h3) return relLongCz(parseInt(h3[1], 10), h3[2]);

    var h4 = LAST_UPD.exec(key);
    if (h4) {
      var tail = translate(h4[1]);
      return 'Naposledy aktualizováno: ' + (tail !== null ? tail : h4[1]);
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
