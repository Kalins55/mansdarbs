# Mansdarbs

Vienkāršs, mobilajām ierīcēm pielāgots palīgs saimnieciskās darbības sākšanai un ikdienas ienākumu/izdevumu uzskaitei.

## Pašreizējā prototipa uzbūve

- Viena statiska lapa: `index.html`.
- Nav nepieciešama kompilēšana vai pakotņu instalēšana.
- Demonstrācijas ieraksti tiek glabāti tikai lietotāja pārlūkprogrammā (`localStorage`).
- Sākumlapā pieejams neobligāts situācijas profils (darbības stadija un aktuālā vajadzība), kas parāda pielāgotu nākamo soli; profils tiek glabāts tikai pārlūkprogrammā, to var mainīt vai dzēst, un tas netiek izmantots analītikai.
- Situācijas profils nolasa arī atsevišķi saglabāto nozares profilu un sākumlapā parāda izvēlēto nozari/nodarbošanos vai aicina to pievienot; abi profili paliek atsevišķi un tiek glabāti lokāli pārlūkā.
- Ienākumu, izdevumu un rēķinu dati paliek lietotāja pārlūkprogrammā un netiek nosūtīti serverim.
- Ja lietotājs pats atver VID palīga jautājumu sadaļu un nosūta ziņu, jautājums, pēdējās sarunas ziņas un izvēlētais VID uzdevuma/profila konteksts tiek nosūtīts uz `/api/vid-assistant` un tālāk uz OpenAI API tikai pēc skaidras piekrišanas. Piekrišana attiecas uz pašreizējo pārlūka cilnes sesiju un tiek glabāta tikai `sessionStorage`; cilnes aizvēršana to pārtrauc. API serveris pieprasījumus bez `consent: true` noraida. Šī pārbaude nodrošina skaidru klienta protokolu, bet nav neatkarīgs pierādījums lietotāja piekrišanai — publiskā pārlūka pieprasījuma karodziņu var mainīt. Saruna netiek saglabāta Mansdarbs serverī.
- Šī demonstrācija nav oficiāls grāmatvedības reģistrs. Tajā ir orientējoši 2026. gada VSAOI un IIN aprēķini; tie neaizstāj VID EDS aprēķinu un neaptver visus īpašos nodokļu režīmus.


## VSAOI un IIN aprēķini

- VSAOI kalkulators atbalsta standarta pašnodarbinātā 31,07% likmi un vecuma pensijas tiesību gadījumā piemērojamo 29,36% likmi.
- Parastai saimnieciskajai darbībai 10% pensiju iemaksas tiek aprēķinātas katram mēnesim atsevišķi.
- Lauksaimnieciskās ražošanas un intelektuālā īpašuma ienākumiem pieejams atsevišķs gada 10% aprēķina režīms; tajā gada rezultātā tiek ņemti vērā arī zaudējumu mēneši.
- Ja vienā ceturksnī ir gan lauksaimnieciskās ražošanas/intelektuālā īpašuma, gan cita veida saimnieciskās darbības ienākumi, nepieciešams VID noteiktais proporcijas aprēķins — pašreizējais vienkāršotais kalkulators šo gadījumu vēl neatbalsta.
- Pensionāra statusa kombinācija ar lauksaimniecības vai intelektuālā īpašuma gada režīmu tiek bloķēta, jo šiem statusiem var būt īpaši izņēmumi, kas vēl nav ieviesti.
- Nekustamā īpašuma apsaimniekotāja īpašā likme un citi individuāli statusi vēl nav pilnībā ieviesti. Īpašos gadījumos summas jāpārbauda VID EDS.
- Aprēķinu dati tiek glabāti lietotāja pārlūkprogrammā kopā ar pārējiem lokālajiem demonstrācijas datiem.
- IIN prognozes VSAOI lauku var automātiski aizpildīt no ceturkšņu aprēķiniem vai manuāli pielāgot faktiskajām attiecīgajā kalendāra gadā samaksātajām iemaksām.

## Proaktīvie nodokļu paziņojumi un režīma salīdzināšana

Mansdarbs attīstībā jāievēro šādi principi:

