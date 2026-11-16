# Mansdarbs — uzskaites ātrā izvēlne

## Izmaiņas
- Uzskaites sadaļai pievienota kompakta, aizvērta pēc noklusējuma HTML `details/summary` izvēlne.
- Izvēlnē ir īsceļi uz ienākumu ievadi, izdevumu ievadi, nozares pielāgošanas sadaļu un ierakstu sarakstu.
- Ienākumu un izdevumu īsceļi automātiski izvēlas atbilstošo darījuma veidu un aizritina lietotāju līdz ievades laukiem.
- Izvēlne pēc īsceļa izvēles aizveras, lai neaizņemtu ekrāna vietu.
- Mobilajā skatā īsceļi ir kompakti divās kolonnās; ja vietas nepietiek, tie pārkārtojas atbilstoši ekrāna platumam.

## Svarīga funkcionalitātes robeža
Nozares pielāgošanas izvēlne pašlaik ir informatīvs izstrādes vietturis. Nozaru veidnes vēl nav ieviestas; esošā vienkāršā ienākumu/izdevumu uzskaite turpina darboties kā iepriekš. Izvēlne neapgalvo, ka nozares pielāgošana jau ir pieejama.

## Faili
- `public/index.html` — uzskaites sadaļas izvēlne, stili, īsceļu darbības un sadaļu enkuri.

## Pārbaudes
- Pārbaudīts, ka `wrangler.jsonc` statisko resursu direktorija ir `./public`; izmaiņas veiktas faktiskajā `public/index.html`, nevis tikai saknes līmeņa `index.html`.
- Pēc GitHub atjaunināšanas atkārtoti nolasīts fails un pārbaudīta izvēlnes, visu četru sadaļu/enkuru un īsceļu funkciju esamība.
- Manuāla pārlūka pārbaude pēc šīm izmaiņām vēl nav veikta, jo publiski pieejamā TEST vide neatspoguļoja aktuālo `test` atzara saturu iepriekšējā pārlūka pārbaudē.
- Nav veikta izvietošana. `main` un produkcijas vide nav mainīta.
