# Globālais princips: klientam vajadzīgā informācija īstajā brīdī

**Statuss:** produkta prasība turpmākajai izstrādei  
**Tvērums:** visa Mansdarbs platforma un tās nākotnes Baltijas versijas  
**Valodas:** latviešu un angļu valoda jau esošajā produkta valodu modelī

## Pamatprincips

Mansdarbs nedrīkst likt klientam meklēt vajadzīgo funkciju, informāciju vai nākamo soli pa izvēlnēm. Kad klients atver lapu, sadaļu vai konkrētu darbplūsmu, sistēmai pašai jāparāda attiecīgajā brīdī vajadzīgā informācija un pieejamās darbības.

Klientam vajadzīgais jāpasniedz izmantojamā formā, nevis tikai jānorāda, kur to varētu atrast. Tas attiecas uz ikvienu klientu neatkarīgi no pieredzes, amata, uzņēmējdarbības formas vai nozares.

## Kā sistēmai jāreaģē uz kontekstu

Mansdarbs var izmantot tikai konkrētajai darbībai nepieciešamo kontekstu, piemēram:

- pašreizējo sadaļu un atvērto ierakstu;
- lietotāja izvēlēto darbības stadiju, nozari un aktuālo vajadzību;
- jau ievadītos datus un darbplūsmas statusu;
- lietotāja lomu un faktiski piešķirtās atļaujas;
- attiecīgos termiņus, aprēķinu rezultātus un trūkstošos dokumentus.

Piemēri:

| Konteksts | Kas jāparāda automātiski |
|---|---|
| Lietotājs sāk darbu | Piemērotie sākšanas soļi, reģistrācijas ceļš un būtiskie ierobežojumi |
| Lietotājs atver ienākumu/izdevumu uzskaiti | Attiecīgajam ierakstam vajadzīgie lauki, saglabāšanas nosacījumi un nākamā darbība |
| Lietotājs ievada darījumu, kas var ietekmēt nodokļu slieksni | Skaidrs brīdinājums, aprēķina pamats un drošākais nākamais solis |
| Lietotājs gatavo rēķinu | Trūkstošie obligātie rekvizīti un iespēja pabeigt rēķinu |
| Lietotājs atver projekta budžetu | Plāns, faktiskās/saistītās izmaksas, novirzes un attiecīgās darbības atbilstoši lomai |
| Lietotājs gatavo pārskatu | Nepieciešamie dati, trūkstošie pierādījumi, termiņš un eksporta iespēja |

Šie ir uzvedības piemēri, nevis prasība visus elementus vienlaikus izvietot ekrānā.

## Informācijas pasniegšanas noteikumi

Kontekstuālajam ieteikumam, ja tas ir būtisks, jāatbild uz šiem jautājumiem:

1. **Kas notiek?** Īsi izskaidro situāciju vai lietotāja pašreizējo stāvokli.
2. **Kāpēc tas ir svarīgi?** Norādi sekas, termiņu vai ieguvumu saprotamā valodā.
3. **Ko darīt tagad?** Piedāvā vienu skaidru nākamo darbību.
4. **Kas būs vajadzīgs?** Parādi nepieciešamos datus vai dokumentus, ja tādi ir.
5. **Kas notiks pēc tam?** Izskaidro sagaidāmo rezultātu un to, ko sistēma pati neveiks.

Ieteikumiem jābūt īsiem, konkrētiem, lokāliem un atbilstošiem pašreizējai darbībai. Sarežģītākos gadījumos jāsniedz pakāpeniska palīdzība, nezaudējot jau ievadīto informāciju.

## Dažādu lietotāju vajadzības

- **Iesācējam:** vienkārša valoda, skaidrojums par to, kas jādara un kāpēc.
- **Pieredzējušam lietotājam:** īsākais ceļš uz vajadzīgo darbību, bez liekiem pamācību blokiem.
- **Vadītājam:** lēmumam vajadzīgs kopsavilkums, riski un novirzes.
- **Finanšu vai administratīvajam lietotājam:** termiņi, trūkstošie dokumenti, izmaksas, saskaņojumi un nākamās darbības.
- **Nozares profesionālim:** tikai viņa darbībai būtiskie lauki, noteikumi un rīki.

