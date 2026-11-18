# VID EDS asistēta darbplūsma

## Produkta mērķis

Mansdarbs nav tikai VID instrukciju katalogs. Ilgtermiņa mērķis ir, lai lietotājam nebūtu pašam jāmeklē EDS sadaļas, pogas un lauki. Lietotājs apraksta vēlamo rezultātu, bet Mansdarbs sagatavo un izpilda atkārtojamos administratīvos soļus, cik to atļauj EDS tehniskie un juridiskie nosacījumi.

Lietotāja galvenais uzdevums ir:
1. autentificēties oficiālajā VID EDS vidē;
2. pārskatīt Mansdarbs sagatavotos datus un dokumentu;
3. pašam apstiprināt un nospiest EDS galīgo iesniegšanas pogu.

**Mansdarbs nekad nedrīkst iesniegt dokumentu, veikt juridiski nozīmīgu apstiprinājumu vai mainīt nodokļu režīmu bez skaidras lietotāja darbības.**

## Lietotāja pieredzes princips

Vēlamā plūsma:

1. Lietotājs Mansdarbs vidē pasaka, ko vēlas izdarīt, piemēram, reģistrēt saimniecisko darbību, paziņot NACE darbības veidu vai iesniegt pašnodarbinātā ziņojumu.
2. Mansdarbs nosaka piemērojamo darbplūsmu un apkopo tikai konkrētajam dokumentam nepieciešamo informāciju.
3. Mansdarbs atrod attiecīgo EDS sadaļu, dokumentu un ievades laukus, izmantojot atļautu pārlūka automatizācijas mehānismu.
4. Mansdarbs sagatavo laukus un dokumenta melnrakstu. Lietotājam nav manuāli jāmeklē pogas vai jāatkārto jau zināma informācija.
5. Mansdarbs parāda pārskatāmu kopsavilkumu: izvēlētais dokuments, periods, ievadītās vērtības, izmantotie pieņēmumi un neatrisinātie jautājumi.
6. Lietotājs pārskata informāciju un pats veic galīgo iesniegšanu EDS.
7. Pēc iesniegšanas Mansdarbs var palīdzēt lietotājam atrast EDS statusu un saglabāt apliecinājumu, bet tikai tad, ja lietotājs to skaidri pieprasa un tehniskā piekļuve ir atļauta.

## Drošības un kontroles robežas

- EDS autentifikācija notiek tikai oficiālajā VID vidē. Mansdarbs nekad neprasa, nesaņem un neglabā EDS paroli, Smart-ID PIN, eParaksta PIN, vienreizējos kodus vai sesijas sīkdatnes.
- Nedrīkst apiet autentifikāciju, daudzfaktoru pārbaudi, CAPTCHA, piekļuves kontroli vai VID noteiktos tehniskos ierobežojumus.
- Automatizācija drīkst darboties tikai lietotāja apstiprinātā sesijā un tikai lietotāja izvēlētā uzdevuma ietvaros.
- Pirms jebkuras juridiski nozīmīgas darbības lietotājam jāredz, ko tieši sistēma ir sagatavojusi.
- Galīgā poga “Iesniegt”, “Apstiprināt”, nodokļu režīma maiņa, maksājuma veikšana vai cita neatgriezeniska darbība vienmēr paliek lietotāja ziņā.
- Ja EDS lapa mainās, lauks nav droši identificējams vai automatizācija nav pārliecināta par ievadāmo vērtību, darbība jāaptur un lietotājam jāparāda konkrētais šķērslis. Nedrīkst minēt lauku nozīmi vai turpināt uz minējuma pamata.
- Nedrīkst sūtīt EDS lapu saturu, personas datus vai finanšu dokumentus uz AI pakalpojumu pēc noklusējuma. AI jautājumiem jānosūta tikai lietotāja apzināti izvēlētais minimālais konteksts.
- Personas dati un finanšu ieraksti pēc noklusējuma paliek lietotāja ierīcē. Jebkurai ārējai apstrādei vajadzīgs skaidrs mērķis, datu minimizācija un atsevišķs lietotāja paziņojums.
- Visām darbībām jābūt pārskatāmām: lietotājam jāzina, ko Mansdarbs dara, kādus datus tas lasa un kurus laukus tas aizpilda.

## Tehniskā arhitektūra

Parasta tīmekļa lapa nevar patvaļīgi nolasīt vai vadīt citas izcelsmes vietnes, piemēram, EDS, DOM saturu. Pārlūka tāda paša avota drošības politika to nepieļauj. Tāpēc ar pašreizējo statisko Mansdarbs lapu un Cloudflare Pages Function vien nepietiek, lai droši automātiski aizpildītu EDS laukus.

