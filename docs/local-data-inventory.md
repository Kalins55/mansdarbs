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

## Pašreizējais rezerves kopijas ierobežojums

Pašreizējais `exportRecordsBackup()` eksportē tikai `mansdarbs_demo_records_v1`. Atjaunošana pieņem versijas 1 formātu un aizstāj tikai pamata ierakstus. Tā neaptver iepriekš uzskaitītos nozaru ierakstus, profilus, VSAOI aprēķinus, rēķinus vai SIA prototipa datus.

## Ieteicamais drošais nākamais solis

Ieviest versijas 2 rezerves kopiju, saglabājot versijas 1 importēšanas atpakaļsaderību. Pirms jebkādas lokālās glabātuves izmaiņas:

1. Validēt katru datu kopu atsevišķi (tipi, datumi, summas, masīvu/objektu forma un saprātīgi izmēra ierobežojumi).
2. Vispirms pilnībā nolasīt un validēt visu failu; kļūdas gadījumā neko nemainīt.
3. Parādīt, kuras datu kategorijas tiks aizstātas, un tikai pēc apstiprinājuma sākt atjaunošanu.
4. Atjaunošanu veikt ar iepriekšēju pašreizējo vērtību momentuzņēmumu un rollback, ja kāda rakstīšana neizdodas.
5. Pievienot testus katrai datu kategorijai, versijas 1 importam, bojātiem failiem un daļējas rakstīšanas kļūdas scenārijam.
6. Neiekļaut sesijas datus, AI piekrišanu, autentifikācijas noslēpumus, servera konfigurāciju vai nezināmas localStorage atslēgas.

Šis dokuments ir koda līmeņa inventārs, nevis garantija, ka visas uzskaitītās shēmas jau ir pilnībā validētas. Pirms versijas 2 realizācijas katras datu kopas reālais rakstīšanas ceļš un lauku shēma vēl jāpārbauda.
