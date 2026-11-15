# Apmeklējumu skaitītājs (test)

Šis skaitītājs reģistrē katru redzamās lapas ielādi. Tas neizmanto sīkdatnes un nesaglabā IP adreses, pārlūka identifikatorus vai lietotāju profilus.

## Cloudflare Pages konfigurācija pirms testa izvietošanas

1. Pages projektā izveido KV namespace.
2. Piesaisti to projektam kā **KV namespace binding** ar nosaukumu `VISITS`.
3. Pievieno Pages environment variable kā **secret** ar nosaukumu `STATS_TOKEN` un garu nejaušu vērtību.
4. Izvieto šo atzaru kā atsevišķu Preview deployment; nepārvieto izmaiņas uz `main`.

## Pārbaude

- Atver Preview adresi vairākas reizes; katra redzamās lapas ielāde palielina skaitītāju.
- Iekšējā statistika: pieprasi `GET /api/visit` ar galveni `Authorization: Bearer <STATS_TOKEN>`.
- Atbilde satur `total_opens` un `daily_opens`.

## Ierobežojumi

KV skaitītājs šajā prototipā ir vienkāršs un vienlaicīgu pieprasījumu gadījumā var nepieskaitīt kādu apmeklējumu. Tas ir piemērots sākotnējai pārbaudei, nevis precīzai auditējamai statistikai. Ja vajadzēs precīzāku skaitīšanu, pāriesim uz atomisku D1/SQLite skaitītāju. Līdz KV piesaistei un Preview izvietošanai uzskaite faktiski vēl nedarbojas.

## Darbības veidu kopīgais saraksts

- Pirmajā jautājumā lietotājs var ierakstīt un uzreiz izvēlēties savu darbības veidu.
- Izvēle tiek skaitīta, kad lietotājs turpina uz nākamo soli.
- Kad viens un tas pats darbības veids ir izvēlēts vismaz **5 reizes**, tas parādās kopīgajā sarakstā.
- Kopīgajā sarakstā varianti tiek kārtoti pēc izvēļu skaita; populārākie ir augstāk.
- Dati tiek glabāti KV ar to pašu `VISITS` piesaisti. Nosaukumi tiek normalizēti pēc reģistra un liekām atstarpēm.
- Šis ir popularitātes saraksts, nevis oficiāls NACE klasifikators. Pirms NACE koda vai nodokļu ieteikuma sniegšanas jāveic atsevišķa atbilstības pārbaude.

Piezīme: KV vienkāršais skaitītājs nav atomisks, tādēļ pie lielas vienlaicīgas slodzes skaits var būt aptuvens. Pirms publiskas palaišanas jāpieliek ātruma ierobežošana un jāizvērtē D1/atomiska skaitīšana pret surogātpastu.
