# Mansdarbs privātuma un API audits — 2026-11-17

## Tvērums un robežas

Pārskatīti GitHub repozitorija `Kalins55/mansdarbs` faili:
- `main`: `index.html`, `functions/api/vid-assistant.js`
- `test`: `public/index.html`, `functions/api/activity.js`, `functions/api/learning.js`, `functions/api/visit.js`, `mi-konsultants.html`, `README.md` un ar testiem saistītās piezīmes.

Šis ir koda pārskats, nevis Cloudflare vides, hostinga žurnālu, reālu tīkla pieprasījumu vai juridiskās atbilstības audits. Nekas nav izvietots vai ieslēgts.

## Galvenie secinājumi

### P0 — Brīvais darbības nosaukums nonāk serverī

`test/public/index.html` nosūta `answers.activity` uz `POST /api/activity`. Lietotājs šo vērtību var ierakstīt brīvā tekstā. `test/functions/api/activity.js` to saglabā Cloudflare KV kā aktivitātes nosaukumu un pēc piecām izvēlēm publicē kopīgajā sarakstā.

Risks: brīvais teksts var saturēt klienta, saimniecības vai personas identificējošu informāciju. Tas pārkāpj Mansdarbs principu, ka serverī nonāk tikai iepriekš noteikti, neidentificējoši skaitītāji.

Ieteicamais risinājums:
1. Atcelt brīvā teksta nosūtīšanu uz serveri.
2. Kopīgajam katalogam izmantot tikai iepriekš definētu kategoriju ID no fiksēta atļauto vērtību saraksta.
3. Ja lietotājs ievada savu nosaukumu, to paturēt tikai lokāli un izmantot tikai šīs sesijas/pārlūka izvēlei.
4. Serveris nedrīkst pieņemt vai atgriezt brīvus nosaukumus, pat ja klients tos filtrē.
5. Pievienot testus, kas noraida nezināmus ID un brīva teksta laukus.

### P1 — AI datu nodošana nav pietiekami skaidri nosaukta

`main/index.html` VID palīgs skaidri brīdina, ka jautājums tiks nosūtīts AI pakalpojumam. Pēc nosūtīšanas `functions/api/vid-assistant.js` nodod lietotāja jautājumus un līdz astoņām sarunas ziņām OpenAI Responses API kopā ar izvēlēto profilu un uzdevumu.

Servera pieprasījumā ir `store: false`, taču tas nenozīmē, ka jautājums netiek nosūtīts pakalpojuma sniedzējam: apstrādei tas tiek nodots OpenAI. Lietotājam pirms pirmās nosūtīšanas jābūt skaidri pateiktam:
- ka brīvprātīgi ievadītais jautājums un sarunas konteksts tiks nosūtīts OpenAI apstrādei;
- ka uzskaites ieraksti, rēķini un lokālie finanšu dati netiek automātiski pievienoti šim pieprasījumam;
- ka nevajag ievadīt personas kodus, klientu datus, bankas datus, EDS paroles vai autentifikācijas kodus;
- ka AI funkcija ir izvēles iespēja un pārējais ceļvedis darbojas bez tās.

Ieteicams pievienot īsu privātuma paskaidrojumu tieši pie nosūtīšanas darbības un saiti uz pilnu privātuma informāciju. Neveikt vizuālas izmaiņas bez īpašnieka apstiprinājuma.

### P1 — Publisks AI API bez acīmredzama ātruma ierobežojuma

`functions/api/vid-assistant.js` pārbauda Origin, pieprasījuma izmēru un ziņu garumu, taču koda pārskatā nav redzams IP/neatkarīgs pieprasījumu ātruma ierobežojums, kvotas vai izmaksu aizsardzība. Origin pārbaude viena pati nav pilnvērtīga ļaunprātīgas izmantošanas aizsardzība, jo ne visi klienti ir pārlūki un Origin var nebūt.

Pirms publiskas AI aktivizēšanas vajadzīgs servera puses rate limit, dienas budžets/kvota, droša kļūdu apstrāde un brīdinājums pie izmaksu sliekšņa. Neizmantot personas identifikatorus analītikai.

### P1 — KV skaitītāji nav atomiski

`activity.js`, `learning.js` un `visit.js` izmanto lasīt–palielināt–ierakstīt darbību KV. Vienlaicīgi pieprasījumi var pazaudēt skaitījumus. Tas ir pieņemami tikai kā aptuvens prototipa signāls, nevis precīza statistika vai norēķinu pamats.

Pirms produkta lēmumiem izvērtēt atomisku skaitīšanas risinājumu. Saglabāt tikai fiksētus notikumu kodus un dienas skaitītājus; nekad nepievienot brīvo tekstu, lietotāja ID, sīkdatnes vai aktivitāšu vēsturi.

### P2 — Hostinga tehniskie žurnāli

Lietotnes kods pats neiekļauj IP adresi analītikas pieprasījuma datos, bet Cloudflare/hostinga infrastruktūra var apstrādāt savienojuma metadatus savos žurnālos. Tāpēc publiski nedrīkst solīt absolūtu anonimitāti, kamēr nav pārbaudīta pakalpojuma sniedzēja žurnālu politika, glabāšanas termiņi un iestatījumi.

### P2 — Divas atsevišķas saskarnes un izvietošanas neskaidrība

Test zara `index.html` un `public/index.html` ir divas atšķirīgas lietotnes. `README.md` norāda, ka testa adrese rādīja saknes `index.html`, kamēr `wrangler.jsonc` norāda `public/`. Pirms jebkuras izvietošanas jānoskaidro faktiskā Pages konfigurācija un funkciju maršrutēšana. Šajā auditā nekas netika mainīts.

## Ieteicamā darbu secība

1. P0: nomainīt kopīgā darbības kataloga brīvo tekstu pret fiksētiem kategoriju ID.
2. P1: precizēt AI datu nodošanas skaidrojumu un iegūt lietotāja skaidru darbību pirms nosūtīšanas.
3. P1: ieviest AI API rate limit un izmaksu budžetu.
4. P1: pārbaudīt un dokumentēt KV skaitītāju aptuveno raksturu.
5. P2: pārbaudīt hostinga žurnālu/retences iestatījumus un saskaņot privātuma paziņojumu.
6. P2: atsevišķi salīdzināt abas saskarnes un izvietošanas konfigurāciju, neapvienojot tās automātiski.

## Kas netika darīts

- Netika mainīts `main` vai `test` zars.
- Netika izveidots PR, veikta sapludināšana vai izvietošana.
- Netika mainīts dizains, izkārtojums vai lietotāja pieredze.
- Netika atvērti Cloudflare resursi un netika mainīti to iestatījumi.
- Netika nosūtīti vai apstrādāti reāli lietotāju dati.
