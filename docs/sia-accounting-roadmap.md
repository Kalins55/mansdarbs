# SIA uzskaites un gada pārskata attīstības prasības

**Statuss:** tehniskā specifikācija; pašreizējā SIA sadaļa ir demonstrācijas prototips, nevis pilnvērtīga grāmatvedības sistēma.

## Mērķis

Mansdarbs jāspēj ātri pārvērst uzņēmuma ikdienas darījumu datus saprotamā finanšu pārskatā. Dažu sekunžu laikā var sagatavot sākotnēju kopsavilkumu, bet to nedrīkst pasniegt kā pabeigtu gada grāmatvedību, kamēr nav pārbaudīti avota dokumenti, darījumu klasifikācija un attiecīgā gada normatīvie nosacījumi.

Pamatprincips: **ātrs aprēķins, pārbaudāma izcelsme, skaidri norādīti ierobežojumi.**

## Pašreizējā prototipa robežas

Pašreizējā `index.html` SIA prototips:
- glabā uzņēmuma un darījumu datus lietotāja pārlūkprogrammā (`localStorage`);
- reģistrē vienkāršotus pārdošanas un pirkumu darījumus;
- aprēķina summas bez PVN, PVN un kopsummu;
- veido vienkāršotu debeta/kredīta pārskatu ar piemēra kontiem;
- parāda ieņēmumu, izdevumu, peļņas un PVN starpības kopsummas.

Tas pašlaik **neveic** pilnu SIA gada slēgumu, neimportē bankas izrakstus vai pirmdokumentus, nepārbauda darījumu juridisko pamatojumu un neaizstāj grāmatvedi. Kontu numuri ir piemēri, un vienkāršotie PVN aprēķini nav pietiekami visiem darījumu veidiem.

## Nākamās tehniskās kārtas

### 1. Datu modelis un izcelsme
Katram darījumam jābūt ar stabilu ID, uzņēmuma ID, datumu, dokumenta numuru, darījuma partneri, valūtu, summām, PVN režīmu, kontējuma statusu un saistītā pirmdokumenta atsauci. Jāsaglabā datu avots: manuāla ievade, imports vai dokumenta atpazīšana. Nekad nedrīkst klusējot pārrakstīt sākotnējo dokumenta vērtību.

### 2. Dokumentu un bankas datu imports
Atbalstīt strukturētus CSV un citus pārbaudītus formātus, kā arī rēķinu/PDF datu izvilkšanu. Atpazīt dublikātus, neatpazītus laukus un nesakritības. Pirms importēto datu pievienošanas lietotājam jāparāda priekšskatījums un jāļauj apstiprināt vai labot ierakstus.

### 3. Kontējums un grāmatojumu pārbaude
Kontu plānam jābūt konfigurējamam atbilstoši uzņēmuma grāmatvedības politikai. Katram grāmatojumam jāpārbauda debeta un kredīta līdzsvars. Jāatbalsta avansa maksājumi, daļēji apmaksāti rēķini, kredītrēķini, atmaksas, valūtas kursi un periodu korekcijas. PVN jānosaka pēc darījuma būtības un piemērojamā režīma, nevis tikai pēc izvēlētas likmes.

### 4. Gada pārskata sagatavošana
Gada pārskata sagatavošanas plūsmai jāpārbauda vismaz:
- visi izvēlētā perioda darījumi un to pirmdokumenti;
- bankas un kases atlikumu salīdzinājums;
- debitoru un kreditoru atlikumi;
- PVN uzskaite un deklarāciju periodu atbilstība;
- pamatlīdzekļi un nolietojums;
- krājumi un inventarizācijas korekcijas, ja attiecināms;
- darba samaksa un ar to saistītās saistības, ja attiecināms;
- uzkrājumi, nākamo periodu izmaksas un citi slēguma ieraksti;
- bilances un peļņas vai zaudējumu aprēķina savstarpējā saskaņa.

