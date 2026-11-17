# Mansdarbs — produkta principi un attīstības ceļvedis

Statuss: plānošanas dokuments. Šis fails pats par sevi neievieš funkcijas, nemaina lietotāja saskarni un neko nepublicē.

## 1. Produkta pamats

Mansdarbs ir palīgs cilvēkiem, kuri strādā paši un mazajiem uzņēmumiem Latvijā. Pirmais uzdevums ir padarīt legālu saimniecisko darbību saprotamāku un ikdienas finanšu pārvaldību vienkāršāku.

Pamatfunkcijas visiem lietotājiem paliek bez maksas:
- ienākumu un izdevumu uzskaite;
- nodokļu aprēķini un prognozes ar skaidriem pieņēmumiem;
- pieejamo nodokļu režīmu salīdzināšana;
- rēķinu un pārskatu sagatavošanas palīgrīki;
- praktisks MI palīgs un saprotami nākamie soļi.

Mākslīgi neierobežot pamatfunkcijas, lai radītu vajadzību maksāt. Jaudas izmaksas jāmazina ar arhitektūru un efektivitāti, nevis ar lietotāja datu pārdošanu vai būtisku pamatfunkciju aizslēgšanu.

## 2. Privātums kā arhitektūras prasība

Noklusējuma princips: lietotājam nav obligāti jāveido konts, un viņa finanšu dati un dokumenti paliek viņa ierīcē/pārlūkprogrammā.

- Uzskaite, aprēķini, prognozes un salīdzinājumi pēc iespējas tiek veikti lokāli.
- Serverim nenosūtīt finanšu ierakstus, klientu datus vai brīvo tekstu tikai tāpēc, ka tas ir tehniski ērtāk.
- Ja lietotājs pats izvēlas MI jautājumu, pirms nosūtīšanas skaidri parādīt, kāds saturs tiks nosūtīts un kam. Sūtīt tikai konkrētajai atbildei vajadzīgo kontekstu.
- Nekad neprasīt VID/EDS paroles, Smart-ID kodus, personas kodu, bankas piekļuves datus vai klientu identificējošus datus.
- Neizmantot reklāmas profilēšanu, lietotāju izsekošanu vai datu pārdošanu.
- Tehniskā hostinga/CDN žurnāli jāatšķir no Mansdarbs paša datu vākšanas. Nedrīkst solīt absolūtu anonimitāti, pirms nav pārbaudīti pakalpojumu sniedzēja žurnāli, glabāšanas termiņi un līguma nosacījumi.

### Pašpilnveide bez personu izsekošanas

Produkta uzlabošanai var izmantot tikai minimālus, apkopotus notikumu skaitītājus, piemēram, cik reižu sākts vai pabeigts konkrēts process. Nedrīkst saglabāt notikumu vēsturi pa lietotājiem, atbildes, brīvo tekstu, konta identifikatorus, sīkdatņu identifikatorus vai lietotāja finanšu datus.

Brīva teksta darbības veidu nosaukumu sūtīšana uz kopīgu servera katalogu nav uzskatāma par drošu anonīmu metriku: nosaukumā var būt personas vai uzņēmuma dati. Sākotnēji šādu katalogu labāk veidot lokāli vai ar iepriekš definētu, pārbaudītu kategoriju sarakstu. Ja nākotnē tiek apsvērta agregēta kategoriju statistika, tai vajadzīga atsevišķa datu minimizācijas un privātuma pārbaude.

Skaitītāji ir signāli produktu uzlabojumu priekšlikumiem, nevis automātiska atļauja mainīt nodokļu loģiku, juridiskus skaidrojumus, privātuma robežas vai produkcijas funkcijas.

## 3. Finansēšanas modelis — tikai pēc vērtības pierādīšanas

Monetizācija nav pirmais uzdevums. Vispirms platformai jāpierāda, ka tā reāli palīdz cilvēkiem un ir uzticama.

- Nekad nepieprasīt maksājumu, lai piekļūtu pamatfunkcijām.
- Var būt neuzbāzīga, pilnīgi brīvprātīga iespēja atbalstīt izstrādi. Tai jābūt skaidri atdalītai no pakalpojuma kvalitātes un nodokļu rezultāta.
- Atbalsts nedrīkst būt slēpta komisija, priekšnoteikums palīdzībai vai iemesls pasliktināt bezmaksas lietotāja pieredzi.
- Atbalstītāja statuss var palīdzēt finansēt jaudīgāku un dārgāku risinājumu piemeklēšanu, bet tas nedrīkst pirkt juridisku priekšrocību, ietekmi uz valsts iestādēm vai precīzāku nodokļu patiesību.
- Īpaši vērtīgām, sabiedrībai nozīmīgām idejām var paredzēt izņēmuma iespēju saņemt padziļinātu palīdzību bez maksas. Kritērijiem jābūt caurskatāmiem un nediskriminējošiem.

Pamatprincipu pārbaude: ja lietotājs nekad neatbalsta projektu finansiāli, viņš joprojām saņem pilnvērtīgu, drošu un cieņpilnu pamatpakalpojumu.

## 4. MI un izmaksu efektivitāte

MI nav jāizmanto tur, kur drošs parasts aprēķins ir labāks.

