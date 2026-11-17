# Mansdarbs

Vienkāršs, mobilajām ierīcēm pielāgots palīgs saimnieciskās darbības sākšanai un ikdienas ienākumu/izdevumu uzskaitei.

## Pašreizējā prototipa uzbūve

- Viena statiska lapa: `index.html`.
- Nav nepieciešama kompilēšana vai pakotņu instalēšana.
- Demonstrācijas ieraksti tiek glabāti tikai lietotāja pārlūkprogrammā (`localStorage`).
- Sākumlapā pieejams neobligāts situācijas profils (darbības stadija un aktuālā vajadzība), kas parāda pielāgotu nākamo soli; profils tiek glabāts tikai pārlūkprogrammā, to var mainīt vai dzēst, un tas netiek izmantots analītikai.
- Situācijas profils nolasa arī atsevišķi saglabāto nozares profilu un sākumlapā parāda izvēlēto nozari/nodarbošanos vai aicina to pievienot; abi profili paliek atsevišķi un tiek glabāti lokāli pārlūkā.
- Ienākumu, izdevumu un rēķinu dati paliek lietotāja pārlūkprogrammā un netiek nosūtīti serverim.
- Ja lietotājs pats atver VID palīga jautājumu sadaļu un nosūta ziņu, tās saturs tiek nosūtīts uz `/api/vid-assistant` un tālāk uz OpenAI API atbildes sagatavošanai; saruna netiek saglabāta Mansdarbs serverī.
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
- Ja lietotāja dati ir pietiekami, jāsalīdzina vispārējais nodokļu režīms ar pieejamām alternatīvām (tostarp mikrouzņēmumu nodokli), ņemot vērā ieņēmumus, attaisnotos izdevumus, peļņu, citus ienākumus, sociālās apdrošināšanas sekas un tiesības izvēlēties attiecīgo režīmu. Pašreizējais salīdzinātājs ir orientējošs: lietotājs ievada gada apgrozījumu, izdevumus un vispārējā režīma VSAOI; MUN tiek rēķināts kā 25% no apgrozījuma, no tā 80% attiecinot uz sociālo apdrošināšanu un 20% uz IIN. Ja PVN reģistrācijas situācija nav atbilstoša vai ir neskaidra, rīks neizsaka MUN izvēles ieteikumu. Salīdzinājums neaizstāj individuālu VID atbilstības pārbaudi.
- Ieteikumu nedrīkst balstīt tikai uz vienu ieņēmumu vai apgrozījuma robežvērtību. Jāparāda pieņēmumi, aptuvenā nodokļu starpība naudā, būtiskākie ierobežojumi un datu trūkumi.
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