Iespējamais nākotnes risinājums jāveido kā atsevišķs, lietotāja kontrolēts pārlūka automatizācijas slānis (piemēram, pārlūka paplašinājums vai cita oficiāli atļauta lokāla integrācija), kas:
- saņem no Mansdarbs tikai konkrētā uzdevuma strukturētu melnrakstu;
- darbojas lokāli lietotāja pārlūkā;
- atpazīst EDS lapas elementus pēc pārbaudāmiem marķieriem un konteksta, nevis trauslām ekrāna koordinātām;
- pirms ievades pārbauda, vai lietotājs atrodas paredzētajā EDS dokumentā un pareizajā periodā;
- aizpilda tikai skaidri identificētus laukus;
- nolasa atpakaļ aizpildītās vērtības un salīdzina tās ar apstiprināto melnrakstu;
- nekad automātiski neaktivizē galīgo iesniegšanas vai apstiprināšanas darbību.

Šis slānis nedrīkst glabāt lietotāja EDS autentifikācijas datus vai nodot tos Mansdarbs serverim. Pirms ieviešanas jāpārbauda VID EDS lietošanas noteikumi, pieejamās oficiālās integrācijas iespējas un pārlūka veikalu prasības. Ja automatizācija nav atļauta vai droši īstenojama, jāizmanto drošs rezerves režīms: Mansdarbs sagatavo precīzu datu kopsavilkumu un atver pareizo EDS sadaļu, bet lietotājs veic ievadi pats.

## Pakāpeniska ieviešana

### 1. posms — datu un dokumentu sagatavošana
- Definēt katra atbalstītā EDS dokumenta lauku shēmu.
- Pievienot lokālu lietotāja profila un iepriekš ievadīto datu atkārtotas izmantošanas loģiku.
- Validēt datumus, summas, periodus un obligātos laukus.
- Parādīt dokumenta priekšskatījumu un trūkstošo datu sarakstu.
- Šo posmu var īstenot pašā Mansdarbs bez EDS automatizācijas.

### 2. posms — EDS navigācijas asistents
- Precīzi identificēt oficiālās EDS ieejas saites un dokumentu ceļus.
- Uzturēt pārbaudītu darbplūsmu katalogu ar pēdējās pārbaudes datumu.
- Ja izvēlnes vai forma mainās, atzīmēt darbplūsmu kā nepārbaudītu un nevadīt lietotāju pēc novecojušiem soļiem.

### 3. posms — lokāla lauku aizpildīšana
- Tikai pēc atļautā automatizācijas mehānisma izveides pievienot lietotāja apstiprinātu lauku aizpildīšanu.
- Sākt ar zema riska, viegli pārbaudāmiem laukiem.
- Katram laukam saglabāt avotu: lietotāja ievade, lokālā uzskaite vai manuāls labojums.
- Pirms nākamā soļa pārbaudīt, vai EDS attēlotā vērtība sakrīt ar melnrakstu.

### 4. posms — lietotāja galīgā pārbaude un iesniegšana
- Parādīt pilnu dokumenta kopsavilkumu un neatrisinātos brīdinājumus.
- Skaidri nodalīt “Mansdarbs sagatavoja” no “VID EDS pieņēma”.
- Lietotājs pats nospiež EDS galīgo iesniegšanas pogu.
- Pēc iesniegšanas statusu drīkst apzīmēt kā pieņemtu tikai tad, ja to tieši apliecina EDS.

## Pašreizējais stāvoklis

Pašreizējā Mansdarbs versijā ir manuāls VID ceļvedis, kas atver EDS atsevišķā cilnē, un izvēles AI jautājumu palīgs. Pašreizējais risinājums **nepieslēdzas EDS kontam, nelasa EDS lapu un neaizpilda EDS veidlapas**. Šī specifikācija apraksta nākotnes produkta virzienu, nevis jau ieviestu funkcionalitāti.

## Pieņemšanas kritēriji

Funkcionalitāti drīkst uzskatīt par gatavu tikai tad, ja:
- lietotājam nav jāmeklē attiecīgā EDS sadaļa manuāli, ja automatizācijas slānis to droši atbalsta;
- visi aizpildītie lauki ir salīdzināti ar apstiprināto melnrakstu;
- neskaidra lauka vai neatbilstības gadījumā sistēma apstājas;
- lietotājs redz visus datus pirms iesniegšanas;
- galīgo iesniegšanu veic tikai lietotājs;
- nekādi EDS autentifikācijas noslēpumi nenonāk Mansdarbs serverī;
- lietotāja finanšu un personas dati netiek nosūtīti ārpus ierīces bez atsevišķa, informēta lietotāja lēmuma.
