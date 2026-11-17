# Mansdarbs nodokļu kalkulatoru audits — 2026-11-17

## Tvērums

Pārskatīts `main/index.html` VSAOI, IIN un nodokļu režīmu salīdzināšanas kods (HTML ievades lauki un JavaScript funkcijas `loadVsaoiQuarter`, `syncIinFromVsaoi`, `calculateVsaoi`, `progressiveIin`, `compareTaxRegimes`, `calculateIin`).

Normatīvie avoti pārbaudīti 2026-11-17. Šis ir tehnisks audits, nevis VID uzziņa vai juridisks atzinums. Nekas nav mainīts lietotnes kodā.

## Apstiprinātie 2026. gada atskaites parametri

- Pašnodarbinātā standarta VSAOI likme: 31,07%; personai, kura sasniegusi vecumu, kas dod tiesības uz vecuma pensiju, 29,36%. VID likmju lapa: https://www.vid.gov.lv/lv/valsts-socialas-apdrosinasanas-obligato-iemaksu-likmes
- Minimālais mēneša VSAOI objekts 2026. gadā: 780 €. Ja mēneša peļņa ir zem 780 €, 10% pensiju iemaksu bāze ir visa mēneša peļņa; ja vismaz 780 €, pilnās VSAOI maksā no izvēlētā objekta, bet 10% — no pārsnieguma. VID: https://www.vid.gov.lv/lv/pasnodarbinata-socialas-apdrosinasanas-iemaksas un https://www.vid.gov.lv/lv/media/29738/download?attachment=
- Standarta ziņojuma termiņš: līdz 17. datumam pēc ceturkšņa beigām; samaksa līdz 23. datumam. Lauksaimniecības ražošanas un intelektuālā īpašuma ienākumiem ir īpaša gada 10% kārtība un atšķirīgs ziņošanas ceļš. VID lapa: https://www.vid.gov.lv/lv/pasnodarbinata-socialas-apdrosinasanas-iemaksas
- IIN progresīvās likmes: 25,5% līdz 105 300 € un 33% virs tā; papildu 3% gada ienākumu daļai virs 200 000 €. VID: https://www.vid.gov.lv/lv/iedzivotaju-ienakuma-nodokla-likmes
- 2026. gada fiksētais neapliekamais minimums: 550 € mēnesī jeb 6 600 € gadā. VID: https://www.vid.gov.lv/lv/neapliekamais-minimums
- MUN: 25% no apgrozījuma; 80% no samaksātā MUN novirza sociālajai apdrošināšanai un 20% IIN daļai. VID: https://www.vid.gov.lv/lv/mikrouznemumu-nodoklis
- Minimālais IIN no saimnieciskās darbības: 50 €, ja nav gūts ar IIN apliekams ienākums no saimnieciskās darbības vai aprēķinātais IIN no šī ienākuma nepārsniedz 50 €, ievērojot likumā noteiktos izņēmumus. Neapliekamo minimumu un atvieglojumus nepiemēro minimālajam apliekamajam ienākumam. VID skaidrojums: https://www.vid.gov.lv/lv/biezak-uzdotie-jautajumi-katalogs/iedzivotaju-ienakuma-nodoklis-no-saimnieciskas-darbibas-ienakuma ; likums: https://likumi.lv/ta/id/56880-par-iedzivotaju-ienakuma-nodokli

## Atrastās problēmas un riski

### P0 — Tukšs mēneša peļņas lauks automātiski kļūst par nulli

`calculateVsaoi()` izmanto `Number(input.value || 0)`. Tādēļ tukšs lauks tiek interpretēts kā 0, kaut gan lietotājs varbūt vienkārši nav ievadījis attiecīgā mēneša datus. Saskarnes teksts aicina ievadīt visus trīs mēnešus, bet kods to nepārbauda.

Risks: nepilnīgi ceturkšņa dati var izskatīties kā korekts aprēķins.

Ieteikums: atšķirt tukšu, derīgu nulli un nederīgu skaitli. Aprēķinu neatļaut, kamēr visi trīs mēneši nav apzināti aizpildīti; nulli lietotājam jāievada apzināti. Tas atbilst produkta principam, ka tukšas vērtības nedrīkst klusējot uzskatīt par nulli.

### P0 — Parastajā VSAOI režīmā nav iespējams ievadīt mēneša zaudējumus

