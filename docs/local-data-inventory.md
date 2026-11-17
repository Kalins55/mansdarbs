# Mansdarbs lokālo datu inventārs

Šis dokuments apraksta pārlūkprogrammā glabāto datu struktūru, lai turpmākie uzlabojumi nesabojātu lietotāja datus un lai rezerves kopiju funkcija aptvertu visu, ko lietotājs var pamatoti vēlēties pārnest uz citu ierīci.

## Pamatprincips

- Finanšu un uzņēmējdarbības dati pēc noklusējuma paliek lietotāja pārlūkprogrammā.
- Šajā inventārā ir tikai atslēgu nosaukumi un to paredzētais saturs; tajā nedrīkst ievietot reālus lietotāju datus.
- Rezerves kopija ir lietotāja iniciēta lokāla lejupielāde. Tās saturs var ietvert personas un finanšu informāciju, tādēļ pirms eksporta/atjaunošanas jābūt skaidram brīdinājumam un drošai validācijai.
- Nezināmas atslēgas nedrīkst automātiski eksportēt vai importēt. Tas varētu nejauši iekļaut sesijas, piekrišanas vai nākotnes tehniskos datus.

## LocalStorage inventārs

| Atslēga | Saturs / funkcija | Rezerves kopijas politika |
|---|---|---|
| `mansdarbs_demo_records_v1` | Pamata ienākumu un izdevumu ieraksti | Iekļaut |
| `mansdarbs_industry_records_v1` | Nozaru uzskaites darījumi | Iekļaut |
| `mansdarbs_context_profile_v1` | Lietotāja situācijas profils (stadija un vajadzība) | Iekļaut kā izvēles iestatījumu |
| `mansdarbs_industry_profile_v1` | Aktīvais nozares/nodarbošanās profils | Iekļaut kā izvēles iestatījumu |
| `mansdarbs_industry_profiles_v1` | Saglabāto nozaru profilu saraksts | Iekļaut kā izvēles iestatījumu |
| `mansdarbs_payment_profile_v1` | Izvēlētie norēķinu veidi un atjaunināšanas laiks | Iekļaut kā izvēles iestatījumu |
| `mansdarbs-vsaoi-2026-q1` līdz `mansdarbs-vsaoi-2026-q4` | VSAOI ceturkšņu ievades un aprēķinu rindas | Iekļaut |
| `mansdarbs_vsaoi_iin_manual_v1` | Manuāli norādītā gada VSAOI summa IIN prognozei | Iekļaut |
| `mansdarbs_sia_prototype_v1` | SIA prototipa uzņēmumi un darījumi | Iekļaut, skaidri marķējot kā prototipa datus |
| `mansdarbs_demo_invoices_v1` | Pašnodarbinātā režīma saglabātie rēķini | Iekļaut |
| `mansdarbs_demo_invoices_zs_v1` | Z/S režīma saglabātie rēķini | Iekļaut |
| `mansdarbs_invoice_seller_v1` | Pašnodarbinātā rēķinu izrakstītāja rekvizīti | Iekļaut |
| `mansdarbs_invoice_seller_zs_v1` | Z/S rēķinu izrakstītāja rekvizīti | Iekļaut |
| `mansdarbs_accounting_mode` | Pēdējais izvēlētais uzskaites režīms | Iekļaut kā iestatījumu |
| `mansdarbs_language_v1` | Saskarnes valoda | Iekļaut kā iestatījumu |

## SessionStorage un pagaidu stāvoklis

| Atslēga | Saturs / funkcija | Rezerves kopijas politika |
|---|---|---|
| `mansdarbsVidGuide` | VID ceļveža pašreizējais solis | Neiekļaut; tas ir īslaicīgs navigācijas stāvoklis |
| `mansdarbsAiDataConsent` (jāpārbauda faktiskā konstante) | AI datu nosūtīšanas piekrišana sesijā | Nekad neiekļaut; piekrišana nav pārnesama starp ierīcēm vai sesijām |

## Rezerves kopijas versija 2

Versijas 2 eksports izmanto skaidru atļauto `localStorage` atslēgu sarakstu. Tas aptver pamata un nozares ierakstus, VSAOI ceturkšņus un manuālo IIN vērtību, SIA prototipa datus, abu režīmu rēķinus un izrakstītāja rekvizītus, profilus, uzskaites režīmu un valodu.

- Eksports ir lietotāja sākta lokāla JSON lejupielāde; dati netiek sūtīti uz Mansdarbs serveri.
- Netiek eksportēts `sessionStorage`, AI piekrišana vai nezināmas atslēgas.
- Importētājs turpina pieņemt iepriekšējo versijas 1 formātu.
- Pirms importēšanas tiek pārbaudīts faila izmērs, atļautās atslēgas, datu kopu struktūra, finanšu vērtības un kalendāra datumi.
- Atjaunošana aizstāj tikai failā iekļautās datu kategorijas; citas lokālās kategorijas paliek neskartas.
- Pirms rakstīšanas tiek saglabāts esošo vērtību momentuzņēmums. Ja rakstīšana neizdodas, kods mēģina atjaunot iepriekšējās vērtības.
- Importēšana tiek testēta ar legacy v1 datiem, daļēju v2 atjaunošanu, bojātiem datiem un nederīgām finanšu vērtībām.


## Rezerves kopijas v2 ieviešana un pārbaudes robežas

Versija 2 ir ieviesta izstrādes zarā feature/explicit-ai-consent PR #12 ietvaros; tā nav publicēta produkcijā. Tā saglabā v1 importēšanas atpakaļsaderību.

- Pirms atjaunošanas tiek validēta visa datu kopa un parādīts, kuras kategorijas tiks aizstātas.
- Atjaunošana notiek tikai pēc lietotāja apstiprinājuma.
- Tiek saglabāts pašreizējo vērtību momentuzņēmums; rakstīšanas kļūmes gadījumā tiek mēģināts veikt rollback.
- Eksporta un importa failiem ir vienots 5 MB ierobežojums. Eksports pirms lejupielādes pārbauda arī paša izveidotā faila izmēru.
- Validācija pārbauda ierakstu tipus, summas, datumus, rēķinu kopsummu matemātisko saskaņu, SIA darījumu saistību ar uzņēmumu, nozares ierakstu laukus, profilus, norēķinu metodes un VSAOI rindu struktūru.
- Sesijas dati, AI piekrišana, autentifikācijas noslēpumi, servera konfigurācija un nezināmas localStorage atslēgas netiek eksportētas vai importētas.

Inventārs jāatjaunina ikreiz, kad lietotnē tiek ieviesta jauna pārlūka glabāšanas atslēga vai mainīta esošas datu kopas shēma. Katras jaunas kategorijas ieviešanai jāpievieno atbilstošs importa/eksporta regresijas tests.
