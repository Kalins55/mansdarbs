# Mansdarbs

Vienkāršs, mobilajām ierīcēm pielāgots palīgs saimnieciskās darbības sākšanai un ikdienas uzskaitei.

## Aktīvā prototipa struktūra

- `wrangler.jsonc` norāda statisko failu mapi `./public`.
- `public/index.html` ir aktīvā sākumlapa un galvenā prototipa saskarne.
- `public/mi-konsultants.html` ir atsevišķs noteikumos balstīts konsultanta demonstrācijas prototips; tas nav savienots ar īstu MI.
- `functions/api/` satur API galapunktu kodu darbības veidu katalogam, anonīmiem lietošanas notikumiem un apmeklējumu skaitītājam. To darbība ir atkarīga no izvietošanas vides atbalsta funkcijām un KV piesaistes.
- Saknes `index.html` ir agrāks atsevišķs prototips. Tas nav statisko failu mapē un nav aktīvā lapa saskaņā ar pašreizējo `wrangler.jsonc`.

## Izstrāde un izvietošana

- Statiskajiem HTML failiem nav nepieciešama kompilēšana vai pakotņu instalēšana.
- Aktīvais statisko failu direktorijs ir `public/`, nevis repozitorija sakne.
- Pirms izvietošanas pārbaudi, vai izmantotais Cloudflare produkts un konfigurācija atbalsta arī `functions/api/` maršrutus. Ar `assets.directory` iestatījumu vien nepietiek, lai pieņemtu, ka API funkcijas ir izvietotas.
- Production branch ir `main`; izstrādes un pārbaudes izmaiņas veic `test` zarā. Nekādas izmaiņas produkcijā bez atsevišķas atļaujas.

## Datu glabāšana un servera konfigurācija

- Aktīvās sākumlapas demonstrācijas ienākumu/izdevumu ieraksti tiek turēti tikai atvērtās lapas JavaScript atmiņā; pārlādējot lapu, tie pazūd.
- Konsultanta atbildes tiek turētas tikai lapas atmiņā un netiek sūtītas serverim, VID vai EDS.
- Darbības veidu kopīgajam katalogam un apkopotajiem lietošanas notikumiem vajadzīga Cloudflare KV namespace binding ar nosaukumu `VISITS`. Bez tās darbības veidu GET atgriež tukšu sarakstu, bet lietošanas notikumu galapunkts neko nesaglabā.
- Apmeklējumu statistikas GET galapunktam papildus vajadzīgs noslēpums `STATS_TOKEN`. To nedrīkst glabāt HTML vai publiskā repozitorija kodā.
- Pirms publiskas analītikas aktivizēšanas jāpārbauda privātuma paziņojums, glabāšanas termiņi, piekļuves kontrole un hostinga žurnālu politika.

## Pirms publiskas palaišanas pārbaudīt

1. Aktīvā lapa atveras datorā un telefonā.
2. Abas sākuma izvēles atver pareizo plūsmu.
3. Konsultanta sarunas izlaišana, atgriešanās, atbilžu labošana un atiestatīšana darbojas.
4. Uzskaites ienākumu un izdevumu izvēlnes pārslēdz pareizo darījuma veidu.
5. Ievadītās summas tiek validētas un netiek sajauktas ar nodokļu aprēķiniem.
6. VID un EDS saites atver oficiālās vietnes jaunā cilnē.
7. Lietotāja teksts tiek attēlots droši kā teksts, nevis izpildāms HTML.
8. API galapunkti ir pārbaudīti gan ar konfigurētu KV, gan bez tās.

## Drošības robežas

Nekad neievietot repozitorijā VID/EDS paroles, API atslēgas, piekļuves tokenus vai reālu lietotāju personas/nodokļu datus. Prototips nav oficiāls grāmatvedības reģistrs, neveic juridiski saistošus aprēķinus un neko neiesniedz VID.
