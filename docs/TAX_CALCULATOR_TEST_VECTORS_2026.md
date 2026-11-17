# Mansdarbs 2026 nodokļu kalkulatoru testu piemēri

Statuss: manuāli pārbaudāmi testu vektori; vēl nav piesaistīti automātiskam testu izpildītājam.
Datums: 2026-11-17

Šie piemēri pārbauda atsevišķas matemātiskās daļas, nevis pilnu juridisko situāciju. Pirms aprēķinu publicēšanas tie jāsalīdzina ar VID EDS rezultātiem un aktuālajiem noteikumiem.

## VSAOI — parastais režīms

Pieņēmumi: 2026. gads, standarta pašnodarbinātais, 31,07%, minimālais objekts 780 €, izvēlētais objekts 780 €.

| Mēneša peļņa | Pilno VSAOI objekts | 31,07% pilnās VSAOI | 10% pensiju iemaksa | Kopā |
|---:|---:|---:|---:|---:|
| 779,99 € | 0,00 € | 0,00 € | 78,00 € | 78,00 € |
| 780,00 € | 780,00 € | 242,35 € | 0,00 € | 242,35 € |
| 1 000,00 € | 780,00 € | 242,35 € | 22,00 € | 264,35 € |
| 1 500,00 € | 780,00 € | 242,35 € | 72,00 € | 314,35 € |

Papildu pārbaude: ja peļņa ir 1 000 € un izvēlētais objekts 900 €, pilnās VSAOI ir 279,63 €, 10% pensiju iemaksa ir 10,00 €, kopā 289,63 €.

Pensionāra tiesību gadījumā, ja piemēro 29,36% un objekts ir 780 €, pilnās VSAOI ir 229,01 €.

Robežvērtības jātestē atsevišķi: 779,99 €, 780,00 €, 780,01 €. Tukšs lauks nav derīga nulle — tam jāaptur aprēķins.

## IIN progresīvās likmes

Atsevišķas progresīvās funkcijas testu vektori, neņemot vērā atvieglojumus un minimālo IIN:

| Apliekamā summa | Aprēķins | IIN |
|---:|---|---:|
| 0 € | 0 | 0,00 € |
| 10 000 € | 10 000 × 25,5% | 2 550,00 € |
| 105 300 € | 105 300 × 25,5% | 26 851,50 € |
| 105 400 € | 26 851,50 + 100 × 33% | 26 884,50 € |
| 200 000 € | 26 851,50 + 94 700 × 33% | 58 102,50 € |
| 200 001 € | 58 102,50 + 1 × (33% + 3%) | 58 138,50 € |

Pārbaudīt arī robežas 105 299,99 €, 105 300,00 €, 105 300,01 €, 199 999,99 €, 200 000,00 €, 200 000,01 €.

## 2026. gada neapliekamais minimums

- 550 € mēnesī × 12 = 6 600 € gadā.
- Ja minimums jau pilnībā izmantots citā ienākuma avotā, IIN prognozē neizmantotā daļa ir 0 €.
- Ja tas izmantots daļēji, jāievada tikai atlikusī daļa.
- Neapliekamais minimums un citi atvieglojumi nesamazina minimālā 50 € IIN bāzi.

## Minimālais 50 € IIN

Pārbaudīt šādus atšķirīgus gadījumus:
1. Nav saimnieciskās darbības apliekamā ienākuma — pārbaudīt, vai piemērojams 50 € minimums.
2. Aprēķinātais IIN no saimnieciskās darbības ir 49,99 € — minimums 50 €, ja nav izņēmuma.
3. Aprēķinātais IIN ir 50,00 € — minimums nepārsniedz aprēķināto summu.
4. Aprēķinātais IIN ir 50,01 € — piemēro faktisko aprēķinu.
5. Taksācijas gadā samaksātas pašnodarbinātā VSAOI — pārbaudīt izņēmumu.
6. Pirmais un nākamais taksācijas gads pēc reģistrācijas — pārbaudīt izņēmumu.
7. Gads, kurā saimniecisko darbību izbeidz — pārbaudīt izņēmumu.

Šo noteikumu nedrīkst noteikt tikai pēc vispārīga “IIN ir zem 50 €” sliekšņa, neņemot vērā atbrīvojuma kritērijus un pareizu minimālā apliekamā ienākuma bāzi.

## MUN matemātikas vektors

Pieņēmums: MUN statuss un tā piemērošana ir juridiski pieļaujama.

- Apgrozījums: 18 000 €.
- MUN 25%: 4 500 €.
- No samaksātā MUN sociālajai apdrošināšanai novirza 80%: 3 600 €.
- IIN daļai novirza 20%: 900 €.
- Izdevumi nemazina MUN nodokļa bāzi.

Šis piemērs nepierāda, ka konkrētam lietotājam ir tiesības izvēlēties MUN.

## Testu izpildes prasības

- Naudas aprēķinos noapaļot tikai noteiktajos starprezultātu punktos, nevis nejauši katrā operācijā.
- Izmantot centu precizitāti un vienotus noapaļošanas noteikumus.
- Testēt gan robežvērtības, gan tukšas, nederīgas un negatīvas ievades.
- Katram testam norādīt likuma gadu un avota pārbaudes datumu.
- Mainoties likmei vai slieksnim, testu vektori jāatjauno kopā ar kalkulatora versiju.
- IIN/VSAOI testu rezultātus salīdzināt ar VID EDS vai VID metodiskajiem piemēriem; neizmantot šos piemērus kā vienīgo juridisko pamatojumu.
