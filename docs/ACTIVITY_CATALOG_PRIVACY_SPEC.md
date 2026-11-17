# Kopīgā darbības veidu kataloga privātuma specifikācija

Statuss: tehniskais priekšlikums, nav ieviests produkcijā.
Datums: 2026-11-17

## Mērķis

Mansdarbs var izmantot kopīgu, populāru darbības kategoriju katalogu, lai palīdzētu cilvēkam ātrāk izvēlēties darbības veidu. Serverim nav vajadzīgs lietotāja paša rakstīts darbības nosaukums. Serverī drīkst nonākt tikai iepriekš definēts kategorijas identifikators.

## Datu robeža

### Atļauts nosūtīt

Vienu no šiem fiksētajiem identifikatoriem:
- `repair_maintenance` — remonts un tehniskā apkope
- `construction_finishing` — būvniecība un apdares darbi
- `agriculture_forestry` — lauksaimniecība un mežsaimniecība
- `transport_logistics` — transports un loģistika
- `cleaning_household` — uzkopšana un mājsaimniecības pakalpojumi
- `beauty_wellness` — skaistumkopšana un labsajūta
- `education_training` — izglītība un apmācība
- `creative_media` — radošie, foto, video un mediju pakalpojumi
- `marketing_advertising` — mārketings un reklāma
- `it_digital` — IT un digitālie pakalpojumi
- `crafts_making` — amatniecība un izgatavošana
- `retail_resale` — preču tirdzniecība
- `food_hospitality` — ēdināšana un viesmīlība
- `professional_services` — profesionālie un konsultāciju pakalpojumi
- `other` — cita kategorija

Šis ir sākotnējs tehniskais saraksts, nevis NACE klasifikācija vai juridisks darbības veida kodu saraksts. Kategorijas jāprecizē ar Latvijas lietotāju scenārijiem, bet nedrīkst automātiski apgalvot, ka kategorija atbilst konkrētam NACE kodam.

### Aizliegts nosūtīt

- brīvi ievadītu darbības nosaukumu vai aprakstu;
- klienta, saimniecības, darba vietas vai personas nosaukumu;
- adresi, tālruni, e-pastu, personas kodu vai reģistrācijas numuru;
- ieņēmumus, izdevumus, nodokļu režīmu vai citus lietotāja atbilžu laukus;
- sesijas identifikatoru, konta ID, sīkdatnes vai lietotāja līmeņa vēsturi.

## Klienta darbība

1. Saskarne lokāli glabā kartējumu starp kategorijas ID un lietotājam saprotamu nosaukumu.
2. Ja lietotājs izvēlas vienu no iepriekš definētajām kategorijām, klients drīkst nosūtīt tikai tās ID.
3. Ja lietotājs ieraksta savu darbības nosaukumu, tas paliek ierīcē/pārlūkā un netiek sūtīts kopīgajam katalogam.
4. Brīvā teksta ieraksts nedrīkst tikt automātiski pārveidots par kategoriju ar AI vai servera klasifikatoru bez atsevišķas skaidras lietotāja izvēles.
5. Kataloga saņemšanas un lietošanas atteice nedrīkst liegt izmantot pamatfunkcijas.

## API līgums

Ieteicamais POST saturs:
```json
{ "category_id": "repair_maintenance" }
```

Servera validācija:
- pieņemt tikai JSON objektu ar vienu atļautu `category_id`;
- noraidīt nezināmus ID;
- noraidīt `name`, `description`, `user_id`, `email`, `answers` un citus papildu laukus;
- ierobežot pieprasījuma izmēru;
- neatspoguļot klienta nosūtītu brīvo tekstu atbildē;
- saglabāt tikai skaitītāju pēc kategorijas ID, nevis notikumu vēsturi.

Ieteicamā GET atbilde:
```json
{
  "popular": [
    { "category_id": "repair_maintenance", "count": 23 }
  ]
}
```

Klients nosaukumu atrod savā lokālajā tulkojumu tabulā. Serverim nav jāglabā nosaukums, ko lietotājs varētu ietekmēt.

## Skaitītāju un datu kvalitātes ierobežojumi

- Cloudflare KV lasīt–palielināt–ierakstīt nav atomisks. Šādi skaitītāji ir aptuveni, un tos nedrīkst izmantot norēķiniem, atlīdzībām vai juridiski nozīmīgai statistikai.
- Pirms kategorijas parādīšanas publiskajā populārāko sarakstā jānosaka minimālais slieksnis, piemēram, 5 izvēles.
- Neatklāt precīzus mazus skaitļus, ja tie var ļaut izdarīt secinājumus par atsevišķu lietotāju; apsvērt noapaļošanu vai tikai secību.
- Noteikt glabāšanas termiņu un periodisku veco skaitītāju dzēšanu.
- Nedrīkst apvienot šos skaitītājus ar apmeklējumu IP, ierīces vai lietotāja profila datiem.

## Obligātie testi

1. Derīgs `category_id` tiek pieņemts.
2. Nezināms `category_id` tiek noraidīts.
3. Pieprasījums ar `name` lauku tiek noraidīts.
4. Pieprasījums ar papildu lietotāja datu laukiem tiek noraidīts.
5. Brīvais teksts, kas satur e-pastu, tālruni vai personas datus, nekad nenonāk API pieprasījumā.
6. Kataloga API nepieejamība neaptur lokālu darbības veida izvēli un pārējo lietotnes darbību.
7. GET atbilde nesatur brīvus nosaukumus vai lietotāja līmeņa datus.
8. Skaitītājs tiek parādīts tikai pēc sliekšņa sasniegšanas.

## Droša ieviešanas secība

1. Vispirms ieviest servera stingro shēmu un testus atsevišķā izstrādes zarā.
2. Tad mainīt klientu, lai tas sūta tikai ID.
3. Pārbaudīt tīkla pieprasījumus ar sintētiskiem datiem.
4. Pārbaudīt, ka vecie brīvā teksta KV ieraksti netiek publiski atgriezti. Vecos ierakstus dzēst tikai pēc īpašnieka apstiprināta migrācijas plāna un rezerves kopijas.
5. Tikai pēc tam apsvērt funkcijas izvietošanu.

## Neatļautās darbības

Šī specifikācija pati par sevi nedod atļauju:
- mainīt dizainu, tekstu izkārtojumu vai būtisku UX;
- dzēst vai migrēt Cloudflare KV datus;
- mainīt `main`, sapludināt zarus vai veikt izvietošanu;
- uzskatīt kategorijas par oficiāliem NACE kodiem.
