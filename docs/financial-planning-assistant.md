# Finanšu plānošanas palīgs

## Mērķis

Mansdarbs finanšu plānošanas palīgs palīdz gan esošiem uzņēmējiem, gan cilvēkiem, kuri tikai plāno uzsākt saimniecisko darbību. Tas pārvērš lietotāja ieceri un ikdienas skaitļus saprotamā finanšu plānā, lai cilvēks varētu novērtēt izmaksas, ieņēmumus, naudas plūsmu un iespējamo peļņu.

Šī funkcija nav ieguldījumu konsultēšana. Tā neiesaka akcijas, fondus, kriptoaktīvus, finanšu instrumentus vai individuālus ieguldījumu darījumus.

## Lietotāju grupas

### 1. Cilvēks, kurš plāno sākt uzņēmējdarbību

Palīdzēt atbildēt uz praktiskiem jautājumiem:
- Kādi sākuma ieguldījumi un izdevumi būs nepieciešami?
- Kādi būs regulārie un mainīgie izdevumi?
- Cik daudz pakalpojumu vai preču jāpārdod, lai nosegtu izmaksas?
- Kā noteikt sākotnējo cenu, ņemot vērā pašizmaksu un vēlamo peļņu?
- Cik liela naudas rezerve vajadzīga, kamēr ieņēmumi kļūst regulāri?
- Kādi nodokļi un administratīvie pienākumi jāņem vērā? Nodokļu aprēķini jānodala no vispārējiem finanšu pieņēmumiem un jābalsta aktuālos Latvijas noteikumos.

### 2. Esošs uzņēmējs

Palīdzēt pārskatīt un plānot:
- ieņēmumus un izdevumus pa kategorijām;
- fiksētās un mainīgās izmaksas;
- pakalpojumu vai produktu pašizmaksu;
- cenu un peļņas maržu;
- mēneša un ceturkšņa budžetu;
- naudas plūsmu un maksājumu termiņus;
- rentabilitātes slieksni;
- scenārijus, ja ieņēmumi samazinās vai izmaksas pieaug;
- naudas rezervi un tuvākos finanšu riskus.

## Galvenās darbplūsmas

1. Noskaidrot, vai lietotājs plāno sākt darbību vai jau darbojas.
2. Noskaidrot darbības veidu un plānošanas periodu.
3. Apkopot tikai attiecīgajam aprēķinam nepieciešamos datus: cenas, apjomus, biežumu, izmaksas, maksājumu termiņus un lietotāja pieņēmumus.
4. Skaidri atdalīt lietotāja ievadītos faktus no sistēmas pieņēmumiem.
5. Aprēķināt attiecīgos rādītājus un paskaidrot tos vienkāršā valodā.
6. Parādīt vismaz pamata scenāriju un, ja dati to atļauj, piesardzīgu un optimistisku scenāriju.
7. Norādīt, kuri dati visvairāk ietekmē rezultātu un kas vēl jānoskaidro.
8. Ļaut lietotājam labot pieņēmumus un uzreiz pārrēķināt rezultātu.

## Aprēķinu pamatprincipi

- Ieņēmumi = pārdotais apjoms × cena.
- Mainīgās izmaksas = vienības mainīgās izmaksas × apjoms.
- Kopējās izmaksas = fiksētās izmaksas + mainīgās izmaksas.
- Peļņa pirms nodokļiem = ieņēmumi − attiecīgajā periodā atzītās izmaksas.
- Vienības pašizmaksa = attiecināmās izmaksas / saražotais vai pārdotais vienību skaits.
- Rentabilitātes slieksni aprēķina tikai tad, ja ir pietiekami dati par fiksētajām izmaksām, cenu un mainīgajām izmaksām.
- Naudas plūsma jāuzrāda atsevišķi no peļņas: ieņēmumu un izdevumu faktiskie naudas saņemšanas/maksāšanas datumi var atšķirties no to uzskaites perioda.
- Nodokļus nedrīkst uzminēt vai pasniegt kā universālu procentu. Jānorāda režīms, periods, piemērotie noteikumi un aprēķina datums; ja informācijas nepietiek, jāparāda, kas jāprecizē.

## Uzticamība un lietotāja kontrole

- Katram rezultātam jābūt pārbaudāmam: jāparāda formula, ievaddati un pieņēmumi.
- Nedrīkst izdomāt trūkstošus skaitļus. Trūkstošās vērtības jāatstāj kā jautājumi vai skaidri marķēti scenārija pieņēmumi.
- Nedrīkst garantēt peļņu vai solīt konkrētu uzņēmējdarbības rezultātu.
- Ja jautājums prasa juridisku, nodokļu vai licencētas finanšu konsultācijas profesionālu izvērtējumu, jāpasaka, kur beidzas rīka aprēķins un kas jāpārbauda pie attiecīgā speciālista vai oficiālā avota.
- Lietotājam vienmēr ir iespēja labot vai dzēst ievadītos datus un sākt no jauna.

## Privātums un monetizācijas robežas

- Pamatplūsmai jādarbojas anonīmi, bez obligāta konta.
- Finanšu dati pēc noklusējuma tiek apstrādāti un saglabāti lietotāja ierīcē/pārlūkprogrammā.
- Nekādus personas vai finanšu datus nedrīkst nosūtīt AI vai citam ārējam pakalpojumam pēc noklusējuma. Ārēja apstrāde pieļaujama tikai pēc skaidra, konkrēta lietotāja lēmuma un datu minimizācijas.
- Pamatfunkcijas finanšu plānošanai jābūt bez maksas; monetizācija nedrīkst radīt stimulu virzīt lietotāju uz konkrētiem finanšu produktiem vai aizdevumiem.

## Pakāpeniska ieviešana

### 1. posms — aprēķinu kodols
- Definēt un notestēt ieņēmumu, izmaksu, pašizmaksas, peļņas un naudas plūsmas aprēķinus.
- Nodrošināt skaidru periodu, valūtu un noapaļošanas apstrādi.
- Izveidot pārbaudes piemērus un robežgadījumu testus.

### 2. posms — lietotāja plānošanas sesija
- Pievienot soli pa solim datu ievadi jaunam un esošam uzņēmējam.
- Nodrošināt labojamus pieņēmumus un tūlītēju pārrēķinu.
- Saglabāt datus lokāli un ļaut eksportēt kopsavilkumu.

### 3. posms — sasaite ar Mansdarbs ikdienas uzskaiti
- Ar lietotāja izvēli izmantot jau ievadītos ieņēmumu un izdevumu ierakstus.
- Neprasīt atkārtoti informāciju, kas jau pieejama lokālajā uzskaitē.
- Pirms plāna aprēķina parādīt, kuri uzskaites dati tiks izmantoti.

## Pieņemšanas kritēriji

Funkcija ir gatava sākotnējai izlaišanai, ja:
- atbalsta gan darbības uzsākšanas plānu, gan esošas darbības finanšu pārskatu;
- aprēķini ir testēti ar zināmiem piemēriem;
- katrs rezultāts izskaidro ievaddatus un formulu;
- pieņēmumi ir redzami un labojami;
- peļņa un naudas plūsma netiek sajauktas;
- netiek sniegti ieguldījumu ieteikumi;
- lietotājam nav jāizveido konts un dati paliek lokāli pēc noklusējuma.
