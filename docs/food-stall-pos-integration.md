# Pop-up ēdienu stendu un POS termināļu modulis

Statuss: produkta prasība un tehniskā specifikācija; nav dzīvas termināļa integrācijas.

## Mērķa lietotāji

- Street-food un pop-up ēdienu stendi.
- Festivālu, gadatirgu un sezonas pasākumu ēdinātāji.
- Mobilās kafejnīcas, food truck un pagaidu kioski.
- Mazie ēdinātāji, kas strādā vairākās tirdzniecības vietās.

## Lietotāja plūsma

1. Lietotājs izvēlas nozari **Ēdināšana un pārtikas pakalpojumi** un apakštipu, piemēram, pop-up stends / food truck.
2. Izveido stendu vai tirdzniecības vietu un pasākuma maiņu: datums, vieta, pasākums, maiņas sākums/beigas.
3. Pievieno ēdienkarti: prece, kategorija, cena, PVN konfigurācija (tikai pēc lietotāja/gramatveža apstiprinājuma).
4. Reģistrē pārdošanu un maksājumu veidus: skaidra nauda, karte caur POS, bezkontakta/mobilais maksājums, dāvanu karte vai cita metode.
5. Dienas beigās importē POS/kases pārskatu vai saņem datus caur autorizētu pakalpojuma sniedzēja savienojumu.
6. Mansdarbs salīdzina pārdošanas uzskaiti, kases datus un termināļa norēķinus, izceļot starpības un komisijas.
7. Sagatavo dienas, pasākuma, mēneša un grāmatvedības kopsavilkumu ar dokumentu atsaucēm.

## POS integrācijas principi

- Veidot no termināļa ražotāja neatkarīgu adapteru slāni: katram pakalpojuma sniedzējam atsevišķs savienotājs.
- Pirmajā versijā atbalstīt CSV/XLSX pārskatu importu un manuālu dienas kopsavilkumu; automātiska API sinhronizācija tikai pēc konkrēta pakalpojuma sniedzēja API, līguma, testa vides un piekļuves saņemšanas.
- Saglabāt sākotnējo importa failu, avota identifikatorus, importēšanas laiku un katra ieraksta izcelsmi.
- Dublētu transakciju novēršanai izmantot pakalpojuma sniedzēja darījuma ID; ja tāda nav, veidot kontrolētu salīdzināšanas atslēgu un atzīmēt neskaidros dublikātus.
- Kartes darījuma summa, atmaksas, anulējumi, komisijas un kontā ieskaitītā neto summa jāglabā atsevišķi.
- Nekad neglabāt pilnu kartes numuru, CVV, PIN vai citus sensitīvus kartes datus. Saglabāt tikai nepieciešamos atsauces ID un maskētu informāciju, ja pakalpojuma sniedzējs to atgriež.
- POS termināļa kartes maksājuma apliecinājums nav automātiski uzskatāms par kases čeku vai darījuma fiskālo dokumentu.
- Mansdarbs sākotnēji ir uzskaites un salīdzināšanas slānis, nevis sertificēta kases sistēma un nevis termināļa vadības programmatūra.

## Datu modelis

### Tirdzniecības vieta un maiņa
- Stenda nosaukums, adrese/vieta, pasākums, datums un maiņas laiks.
- Atbildīgā persona un izmantotā kases sistēma.
- Termināļa pakalpojuma sniedzējs, termināļa identifikators un tirgotāja identifikators (ja pieejams).

### Pārdošanas ieraksts
- Datums/laiks, prece/pakalpojums, daudzums, vienības cena, atlaide un kopējā summa.
- Maksājuma veids un valūta.
- Kases darījuma/čeka identifikators.
- POS darījuma ID un autorizācijas statuss (ja attiecas).
- Atmaksa/anulējums un saistītā sākotnējā darījuma ID.

### Norēķinu kopsavilkums
- Bruto karšu apgrozījums.
- Atmaksas un anulējumi.
- Pakalpojuma sniedzēja komisijas un citas maksas.
- Neto izmaksātā summa, izmaksas datums un bankas konta izraksta atsauce.
- Starpība starp kases/POS datiem un bankā saņemto summu.

## Pārskati

- Maiņas un pasākuma pārdošanas kopsavilkums.
- Pārdošana pa precēm, kategorijām un maksājuma veidiem.
- Skaidras naudas un karšu maksājumu salīdzinājums.
- POS komisijas, atmaksas un neto izmaksas.
- Neatbilstību saraksts, ko lietotājs var izskaidrot un atzīmēt.
- Eksports grāmatvedim un VID vajadzībām piemērotā formātā, balstoties uz pārbaudītiem dokumentiem un spēkā esošajām prasībām.

## Latvijas atbilstības robežas

- Ēdiena un dzērienu pārdošana tūlītējam patēriņam (arī promnešanai) ir ēdināšanas pakalpojums; VID skaidro, ka šādā gadījumā jālieto kases aparāts.
- POS terminālis pats par sevi neveido darījumu apliecinošu dokumentu. Tādēļ kartes termināļa čeks nedrīkst tikt automātiski uzskatīts par kases čeku.
- Precīza kases sistēmas un POS savietojamība jāīsteno atbilstoši VID tehniskajām prasībām un konkrētā risinājuma sertifikācijas/atbilstības nosacījumiem.
- Atsevišķi jāizvērtē pašu ražotu pārtikas produktu mazumtirdzniecība, kas nav ēdināšana, jo tai var būt citi kases aparāta lietošanas izņēmumi.
- PVN likmes, PVN statuss, čeku/kvīšu izsniegšana un dokumentu prasības nedrīkst tikt noteiktas tikai pēc nozares izvēles; tās jāpārbauda pēc faktiskā darījuma un lietotāja statusa.
- Pārtikas uzņēmuma reģistrācija un higiēnas prasības ir atsevišķa PVD atbilstības plūsma, nevis POS funkcija.

## Izstrādes secība

1. Pievienot pop-up/food truck profilu ēdināšanas nozarei.
2. Izveidot maiņu, ēdienkartes un pārdošanas uzskaiti.
3. Ieviest POS un kases pārskatu CSV importu, lauku kartēšanu un kļūdu pārskatu.
4. Ieviest automātisku darījumu un izmaksu salīdzināšanu.
5. Pēc lietotāju pieprasījuma izvēlēties pirmo POS pakalpojuma sniedzēju un izstrādāt tā API adapteri.
6. Pirms palaišanas pārbaudīt risinājumu ar VID prasībām un izvēlētā kases sistēmas/POS piegādātāja tehnisko dokumentāciju.

## Atvērtie lēmumi

Pirmo automātisko integrāciju nevar korekti izvēlēties, kamēr nav zināms, kuru termināļu pakalpojumu sniedzēju mērķa lietotāji izmanto. Arhitektūra paliek neitrāla, lai vēlāk pievienotu vairākus pakalpojumu sniedzējus, neizmainot uzskaites kodolu.