- Lietotājs jāinformē par īpašiem nodokļu aprēķina gadījumiem (piemēram, jauktu lauksaimniecisko un citu saimniecisko darbību), tiklīdz ievadītie dati liecina, ka standarta kalkulators konkrētajai situācijai nav piemērojams.
- Paziņojumam skaidri jāpasaka, kas tieši jāprecizē, kāpēc tas ir svarīgi un kāds ir drošākais nākamais solis. Ja aprēķins nav atbalstīts, nedrīkst parādīt maldinošu maksājuma summu.
- Jāseko lietotāja uzskaitītajam apgrozījumam un jābrīdina par tuvošanos būtiskiem nodokļu sliekšņiem, tostarp PVN reģistrācijas slieksnim. Jānorāda, ka apgrozījuma slieksnis un nodokļu režīma izvēle ir atšķirīgi jautājumi.
- PVN sliekšņa brīdinājums tiek aprēķināts atsevišķi no peļņas: lietotājs pats atzīmē darījumus, kurus uzskata par ieskaitāmiem 50 000 € kalendārā gada slieksnī. Vecie ieraksti bez šīs atzīmes netiek automātiski pieskaitīti. Pie 80% tiek parādīts atgādinājums, pie 90% — izteiktāks brīdinājums; īpašie darījumu veidi un obligātās reģistrācijas gadījumi jāprecizē VID. Šī atzīme pieejama arī nozares uzskaites ienākumiem; tie tiek ieskaitīti tikai tad, ja lietotājs konkrēto darījumu atzīmē. Nozares ienākumi, izdevumi un klientu atmaksas tiek ņemtas vērā arī IIN brīdinājuma peļņas orientierī.
- Ja lietotāja dati ir pietiekami, jāsalīdzina vispārējais nodokļu režīms ar pieejamām alternatīvām (tostarp mikrouzņēmumu nodokli), ņemot vērā ieņēmumus, attaisnotos izdevumus, peļņu, citus ienākumus, sociālās apdrošināšanas sekas un tiesības izvēlēties attiecīgo režīmu. Pašreizējais salīdzinātājs ir orientējošs: gada ieņēmumus un izdevumus var pārņemt no lietotāja pārlūkprogrammā saglabātajiem uzskaites ierakstiem, izvēloties kalendāra gadu; manuāli ievadītas vērtības netiek pārrakstītas. Importā apvieno pamata un nozares uzskaites ienākumus un izdevumus. Klientu atmaksas netiek automātiski ieskaitītas apgrozījumā, jo atgrieztas preces darījuma korekcija var būt jāattiecina uz sākotnējo deklarācijas periodu; salīdzinātājs par tām brīdina, un lietotājam jāpārbauda, vai apgrozījums jāprecizē manuāli. Vispārējā režīma VSAOI; MUN tiek rēķināts kā 25% no apgrozījuma, no tā 80% attiecinot uz sociālo apdrošināšanu un 20% uz IIN. Ja PVN reģistrācijas situācija nav atbilstoša vai ir neskaidra, rīks neizsaka MUN izvēles ieteikumu. Salīdzinājums neaizstāj individuālu VID atbilstības pārbaudi.
- Salīdzinātājs atšķir vispārīgo PVN reģistrāciju no īpašās PVN reģistrācijas saskaņā ar PVN likuma 139.² pantu, kurā noteiktos apstākļos MUN statusu var saglabāt. Minimālā 50 € IIN izņēmums tiek piemērots tikai tad, ja lietotājs apstiprina faktisku maksājumu vai citu VID noteiktu atbrīvojumu; aprēķināta, bet nesamaksāta VSAOI summa pati par sevi to neapstiprina.
- Ieteikumu nedrīkst balstīt tikai uz vienu ieņēmumu vai apgrozījuma robežvērtību. Jāparāda pieņēmumi, aptuvenā nodokļu starpība naudā, būtiskākie ierobežojumi un datu trūkumi.
- Režīmu salīdzinātājs papildus brīdina, ja aprēķinātais MUN pārsniedz peļņu pēc izdevumiem vai ja vispārējā režīma nodokļu kopsumma pārsniedz norādīto peļņu. Šāds brīdinājums neizmaina lietotāja ievadītos datus un neaizstāj individuālu nodokļu aprēķinu.
- Pirms gada datu pārņemšanas no lokālās uzskaites salīdzinātājs pārbauda kalendāra datuma derīgumu, ieraksta veidu un summas korektumu. Nederīgos ierakstus aprēķinā neiekļauj un skaidri parāda, cik ierakstu izlaists; ja visi atlasītie ieraksti ir nederīgi, salīdzinājums netiek aizpildīts.
- Paziņojumi ir informatīvi, nevis automātiska nodokļu režīma maiņa vai garantija par ietaupījumu. Lietotājs pats pieņem lēmumu un pirms reģistrācijas izmaiņām pārbauda aktuālos nosacījumus VID.
- Paziņojumu biežumam jābūt samērīgam: viens skaidrs brīdinājums pie sliekšņa tuvošanās, nevis atkārtoti uznirstoši paziņojumi katrā apmeklējumā.
- Finanšu dati pašreizējā prototipā paliek lietotāja pārlūkprogrammā. Proaktīvie brīdinājumi jāaprēķina lokāli; tos nedrīkst saukt par uzvedības analītiku vai servera uzraudzību.

