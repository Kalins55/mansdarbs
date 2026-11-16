# Mansdarbs

Vienkāršs, mobilajām ierīcēm pielāgots palīgs saimnieciskās darbības sākšanai un ikdienas uzskaitei.

## Pašreizējā koda un izvietošanas struktūra

Repozitorijā ir divas atsevišķas HTML saskarnes, kuras pagaidām nav apvienotas:

- `index.html` — pilnīgākais prototips ar sākumlapu, VSAOI/IIN kalkulatoriem un uzskaiti.
- `public/index.html` — atsevišķs, vienkāršāks prototips ar sākuma izvērtējumu un uzskaites cilni.
- `public/mi-konsultants.html` — noteikumos balstīts konsultanta demonstrācijas prototips; tas nav savienots ar īstu MI.

**Izvietošanas neatbilstība, kas jāņem vērā:** pārlūkā pārbaudītā testa adrese `https://test.mansdarbs.pages.dev/` šīs pārbaudes laikā rādīja saknes `index.html` saturu. Savukārt `wrangler.jsonc` statisko aktīvu mapi norāda uz `./public`. Tātad Pages testa izvietošana un Wrangler konfigurācija pašlaik var izmantot atšķirīgus ieejas failus. Pirms izvietošanas procesa maiņas jāpārbauda Cloudflare projekta faktiskie iestatījumi; nedrīkst pieņemt, ka abi ieejas faili ir savstarpēji aizvietojami.

## Izstrāde un izvietošana

- HTML/JavaScript prototipiem nav nepieciešama kompilēšana vai pakotņu instalēšana.
- Testa izmaiņas veic `test` zarā. `main` un produkcija nav jāmaina bez atsevišķas atļaujas.
- `functions/api/` satur API galapunktu kodu darbības veidu katalogam, anonīmiem lietošanas notikumiem un apmeklējumu skaitītājam. To darbība ir atkarīga no izvietošanas vides atbalsta funkcijām un KV piesaistes.
- Ar `assets.directory: ./public` iestatījumu vien nepietiek, lai pieņemtu, ka `functions/api/` galapunkti ir izvietoti. Pirms to izmantošanas jāpārbauda izvēlētā Cloudflare izvietošanas režīma atbalsts un maršrutēšana.

## Datu glabāšana un servera konfigurācija

- Saknes `index.html` demonstrācijas uzskaite tiek glabāta pārlūka `localStorage` šajā ierīcē.
- `public/index.html` vienkāršākās uzskaites ieraksti tiek turēti tikai atvērtās lapas JavaScript atmiņā; pārlādējot lapu, tie pazūd.
- Konsultanta atbildes tiek turētas tikai lapas atmiņā un netiek sūtītas serverim, VID vai EDS.
- Darbības veidu kopīgajam katalogam un apkopotajiem lietošanas notikumiem vajadzīga Cloudflare KV namespace binding ar nosaukumu `VISITS`. Bez tās darbības veidu GET atgriež tukšu sarakstu, bet lietošanas notikumu galapunkts neko nesaglabā.
- Apmeklējumu statistikas GET galapunktam papildus vajadzīgs noslēpums `STATS_TOKEN`. To nedrīkst glabāt HTML vai publiskā repozitorija kodā.
- Pirms publiskas analītikas aktivizēšanas jāpārbauda privātuma paziņojums, glabāšanas termiņi, piekļuves kontrole un hostinga žurnālu politika.

## Pārbaudes pirms publiskas palaišanas

1. Pārbaudi, kuru ieejas failu faktiski izmanto Pages un kuru — Wrangler.
2. Pārbaudi sākumlapu datorā un telefonā.
3. Pārbaudi galvenās navigācijas pogas un uzskaites ātro izvēlni.
4. Pārbaudi ierakstu pievienošanu, labošanu, dzēšanu, perioda filtru un CSV eksportu.
5. Pārbaudi, ka CSV apraksti, kas sākas ar `=`, `+`, `-` vai `@`, netiek interpretēti kā izklājlapas formulas.
6. Pārbaudi konsultanta sarunas izlaišanu, atgriešanos, atbilžu labošanu un atiestatīšanu.
7. Pārbaudi API galapunktus gan ar konfigurētu KV, gan bez tās.
8. Nodokļu aprēķinu formulas un juridiskos skaidrojumus pirms publiskas izmantošanas atsevišķi salīdzini ar aktuālajiem VID avotiem.

## Drošības robežas

Nekad neievietot repozitorijā VID/EDS paroles, API atslēgas, piekļuves tokenus vai reālu lietotāju personas/nodokļu datus. Prototips nav oficiāls grāmatvedības reģistrs, neveic juridiski saistošus aprēķinus un neko neiesniedz VID.