- Nodokļu formulas un finanšu kopsummas jāaprēķina deterministiski ar testiem, nevis jāpaļaujas uz MI matemātisku minēšanu.
- MI izmanto skaidrojumiem, jautājumu precizēšanai, dokumentu melnrakstiem un sarežģītākai analīzei.
- Vienkāršiem uzdevumiem izmantot lētāku/ātrāku apstrādi; sarežģītus uzdevumus novirzīt jaudīgākam modelim tikai tad, kad tas dod reālu ieguvumu.
- Atkārtotiem, nemainīgiem skaidrojumiem izmantot kešatmiņu, bet ne kešot privātus lietotāja datus starp lietotājiem.
- MI atbildēs skaidri nošķirt faktus, pieņēmumus un nezināmo; nodokļu un juridiskos jautājumos norādīt oficiālos avotus un to aktualitāti.
- Lietotājam vienmēr jāsaglabā kontrole pār to, vai viņa informācija tiek nosūtīta ārējam MI pakalpojumam.

## 5. Uzticamība un nodokļu drošība

- Katram nodokļu aprēķinam jāparāda periods, izmantotā likme, ievades pieņēmumi un ierobežojumi.
- Tukšus laukus nedrīkst klusi interpretēt kā nulli vai kā noklusētu slieksni. Skaidri ievadīts 0 ir derīga vērtība, ja konkrētajā aprēķinā tas ir loģiski.
- Ja lietotāja situācija neatbilst atbalstītajam scenārijam, aprēķins jāaptur vai skaidri jāmarķē kā nepilnīgs, nevis jāparāda maldinoša gala summa.
- Aprēķinu loģikai vajadzīgi regresijas testi, robežgadījumi un pārbaude pret aktuālajiem VID un normatīvajiem avotiem.
- Mansdarbs nekad neapgalvo, ka ir pieslēdzies EDS, iesniedzis dokumentu vai mainījis lietotāja statusu, ja šāda darbība patiesībā nav notikusi.

## 6. Valsts politikas un sabiedrisko ideju atbalsts

Ilgtermiņā platforma var palīdzēt cilvēkiem saprast un strukturēt priekšlikumus par nodokļu, uzņēmējdarbības vai ekonomikas politikas uzlabojumiem.

Šim procesam jābūt:
- balstītam publiskos datos, tiesību aktos un pārbaudāmos aprēķinos;
- pieejamam neatkarīgi no lietotāja maksātspējas;
- caurskatāmam par pieņēmumiem, ieguvējiem, izmaksām un riskiem;
- demokrātiskam — Mansdarbs var palīdzēt sagatavot un iesniegt priekšlikumu, bet nevar nopirkt tā izskatīšanu vai garantēt politisku lēmumu;
- privātumu respektējošam — individuālie finanšu dati nav jānodod valsts iestādēm, lai izveidotu vispārīgu politikas priekšlikumu.

## 7. Prioritāšu secība

### P0 — drošs pamats
1. Noskaidrot, kura HTML lietotne un kura Cloudflare konfigurācija ir faktiskā aktīvā versija.
2. Atrisināt Git atzaru atšķirības, neapvienojot akli novecojušus vai divergentus atzarus.
3. Pārbaudīt, ka visi finanšu dati tiešām paliek lokāli, izņemot skaidri iniciētu MI pieprasījumu.
4. Pārbaudīt servera galapunktus: ievades izmērus, ātruma ierobežošanu, kļūdu apstrādi un KV/D1 konfigurāciju.
5. Pabeigt nodokļu kalkulatoru regresijas un juridiskās pārbaudes.

### P1 — reāla lietotāja vērtība
1. Pabeigt nozares uzskaites veidnes tikai pēc tam, kad katrai nozarei ir definēti vajadzīgie lauki un to nodokļu nozīme.
2. Padarīt sākšanas konsultantu par uzticamu soli-pa-solim ceļvedi, skaidri norādot, kas ir demonstrācija un kas ir pārbaudīts juridisks skaidrojums.
3. Pievienot saprotamu datu eksportu un rezerves kopijas atjaunošanas pārbaudes.
4. Pārbaudīt pieejamību telefonā, tastatūrai un ekrānlasītājiem, neveicot vizuālas izmaiņas bez īpašnieka apstiprinājuma.

### P2 — mērogošana
1. Optimizēt MI izmaksas un pieprasījumu maršrutēšanu.
2. Ieviest minimālus apkopotus produkta lietojuma rādītājus tikai pēc privātuma pārbaudes.
3. Izvērtēt brīvprātīgu atbalsta iespēju tikai pēc tam, kad produkts pierādījis savu vērtību.
4. Sagatavot starptautisku tehnisko pamatu, bet vispirms nostiprināt Latvijas versiju; nākamā Baltijas prioritāte ir Igaunija, pēc tam Lietuva.

## 8. Darba robežas

- Šis dokuments ir virziens, nevis apgalvojums, ka funkcijas jau ir ieviestas.
- Pirms jebkādas dizaina, vizuālā izskata, izkārtojuma vai būtiskas lietotāja pieredzes maiņas jāsaņem īpašnieka apstiprinājums.
- Nekādas izmaiņas nedrīkst automātiski publicēt produkcijā.
- Neatvienot un nedzēst Cloudflare projektu, KV resursus vai esošos datus.
- Pirms apvienošanas vienmēr salīdzināt atzarus un pārbaudīt, kurš saturs ir jaunāks; test atzaru nedrīkst uzskatīt par automātiski apvienojamu ar main.