Parastajam režīmam kods noraida jebkuru negatīvu mēneša peļņu. Tas var būt pareizi attiecīgā mēneša VSAOI bāzes aprēķinam, kur negatīvs ienākums nedod negatīvas iemaksas, bet lietotājam gada IIN prognozē var būt vajadzīgs atspoguļot gada kopējo saimnieciskās darbības rezultātu, ieskaitot zaudējumu mēnešus.

Pašreizējā struktūra no ceturkšņa VSAOI ierakstiem veido arī gada peļņu IIN kalkulatoram. Ja zaudējumu mēnesi nevar ievadīt, gada peļņa var tikt uzrādīta par lielu.

Ieteikums: nošķirt mēneša faktiskās peļņas ievadi no VSAOI bāzes. Negatīva peļņa var samazināt gada IIN rezultātu, bet attiecīgā mēneša VSAOI bāzei jābūt 0, ja to apstiprina normatīvais aprēķins. Pirms koda maiņas sagatavot VID/likuma testpiemēru.

### P1 — Lauksaimniecības/intelektuālā īpašuma gada aprēķins var būt nepilnīgs jauktas darbības gadījumā

`syncIinFromVsaoi()` gada 10% pensiju iemaksu bāzi aprēķina no peļņas un tikai to ceturkšņu VSAOI objektu summas, kuros izvēlēts `annual_special`. Saskarnes brīdinājums par jauktu darbību aktivizējas tikai tad, ja konkrētajā ceturksnī izvēlēts īpašais režīms, bet neidentificē jauktu darbību dažādos ceturkšņos.

VID norāda, ka lauksaimniecības/intelektuālā īpašuma gada 10% kārtībai ir atsevišķi noteikumi; ja kādā mēnesī peļņa pārsniedz 780 €, par attiecīgo ceturksni iesniedz parasto ziņojumu un 10% pensiju iemaksu objektā norāda 0. Tādēļ vienkārša ceturkšņu summēšana bez ienākumu veidu un periodu klasifikācijas nav pietiekama.

Ieteikums: līdz pilnīgai jauktas darbības loģikas ieviešanai gada 10% rezultātu neuzrādīt kā galīgu, ja gada laikā bijuši vairāki ienākumu veidi vai īpašā režīma un parastās darbības kombinācija. Pievienot skaidru “neatbalstīts — pārbaudi EDS” stāvokli. Precīzo proporcijas formulu pārbaudīt ar VID metodisko materiālu vai uzziņu.

### P1 — IIN prognozes ievaddatu pilnīgums nav pārbaudīts

`calculateIin()` tukšus skaitļu laukus pārvērš par 0, izmantojot `Number(value || 0)`. Tas pats notiek ar VSAOI automātisko kopsummu, ja nav saglabātu ceturkšņu. Lietotājs var iegūt rezultātu, nenorādot, vai citi ienākumi, neapliekamais minimums un atvieglojumi ir zināmi vai nav vēl ievadīti.

Ieteikums: obligāti norādīt, kuri lauki ir apzināti 0 un kuri nav zināmi. IIN rezultātam jāpievieno ievaddatu kopsavilkums un brīdinājums, ja VSAOI summa nav faktiski samaksātā summa vai ja gada ceturkšņi nav pilni.

### P1 — Nodokļu režīmu salīdzinājums nav pilns MUN tiesību tests

`compareTaxRegimes()` salīdzina aprēķināto vispārējā režīma nodokļu slogu ar 25% MUN un izmanto PVN statusa vienkāršotu pārbaudi. Pats kods neizvērtē visus MUN statusa iegūšanas un saglabāšanas kritērijus, citus ierobežojumus, darbinieku un saimnieciskās darbības specifiku.

Ieteikums: rezultātu saukt par “aritmētisku scenāriju salīdzinājumu”, nevis režīma piemērotības izvērtējumu. Pirms norādes, ka MUN ir pieejams, nepieciešams atsevišķs atbilstības kontrolsaraksts, kas balstīts aktuālajos VID nosacījumos.

### P1 — IIN atvieglojumu un 3% papildu likmes robežas

`progressiveIin()` piemēro 3% papildu likmi summai virs 200 000 €, un kalkulatorā tā tiek piemērota vienam kopējam skaitlim, kurā ietilpst ievadītie citi ienākumi un saimnieciskās darbības ienākums. Tas ir labs aptuvens modelis, bet nav pilns visu 3% papildu likmes bāzē iekļaujamo un izslēdzamo ienākumu klasifikators.