Ja kāda sadaļa nav pieejama vai dati nav pietiekami, pārskats jāmarķē kā nepilnīgs un jāuzrāda konkrētais trūkums. Nedrīkst izlikties, ka nepārbaudīta pozīcija ir nulle.

### 5. AI asistenta loma
AI drīkst klasificēt dokumentu laukus, ieteikt kontējumu, izskaidrot novirzes un sagatavot pārskata projektu. Katram ieteikumam jābūt sasaistītam ar avota ierakstu un skaidri marķētam kā ieteikumam. AI nedrīkst izdomāt trūkstošus darījumus, automātiski apstiprināt neskaidru kontējumu vai iesniegt deklarācijas lietotāja vietā.

### 6. Pārskatīšana un apstiprināšana
Lietotājam vai pilnvarotam grāmatvedim jāspēj pārskatīt katru brīdinājumu, labot klasifikāciju un apstiprināt perioda slēgumu. Labojumiem jāsaglabā auditācijas vēsture: kas mainīts, kad, kāpēc un no kādas sākotnējās vērtības. Ārēja iesniegšana vai juridiski saistoša darbība vienmēr prasa skaidru lietotāja apstiprinājumu.

## Ātrā pārskata režīms

Mērķis ir dažu sekunžu laikā sniegt sākotnēju atbildi uz jautājumiem:
- cik ir ieņēmumu, izdevumu un rezultāta izvēlētajā periodā;
- kādi ir lielākie izmaksu posteņi;
- kuri darījumi nav sasaistīti ar dokumentiem;
- kādi dati trūkst pilnam pārskatam;
- kuras summas vēl nav pārbaudītas vai apstiprinātas.

Ātrā pārskata virsrakstam jāatšķir **“Aprēķināts no ievadītajiem datiem”** no **“Pārbaudīts gada pārskats”**. Otru statusu drīkst piešķirt tikai pēc visu attiecināmo pārbaudes soļu pabeigšanas.

## Privātums un drošība

- Pamatlietošana paliek anonīma, bez obligāta konta.
- Pēc noklusējuma finanšu dati paliek lietotāja ierīcē; servera AI pieprasījumam nedrīkst automātiski pievienot pilnu uzņēmuma datu kopu.
- Pirms jebkādas ārējas datu nosūtīšanas jāparāda, kādi dati tiks nosūtīti un kādam nolūkam.
- API atslēgas un piekļuves tokeni nekad nedrīkst atrasties klienta kodā vai repozitorijā.
- Jāievieš rezerves kopijas eksports un atjaunošanas pārbaude; lokāla pārlūka glabātuve nav uzskatāma par ilgtermiņa arhīvu.
- Reālu uzņēmumu datu izmantošanai testos jālieto anonimizēti vai sintētiski dati.

## Pieņemšanas kritēriji pirms pilnvērtīgas SIA funkcijas publiskas palaišanas

1. Aprēķiniem ir automatizēti testi ar pozitīviem, negatīviem, robežvērtību un noapaļošanas gadījumiem.
2. Katrs kopsavilkuma skaitlis ir izsekojams līdz konkrētiem darījumiem un dokumentiem.
3. Debeta un kredīta kopsummas vienmēr sakrīt; kļūdas gadījumā perioda slēgums tiek bloķēts.
4. PVN režīmi un darījumu veidi tiek pārbaudīti pret aktuāliem oficiāliem avotiem.
5. Dublikāti, nepilnīgi dokumenti un neatbilstoši datumi tiek atklāti, nevis klusi pieņemti.
6. Lietotājs var eksportēt savus datus un atjaunot rezerves kopiju.
7. Saskarne skaidri atšķir demonstrācijas aprēķinu, nepilnīgu pārskatu un pārbaudītu rezultātu.
8. Pirms publiskas palaišanas tiek veikta grāmatvedības, juridiskā un datu aizsardzības pārbaude.

