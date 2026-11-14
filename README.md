# Mansdarbs

Vienkāršs, mobilajām ierīcēm pielāgots palīgs saimnieciskās darbības sākšanai un ikdienas ienākumu/izdevumu uzskaitei.

## Pašreizējā prototipa uzbūve

- Viena statiska lapa: `index.html`.
- Nav nepieciešama kompilēšana vai pakotņu instalēšana.
- Demonstrācijas ieraksti tiek glabāti tikai lietotāja pārlūkprogrammā (`localStorage`).
- Dati netiek nosūtīti uz serveri un netiek sinhronizēti starp ierīcēm.
- Šī demonstrācija nav oficiāls grāmatvedības reģistrs un neveic nodokļu aprēķinus.

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