Tāpat vienā laukā ievadītie “citi atvieglojumi un attaisnotie izdevumi” tiek piemēroti vienkāršoti, bez katras atvieglojumu kategorijas atsevišķiem limitiem un piemērošanas secības.

Ieteikums: saglabāt skaidru norādi, ka šis ir aptuvens aprēķins, un nepieļaut, ka lietotājs uztver to kā gada deklarācijas aizvietotāju. Nākotnē sadalīt atvieglojumus pa juridiski atšķirīgām kategorijām.

## Pozitīvi pārbaudītie aspekti

- 2026. gada 31,07% un 29,36% VSAOI likmes atbilst VID likmju lapai.
- 780 € minimālais objekts un 10% papildu pensiju iemaksas pamatloģika parastajā režīmā atbilst VID skaidrojumam.
- 25,5%, 33% un 3% IIN likmju robežvērtības atbilst VID publicētajai informācijai.
- 6 600 € gada neapliekamais minimums atbilst 2026. gada VID informācijai.
- 50 € minimālā IIN izņēmumu apraksts kopumā atbilst VID publicētajam skaidrojumam, taču lietotāja atzīme pati par sevi neaizstāj statusa pārbaudi.
- Aprēķini notiek pārlūkā; VSAOI ceturkšņu dati tiek glabāti `localStorage`, nevis nosūtīti API.

## Ieteicamā testu matrica pirms aprēķinu aktivizēšanas

### Parastais VSAOI režīms

1. Trīs mēneši ar apzināti ievadītu 0 — derīgs aprēķins.
2. Viens tukšs mēnesis — aprēķins tiek bloķēts un prasa ievadi.
3. Peļņa 779,99 € — 10% no attiecīgās peļņas, pilnās VSAOI nav.
4. Peļņa 780,00 € — pilnās VSAOI no atbilstošā izvēlētā objekta; 10% pārsnieguma bāze 0.
5. Peļņa virs 780 € ar objektu 780 € — 10% tikai no pārsnieguma.
6. Izvēlēts objekts virs peļņas — pilno VSAOI objektu nepārsniedz faktiskā peļņa.
7. Negatīvs mēnesis — atsevišķi pārbaudīt VSAOI nulles bāzi un gada IIN peļņas samazinājumu.
8. Pensionāra likme 29,36% — atsevišķi no standarta 31,07%.

### IIN

1. Nav saglabātu VSAOI ceturkšņu — parādīt nepilnīgu datu brīdinājumu, nevis klusi uzskatīt VSAOI par 0.
2. Visi četri ceturkšņi saglabāti — gada peļņas un VSAOI kopsumma.
3. Faktiski samaksāto VSAOI manuāla ievade — korekti aizstāj automātisko summu.
4. Neapliekamais minimums 0, daļējs un pilns — pārbaudīt robežgadījumus.
5. 50 € minimālais IIN — pārbaudīt gan piemērošanu, gan katru VID izņēmumu.
6. Ienākumi ap 105 300 € un 200 000 € — pārbaudīt progresīvo un papildu likmi.
7. Negatīvs gada saimnieciskās darbības rezultāts — neļaut to kompensēt ar citu ienākumu veidu, ja likums to neļauj.

### Režīmu salīdzinājums

1. Tukši obligātie lauki — bloķēt aprēķinu.
2. Izdevumi pārsniedz apgrozījumu — skaidri norādīt, ka scenārijs nav atbalstīts, nevis dot ieteikumu.
3. MUN PVN statusa neatbilstība — nerādīt MUN kā pieejamu.
4. Papildu MUN atbilstības kritēriji nav pārbaudīti — skaidri atzīmēt “nav pārbaudīts”.

## Darbu secība

1. Vispirms izveidot tīras, no DOM neatkarīgas aprēķinu funkcijas un automātiskus testus, neizmainot lietotāja saskarni.
2. Pievienot stingru ievades validāciju: tukšs nav nulle.
3. Nošķirt VSAOI mēneša aprēķinu no gada IIN peļņas kopsummas.
4. Atrisināt īpašā un jauktā ienākumu veida gada loģiku ar VID avotu.
5. Pārbaudīt MUN atbilstības kritērijus.
6. Tikai pēc testu izpildes sagatavot koda izmaiņas atsevišķā zarā.

## Kas netika darīts

- Netika mainīts lietotnes kods vai kalkulatoru formulas.
- Netika mainīts `main` vai `test` zars.
- Netika veikta izvietošana, sapludināšana vai Cloudflare iestatījumu maiņa.
- Netika izmantoti reāli personas vai finanšu dati.
