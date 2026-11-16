# Kļūdu pārbaude un labojumi — 2026-11-16

## Labojumi test zarā

### Aktīvā testa lapa (index.html)
- Uzskaites ātrā, sakļaujamā izvēlne pievienota faktiskajai testa lapai. Iepriekšējā izvēlnes izmaiņa bija tikai public/index.html, bet testa adrese rādīja saknes index.html.
- Summas, kas pēc noapaļošanas būtu mazākas par 0,01 €, vairs netiek saglabātas kā 0,00 € ieraksti.
- CSV eksports aizsargā lietotāja aprakstus, kas sākas ar =, +, - vai @, lai izklājlapā tie netiktu interpretēti kā formulas.
- CSV lejupielādes objekta URL tiek atbrīvots ar nelielu aizkavi, nevis uzreiz pēc klikšķa, lai nepārtrauktu lejupielādi mobilajos pārlūkos.
- VSAOI aprēķinam jāievada visi trīs mēneši; ja peļņas nav, jāievada 0. Tukšs VSAOI objekta lauks vairs netiek klusi aizstāts ar 780 €.
- IIN prognozei jāievada gada peļņa; 0 ir atļauta skaidra vērtība.

### Otrā saskarne un API
- public/index.html: salabota pielāgota darbības veida nosaukuma atstarpju normalizācija.
- functions/api/activity.js: pieprasījuma saturs ierobežots līdz 512 rakstzīmēm; bojāts KV skaitītājs vairs neizraisa NaN un tiek droši atiestatīts pirms nākamā skaitījuma.
- README.md: precizēts, ka repozitorijā ir divas atšķirīgas HTML saskarnes un ka izvietošanas konfigurācijas pašlaik nav pilnībā salāgotas.

## Pārbaudes, kas izpildītas

- JavaScript sintakses pārbaude visām trim HTML lapām un visiem trim API moduļiem.
- Pārbaudīts, ka HTML lapās nav dublētu ID un ka statiski norādītie DOM ID ir atrodami.
- Izmēģināta ātrās izvēlnes loģika ar testa DOM: ienākumu/izdevumu izvēle, ritināšana, izvēlnes aizvēršana un fokuss uz summas lauku.
- Pārbaudīta pielāgota darbības veida vairāku atstarpju normalizācija.
- Pārbaudīts, ka VSAOI un IIN kalkulatori aptur aprēķinu, ja obligātie lauki ir tukši, bet pieņem skaidri ievadītu 0.
- Pārbaudīts, ka summas zem viena centa tiek noraidītas un 12,345 € tiek noapaļoti līdz 12,35 €.
- Pārbaudīts CSV formulas aizsardzības rezultāts piemēriem ar =, +, - un @.
- API testā pārbaudīts, ka pārāk liels aktivitātes pieprasījums saņem HTTP 413, derīgs pieprasījums tiek pieņemts, bet bojāts skaitītājs tiek atjaunots.

## Neatrisinātie riski un ierobežojumi

1. Divas atšķirīgas saskarnes: index.html un public/index.html joprojām ir atsevišķas lietotnes. Tās nav apvienotas, tāpēc turpmākas izmaiņas var atkal atšķirties.
2. Izvietošanas konfigurācija: pārlūkā pārbaudītā test.mansdarbs.pages.dev adrese rādīja saknes index.html, bet wrangler.jsonc norāda public/. Jāpārbauda Cloudflare Pages projekta faktiskā Build output directory un Wrangler lietošanas veids, pirms mainīt izvietošanas konfigurāciju.
3. Pārlūka pārbaude pēc labojumiem: testa adrese pārbaudes brīdī vēl nerādīja jaunāko test zara saturu. Tāpēc jaunie labojumi ir pārbaudīti koda un izolētu loģikas testu līmenī, bet nav apstiprināti ar dzīvu pārlūka testu pēc izvietošanas. Izvietošana netika veikta.
4. API aizsardzība: aktivitāšu un apmeklējumu skaitītājiem joprojām vajadzīga izvietošanas vides pārbaude, KV piesaiste un pirms publiskas lietošanas ātruma ierobežošana. Vienkāršais KV skaitītājs nav atomisks.
5. Nodokļu juridiskā validācija: šie labojumi novērš ievades un saskarnes kļūdas, bet neaizstāj pilnu VSAOI/IIN formulas un 2026. gada normatīvo noteikumu neatkarīgu auditu.

## Drošības robeža

Visas izmaiņas veiktas tikai test zarā. main un produkcija nav mainīti. Nekāda izvietošana nav veikta.
