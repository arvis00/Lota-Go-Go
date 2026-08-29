# Lota Go 🐾

2D endless-runner stiliaus žaidimas su juoda šnaucere Lota. Du lygiai jau turi tikras
trasas — **1: nuo namų iki Londono**, **2: nuo viešbučio iki miško** — o už jų dar du,
kurių kol kas parodomos tik nuotraukos ir aprangos (žr. „Keturi lygiai"). Grynas
HTML5 + Canvas, be jokių bibliotekų ir be paveikslėlių: visa grafika piešiama kodu
(vektoriai).

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
| 1 | Kelias į Londoną | skaniukai 🦴 (15) | atviras nuo pradžios |
| 2 | Nuo viešbučio iki miško | žaisliukai 🧸 (20) | pereiti 1 lygį **ir** atrakinti visas 1 lygio aprangas |
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

**Kol kas 3 ir boso lygiai yra tik nuotraukos.** Trasų juose dar nėra: paspaudus
mygtuką parodoma to lygio nuotrauka (piešiama kodu, kaip ir visa kita) ir paaiškinama, kas
ten bus renkama. Aprangų lentynos jau veikia — tik piniginės tuščios, nes jų dar nėra kur
prisirinkti. Kai trasa atsiras, `js/levels.js` faile užtenka `playable: false` pakeisti į
`true` ir prirašyti tam lygiui `TRACKS` įrašą.

## Kaip veikia trasa

Kiekvieno lygio trasa yra **viena, fiksuota ir vienoda kiekvieną kartą** — ją nusako
`TRACKS` lentelė faile `js/levels.js`: kokios vietos, koks seed'as, kiek renkama, koks
greitis ir kiek reakcijos laiko paliekama tarp kliūčių. `buildWorld(track)`
(`js/level.js`) iš to pastato pasaulį.

### 1 lygis — Kelias į Londoną

Seed `20260827`, 13 vietų iš eilės:

`Lotos namai → Kiemas → Kaimynų namas → Rudens kiemas → Senelės namas → Miesto gatvė →
Parkas → Vakaro gatvė → Prekybos centras → Autobusas → Oro uostas → Lėktuvas → Londonas`

Pilnas nubėgimas gatve trunka **~3 min 15 s**; radus metro raktą ir įlipus į traukinį —
**~2 min 57 s**. Greitis auga nuo 330 iki 730 px/s.

### 2 lygis — Nuo viešbučio iki miško

Seed `20260901`, **15 vietų** — dviem daugiau nei pirmame lygyje:

`Apartamentai → Koridorius → Laukiamasis → Baseinas → Promenada → Paplūdimys → Tiltas →
Jūros dugnas → Nuskendęs laivas → Koralų rifas → Sekluma → Krantas → Gatvė → Miškas →
Tankus miškas`

Prasideda prašmatnaus viešbučio apartamente ir eina per koridorių su numeruotomis
durimis, per fojė su kolonomis ir arkiniais langais į jūrą, pro baseiną, pro viešbučio
vartus į promenadą ir paplūdimį. **Ant tilto ekranas pasisuka** — Lota pasuka į dešinę ir
nubėga tiltu (kaip Palangoje) iki pat galo, o nuo galo **šoka į vandenį**. Po vandeniu ji
bėga dugnu pro koralus, nuskendusį laivą ir rifą; seklumoje **vandens paviršius nusileidžia**,
ir ji išbėga į krantą. Toliau trumpa pajūrio gatvė ir miškas, kuriame stovi finišas.

Trunka **~3 min 10 s**. **Sunkesnis už pirmą lygį:** pradeda 400 px/s (pirmas lygis
tokio greičio pasiekia tik įpusėjęs) ir įsibėgėja iki 880; tarpai tarp kliūčių trumpesni
(vidutinis 1,10 s vietoj 1,37 s, medianinis 0,85 s vietoj 1,13 s), kliūčių per minutę
daugiau, o sunkiausiose vietose reakcijos lieka 0,40 s vietoj 0,46 s.

**Žuvėdros.** Paplūdimyje jų yra keturios, ant tilto trys, krante dvi. Žuvėdra skrenda
Lotai ties galva: **po ja galima pralįsti pasilenkus, per ją galima peršokti, bet ant jos
užšokti negalima** — vienintelis daiktas visame žaidime, kuris neturi viršaus. Jos juosta
(50–116 px nuo grindų) parinkta taip, kad abu keliai visada tilptų: pasilenkusi Lota yra
30 px aukščio, o šuolio viršūnė — 188 px.

**Šuolis nuo tilto.** Tilto gale grindys tikrai baigiasi — tai vienintelė vieta abiejose
trasose, kur po kojomis nieko nėra, ir tai ne skylė, o scenarijus: Lota atsispiria pati,
nukrinta į vandenį, pasigirsta pliūpsnis, ekranas nuplaukia ir ji atsiranda bėganti jūros
dugnu. Nukristi ir žūti ten neįmanoma.

**Skylių nėra niekur.** Duobių, angų grindyse ir pralaimėjimo dėl kritimo nėra nė
vienoje trasoje. Ten, kur galėtų būti skylė, yra arba paprasta kliūtis, arba **laiptai**,
kuriais Lota nubėga į kitą trasos aukštį (žr. „Du keliai" žemiau). Vienintelė vieta, kur
grindys tikrai baigiasi, yra tilto galas antrame lygyje — ir ten nukristi yra pats
tikslas, o ne pralaimėjimas.

**Sąžiningumo garantija.** Kliūtys dėliojamos ne pikseliais, o *laiku*: generatorius
žino, koks bus greitis konkrečioje trasos vietoje, ir tarp kliūčių visada palieka
reakcijos — pirmame lygyje bent 0,46 s, antrame bent 0,40 s. Visi šuoliai telpa į šuolio lanką (aukštis 188 px, oro laikas 0,755 s),
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

**Pirmame lygyje** trasa trijose vietose šakojasi. Du iš tų kelių — kaimynų antras aukštas ir ventiliacija virš
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

### Lapių urvas (2 lygis)

Antrame lygyje šakojimasis vienas — **miške**. Šaligatvyje… tiksliau, miško takelyje,
ties mediniu ženklu „URVAS" žemyn veda akmeninių laiptų anga.

- **Peršoki ją** — bėgi mišku toliau.
- **Nieko nedarai** — nubėgi laiptais žemyn į urvą.

Urvas nėra trumpinys: jis nutiestas virš to paties trasos ruožo, tik žemiau, todėl
**trunka lygiai tiek pat** (12,3 s urvu ir 12,3 s viršumi) ir baigiasi toje pačioje
vietoje — laiptais atgal į mišką. Rakto jam nereikia.

Viduje dvi patalpos: **Lapių urvas** (šviečiančios grybų kekės, kristalų gyslos uolose ir
olos sienoje išraustos landos, iš kurių kyšo lapiukai) ir **Kristalų salė** (didžiuliai
švytintys kristalai ir ramus požeminis ežerėlis). Kliūtys ten **lengvesnės** nei miške
viršuje (sunkumas 0,30 ir 0,34 vietoj 0,88).

**Lapės bėga paskui Lotą.** Keturios, per visą urvo ilgį. Jos seka ne spėjimu, o tikru
jos keliu: variklis įsimena, kur ji buvo, ir kiekviena lapė bėga tuo pačiu taku 86, 156,
226 ir 296 px atsilikusi — jei Lota šoka, po akimirkos šoka ir jos.

## Kontroliniai taškai

Kiekvienos vietos pradžioje stovi languota vėliavėlė. Pirmą kartą ją pasiekus ji užsidega,
pasigirsta garsas ir ekrane trumpam pasirodo **✓ KONTROLINIS TAŠKAS**. Atsitrenkusi Lota
grįžta ne į patį pradžią, o į paskutinės pasiektos vietos pradžią — mygtukas ekrane rodo,
nuo kurios vietos tęsiama (pvz. *Tęsti nuo Parkas*).

Skaniukai, surinkti iki kontrolinio taško, išlieka; tos vietos skaniukai atstatomi, nes
per ją bėgama iš naujo. Surinkti skaniukai **atiduodami tik pasibaigus bėgimui** — pasiekus
finišą arba paspaudus *Baigti*. Todėl žūtis prie kontrolinio taško nieko neduoda ir nieko
neatima.

## Skanėstai ir žaisliukai

Pirmo lygio trasoje paslėpta lygiai **15 kaulų**, antro — lygiai **20 žaisliukų**.
Kiekvienoje vietoje bent po vieną. Dauguma jų — ant alternatyvių kelių, ant lentynų arba
virš žuvėdrų, todėl reikia rizikuoti.

**Nesvarbu, kurį kelią pasirinksi.** Ten, kur trasa šakojasi, tos vietos kaulas padėtas
**abiejuose** keliuose — tai tas pats kaulas, pasiimtas bet kurioje pusėje jis užsiskaito
vieną kartą. Likę tos vietos kaulai dedami tik ten, kur eina abu keliai. Tas pat galioja ir
trumpiniui: viskas, ką traukinys prašoka, dar kartą padedama stotyje arba vagone. Todėl
surinkti visus 15 galima ir viršumi, ir apačia, ir per ventiliaciją, ir per metro.

- surinkti ne visi → gauni tiek, kiek surinkai
- surinkti visi → **dvigubai** (1 lygis 15 → 30, 2 lygis 20 → 40)
- pasiekus finišą → **+10**

Visa tai keliauja į **to lygio** piniginę ir kitiems lygiams netinka: pirmas lygis moka
skaniukais, antras — žaisliukais.

## Failai

| Failas | Ką daro |
|---|---|
| `js/util.js` | matematika, spalvos, `localStorage`, WebAudio garsai |
| `js/lota.js` | Lotos piešimas (bėgimas / šuolis / pasilenkimas / sėdėjimas) + visos aprangos |
| `js/props.js` | ~130 pirmo lygio kliūčių, platformų ir dekoracijų piešiniai + jų natūralūs dydžiai |
| `js/props2.js` | ~70 antro lygio piešinių: viešbutis, paplūdimys, tiltas, jūros dugnas, urvas + `drawFox()` |
| `js/zones.js` | 1 lygio 13 vietų + `BRANCHES` (metro, antras aukštas, ventiliacija); `BG` ir grindų piešimas |
| `js/zones2.js` | 2 lygio 15 vietų + `BRANCHES2` (lapių urvas); `BG2` ir naujos grindys |
| `js/levels.js` | keturi lygiai, `TRACKS` (kas iš ko pastatoma), atrakinimo taisyklės, lygių nuotraukos |
| `js/level.js` | trasos generatorius + fizikos konstantos (`PHYS`) |
| `js/game.js` | variklis: įvestis, fizika, kamera, piešimas |
| `js/ui.js` | ekranai, HUD, aprangų parduotuvė |
| `dev/bot.js` | testinis botas (žaidimo neįkeliamas) |
| `dev/headless.js` | tas pats botas be naršyklės — `node dev/headless.js <lygis>` |
| `dev/skins.html` | visos aprangos keturiose pozose, dideliu masteliu (atskiras puslapis) |

## Derinimas

Dažniausiai keičiami dalykai:

- **Kas iš ko pastatoma** — `TRACKS` (`js/levels.js`): `zones`, `branches`, `seed`,
  `treats`, `currency`, `perZone`, `phys`, `rest`, `minRest`
- **Trasos ilgis** — `sec:` reikšmės kiekvienoje zonoje (`js/zones.js`, `js/zones2.js`)
- **Antri keliai** — `BRANCHES` (`js/zones.js`): `enterSec` (kur prasideda), `sec` (kiek trunka),
  `drop` / `rise` (kiek žemyn ar aukštyn veda laiptai), `rooms` (patalpos ir jų kliūtys)
- **Laiptai** — `STAIR_RISE`, `STAIR_UP`, `STAIR_FIRST` (`js/level.js`)
- **Lova ir ventiliacija** — `PHYS.BOUNCE_V`, `VENT_RISE` ir `buildDuct()` (`js/level.js`),
  vamzdžio vaizdas — `BRANCHES.upstairs.duct` (`js/zones.js`)
- **Kiek metro sutrumpina trasą** — `tail` funkcijoje `buildWorld()` (`js/level.js`): kiek
  sekundžių Londono lieka po išlipimo
- **Lapių urvas** — `BRANCHES2.foxcave` (`js/zones2.js`): `sec`, `drop`, `foxes`;
  lapių atstumai — `stepFoxes()` (`js/game.js`)
- **Žuvėdros** — `gulls:` zonoje (`js/zones2.js`), juosta — `BIRD_BOTTOM` ir `BIRD_H`
  (`js/level.js`)
- **Šuolis nuo tilto** — `dive: 1` zonoje ir `z.dive` blokas `buildWorld()` viduje
- **Ekrano pasisukimas** — `turn: 1` zonoje; pats efektas — `fx.spin` (`js/game.js`)
- **Greitis** — `phys` lygio įraše `TRACKS` (`js/levels.js`); numatytasis — `PHYS`
  (`js/level.js`)
- **Sunkumas** — `diff:` zonoje (0…1) valdo kliūčių tipų dažnį, o `rest` ir `minRest`
  lygio įraše — kiek reakcijos laiko lieka tarp jų
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

window.BOT_LEVEL = 2; runBot(400);    // antras lygis

// kurį kelią rinktis ten, kur trasa šakojasi (numatyta: žemyn taip, viršus ne)
// `upstairs: true` reiškia ir lovą su ventiliacija, t. y. raktą; be jo `metro` nieko
// nekeičia, nes anga užrakinta. `down: false` — nesileisti nei į metro, nei į urvą.
window.BOT_TAKE = { metro: false, upstairs: true }; runBot(400);
window.BOT_TAKE = { down: false }; runBot(400);

inspect(15000);              // kas yra trasoje ties nurodyta pozicija
```

Tą patį galima paleisti ir be naršyklės — `dev/headless.js` sukuria žaidimui netikrą DOM
ir paleidžia botą tiesiai iš terminalo:

```bash
node dev/headless.js 2 12
```

Argumentai: lygis ir `BOT_EVERY` (kas kiek kadrų botas reaguoja). Trečias, neprivalomas,
yra `BOT_TAKE` JSON'u, pvz. `'{"down":false}'`.

Aprangas galima apžiūrėti dideliu masteliu atskirame puslapyje: `dev/skins.html`.

Kadangi 3–4 lygiuose kol kas nėra kur prisirinkti valiutos, piniginės ir raktai
pripildomi iš konsolės (žaidimas šių funkcijų niekur nekviečia):

```js
LotaDev.give(2, 't', 200);   // 200 žaisliukų į 2 lygio piniginę
LotaDev.key(2);              // viskas, ko reikia 2 lygiui atrakinti
LotaDev.boss();              // atiduoda boso prizą — abi 4 lygio aprangas
LotaDev.reset();             // ištrina išsaugojimą
```

Progreso išsaugojimas — `localStorage`, raktas `lotago.save.v3` (senas `…v2` perkeliamas
automatiškai: jo skaniukai ir aprangos atitenka pirmam lygiui).
