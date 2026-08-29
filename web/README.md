# Lota Go 🐾

2D endless-runner stiliaus žaidimas su juoda šnaucere Lota. Pirmasis lygis — viena ilga
trasa nuo namų iki Londono finišo; už jo dar trys lygiai, kurių kol kas parodomos tik
nuotraukos ir aprangos (žr. „Keturi lygiai"). Grynas HTML5 + Canvas, be jokių bibliotekų
ir be paveikslėlių: visa grafika piešiama kodu (vektoriai).

## Paleidimas

**Kompiuteryje:** tiesiog atidarykite `index.html` naršyklėje.

**Telefone / iPad (tame pačiame Wi-Fi):** paleiskite serverį šiame kataloge ir
telefone atidarykite `http://<kompiuterio-IP>:8777`

```bash
python3 -m http.server 8777
```

Dirbant su kodu patogiau `python3 ../.claude/serve.py 8131` — tas pats serveris, tik
siunčia `Cache-Control: no-store`, kad naršyklė nerodytų senų `js/` failų.

iPhone/iPad: Safari → Share → „Add to Home Screen" — žaidimas veiks per visą ekraną.

## Valdymas

| Veiksmas | Telefonas / iPad | Kompiuteris |
|---|---|---|
| Šokti | mygtukas **▲** arba swipe aukštyn (arba bakstelėti) | `↑` / `W` / `Space` |
| Pasilenkti | mygtukas **▼** arba swipe žemyn (laikyti) | `↓` / `S` |
| Pauzė | mygtukas viršuje | `Esc` / `P` |
| Kitas / ankstesnis lygis (pradžios ekrane) | swipe į kairę / dešinę arba **‹ ›** | `←` / `→` |

Lota bėga pati — kryptis nevaldoma.

Liečiamuose ekranuose apatiniame dešiniajame kampe rodomos dvi rodyklės **▲ / ▼**. Jas
laikyti galima kaip klaviatūros klavišus — laikant **▼** Lota lieka pasilenkusi, todėl
ilgi tuneliai praeinami be pakartotinių swipe'ų. Rodyklės atsiranda automatiškai, kai
naršyklė praneša `pointer: coarse`.

**Lota niekada nepasilenkia pati.** Anksčiau prieš kabančią kliūtį ji pasilenkdavo
automatiškai, net jei žaidėjas nieko nespaudė. Dabar pasilenkimą visada valdo žaidėjas:
laikyk **▼**, kol tunelis baigsis — arba peršok ant jo viršaus.

## Keturi lygiai

Pradžios ekranas yra ne vienas, o **keturi vienodi kambariai iš eilės**. Pastūmus pirštu
į kairę (arba `→`, arba rodyklė ekrano krašte) vaizdas nuslenka į kito lygio namus.
Kambarys visur tas pats — skiriasi tik ant lentynos gulintys daiktai ir ant sienos
užrašytas lygio numeris.

**Neatrakintas lygis yra tas pats kambarys, tik be spalvų.** Jis nupilkinamas, ant abiejų
mygtukų uždedama spyna, o po logotipu parašoma, ko dar trūksta. Lotos tame kambaryje nėra —
ant kilimo guli tik jos antkaklis.

| Lygis | Vieta | Kas renkama | Kaip atrakinamas |
|---|---|---|---|
| 1 | Kelias į Londoną | skaniukai 🦴 | atviras nuo pradžios |
| 2 | Žaislų kiemas | žaisliukai 🧸 | pereiti 1 lygį **ir** atrakinti visas 1 lygio aprangas |
| 3 | Šviesų šventė | skaniukai **ir** žaisliukai | pereiti 2 lygį **ir** atrakinti visas 2 lygio aprangas |
| 4 | Bosas: Didysis Siurblys | nieko | pereiti 3 lygį **ir** atrakinti visas 3 lygio aprangas |

Kai raktas uždirbamas, visos to lygio spynos atsirakina iš karto ir ekrane vieną kartą
parodoma `🔑 N lygio raktas!`.

**Kiekvienas lygis turi savo piniginę.** Kas surinkta lygyje, tame lygyje ir išleidžiama:
pirmame lygyje pririnktais skaniukais trečio lygio aprangos nenusipirksi. Trečiame lygyje
renkami abu dalykai, nes jo aprangos kainuoja ir skaniukų, ir žaisliukų — kiekviena
skirtingą kiekį, kad nė viena nebūtų uždirbama taip pat kaip kita.

## Aprangos

Iš viso jų 22, po vieną lentyną kiekviename lygyje. Kiekvienos lygio aprangos gražesnės už
ankstesniojo: 1 lygyje — kasdieniai kostiumai, 2 — audiniai ir sparnai, 3 — brangakmeniai
ir švytėjimas.

- **1 lygis** (25–140 🦴): Pilotė, Autobuso vairuotoja, Kadetė, Senelė, Futbolininkė,
  Detektyvė, Karalienė, Astronautė, Vienaragė
- **2 lygis** (20–85 🧸): Baletė, Piratė, Fėja, Roko žvaigždė, Snieguolė
- **3 lygis** (30🦴+12🧸 … 80🦴+80🧸): Auksinė princesė, Undinė, Ugnies paukštė,
  Žvaigždžių burtininkė, Krištolo šokėja
- **4 lygis** — **neparduodamos**. Įveikus bosą abi atiduodamos iš karto:
  **Vaivorykštės suknelė** (mirguliuojanti suknelė, skrybėlaitė su žiedu ir šydu, batukai
  ir ilga pirštinaitė ant vienos priekinės letenos) ir prie jos derantis
  **Vaivorykštės frakas** (frakas su uodegomis, cilindras, peteliškė, batai ir lazdelė).
  Spalvos tos pačios, tad galima rinktis moterišką arba vyrišką variantą.

**Kol kas 2, 3 ir boso lygiai yra tik nuotraukos.** Trasų juose dar nėra: paspaudus
mygtuką parodoma to lygio nuotrauka (piešiama kodu, kaip ir visa kita) ir paaiškinama, kas
ten bus renkama. Aprangų lentynos jau veikia — tik piniginės tuščios, nes jų dar nėra kur
prisirinkti. Kai trasa atsiras, `js/levels.js` faile užtenka `playable: false` pakeisti į
tikrą paleidimą.

## Kaip veikia trasa

Trasa yra **viena, fiksuota ir vienoda kiekvieną kartą** (deterministinis seed
`20260827` faile `js/level.js`). 13 vietų iš eilės:

`Lotos namai → Kiemas → Kaimynų namas → Rudens kiemas → Senelės namas → Miesto gatvė →
Parkas → Vakaro gatvė → Prekybos centras → Autobusas → Oro uostas → Lėktuvas → Londonas`

Pilnas nubėgimas gatve trunka **~3 min 15 s**; radus metro raktą ir įlipus į traukinį —
**~2 min 57 s**. Greitis auga nuo 330 iki 730 px/s.

**Trasoje nėra nė vienos skylės.** Duobių, angų grindyse ir pralaimėjimo dėl kritimo
nebėra — jos visos pašalintos. Ten, kur anksčiau buvo skylė, dabar arba paprasta kliūtis,
arba **laiptai**, kuriais Lota nubėga į kitą trasos aukštį (žr. „Du keliai" žemiau).

**Sąžiningumo garantija.** Kliūtys dėliojamos ne pikseliais, o *laiku*: generatorius
žino, koks bus greitis konkrečioje trasos vietoje, ir tarp kliūčių visada palieka bent
0,46 s reakcijos. Visi šuoliai telpa į šuolio lanką (aukštis 188 px, oro laikas 0,755 s),
o alternatyvūs keliai (lentynos, šakos, markizės) yra **vienpusės platformos** — pro jas
galima prabėgti apačia, todėl niekada nesusidaro aklavietė.

**Kas pavojinga, o kas — tik dekoracija.** Kiekvienas objektas turi *vieną* reikšmę
visame žaidime: arba į jį galima atsitrenkti, arba jis yra fonas — niekada abu. Dekoracijos
yra plokščios (≤15 px aukščio) ir guli ant grindų: žolė, akmenukai, lapai, balos, šulinių
dangčiai, kelio ženklinimas, Lotos pėdutės. Todėl galioja paprasta taisyklė: **jei objektas
stovi — jį reikia peršokti, užšokti ant jo arba pralįsti**. Kliūtys meta šešėlį ant grindų;
**apvadų aplink jas nebėra** — užtenka atsitrenkti į patį daiktą. `assertPropRoles()` faile
`js/level.js` neleidžia šiai taisyklei sugesti ir dar patikrina, ar kiekvienas naudojamas
objektas apskritai turi piešinį.

Vienintelė išimtis — **ženklai** (metro rodyklė, rodyklė į laiptus). Jie piešiami blankiau
ir atitraukti į foną, o Lota per juos tiesiog prabėga.

**Fono langai nemirksi.** Kuris pastato langas dega, sprendžia to lango eilutė ir stulpelis
pačiame pastate (`BG.buildings`, `js/zones.js`), o ne jo vieta ekrane — anksčiau buvo
atvirkščiai, todėl slenkant gatvei visi langai be perstojo mirgėjo.

**Kiekvienas daiktas piešiamas tokio dydžio, koks jis iš tikrųjų yra.** Anksčiau kliūties
plotis ir aukštis buvo atsitiktiniai, todėl karutis susitraukdavo į dėmę, o šiukšlių dėžė
išsitęsdavo į konteinerį. Dabar dydį duoda `PROP_SIZE` (`js/props.js`), o per platūs objektai
ne tempiami, o kartojami (`PROP_NATURAL`). Viskas, po kuo lendama — stalas, markizė, turėklas,
vamzdis, gyvatvorės arka — turi kojas iki grindų arba pakabinimą prie lubų, todėl matyti,
kas tą daiktą laiko.

**Ant kliūčių galima užšokti — ant bet kurios.** Šuolis niekada nėra tai, kas Lotą
užmuša. Dėžė, akmuo ar lagaminas mirtini tik tada, kai į juos įbėgama žeme, stačiomis;
jei Lota jau kyla, atsitrenkusi į šoną ji tiesiog užsiropščia ant viršaus, kad ir koks jis
aukštas. Krisdama ji dar pasigauna kraštą per `GRAB` = 34 px (`js/level.js`) — toliau
nebeužtenka, kitaip nepataikyti į duobę nieko nekainuotų.

Tas pat galioja ir kabantiems objektams — ekranams, vamzdžiams, tuneliams: laiku pašokusi
Lota atsistoja jiems ant viršaus ir nubėga juo (`GRAB_OVER` = 52 px). Todėl kiekviena
kabanti kliūtis turi du kelius: pralįsti apačia laikant **▼** arba užšokti ant viršaus.
Mirtinas lieka tik per vėlai pradėtas šuolis, kai Lota jau nebespėja pasiekti viršaus ir
įlekia kliūčiai tiesiai į vidurį — dėl to pasilenkimas vis dar turi prasmę.

Kadangi iš kliūties viršaus tenka dar nukristi, generatorius prie tarpo po kiekvieno
šablono prideda kritimo laiką, kad reakcijos atsarga galiotų ir aukštuoju keliu.

## Du keliai

Trasa trijose vietose šakojasi. Du iš tų kelių — kaimynų antras aukštas ir ventiliacija virš
mergaitės kambario — nutiesti virš to paties trasos ruožo, tik kitame aukštyje, todėl
**trunka lygiai tiek pat** ir baigiasi toje pačioje vietoje. Trečias, Londono metro, yra
**trumpinys**: jis trasos ruožą ne pakartoja, o praleidžia, ir todėl užrakintas, kol
nerandamas raktas.

Aukštus jungia tikri laiptai: jais ne šokinėjama, o *bėgama* — pakopa yra pakopa, ant laiptų
mirti neįmanoma. Bėgant laiptais aukštyn ar žemyn kamera juda kartu, Lota visada matoma.

**Kaimynų namo antras aukštas.** Koridoriuje virš galvos prasideda laiptai.

- **Nieko nedarai** — prabėgi po jais pirmu aukštu.
- **Užšoki ant apatinės pakopos** — Lota užbėga į viršų: berniuko miegamasis (raketų
  plakatai, žaislai), paskui vonia, paskui mergaitės kambarys. Jo gale pro **atvirą langą**
  ji iššoka ir nusileidžia jau kieme — lygiai ten, kur išeitų pro duris bėgusi apačia.

**Mergaitės kambario lova ir ventiliacija.** Kambario viduryje stovi lova. Ji **nėra
kliūtis** — ant jos mirti neįmanoma: įbėgusi Lota tiesiog užsiropščia ant jos, o užšokusi
**atšoka nuo jos daug aukščiau** nei šoktų pati (1300 vietoj 1000 px/s) ir įlekia pro
atvirą liuką lubose į **ventiliacijos vamzdį**.

- **Peršoki lovą** — bėgi kambariu toliau.
- **Užšoki ant jos** — atsimuši, atsidursi vamzdyje.

Vamzdyje **nėra jokių kliūčių**: tamsu, po grotelėmis prasišviečia kambarys, ir Lota tiesiog
bėga ~2 s. Viduryje guli **metro raktas**. Vamzdžio gale grindų nebelieka, ji iškrenta pro
groteles ir nusileidžia **tame pačiame kambaryje** — lygiai ten, kur būtų nubėgusi peršokusi
lovą (ruožas po vamzdžiu specialiai paliktas tuščias). Paėmus raktą ekrane parodoma
**🔑 Metro raktas!**, o raktas nuo tol matomas HUD'e ir išlieka po kontrolinio taško.

**Londono metro — trumpinys, o ne antras kelias.** Netoli Londono pradžios šaligatvyje yra
laiptų anga su METRO ženklu.

- **Be rakto** anga **užrakinta grotomis**: ant ženklo kabo spyna, grotos yra tiesiog
  grindys — Lota per jas prabėga ir į metro nepatenka niekaip.
- **Su raktu** grotos atsilenkia į šonus, anga atsiveria. Peršoki ją — bėgi gatve toliau;
  nieko nedarai — nukrenti laiptais žemyn.

Metro viduje kliūčių yra kaip ir visur: peronas su turniketais, bilietų automatais, žemėlapiu
virš galvos ir suoliukais, paskui traukinio vagonas su lagaminais ir turėklais. Bet
**kelionė trunka žymiai trumpiau už gatvę**: išlipusi ir užbėgusi laiptais Lota atsiduria
daug toliau — nuo metro angos iki finišo gatve ~24,8 s, o metro ~15,6 s. Išlipimo vieta
specialiai palikta tuščia (į ją įkrentama po ekrano perėjimo, todėl reaguoti nespėtum), ir
po jos dar lieka ~5,7 s Londono su kliūtimis: **metro nėra finišas**.

Metro yra **tik** Londone. Prie išėjimo laiptų gatvėje stovi tik turėklas — atgal į metro
ten nepateksi.

## Kontroliniai taškai

Kiekvienos vietos pradžioje stovi languota vėliavėlė. Pirmą kartą ją pasiekus ji užsidega,
pasigirsta garsas ir ekrane trumpam pasirodo **✓ KONTROLINIS TAŠKAS**. Atsitrenkusi Lota
grįžta ne į patį pradžią, o į paskutinės pasiektos vietos pradžią — mygtukas ekrane rodo,
nuo kurios vietos tęsiama (pvz. *Tęsti nuo Parkas*).

Skaniukai, surinkti iki kontrolinio taško, išlieka; tos vietos skaniukai atstatomi, nes
per ją bėgama iš naujo. Surinkti skaniukai **atiduodami tik pasibaigus bėgimui** — pasiekus
finišą arba paspaudus *Baigti*. Todėl žūtis prie kontrolinio taško nieko neduoda ir nieko
neatima.

## Skanėstai

Trasoje paslėpta lygiai **15 kaulų**, po vieną kiekvienoje vietoje (+ po vieną papildomą
oro uoste ir Londone). Dauguma jų — ant alternatyvių kelių arba trumpiniuose, todėl reikia
rizikuoti.

**Nesvarbu, kurį kelią pasirinksi.** Ten, kur trasa šakojasi, tos vietos kaulas padėtas
**abiejuose** keliuose — tai tas pats kaulas, pasiimtas bet kurioje pusėje jis užsiskaito
vieną kartą. Likę tos vietos kaulai dedami tik ten, kur eina abu keliai. Tas pat galioja ir
trumpiniui: viskas, ką traukinys prašoka, dar kartą padedama stotyje arba vagone. Todėl
surinkti visus 15 galima ir viršumi, ir apačia, ir per ventiliaciją, ir per metro.

- surinkti < 15 → gauni tiek, kiek surinkai
- surinkti visi 15 → **dvigubai** (15 → 30)
- pasiekus finišą → **+10**

Visa tai keliauja į **pirmo lygio** piniginę ir kitiems lygiams netinka.

## Failai

| Failas | Ką daro |
|---|---|
| `js/util.js` | matematika, spalvos, `localStorage`, WebAudio garsai |
| `js/lota.js` | Lotos piešimas (bėgimas / šuolis / pasilenkimas / sėdėjimas) + 10 aprangų |
| `js/props.js` | ~130 kliūčių, platformų ir dekoracijų piešiniai + jų natūralūs dydžiai |
| `js/zones.js` | 13 vietų + `BRANCHES` (metro, antras aukštas ir ventiliacija): paletės, fonai, grindys, kliūčių rinkiniai |
| `js/levels.js` | keturi lygiai: atrakinimo taisyklės, piniginės, lygių nuotraukos |
| `js/level.js` | trasos generatorius + fizikos konstantos (`PHYS`) |
| `js/game.js` | variklis: įvestis, fizika, kamera, piešimas |
| `js/ui.js` | ekranai, HUD, aprangų parduotuvė |
| `dev/bot.js` | testinis botas (žaidimo neįkeliamas) |
| `dev/skins.html` | visos aprangos keturiose pozose, dideliu masteliu (atskiras puslapis) |

## Derinimas

Dažniausiai keičiami dalykai:

- **Trasos ilgis** — `sec:` reikšmės kiekvienoje zonoje (`js/zones.js`)
- **Antri keliai** — `BRANCHES` (`js/zones.js`): `enterSec` (kur prasideda), `sec` (kiek trunka),
  `drop` / `rise` (kiek žemyn ar aukštyn veda laiptai), `rooms` (patalpos ir jų kliūtys)
- **Laiptai** — `STAIR_RISE`, `STAIR_UP`, `STAIR_FIRST` (`js/level.js`)
- **Lova ir ventiliacija** — `PHYS.BOUNCE_V`, `VENT_RISE` ir `buildDuct()` (`js/level.js`),
  vamzdžio vaizdas — `BRANCHES.upstairs.duct` (`js/zones.js`)
- **Kiek metro sutrumpina trasą** — `tail` funkcijoje `buildWorld()` (`js/level.js`): kiek
  sekundžių Londono lieka po išlipimo
- **Greitis** — `PHYS.V_MIN`, `PHYS.V_MAX`, `PHYS.X_FULL` (`js/level.js`)
- **Sunkumas** — `diff:` zonoje (0…1) valdo kliūčių tipų dažnį ir tarpus
- **Šuolis** — `PHYS.JUMP_V`, `PHYS.GRAV`
- **Aprangos ir kainos** — `SKINS` masyvas (`js/lota.js`): `level` ir `cost: {b, t}`
- **Lygiai ir jų atrakinimas** — `LEVELS` ir `Levels.unlocked()` (`js/levels.js`)
- **Lygių nuotraukos** — `Levels.picToys` / `picFestival` / `picBoss` (`js/levels.js`)

## Testinis botas

`dev/bot.js` — refleksinis botas, kuris pats pereina visą trasą. Naudojamas patikrinti,
ar trasa apskritai įveikiama ir kiek yra reakcijos atsargos.

Naršyklės konsolėje:

```js
var s=document.createElement('script'); s.src='dev/bot.js'; document.head.appendChild(s);
runBot(400);                 // idealios reakcijos — turi grąžinti state:"win"
window.BOT_EVERY = 12; runBot(400);   // ~100 ms vėlavimas — vis dar įveikia

// kurį kelią rinktis ten, kur trasa šakojasi (numatyta: metro taip, viršus ne)
// `upstairs: true` reiškia ir lovą su ventiliacija, t. y. raktą; be jo `metro` nieko
// nekeičia, nes anga užrakinta
window.BOT_TAKE = { metro: false, upstairs: true }; runBot(400);

inspect(15000);              // kas yra trasoje ties nurodyta pozicija
```

Aprangas galima apžiūrėti dideliu masteliu atskirame puslapyje: `dev/skins.html`.

Kadangi 2–4 lygiuose kol kas nėra kur prisirinkti valiutos, piniginės ir raktai
pripildomi iš konsolės (žaidimas šių funkcijų niekur nekviečia):

```js
LotaDev.give(2, 't', 200);   // 200 žaisliukų į 2 lygio piniginę
LotaDev.key(2);              // viskas, ko reikia 2 lygiui atrakinti
LotaDev.boss();              // atiduoda boso prizą — abi 4 lygio aprangas
LotaDev.reset();             // ištrina išsaugojimą
```

Progreso išsaugojimas — `localStorage`, raktas `lotago.save.v3` (senas `…v2` perkeliamas
automatiškai: jo skaniukai ir aprangos atitenka pirmam lygiui).