## Aprēķinu testēšana

Ja datorā ir instalēts Node.js, VSAOI aprēķinu regresijas testus var palaist ar:

```bash
node --test tests/*.test.js
```

Testi pārbauda VSAOI aprēķinus, vispārējā režīma un MUN salīdzinājuma scenārijus, nodokļu brīdinājumus pēc ierakstu labošanas, nozares ierakstu iekļaušanu IIN/PVN brīdinājumos, vietējo datumu apstrādi, vietnes lokālo skriptu esamību, Cloudflare Pages/Worker statisko resursu norādes un Meta priekšskatījuma attēla failu.

## VID palīgs un AI savienojums

- Klikšķis uz galvenās VID / EDS saites atver VID EDS jaunā cilnē un Mansdarbs pilnekrāna VID ceļvedi pašreizējā cilnē.
- Ceļvedis darbojas arī bez AI savienojuma; lietotājs var izvēlēties reģistrāciju, pašnodarbinātā ziņojumu, gada deklarāciju vai reģistrācijas datu pārbaudi.
- Papildu jautājumu atbildes nodrošina Cloudflare Pages Function `/api/vid-assistant`, izmantojot OpenAI Responses API un oficiālo Latvijas iestāžu avotu meklēšanu.
- Lai aktivizētu AI atbildes, Cloudflare Pages projekta iestatījumos jāpievieno slepenais mainīgais `OPENAI_API_KEY`. Pēc noklusējuma tiek izmantots `gpt-6-luna`; to var mainīt ar neobligātu `OPENAI_MODEL`.
- API atslēga nekad nedrīkst atrasties HTML, JavaScript klienta kodā vai GitHub repozitorijā.
- AI jautājumu saturs tiek nosūtīts ārējam AI pakalpojumam. Lietotājam pirms nosūtīšanas tiek atgādināts neiekļaut paroles, personas kodu, Smart-ID kodus vai bankas datus.
- EDS pieslēgšanās, dokumentu iesniegšana un konta pārbaude vienmēr paliek paša lietotāja ziņā. Mansdarbs neprasa EDS piekļuves datus un neveic darbības lietotāja vietā.
- AI atbildēm jābalstās uz VID, likumi.lv, VSAA, Uzņēmumu reģistra, Finanšu ministrijas un Latvija.gov.lv avotiem; neskaidrās situācijās jānorāda uz nepieciešamību precizēt informāciju pie VID.

## Publicēšana un Cloudflare konfigurācija

**Galvenā Mansdarbs versija atrodas repozitorija saknē.** Cloudflare Pages projektam, kas piesaistīts šim GitHub repozitorijam, izmanto:

- Production branch: `main`
- Framework preset: `None`
- Build command: atstāt tukšu
- Build output directory: `/` (vai `.`, ja Cloudflare interfeiss to pieprasa)
- Root directory: `/` (noklusējums)

