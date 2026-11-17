# Mansdarbs — Android kā pirmais servera mezgls

Statuss: tehniskās izpētes un prototipa plāns. Nekas šajā dokumentā neinstalē programmatūru telefonā, neatver portus un nepublicē serveri internetā.

## Kopsavilkums

Android ierīci var izmantot kā pirmo Mansdarbs servera eksperimentu. Pareizais sākuma mērķis nav aizstāt Cloudflare vai uzticamu produkcijas hostingu, bet iegūt lētu, kontrolētu vidi, kurā pārbaudīt servera komponentes, API, automatizētos testus un resursu patēriņu.

Ieteicamais pirmais variants: Termux + Node.js LTS + lokāls HTTP serviss, kas pēc noklusējuma klausās tikai uz 127.0.0.1. Pirmajā posmā tam nav publiskas piekļuves un tas nesaņem reālus lietotāju vai finanšu datus.

## Kāpēc tas var strādāt

- Android ierīce ir pilnvērtīga ARM skaitļošanas platforma, un Termux nodrošina Linux tipa lietotāja vidi ar pakotņu pārvaldību.
- Node.js var palaist lokālu API un testu vidi, kas tehnoloģiski ir tuva Mansdarbs Cloudflare Pages Functions/JavaScript kodam.
- Var izmantot ierīci kā nepārtraukti pieejamu lokālu testu mezglu, ja tā ir pieslēgta barošanai un Android atļauj procesam darboties.

## Svarīgie ierobežojumi

- Android var ierobežot vai apturēt fona procesus, īpaši enerģijas taupīšanas režīmā vai ražotāja pielāgotā sistēmā. Ilgstošai darbībai var būt vajadzīgs lietotāja redzams foreground process/notification un Termux akumulatora optimizācijas izņēmums.
- Android 16 maina fona darbu kvotas un izpildes uzvedību; nevajag pieņemt, ka process darbosies bezgalīgi tikai tāpēc, ka tas reiz ir palaists.
- Mobilais internets var būt aiz CGNAT, mainīt IP adresi vai ierobežot ienākošos savienojumus. Tāpēc publiska servera pieejamība nav garantēta.
- Telefons nav paredzēts augstas pieejamības produkcijas serverim: iespējama pārkaršana, restartēšanās, akumulatora nolietošanās, Wi‑Fi/mobilo datu pārtraukumi un nejauša procesa apturēšana.
- Neizmantot telefonu kā vienīgo glabātuvi, datubāzi vai rezerves kopiju.

## Ieteicamā arhitektūra

### 0. posms — tikai lokāls prototips
- Termux vide.
- Node.js LTS.
- Vienkāršs Mansdarbs servera prototips, kas klausās tikai 127.0.0.1.
- Health endpoint, piemēram, GET /health, kas atgriež tikai statusu un versiju.
- Automatizēti testi pret veselības pārbaudi un API ievades validāciju.
- Nekādu noslēpumu, API atslēgu, lietotāju datu vai finanšu ierakstu.

### 1. posms — lokālā tīkla tests
Tikai pēc veiksmīga lokālā testa:
- Piekļuve no citas ierīces tajā pašā privātajā Wi‑Fi tīklā.
- Klausīties uz konkrēta lokālā tīkla interfeisa, nevis automātiski atvērt publisku piekļuvi.
- Ugunsmūris/routera noteikumi un piekļuves autentifikācija.
- Testēt restartu, tīkla pārtraukumu, ekrāna izslēgšanu, uzlādi un temperatūru.

### 2. posms — kontrolēts attālināts tests
Ja ir reāla vajadzība:
- Izmantot drošu tuneli vai VPN ar autentifikāciju; nekad neatvērt neautentificētu API internetam.
- Neizmantot publisku port-forwarding kā pirmo risinājumu.
- Ierobežot pieprasījumu biežumu un izmēru, reģistrēt tikai minimālus tehniskos kļūdu datus.
- Testa dati ir sintētiski.

### 3. posms — loma Mansdarbs sistēmā
Android mezgls var būt:
- izstrādes un CI palīgs;
- lokāls demonstrācijas serveris;
- neliela iekšēja automatizācijas mezgla prototips;
- rezerves/diagnostikas vide.

Android mezgls sākotnēji nav:
- publiskā Mansdarbs produkcijas hostings;
- galvenā datubāze;
- lietotāju finanšu dokumentu glabātuve;
- maksājumu vai VID/EDS integrāciju serveris.

## Drošības minimums

1. Sākt ar 127.0.0.1; nepublicēt servisu internetā.
2. Nelikt API atslēgas GitHub repozitorijā vai klienta kodā.
3. Neievadīt reālus personas vai finanšu datus.
4. Izslēgt nevajadzīgus endpointus un debug režīmu.
5. Katram endpointam validēt metodi, satura tipu, datu izmēru un ievades shēmu.
6. Pievienot rate limiting, kad sākas tīkla piekļuve.
7. Pēc testa pārtraukt serveri un pārbaudīt, ka tas vairs neklausās portā.
8. Neatspējot Android drošības mehānismus globāli; mainīt tikai konkrētās lietotnes iestatījumus, ja tas tiešām nepieciešams.

## Sākotnējie veiksmes kritēriji

- Serveris lokāli startē un apstājas paredzami.
- /health atbild korekti.
- Testi iziet pēc ierīces restartēšanas un pēc tīkla pārtraukuma.
- 8–12 stundu kontrolētā testā nav negaidītas procesa apturēšanas vai pārkaršanas.
- RAM, CPU, temperatūra un enerģijas patēriņš ir pieņemami.
- Nav neviena publiski pieejama neautentificēta endpointa.
- Nav reālu lietotāju datu un noslēpumu žurnālos.

## Lēmums

Android servera ideju ir vērts pārbaudīt kā pirmo lēto prototipa mezglu. Pirms faktiskas uzstādīšanas jāzina precīzs ierīces modelis, Android versija, pieejamā atmiņa, brīvā vieta, barošanas apstākļi un tas, vai tests paredzēts tikai lokālajam tīklam vai attālinātai piekļuvei. Līdz tam sagatavojam arhitektūru, nevis veicam ierīces izmaiņas.

## Oficiālā tehniskā atsauce

- Android Developers: Background execution limits — https://developer.android.com/about/versions/oreo/background
- Android Developers: Foreground service changes — https://developer.android.com/develop/background-work/services/fgs/changes
- Termux app — https://github.com/termux/termux-app
- Termux execution environment — https://github.com/termux/termux-packages/wiki/Termux-execution-environment
