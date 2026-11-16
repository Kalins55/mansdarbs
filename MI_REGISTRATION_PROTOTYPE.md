# Mansdarbs konsultanta sarunas prototips

## Atrašanās vieta un atvēršanas loģika

- `public/mi-konsultants.html` — responsīva latviešu valodas sarunas lapa.
- `public/index.html` — sākuma izvēle “Vēlos sākt strādāt oficiāli” atver parasto sākuma izvērtējumu, nevis MI konsultantu.
- Mansdarbs konsultants atveras tikai pēc lietotāja klikšķa uz VID/EDS saiti Mansdarbs lapā: VID vietne tiek atvērta jaunā cilnē, bet konsultants — esošajā Mansdarbs cilnē.
- “Aizvērt konsultantu” atgriežas iepriekšējā tās pašas vietnes skatā, ja pārlūks to ļauj; tiešas atvēršanas gadījumā tiek atvērta sākumlapa.
- Izmaiņas veiktas tikai `test` atzarā. `main` nav mainīts. Izvietošana nav veikta.

## Sarunas plūsma

Jautājumi tiek uzdoti pa vienam:
1. Kādi darbi vai pakalpojumi tiek sniegti?
2. Cik bieži ir pasūtījumi?
3. Aptuvenie mēneša ieņēmumi.
4. Aptuvenie mēneša izdevumi.
5. Klientu veids.
6. Maksājuma veids.
7. Vai saimnieciskā darbība jau reģistrēta VID?

Katram jautājumam ir īss paskaidrojums, kāpēc informācija vajadzīga. Lietotājs var atbildēt brīvā tekstā, izvēlēties piedāvātu variantu, izlaist jautājumu vai atgriezties pie iepriekšējā jautājuma. Kopsavilkumā izlaistās atbildes tiek parādītas kā “Nav norādīts”. Sākotnējais plāns tiek pielāgots reģistrācijas statusam, pasūtījumu biežumam, izdevumiem, klientu veidam un maksājuma veidam.

## Privātums un drošības robežas

- Prototips nav savienots ar MI API, Mansdarbs sarunas API, VID vai EDS.
- Sarunas atbildes atrodas tikai lapas JavaScript atmiņā; tās netiek sūtītas uz serveri, URL, VID vai EDS, un netiek glabātas `localStorage`, `sessionStorage` vai sīkdatnēs.
- Aizverot vai pārlādējot konsultanta lapu, atbildes pazūd.
- Ir vienkārša klienta puses pārbaude, kas aptur atbildes nosūtīšanu sarunā, ja tajā atpazīst personas koda, IBAN vai iespējamās kartes numura rakstu. Tā nav pilnīga sensitīvu datu noteikšana.
- Lietotājam tiek skaidri lūgts neievadīt paroles, personas kodu, bankas vai kartes datus un klientu identificējošu informāciju.
- Vietnes hostings var apstrādāt tehniskus lapas pieprasījumu žurnālus. Sarunas atbildes netiek pievienotas šiem pieprasījumiem.
- Nekas netiek automātiski nosūtīts VID vai iesniegts lietotāja vārdā.

## Demonstrācijas ierobežojumi

- Šis ir noteikumos balstīts UI prototips, nevis īsts MI. Nav MI API atslēgas vai servera izpildvides konfigurācijas, un tās šai demonstrācijai nav vajadzīgas.
- Brīvā teksta izpratne ir ierobežota; plāna personalizācija izmanto vienkāršus noteikumus un atbilžu kategorijas.
- Nav nodokļu aprēķinu, juridiska slēdziena, EDS savienojuma, automātiskas iesniegšanas vai datu saglabāšanas.
- Prototips negarantē juridisku vai nodokļu rezultātu. Neskaidrie jautājumi jāpārbauda aktuālajos VID avotos un normatīvajos aktos.

## Konfigurācija

- Ja izmanto esošo Cloudflare Pages statisko konfigurāciju ar `assets.directory: ./public`, papildu MI noslēpumi, KV saites vai servera funkcijas šai demonstrācijai nav vajadzīgas.
- Netiek pievienotas jaunas API atslēgas, vides mainīgie vai Cloudflare binding.
- Pirms īstas MI integrācijas API atslēga jāglabā tikai servera pusē; jāizstrādā datu minimizācijas, glabāšanas, dzēšanas, piekrišanas un piekļuves kontroles kārtība; jāizmanto pārbaudīta VID/normatīvo avotu kopa ar atjaunošanas datumiem; jānodala fakti, pieņēmumi un jautājumi, kas jāeskalē VID vai speciālistam.

## Pārbaudes

Automātiskās pārbaudes jāveic pēc izmaiņām:
- JavaScript sintakses pārbaude abām lapām.
- Pārbaude, ka sākuma poga vairs neatver konsultantu.
- Pārbaude, ka VID saišu klikšķis atver jaunu cilni un konsultantu esošajā cilnē.
- Pārbaude, ka sarunas atbildes netiek sūtītas ar `fetch`, `sendBeacon`, XHR vai formu.
- Pārbaude, ka ir jautājumu izlaišana, atgriešanās, tukšas/garas/sensitīvas atbildes kļūdas stāvoklis, kopsavilkums un personalizēts plāns.
- Manuāla pārbaude mobilajā pārlūkā, tastatūras navigācijā, pārlūka uznirstošo logu bloķēšanas gadījumā un atgriešanās vēsturē.

## Neatrisinātie ierobežojumi

- Pārlūka un hostinga uzvedība var ietekmēt jaunas cilnes atvēršanu un iepriekšējā skata atjaunošanu; tas jāpārbauda reālā pārlūkā.
- Sensitīvu datu rakstu noteikšana ir tikai papildu aizsardzība, nevis garantija.
- Nav veikta reāla VID juridiskā satura validācija vai nodokļu režīmu salīdzināšana.
- Nav veikta manuāla pārlūka pārbaude vai izvietošana. `main` un produkcija nav aiztikti.