Šī ir statiska HTML vietne ar Cloudflare Pages Function mapē `functions/api/`. Tai nevajag Vite/React kompilēšanu vai `npm run build`.

**Svarīga atšķirība:** `wrangler.jsonc` konfigurē atsevišķu Cloudflare Worker statisko resursu izvietošanu no mapes `public/`. Tas nav Cloudflare Pages izvades mapes iestatījums. `public/` pašlaik ir vecāka vietnes kopija, nevis galvenais izstrādes avots; tajā vēl nav visu jaunāko funkciju un Pages API maršruta. Tāpēc `wrangler deploy` ar šo konfigurāciju nav līdzvērtīgs pilnas Mansdarbs Pages vietnes publicēšanai.

Ja vēlāk izvēlamies pāriet uz vienotu Workers izvietošanu, vispirms jāpārnes un jāpārbauda visas lapas, skripti un API funkcijas. Līdz tam izmaiņas galvenajā vietnē jāveic saknes failos, un publisko Pages versiju jāpublicē no saknes mapes.

## Pirms publiskas palaišanas pārbaudīt

1. Sākumlapa atveras gan datorā, gan telefonā.
2. Abas galvenās izvēles atver pareizo sadaļu.
3. VID un EDS saites atveras jaunā cilnē.
4. Var pievienot ienākumu un izdevumu, un kopsummas ir pareizas.
5. Ieraksti saglabājas pēc lapas pārlādes tajā pašā pārlūkā.
6. Aprakstā ievadīts HTML teksts tiek parādīts kā teksts, nevis izpildīts.
7. Dzēšanas poga prasa apstiprinājumu.
8. Pārlūka privātuma ierobežojumu gadījumā lietotājs saņem saprotamu kļūdas paziņojumu.

## Drošības robežas

Nekad neievietot repozitorijā VID/EDS paroles, API atslēgas, piekļuves tokenus vai reālu lietotāju personas/nodokļu datus. Pirms kontu, servera datubāzes vai analītikas ieviešanas jāizstrādā atsevišķs privātuma un datu aizsardzības risinājums.


### Nozares uzskaites ienākumu un izdevumu kopsavilkums

Nozares ierakstos katram darījumam var norādīt ienākumu, izdevumu vai klientam veiktu atmaksu. Nozares skatā tiek aprēķinātas šo kategoriju kopsummas un atlikums pirms nodokļiem. Vecie ieraksti paliek lasāmi un tiek saglabāti kā ienākumi, jo iepriekš tiem nebija atsevišķa darījuma veida. Šis kopsavilkums nav nodokļu aprēķins.


### Kopējais finanšu pārskats

Kopējais pārskats apvieno pašnodarbinātā pamata uzskaites ierakstus un visus nozares uzskaites ierakstus no tās pašas pārlūkprogrammas. Tas rāda ienākumus, izdevumus, klientu atmaksas, atlikumu pirms nodokļiem un pēdējo sešu aktīvo mēnešu rezultātus. SIA darījumi netiek jaukti šajā pārskatā, jo uzņēmuma grāmatvedība ir atsevišķa. Pārskats ir informatīvs un nav nodokļu aprēķins.


## Nozaru projektu un finansējuma iespēju meklētājs

Mansdarbs attīstības prasība: lietotājam jāspēj atrast gan tieši savai nozarei paredzētus Latvijas un ES projektus, gan starpnozaru atbalstu uzņēmējdarbības uzsākšanai un attīstībai. Atlasei jāņem vērā faktiskā darbība un NACE 2.1 kods, uzņēmējdarbības forma, darbības stadija, reģions un konkrētais ieguldījuma mērķis. Jāiekļauj arī plānotie konkursi, lai lietotājs var sagatavoties pirms pieteikšanās sākuma.

Finansējuma veidi jānodala: grants, aizdevums, garantija, kapitāla ieguldījums, nodokļu atvieglojums un nefinansiāls atbalsts. Katram piedāvājumam jānorāda oficiālais avots, termiņš, atbilstības kritēriji, summa/atbalsta intensitāte, līdzfinansējums un pēdējās pārbaudes datums. Nekad nedrīkst garantēt atbilstību vai finansējuma saņemšanu, un aizdevumu nedrīkst pasniegt kā grantu.

