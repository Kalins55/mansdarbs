# Kontekstuālās palīdzības ieviešanas karte

**Statuss:** esošās koda bāzes audits un ieviešanas secība  
**Bāze:** `main` pārbaudes brīdī, 2026-11-17  
**Saistītā prasība:** `docs/global-contextual-guidance.md` (PR #18)  
**Tvērums:** pašreizējā Mansdarbs individuālā versija

## Mērķis

Pārvērst globālo principu praktiskā ieviešanas plānā: lietotājam, atverot konkrētu sadaļu vai sākot darbību, automātiski jāsaņem tieši šai situācijai vajadzīgā informācija un nākamais solis. Viņam nav jāmeklē slēpta funkcija vai vispirms jāaizpilda profils.

Šis dokuments ir koda bāzes audits un prioritāšu plāns. Tas nemaina lietotnes kodu, vizuālo dizainu, lapu izkārtojumu vai lietotāja darbplūsmu.

## Esošās lietotnes struktūras karte

Pašreizējā lietotne ir viena galvenā HTML lapa (`index.html`) ar atsevišķiem JS moduļiem. Galvenā navigācija ved uz sākumu, aprēķiniem un uzskaiti. Uzskaites vide tālāk izvēlas pašnodarbinātā/Z/S vai SIA darbplūsmu.

| Sadaļa / skats | Esošais saturs un ieejas punkts | Konteksts, ko sistēma jau zina | Kur palīdzība būtu vajadzīga |
|---|---|---|---|
| Sākums (`homeView`) | Sākšanas ceļvedis, auditorijas izvēle, finansējuma iespējas | Atvērta sākumlapa; ceļvedī izvēlēts Latvijas iedzīvotāja vai pārcelšanās ceļš; biznesa veids | Uzreiz parādīt piemērotāko sākuma ceļu un vienu nākamo soli, neuzspiežot profila anketu |
| Sākšanas ceļvedis (`guide`) | Rezidenta/pārcelšanās soļi un biznesa veida izvēle | Izvēlētais ceļš un biznesa veids | Izcelt konkrētajam ceļam nākamo veicamo soli, nepieciešamos dokumentus un oficiālo iestādi; skaidri atdalīt vispārīgu informāciju no individuālas juridiskas pārbaudes |
| Finansējuma iespējas (`fundingSection`) | Finansējuma programmu rezultāti | Finansējuma meklēšanas rezultāti un lietotāja izvēlētie filtri, ja tādi ir | Izskaidrot piemērotības iemeslu, termiņu, galvenos nosacījumus un nākamo pārbaudi; neapgalvot, ka lietotājs noteikti kvalificējas |
| Uzskaites sākuma izvēle (`accountingChoiceView`) | Pašnodarbinātais, SIA, Z/S | Lietotājs vēl nav saglabājis uzskaites režīma izvēli | Īsi izskaidrot atšķirības un ko katra izvēle nozīmē; neizvēlēties juridisko formu lietotāja vietā |
| Pašnodarbinātā / Z/S uzskaite (`recordsView`) | Ienākumu/izdevumu ieraksti, kategorijas, PVN sliekšņa atzīme, datu eksports un rezerves kopija | Ieraksta veids, summa, datums, kategorija, izvēlētais uzskaites režīms, saglabāto ierakstu kopa | Ievades brīdī izskaidrot vajadzīgos laukus, PVN sliekšņa atzīmes nozīmi, datu lokālo glabāšanu un drošu nākamo darbību |
| Rēķini (`invoiceTool`) | Rēķina rekvizīti, pozīcijas, PVN izvēle, saglabātie rēķini | Izrakstītāja/saņēmēja dati, datums, termiņš, pozīcijas, PVN statuss | Norādīt trūkstošos rekvizītus un pārbaudāmos nosacījumus pirms ģenerēšanas; neuzdot neobligātos laukus par obligātiem |
| SIA uzskaite (`siaView`) | Darījumu ievade, ieņēmumu/izdevumu kopsavilkums, žurnāls un grāmatojumu pārskats | Darījuma veids, datums, apraksts, summa, PVN likme, izdevumu konts | Izskaidrot katra lauka nozīmi, konta izvēles ierobežojumus un to, ka pašreizējais prototips nav pilnvērtīga grāmatvedības sistēma |
| Aprēķinu pārskats (`calculatorOverview`) | VSAOI, IIN un nodokļu režīmu rīku izvēle | Izvēlētais aprēķina veids | Palīdzēt izvēlēties pareizo aprēķinu pēc situācijas, skaidri parādot, kādi dati būs vajadzīgi |
| VSAOI aprēķins (`nodokli`) | Ceturkšņa peļņa, statuss, darbības veids, VSAOI objekts | Gads/ceturksnis, trīs mēnešu peļņa, statuss, ienākuma veids un izvēlētais objekts | Norādīt trūkstošos mēnešus, paskaidrot robežvērtības un atšķirt aprēķina rezultātu no faktiski maksājamās summas |
| Nodokļu režīmu salīdzinājums (`regime`) | Gada apgrozījums, izdevumi, VSAOI, citi ienākumi un PVN situācija | Ievadītie gada dati un atzīmētie izņēmumi | Parādīt, kuri ievaddati trūkst vai ir tikai pieņēmumi; izcelt, ka salīdzinājums pats nepārbauda tiesības izvēlēties režīmu |
| IIN prognoze (`iin`) | Gada peļņa, VSAOI, citi ienākumi, minimums un atvieglojumi | Daļa datu pārnesta no VSAOI aprēķina; manuālais režīms saglabāts pārlūkā | Parādīt datu avotu, neizmantotos laukus un atšķirt prognozi no gada deklarācijas vai VID aprēķina |
| VID soli pa solim palīgs | Atsevišķs palīga skats ar profila un uzdevuma izvēli | Izvēlētais nodokļu profils un VID uzdevums | Pēc izvēles automātiski sniegt konkrētajam uzdevumam vajadzīgo ceļu; pirms jebkādas ziņas nosūtīšanas saglabāt atsevišķu, skaidru piekrišanu AI pakalpojumam |

## Esošie palīdzības mehānismi un to robežas

### `context-engine.js`

- Izveido personalizācijas sadaļu sākumlapā pēc auditorijas izvēles.
- Piedāvā divus jautājumus: lietotāja pašreizējais posms un svarīgākā vajadzība.
- Atbildes tiek glabātas pārlūka `localStorage`; konts un servera pieprasījums nav vajadzīgs.
- Ja lietotājs profilu neaizpilda, personalizētais nākamais solis netiek parādīts.
- Risinājums ir sākumlapas līmeņa, nevis katras sadaļas/darbības konteksta palīgs.

**Secinājums:** saglabāt profilu kā neobligātu precizēšanas iespēju, bet nedrīkst to padarīt par priekšnoteikumu noderīgai palīdzībai.

### `contextual-help.js`

- Palīdzība parādās pēc atkārtotas formas kļūdas vai saglabāšanas kļūmes.
- Tajā ir skaidrojumi uzskaites, SIA, rēķinu un datu glabāšanas situācijām.
- Tā nav sākotnējā palīdzība, kas tiek parādīta, atverot sadaļu.

**Secinājums:** saglabāt kā kļūdu atkopšanas mehānismu. Tas neaizstāj palīdzību pirms kļūdas.

### Navigācija `index.html`

- `showView()` pārslēdz galvenos skatus.
- `showAccounting()` izvēlas uzskaites vidi pēc lokāli saglabātā režīma.
- `showAccountingSection()` atver attiecīgo uzskaites akordeonu un ritina uz vajadzīgo elementu.
- `showCalculatorPanel()` pārslēdz aprēķinu paneli.

**Iespēja:** šie jau esošie pārejas punkti var kļūt par vienotu, viegli testējamu konteksta noteikšanas slāni. Sākotnēji tam jānosaka tikai pašreizējā sadaļa un darbība, nepievienojot slēptu profilēšanu vai servera izsekošanu.

## Ieviešanas prioritātes

### P0 — pamata konteksts un drošas nākamās darbības

1. Definēt stabilus sadaļu un darbību identifikatorus: `home.start`, `records.new-income`, `records.new-expense`, `invoice.create`, `calculator.vsaoi`, `calculator.iin`, `calculator.regime`, `sia.transaction`, `vid.task`.
2. Katram identifikatoram uzturēt nelielu lokalizētu palīdzības aprakstu: kas tas ir, kāpēc svarīgi, kas vajadzīgs un viens nākamais solis.
3. Iegūt kontekstu no pašreizējās lapas un lietotāja jau ievadītajiem datiem; neprasīt profilu, ja pietiek ar lapas kontekstu.
4. Rādīt palīdzību pie esošā uzdevuma ieejas punkta tikai pēc atsevišķa UX apstiprinājuma par izvietojumu.
5. Saglabāt esošo `contextual-help.js` kļūdu atkopšanai.

### P1 — datu stāvoklim atbilstoši ieteikumi

1. Uzskaitē: trūkstošs datums/summa, ienākumu vai izdevumu izvēle, PVN sliekšņa atzīmes skaidrojums, rezerves kopijas atgādinājums atbilstošā brīdī.
2. Rēķinos: trūkstošie obligātie lauki, maksājuma termiņš un PVN izvēles skaidrojums.
3. Aprēķinos: nepilnīgi ievaddati, datu pārnešanas avots un rezultāta ierobežojumi.
4. Finansējumā: termiņš, atbilstības nosacījumi un pārbaudes nākamais solis.

### P2 — nozares un organizāciju darbplūsmas

1. Nozaru profilu izmantot tikai tad, ja lietotājs to jau izvēlējies vai brīvprātīgi pievieno.
2. Organizāciju darba vidi projektēt atsevišķi ar lomu un piekļuves tiesību kontroli; neizmantot pašreizējo pārlūka `localStorage` kā vairāku lietotāju koplietošanas risinājumu.
3. LAAPC finanšu darbplūsmas specifikācija paliek atsevišķs organizāciju lietojuma gadījums, nevis universālās individuālās uzskaites noklusējums.

## Tehniskie noteikumi

- Konteksta noteikšanai izmantot skaidras, tīras funkcijas, kuras var testēt bez pārlūka DOM.
- Palīdzības tekstus uzturēt latviešu un angļu valodā, ievērojot esošo `document.documentElement.lang` pieeju.
- Neveikt tīkla pieprasījumus tikai tāpēc, lai noteiktu pašreizējo lietotāja darbību.
- Personīgos finanšu datus neiekļaut analītikā, žurnālos vai servera pieprasījumos.
- Ieteikumu rādīšanai jābūt idempotentai: viena un tā pati navigācija nedrīkst radīt dublētus paziņojumus vai atkārtotus notikumus.
- Nedrīkst mainīt vai automātiski aizpildīt finanšu datus, nodokļu statusu vai juridisko formu pēc minējuma.
- Aprēķinu skaidrojumiem jānorāda, vai vērtība ir lietotāja ievade, no cita rīka pārnesta vērtība vai aprēķina rezultāts.
- AI palīgs ir atsevišķa funkcija ar skaidru piekrišanu; parasta kontekstuālā palīdzība darbojas lokāli un bez AI.

## Testēšanas matrica

| Scenārijs | Sagaidāmais rezultāts |
|---|---|
| Jauns apmeklētājs bez profila | Saņem noderīgu sākuma palīdzību; nav spiests aizpildīt profilu |
| Atver ienākumu ievadi | Redz ienākuma ierakstam būtisko skaidrojumu |
| Pārslēdzas uz izdevumu ievadi | Palīdzības konteksts mainās uz izdevumiem, nevis atkārto ienākumu padomu |
| Atver rēķinu sadaļu | Redz rēķina sagatavošanas vajadzīgo informāciju |
| Atver VSAOI aprēķinu ar tukšiem laukiem | Redz, kādi dati jāievada un par kuru periodu |
| Atver IIN prognozi ar pārnestiem datiem | Redz, no kurienes dati nāk un kas vēl jāievada |
| Pārslēdz valodu LV/EN | Palīdzības teksts mainās, dati un aprēķini paliek neskarti |
| Pārvietojas starp sadaļām | Netiek zaudēti ievadītie dati un neveidojas dublēti palīdzības elementi |
| Nav saglabāšanas iespējas | Tiek parādīts konkrēts drošs atkopšanas solis |
| Nav pietiekamu datu drošam ieteikumam | Tiek uzdots viens būtiskākais precizējošais jautājums |

## Pirms ieviešanas nepieciešamais apstiprinājums

Šis audits ļauj sagatavot un testēt neredzamo loģiku, tekstu katalogu un vienību testus. Taču automātiski parādīta jauna palīdzības satura izvietošana maina lietotāja saskarnes uzvedību. Tāpēc pirms tās ieviešanas esošajā produkta saskarnē jāsaņem atsevišķs apstiprinājums par konkrēto izvietojumu un uzvedību.

Līdz tam šis PR paliek dokumentācijas līmenī; nav veiktas izmaiņas lietotnes kodā, dizainā vai produkcijas vidē.
