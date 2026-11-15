# MI reģistrācijas sarunas prototips

## Atrašanās vieta
- `public/mi-konsultants.html` — responsīva sarunas lapa.
- `public/index.html` — sākuma izvēle “Vēlos sākt strādāt oficiāli” atver sarunas prototipu.
- Izmaiņas ir tikai `test` atzarā. `main` nav mainīts un izvietošana nav veikta.

## Sarunas plūsma
Jautājumi tiek uzdoti pa vienam: darbības veids, pasūtījumu biežums, aptuvenie mēneša ieņēmumi, darba izdevumi, klientu veids, maksājuma veids un reģistrācijas statuss. Katru jautājumu var izlaist. Atbalstītas arī brīvā teksta atbildes. Beigās tiek parādīts atbilžu kopsavilkums un orientējoša nākamo soļu secība.

## Drošības un privātuma robežas
- Prototips ir noteikumos balstīta demonstrācija, nevis īsta MI integrācija.
- Atbildes atrodas tikai lapas JavaScript atmiņā; nav localStorage, cookies, API pieprasījumu vai servera saglabāšanas.
- Nekas netiek nosūtīts VID/EDS un netiek veiktas darbības lietotāja vārdā.
- Lietotājam tiek lūgts neievadīt paroles, personas kodu, bankas datus vai klientu identificējošu informāciju.
- Rezultāts norāda, ka tas nav juridisks vai nodokļu slēdziens un aktuālie noteikumi jāpārbauda VID.

## Pirms īstas MI integrācijas
1. MI pakalpojuma izsaukums jāveic servera pusē; API atslēgu nekad nelikt pārlūka kodā.
2. Jādefinē datu minimizācijas un glabāšanas politika, piekrišanas teksts un dzēšanas mehānisms.
3. Jāizveido pārbaudīta VID/normatīvo avotu zināšanu bāze ar datumiem un saitēm.
4. MI atbildēs jānodala fakti, pieņēmumi un jautājumi, kuriem vajadzīga VID vai speciālista pārbaude.
5. Pirms palaišanas jāveic drošības, privātuma, pieejamības un juridiskās kvalitātes pārbaude.

## Pārbaudes kontrolsaraksts
- [ ] Atvērt sākumlapu un izvēlēties “Vēlos sākt strādāt oficiāli”.
- [ ] Atbildēt uz jautājumiem ar pogām un brīvu tekstu.
- [ ] Izlaist jautājumus un pārbaudīt, ka saruna turpinās.
- [ ] Ievadīt tukšu atbildi un pārbaudīt kļūdas paziņojumu.
- [ ] Pabeigt sarunu un pārbaudīt kopsavilkumu.
- [ ] Pārbaudīt “Sākt sarunu no jauna”.
- [ ] Pārbaudīt mobilajā ekrānā un ar tastatūras navigāciju.
- [ ] Pārliecināties pārlūka tīkla panelī, ka atbildes netiek sūtītas serverim.

## Zināmie ierobežojumi
- Nav īsta MI modeļa; brīvā teksta izpratne ir ierobežota.
- Nav nodokļu aprēķinu vai automātiskas juridisko noteikumu pārbaudes.
- Nav EDS savienojuma.
- Nav saglabāšanas vai turpināšanas pēc lapas aizvēršanas.
- Reālai integrācijai nepieciešama API atslēga, servera funkcija, datu aizsardzības risinājums un aktuāla juridisko avotu kopa.
