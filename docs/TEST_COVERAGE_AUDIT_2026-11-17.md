# Automatizētās testēšanas pārskats — 2026-11-17

## Pašreizējais stāvoklis

`main` zarā ir 7 Node.js testu faili ar kopā 28 atsevišķiem `node:test` gadījumiem:

| Tests | Gadījumi | Galvenais pārklājums |
|---|---:|---|
| `vsaoi-calculations.test.js` | 7 | Parastais VSAOI, gada lauksaimniecības režīms, zaudējumu mēneši, pensionāra likme, manuāla VSAOI korekcija |
| `tax-regime-comparison.test.js` | 11 | Vispārējais režīms/MUN, 50 000 € robeža, PVN statusi, atvieglojums, datu pārņemšana |
| `site-integrity.test.js` | 2 | Lokālie skripti, sociālā priekšskatījuma attēls, Pages funkcijas esamība |
| `industry-tax-warning.test.js` | 1 | Nozares ieraksti IIN/PVN brīdinājumos |
| `local-date.test.js` | 1 | Lokālais kalendāra datums |
| `record-edit-warning.test.js` | 1 | Ieraksta datuma atjaunošana rediģēšanas laikā |
| `vat-threshold.test.js` | 5 | PVN sliekšņa aprēķins un brīdinājumu līmeņi |
| **Kopā** | **28** | |

Testi izmanto Node.js iebūvētos `node:test` un `node:assert/strict` moduļus. Atsevišķa `package.json` vai ārēja testēšanas bibliotēka nav nepieciešama.

## Pārbaudes ierobežojumi

1. Testi izvelk atsevišķas funkcijas no `index.html` teksta un izpilda tās mākslīgā DOM vidē. Tas ir noderīgi aprēķinu regresijām, bet nepārbauda pilnu lietotāja pārlūka darbību.
2. VSAOI testos mēnešu vērtības tiek padotas kā skaitļi vai skaitliski teksti. Nav testa, kas pierāda, ka tukšs mēneša lauks tiek noraidīts. Pašreizējā `calculateVsaoi()` izmanto `Number(value || 0)`, tādēļ tukšs lauks kļūst par nulli.
3. IIN testu nav. Pašreizējā `calculateIin()` arī izmanto `Number(value || 0)`, tādēļ tukši lauki tiek interpretēti kā nulle. Jāizlemj un jātestē, kuri lauki ir obligāti un kuri drīkst būt neievadīti.
4. Nav atsevišķu regresijas testu jauktai lauksaimnieciskai un citai saimnieciskajai darbībai vienā gadā/ceturksnī. Šis gadījums pašā lietotnē ir norādīts kā neatbalstīts un nedrīkst tikt uzskatīts par pārbaudītu.
5. Nav pilna E2E testa, pieejamības (accessibility) automātiskās pārbaudes vai reāla mobilā pārlūka testa.

## CI

Izstrādes zarā pievienots GitHub Actions darbplūsmas fails `.github/workflows/tests.yml`, kas pie `push` uz `main` vai `planning/product-principles-roadmap` un pie pull request uz `main` palaiž:

```bash
node --test tests/*.test.js
```

Darbplūsmas fails ir saglabāts izstrādes zarā. Šī pārskata sagatavošanas brīdī nav iegūts apstiprināts GitHub Actions izpildes rezultāts, tāpēc testu sekmīga izpilde nav apgalvota.

## Ieteicamā secība

1. Ieslēgt/atļaut GitHub Actions repozitorijā, ja tas pašlaik ir atspējots, un pārliecināties, ka jaunā darbplūsma izpildās.
2. Pievienot atsevišķus tukšo, nederīgo un robežvērtību ievades testus VSAOI un IIN funkcijām.
3. Pirms mainīt aprēķinu uzvedību, noteikt katra lauka obligātumu un saglabāt skaidru atšķirību starp tukšu vērtību un lietotāja apzināti ievadītu `0`.
4. Tikai pēc VID noteikumu pārbaudes pievienot jauktās darbības un citus īpašos nodokļu režīmus.

Šis ir testēšanas pārskats, nevis nodokļu aprēķinu juridiska validācija.
