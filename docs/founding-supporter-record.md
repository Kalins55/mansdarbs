# Agrīno atbalstītāju reģistrācijas pamats

## Mērķis

Paredzēt Mansdarbs nākotnes iespēju atpazīt uzņēmumus un saimniecības, kas projekta agrīnajā posmā ir iegādājušies individuālu konsultāciju/pakalpojumu un kurām saskaņā ar skaidri noformēto piedāvājumu nākotnē var tikt piešķirts Founding Member vai VIP statuss.

Šis dokuments rezervē vietu nākotnes funkcionalitātei. Tas **neievieš VIP pakalpojumu, neaktivizē priekšrocības un nemaina publiskās vietnes darbību**.

## Pašreizējais princips

- Publiskā Mansdarbs versija paliek pieejama bez maksas.
- Publiskajā saskarnē nav abonementu, VIP piedāvājuma vai VIP marķējuma.
- Pašreizējā prototipā netiek veidots uzņēmumu kontu katalogs un netiek vākti uzņēmumu dati.
- Nākotnes datu modelī paredzēt atsevišķu, pēc noklusējuma izslēgtu atzīmi founder_eligible = false.
- Šī atzīme nozīmē tikai to, ka uzņēmums ir atzīts par tiesīgu saņemt nākotnē noteiktu Founding Member piedāvājumu. Tā pati par sevi nepiešķir VIP piekļuvi.
- Atsevišķs statuss vip_active = false nākotnē kontrolē faktisko VIP funkciju ieslēgšanu. To nedrīkst automātiski ieslēgt tikai ar uzņēmuma reģistrēšanu.

## Nākotnes reģistrācijas loģika

1. Pakalpojuma sniedzējs klātienē sniedz klientam konkrēti aprakstītu konsultāciju vai citu faktiski izpildāmu pakalpojumu.
2. Klientam tiek izrakstīts atbilstošs rēķins uz uzņēmuma vai saimniecības rekvizītiem.
3. Pēc maksājuma pārbaudes un attiecīgā piedāvājuma noteikumu izpildes pilnvarots administrators var reģistrēt uzņēmumu agrīno atbalstītāju sarakstā.
4. Reģistrācija saglabā uzņēmuma identifikatoru un pamatojumu, lai vēlāk to varētu atpazīt arī bez publiska lietotāja konta.
5. Kad Founding Member/VIP funkcionalitāte ir izstrādāta un tās noteikumi apstiprināti, tiesīgajiem uzņēmumiem var piešķirt statusu saskaņā ar sākotnēji apsolītajiem noteikumiem.

Rēķina izrakstīšana pati par sevi nav maksājuma apliecinājums. Ja konkrētā piedāvājuma nosacījums ir apmaksa, reģistrācija par tiesīgu atbalstītāju notiek tikai pēc apmaksas pārbaudes.

## Minimālais nākotnes datu modelis

| Lauks | Nozīme |
|---|---|
| business_legal_name | Uzņēmuma/saimniecības nosaukums |
| business_registration_number | Reģistrācijas numurs uzņēmuma atpazīšanai |
| founder_eligible | Nākotnes Founding Member tiesību atzīme; noklusējums false |
| eligibility_basis | Rēķina/pakalpojuma atsauce un pamatojums |
| payment_verified_at | Datums, kad pārbaudīta apmaksa, ja apmaksa ir piedāvājuma nosacījums |
| vip_active | Faktiskās VIP funkcijas statuss; noklusējums false |
| created_at | Reģistrācijas datums |
| notes | Tikai nepieciešamas, neitrālas administratīvas piezīmes |

Nedrīkst glabāt rēķina pilnu kopiju, personas kodus, bankas piekļuves datus vai citu lieku informāciju šī statusa vajadzībām. Ja uzņēmums ir fiziskas personas saimnieciskā darbība, reģistrācijas numura un citu datu apstrādei jāizvērtē personas datu aizsardzības prasības.

## Privātums un piekļuves kontrole

- Šo reģistru nedrīkst ievietot publiskajā JavaScript, HTML vai publiski pieejamā JSON failā.
- Reģistrs nākotnē jāglabā atsevišķā aizsargātā administrēšanas vidē ar autentifikāciju un piekļuves žurnālu.
- Publiska vietnes apmeklēšana nedrīkst atklāt, kuri uzņēmumi ir reģistrēti.
- Uzņēmuma identifikācija jāveic pēc minimāla, uzticama identifikatora; nedrīkst mēģināt atpazīt uzņēmumu pēc nejaušas atslēgas frāzes vai pārlūka keša.
- Jāparedz kļūdaina ieraksta labošana, statusa atsaukšana, datu glabāšanas termiņš un klienta informēšana par datu izmantošanu.
- Tā kā pašreizējā Mansdarbs prototipa finanšu dati paliek lietotāja pārlūkprogrammā, agrīno atbalstītāju reģistru nedrīkst nemanāmi pievienot esošajai lokālajai uzskaitei vai nosūtīt uz serveri bez atsevišķa privātuma risinājuma.

## Piedāvājuma godīga noformēšana

Pirms šādu pakalpojumu piedāvāt klientiem, rakstiski jānosaka:
- kas tieši tiek sniegts par 500 EUR šodien;
- vai un kā maksājums dod tiesības uz nākotnes Founding Member statusu;
- kādas priekšrocības ir garantētas un kuras vēl ir tikai plānotas;
- vai statuss ir piesaistīts juridiskajai personai/saimniecībai un kā to var izmantot tās pārstāvji;
- kas notiek, ja nākotnes VIP funkcijas netiek izveidotas.

Mārketingā nedrīkst apgalvot, ka neizveidotas funkcijas jau ir pieejamas. Rēķina aprakstam jāatbilst reāli sniegtajam pakalpojumam.

## Ieviešanas robeža

**Pašreizējā darbība:** tikai šīs prasības dokumentēšana un nākotnes lauku rezervēšana specifikācijā.

**Nav ieviests:** uzņēmumu reģistrs, maksājumu pārbaude, VIP atpazīšana, klientu konti, maksas funkcijas vai jebkādas izmaiņas publiskajā saskarnē.

Pirms koda ieviešanas jāizstrādā droša administrēšanas vide un jāapstiprina konkrētie pakalpojuma noteikumi, datu apstrādes pamats un VIP priekšrocību apraksts.
