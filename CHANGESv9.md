# v9 — Custom fields page + pattern rules

Built on v8 (which was built on your file). **743 terms**, was 697.
Gate unchanged: `['SbA5m1DElMNEKBVnixsX']`.

---

## You were right — I was over-conservative

I had been treating field labels as customer data and skipping them. On
`/settings/fields` they are HighLevel defaults, so all of it is now translated:

**Page chrome** — Fields, Business, Create field, Search fields, Fields per page,
and the column headers Field name / Field type / Folder name / Key.

**Default field names** — Opportunity name, Pipeline, Stage, Lead value,
Opportunity source, Lost reason, Forecast expected close date, Forecast
probability, Street address, Website, Timezone.

**Default folder name** — Opportunity Details → Detaily příležitosti.

**All 13 field types**, taken from the Create field picker rather than guessed:

| English | Czech |
|---|---|
| Single line | Jeden řádek |
| Multi line | Více řádků |
| Text box list | Seznam textových polí |
| Number | Číslo |
| Phone | Telefon |
| Monetary | Peněžní |
| Dropdown (single) | Rozbalovací (jedna volba) |
| Dropdown (multiple) | Rozbalovací (více voleb) |
| Radio select | Přepínač |
| Checkbox | Zaškrtávací pole |
| File upload | Nahrání souboru |
| Date picker | Výběr data |
| Signature | Podpis |

**Create custom field panel** — Field details, Enter name, Add to object, Select
object, Select folder, Set default value, Placeholder text, Live preview, and
both hint sentences.

---

## Four new pattern rules

The remaining English on that page was all text a fixed glossary can never
match, because part of it changes at runtime.

| Pattern | Example | Result |
|---|---|---|
| `Label (ABBR)` | `Created (PDT)` | `Vytvořeno (PDT)` |
| `n/m columns` | `6/7 columns` | `6/7 sloupců` |
| `a - b of c` | `21 - 25 of 25` | `21 – 25 z 25` |
| `MMM D, YYYY hh:mm AM/PM` | `Aug 31, 2026 01:57 PM` | `31. srp 2026 13:57` |

The timestamp rule also converts to a 24-hour clock, which is what Czech uses.
Midnight and noon are the cases that usually break this — verified:
`12:00 AM → 00:00` and `12:30 PM → 12:30`.

Each pattern requires its variable part to be strictly digits (or a 2–6 letter
uppercase abbreviation), so nothing resembling customer data is captured.
`Centene 5 of 9` and a bare `Aug 31, 2026` both correctly return no match.

---

## Verified live

Applied to `/settings/fields` in the clean sub-account: 19 replacements, the
whole screen rendering in Czech — heading, description, object tabs
(Vše / Kontakt / Příležitost / Firma), filter chips, column headers, field types
and pagination.