Sistēmai nav jāpieņem, ka katrs lietotājs ir iesācējs. Pieredzes līmeni var noteikt pēc skaidri izvēlētas lietotāja preferences vai lietotāja pašreizējās darbības konteksta, nevis slēptas uzvedības profilēšanas.

## UX un uzticamības robežas

- Ieteikumiem jābūt neuzbāzīgiem, nepārtraucošiem un vajadzības gadījumā aizveramiem.
- Nedrīkst uzspiest pamācību, bloķēt galveno darbību vai atkārtoti rādīt vienu un to pašu paziņojumu bez jauna iemesla.
- Nedrīkst pazust lietotāja ievadītie dati, mainoties sadaļai vai pārejot uz saistītu darbību.
- Jāparāda tikai tās darbības, kuras lietotājs drīkst veikt; piekļuves kontrole vienmēr jānodrošina arī servera pusē.
- Ja ieteikums nav pašsaprotams, īsi jāpaskaidro, kāpēc tas tiek rādīts.
- Sistēma nedrīkst apgalvot, ka darbība ir pabeigta, dokuments iesniegts, maksājums veikts vai dati saglabāti, kamēr to nav apstiprinājis attiecīgais process.
- Ja informācija ir nepilnīga vai aprēķins nav atbalstīts, tas skaidri jāpasaka un nedrīkst radīt maldinošu pārliecību.
- Svarīga informācija jāsniedz arī pieejamā, tastatūrai un ekrānlasītājiem saprotamā veidā.

## Privātums un datu izmantošana

- Kontekstuālie ieteikumi pēc noklusējuma jāaprēķina lietotāja pārlūkprogrammā, ja servera apstrāde nav nepieciešama.
- Nedrīkst sūtīt personīgos finanšu datus, dokumentus vai lietotāja profilu analītikai tikai tāpēc, lai pielāgotu saskarni.
- Neobligātam situācijas profilam jāpaliek lietotāja kontrolē: to var mainīt vai dzēst.
- Organizāciju vidē konteksts un ieteikumi jāierobežo ar lietotāja lomu un piekļuves tiesībām.
- AI izmantošana nav automātiska prasība. Sensitīvi dati netiek nosūtīti AI pakalpojumiem bez skaidras vajadzības, atbilstošas informēšanas un atsevišķa lietotāja apstiprinājuma.

## Pieņemšanas kritēriji turpmākām funkcijām

Funkcija atbilst šim principam, ja:

- atverot attiecīgo sadaļu, lietotājs redz būtiskāko informāciju un pieejamo nākamo darbību bez nepieciešamības to meklēt izvēlnēs;
- ieteikums ir balstīts uz pašreizējo kontekstu, nevis vispārīgu reklāmas tipa paziņojumu;
- lietotājs saprot, kāpēc ieteikums tiek rādīts un ko tas izraisīs;
- ieteikums nepiedāvā nepieejamu vai neatļautu darbību;
- ievadītie dati tiek saglabāti vai droši saglabājas darbplūsmas laikā;
- kļūdu, nepilnīgu datu vai neatbalstīta scenārija gadījumā lietotājam tiek parādīts konkrēts skaidrojums un drošs nākamais solis;
- risinājums darbojas latviešu un angļu valodā, ievērojot esošo lokalizācijas modeli;
- funkcija tiek pārbaudīta ar reāliem lietotājiem un dažādiem pieredzes līmeņiem.

## Ieviešanas robeža

Šis dokuments nosaka globālu produkta un funkcionalitātes principu. Tas pats par sevi nav atļauja mainīt esošo vizuālo dizainu, lapu izkārtojumu vai būtisku lietotāja pieredzi. Šādas izmaiņas pirms ieviešanas jāsaskaņo atsevišķi.

Princips jāievieš pakāpeniski esošo funkciju ietvaros: vispirms identificējot konkrēto lietotāja uzdevumu, nepieciešamo kontekstu un drošo nākamo darbību, pēc tam papildinot loģiku un testus. Nedrīkst ieviest plašu, nepārbaudītu personalizācijas vai analītikas slāni.