Sākotnējā meklēšana paliek anonīma; nozares profils pēc noklusējuma tiek izmantots lokāli pārlūkā. Lietotāja finanšu ieraksti un dokumenti netiek nosūtīti finansējuma katalogam. Pilnā specifikācija: [docs/sector-funding-discovery.md](docs/sector-funding-discovery.md). Sākotnējie oficiālie avoti reģistrēti [funding-sources.json](funding-sources.json); tas vēl nav automātiski atjaunots finansējuma katalogs. Avotu reģistra struktūru pārbauda arī atsevišķs tests.


### Finansējuma atlases tehniskais pamats

Pievienots lokāls atlases modulis `funding-discovery.js`, kas lasa jau saglabātos nozares profilus no pārlūka, salīdzina tos ar programmu nozares, NACE kodu, uzņēmējdarbības formas, stadijas, reģiona un atbalsta mērķa kritērijiem, kā arī nošķir tieši nozarei paredzētu atbalstu no starpnozaru iespējām. Tas neraksta un nesūta profila datus uz serveri. Programmu datu modelis atrodas `funding-programs.json`; tajā jau ievietoti pirmie pieci oficiālajos avotos pārbaudītie programmu ieraksti. Tas vēl nav pilns katalogs un netiek automātiski atjaunots. Modulis vēl nav pieslēgts lietotāja saskarnei, lai neveiktu neapstiprinātas dizaina vai izkārtojuma izmaiņas.


## Nozaru finansējuma un projektu meklētājs

Sākumlapā ir kompakta finansējuma sadaļa, kas izmanto lietotāja pārlūkprogrammā saglabāto nozares profilu, lai atlasītu nozares un starpnozaru atbalsta iespējas. Finansējuma katalogs tiek ielādēts kā publiski statiski dati; lietotāja nozares profils, finanšu ieraksti un dokumenti netiek nosūtīti atlases servera pieprasījumā. Rezultātos tiek parādīts atbalsta veids, pieteikšanās statuss un termiņš, summa vai kopējais programmas budžets, oficiālais avots un pēdējās pārbaudes datums. Aizdevumi ir skaidri marķēti kā atmaksājami.

Pašreizējais katalogs ir sākotnējs un nav pilns visu Latvijas vai ES iespēju saraksts. Programmu statusi un nosacījumi ir manuāli pārbaudāmi; automātiska avotu uzraudzība un paziņojumi vēl nav ieviesti. Skatīt `docs/sector-funding-discovery.md`.


### VID palīga pieprasījumu biežuma ierobežošana

Lietojumprogrammas API pārbauda izcelsmi, pieprasījuma formātu, lietotāja piekrišanas karogu un pieprasījuma izmēru, taču šīs pārbaudes neaizstāj tīkla līmeņa biežuma ierobežošanu. Pirms plašākas publiskas AI palīga lietošanas Cloudflare zonā jāizveido WAF Rate Limiting rule:

- Nosacījums: `http.request.uri.path eq "/api/vid-assistant" and http.request.method eq "POST"`.
- Skaitītājs: IP adrese.
- Sākotnējais slieksnis: 30 pieprasījumi 60 sekundēs no vienas IP adreses; pēc reālās lietošanas novērojumiem slieksni pielāgot.
- Pārsniedzot slieksni: bloķēt ar HTTP 429 un īsu ierobežojuma periodu.

**Svarīgi:** IP adreses ierobežojums var ietekmēt vairākus lietotājus, kuri atrodas aiz viena kopīga tīkla vai mobilo sakaru operatora NAT. Tāpēc slieksni nevajag iestatīt pārāk zemu. Cloudflare plānos pieejamie skaitītāja parametri un noteikumu skaits atšķiras; Free plānā pieejamais IP skaitītājs nav individuāla lietotāja identifikācija. Noteikums jāizveido Cloudflare vadības panelī sadaļā Security rules → Create rule → Rate limiting rules. Tas nav automātiski ieslēgts ar GitHub izmaiņām.
