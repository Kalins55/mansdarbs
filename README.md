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
- Šī demonstrācija nav oficiāls grāmatvedības reģistrs un neveic nodokļu aprēķinus.


## VID palīgs un AI savienojums

- Klikšķis uz galvenās VID / EDS saites atver VID EDS jaunā cilnē un Mansdarbs pilnekrāna VID ceļvedi pašreizējā cilnē.
- Ceļvedis darbojas arī bez AI savienojuma; lietotājs var izvēlēties reģistrāciju, pašnodarbinātā ziņojumu, gada deklarāciju vai reģistrācijas datu pārbaudi.
- Papildu jautājumu atbildes nodrošina Cloudflare Pages Function `/api/vid-assistant`, izmantojot OpenAI Responses API un oficiālo Latvijas iestāžu avotu meklēšanu.
- Lai aktivizētu AI atbildes, Cloudflare Pages projekta iestatījumos jāpievieno slepenais mainīgais `OPENAI_API_KEY`. Pēc noklusējuma tiek izmantots `gpt-6-luna`; to var mainīt ar neobligātu `OPENAI_MODEL`.
- API atslēga nekad nedrīkst atrasties HTML, JavaScript klienta kodā vai GitHub repozitorijā.
- AI jautājumu saturs tiek nosūtīts ārējam AI pakalpojumam. Lietotājam pirms nosūtīšanas tiek atgādināts neiekļaut paroles, personas kodu, Smart-ID kodus vai bankas datus.
- EDS pieslēgšanās, dokumentu iesniegšana un konta pārbaude vienmēr paliek paša lietotāja ziņā. Mansdarbs neprasa EDS piekļuves datus un neveic darbības lietotāja vietā.
- AI atbildēm jābalstās uz VID, likumi.lv, VSAA, Uzņēmumu reģistra, Finanšu ministrijas un Latvija.gov.lv avotiem; neskaidrās situācijās jānorāda uz nepieciešamību precizēt informāciju pie VID.

## Cloudflare Pages iestatījumi

Ja projekts tiek izvietots ar Cloudflare Pages un piesaistīts šim GitHub repozitorijam:

- Production branch: `main`
- Framework preset: `None`
- Build command: atstāt tukšu
- Build output directory: `/` (vai `.`, ja Cloudflare interfeiss to pieprasa)
- Root directory: `/` (noklusējums)

Svarīgi: šis ir statisks HTML prototips. To nevajag konfigurēt kā Vite/React projektu vai norādīt `npm run build`.

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
