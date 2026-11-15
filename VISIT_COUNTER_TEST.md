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
