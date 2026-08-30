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

| Lygis | Vieta | Kas renkama | Už finišą (su K.T. / be jų) | Kaip atrakinamas |
|---|---|---|---|---|
| 1 | Kelias į Londoną | skaniukai 🦴 (15) | +10 / +50 | atviras nuo pradžios |
| 2 | Nuo viešbučio iki miško | žaisliukai 🧸 (20) | +30 / +100 | pereiti 1 lygį **be kontrolinių taškų** ir atrakinti visas 1 lygio aprangas |
| 3 | Šviesų šventė | skaniukai **ir** žaisliukai | +50 / +200 | pereiti 2 lygį **be kontrolinių taškų** ir atrakinti visas 2 lygio aprangas |
| 4 | Bosas: Didysis Siurblys | nieko | visada su K.T. | pereiti 3 lygį **be kontrolinių taškų** ir atrakinti visas 3 lygio aprangas |

**Raktą duoda tik bėgimas be kontrolinių taškų.** Finišas su vėliavėlėmis moka skaniukais
ir tiek — kitas lygis neatsirakina, kad ir kiek kartų taip pereitum. Reikia bent vieno
švaraus perėjimo nuo starto linijos iki finišo, ir tik tada, kai visa to lygio spinta jau
nupirkta. Kiek kartų lygis pereitas kuriuo būdu, matyti pradžios ekrane po logotipu
(`Finišas ×3` ir po juo `🔑 be k. t. ×1` arba `Be kontrolinių taškų — dar nė karto`).

Kai raktas uždirbamas, visos to lygio spynos atsirakina iš karto ir ekrane vieną kartą
parodoma `🔑 N lygio raktas!`.

> ⚠️ **Šiuo metu spynų nėra.** `js/levels.js` viršuje stovi `const UNLOCK_ALL = true` —
> testavimo jungiklis, dėl kurio `Levels.unlocked()` visiems lygiams atsako „taip": lobby
> be spynų, abu mygtukai veikia, visos aprangų lentynos pasiekiamos. Daugiau jis nekeičia
> nieko — piniginės, kainos ir finišo priedai lieka tokie patys. Norint grąžinti tikrą
> eigą, užtenka tą vieną eilutę pakeisti į `false`; niekur kitur apie ją nežinoma.

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

Seed `20260901`, **17 vietų** — keturiomis daugiau nei pirmame lygyje:

`Apartamentai → Koridorius → Laukiamasis → Baseinas → Promenada → Paplūdimys → Tiltas →
Jūros dugnas → Nuskendęs laivas → Laivo triumas → Apgriuvęs denis → Koralų rifas →
Sekluma → Krantas → Gatvė → Miškas → Tankus miškas`

**Gatvė yra gatvė.** Pajūrio gatvėje nėra jokio vandens: kelias su šaligatviu ir bortu,
palei jį — vienaaukščiai nameliai ir mediniai vasarnamiai su verandomis (vietoj buvusių
daugiaaukščių), o pravažiuojantis transportas rieda **ratais ant asfalto** — universalas
su banglentėmis ant stogo, pikapas su lenta kėbule, kemperis su kopėčiomis ir mašina su
valtimi ant priekabos. Anksčiau mašinos buvo nupieštos pusmetriu virš kelio, ir būtent tai
darė gatvę panašią į užtvindytą.

Prasideda prašmatnaus viešbučio apartamente ir eina per koridorių su numeruotomis
durimis, per fojė su kolonomis ir arkiniais langais į jūrą, pro baseiną, pro viešbučio
vartus į promenadą ir paplūdimį. **Ant tilto ekranas pasisuka** — Lota pasuka į dešinę ir
nubėga tiltu (kaip Palangoje) iki pat galo, o nuo galo **šoka į vandenį**. Po vandeniu ji
bėga dugnu pro koralus, **įbėga į nuskendusį laivą** ir išlipa ant jo denio (žr. „Nuskendęs
laivas" žemiau), paskui rifas; seklumoje **jūros dugnas pakyla**, ir ji išbėga į krantą.
Toliau trumpa pajūrio gatvė ir miškas, kuriame stovi finišas.

Trunka **~3 min 20 s**. **Sunkesnis už pirmą lygį:** pradeda 400 px/s (pirmas lygis
tokio greičio pasiekia tik įpusėjęs) ir įsibėgėja iki 880; tarpai tarp kliūčių trumpesni
(vidutinis 1,10 s vietoj 1,37 s, medianinis 0,85 s vietoj 1,13 s), kliūčių per minutę
daugiau, o sunkiausiose vietose reakcijos lieka 0,40 s vietoj 0,46 s.

**Žuvėdros.** Paplūdimyje jų yra keturios, ant tilto trys, krante dvi. Žuvėdra skrenda
Lotai ties galva: **po ja galima pralįsti pasilenkus, per ją galima peršokti, bet ant jos
užšokti negalima** — vienintelis daiktas visame žaidime, kuris neturi viršaus. Jos juosta
(50–116 px nuo grindų) parinkta taip, kad abu keliai visada tilptų: pasilenkusi Lota yra
30 px aukščio, o šuolio viršūnė — 188 px.

**Posūkis ant tilto.** Nuo paplūdimio ji pasuka į dešinę, ir kamera pasisuka paskui ją.
Užrašo, kad taip nutiko, nebėra — apie posūkį pasako tik pats vaizdas: Lota pasisuka
vietoje (jos siluetas per akimirką susiaurėja iki briaunos ir vėl išsiskleidžia), o kamera
nusiveja ją pusę akimirkos vėliau — pasvyra, prisitraukia ir per ekraną nubėga greito
posūkio dryžiai. Kadras visą laiką lieka užpildytas — anksčiau vaizdas būdavo suplojamas
horizontaliai ir pro jo kampus prasišviesdavo fonas. Trukmė ~1,1 s (`fx.spin`, `js/game.js`).

**Nuskendęs laivas.** Trys vietos iš eilės, ir jokio pasirinkimo tarp jų nėra:

1. **Nuskendęs laivas** — dugnu prieinama prie jos šono; vietos gale plotoje išplėšta
   **skylė**, pro kurią įbėgama į vidų.
2. **Laivo triumas** — tamsu, laivo špantai, iliuminatoriai su šviesos pluoštais, krovinys
   po tinklu, siūbuojantis žibintas, grandinės nuo denio. Kliūtys — statinės, skrynios,
   dėžės, patrankos, grandinių krūvos.
3. **Apgriuvęs denis** — triumo gale **apgriuvę laiptai** kyla į denį. Jais ne šokinėjama,
   o bėgama, ir apeiti jų neįmanoma: pirmoji pakopa yra viena pakopa nuo grindų, tad Lota
   tiesiog užbėga. Denis stovi 210 px virš dugno ir yra po vandeniu kaip ir visa kita —
   stiebas su takelažu, ventiliatoriaus kaklas, gervė, vairinė. **Denio galas nulūžęs**:
   lentos tiesiog baigiasi, Lota iššoka į mėlyną ir nukrinta atgal ant jūros dugno, iš kur
   bėga toliau į rifą. Nukristi ten irgi neįmanoma — apačioje visą laiką yra dugnas.

**Sekluma — kyla smėlis, o ne leidžiasi vanduo.** Jūra šioje vietoje niekur nedingsta:
jos paviršius stovi fiksuotame aukštyje (`surfaceY`, pasaulio koordinatėmis 320), o kyla
**dugnas** — devynios smėlio pakopos po 38 px, iš viso 342 px. Pakopa yra laiptas: ja
bėgama, ant jos mirti neįmanoma. Todėl paviršius artėja prie Lotos, o ne atvirkščiai, ir
matyti, kad ji kopia: krantas su pušimis pamažu iškyla virš vandens, o horizontas lieka
lygus. Nuo šios vietos ir iki finišo visa trasa eina 342 px aukščiau nei jūros dugnas.

**Šuolis nuo tilto.** Tilto gale grindys tikrai baigiasi — tai vienintelė vieta abiejose
trasose, kur po kojomis nieko nėra, ir tai ne skylė, o scenarijus: Lota atsispiria pati,
nukrinta į vandenį, pasigirsta pliūpsnis, ekranas nuplaukia ir ji atsiranda bėganti jūros
dugnu. Nukristi ir žūti ten neįmanoma.

**Trasa nebėra plokščia.** Iki šiol visa trasa buvo viename aukštyje ir tik antri keliai
nukrypdavo aukštyn ar žemyn. Dabar aukštį gali keisti ir pati vieta: `stairsUp` prie
vietos pradžios pastato privalomus laiptus, `climb` išbarsto pakopas per visą vietą, o
`dropEnd` gale nutraukia grindis, po kuriomis jau laukia žemesnis aukštas. Kamera, fonai,
kontroliniai taškai ir startas atsiremia į tas grindis, kurios tikrai yra po Lota
(`groundYAt()`, `js/level.js`).

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

**Fonas nesikartoja.** Uždarose vietose fonas anksčiau buvo vienas piešinys, kartojamas
per visą vietą: berniuko kambaryje tas pats raketos plakatas, mergaitės — ta pati spinta
su supamu arkliuku, rife — tie patys koralai, oloje — tie patys kristalai. Dabar kiekviena
tokia juosta turi kelias skirtingas variacijas, ir kuri kur atsiduria, sprendžia juostos
numeris (`tileLayer` antras argumentas `i`), o ne vieta ekrane — todėl slenkant vaizdui
niekas nemirga.

Ką dabar mato Lota: berniuko kambaryje — raketa, dinozauras, futbolo marškinėliai, piratų
žemėlapis, o po jais lentyna su modeliais, knygomis arba taurėmis; mergaitės kambaryje —
spinta, tualetinis staliukas su veidrodžiu, lentyna su lėlėmis ir knygomis, didelis
meškiukas fotelyje, o šalia vežimėlis, aitvaras arba gimnastikos lankas; vonioje —
veidrodis, vaistinėlė, langelis į sodą, dušas, rankšluosčių kabykla, skalbinių krepšys;
močiutės kambaryje — knygų spinta, indauja, fotelis su mezginiu, pianinas; kaimynų
koridoriuje — radiatorius, pakaba su paltais, laikrodis, batų suoliukas; ventiliacijoje —
ventiliatorius, atšaka, įspėjamasis ženklas; kieme — skalbinių virvė, būda, gėlynas,
lesyklėlė, karutis; viešbučio apartamente — balkono langas, židinys, lova su baldakimu;
fojė — registratūra, sėdimoji zona, liftai su fortepijonu; baseine — trys skirtingi
viešbučio korpusai, kopėčios, tramplinas, gelbėtojo kėdė; ant tilto — jachta, žvejų
laivas, plūduras, banglentininkas; rife — vėduokliniai, šakoti, „smegeniniai" koralai,
kempinės, jūrų ežiai, elniaragiai, o pro šalį plaukia vėžlys arba rajas; laivo triume —
kas antra sekcija kitokia; lapių urve — kristalų gyslos, grybai, šaknys, rūdos gysla;
kristalų salėje — pavieniai smailiai, jų kekės, nuvirtę kristalai ir perskelti geodai
penkiomis spalvomis.

Gatvės (pirmame ir antrame lygyje) ir viešbučio koridorius palikti kartotis specialiai:
vienoda namų eilė ir vienodos numeruotos durys yra būtent tai, kas jie ir yra.

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

**Mergaitės kambario lova ir ventiliacija.** Kambario viduryje stovi **antresolinė lova** —
čiužinys aukštai (140 px), o po juo 94 px oro. Ji **nėra kliūtis**: ant jos mirti
neįmanoma, ir pro ją nieko nereikia daryti. Užšokusi ant čiužinio Lota **atšoka daug
aukščiau** nei šoktų pati (1140 vietoj 1000 px/s — nuo 140 px lankas kyla iki 385) ir įlekia
pro atvirą liuką lubose į **ventiliacijos vamzdį**.

**Užšokti ant jos sunkiau, negu pro ją prabėgti — taip ir turi būti.** Raktas yra
privilegija, o ne dovana tam, kas nieko nespaudė. Anksčiau būdavo atvirkščiai: lova stovėjo
ant grindų ir buvo *soft* — įbėgusi Lota automatiškai užsiropšdavo ant jos, tad nieko
nedarant vamzdys atitekdavo pats.

- **Nieko nedarai** — tiesiog pralendi po lova ir bėgi kambariu toliau. Nemokama.
- **Šoki per vėlai arba per anksti** — čiužinys yra **vienpusė platforma**, tad kildama
  Lota pro jį pralekia ir nusileidžia už lovos. Irgi nieko neatsitinka.
- **Šoki laiku** — nusileidi ant čiužinio, atsimuši ir atsiduri vamzdyje.

Kad nusileistum ant lovos, reikia atsispirti **prieš ją**, o ne prie jos: šuolio lankas
grįžta į 140 px praėjęs 0,57 s, tad šokti reikia maždaug 105–270 px prieš lovos kraštą.
Langas — apie **0,38 s**. Palyginimui, paprastą kliūtį šokant reakcijos paliekama bent
0,46 s ir šokama *prie jos*.

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

## Kontroliniai taškai — su jais arba be jų

Kiekvieną lygį galima bėgti dviem būdais, ir **žaidėjas pasirenka pats**. Klausimas
užduodamas **vieną kartą** — pirmą kartą paspaudus *ŽAISTI* tame lygyje. Atsakymas
įsimenamas, ir nuo tol *ŽAISTI* iš karto paleidžia bėgimą.

**Bet kitas lygis atsirakina tik be jų.** Su kontroliniais taškais bėgti galima kiek nori
ir uždirbti tuo galima kiek nori — tik raktas taip neuždirbamas. Kad atsivertų kitas
lygis, reikia bent vieno perėjimo **be kontrolinių taškų** (ir, kaip ir anksčiau, visos to
lygio spintos). Todėl vėliavėlės nebėra „lengvesnis kelias į priekį" — jos yra būdas
ramiai prisirinkti aprangoms, o pats žingsnis pirmyn visada padaromas švariai.

**Kaina yra finišas.** Be kontrolinių taškų vienas prisilietimas prie kliūties baigia visą
bėgimą — bet už finišą mokama kelis kartus daugiau:

| Lygis | Su kontroliniais taškais | Be jų |
|---|---|---|
| 1 · Kelias į Londoną | +10 🦴 | **+50 🦴** |
| 2 · Nuo viešbučio iki miško | +30 🧸 | **+100 🧸** |
| 3 · Šviesų šventė | +50 🦴 ir 🧸 | **+200 🦴 ir 🧸** |
| 4 · Bosas | visada su jais | — |

Boso lygyje pasirinkimo nėra: jis visada žaidžiamas su kontroliniais taškais. Trečiame
lygyje renkami abu dalykai, tad ir premija už finišą įskaitoma į abi to lygio pinigines.

Boso lygis pasirinkimo neturi, ir už jo nieko nebeatsirakina, tad jo tai neliečia.

**Kur pasirinkimas matomas.** Bėgant — **ekrano viršuje**, HUD'e, greta skaniukų:
`SU K.T. +10` arba `BE K.T. +50`. Pradžios ekrane — juostelė virš mygtukų; bakstelėjus ją
klausimas užduodamas iš naujo, tad apsigalvoti galima bet kada.

**Su kontroliniais taškais.** Kiekvienos vietos pradžioje stovi languota vėliavėlė. Pirmą
kartą ją pasiekus ji užsidega, pasigirsta garsas ir ekrane trumpam pasirodo
**✓ KONTROLINIS TAŠKAS**. Atsitrenkusi Lota grįžta ne į patį pradžią, o į paskutinės
pasiektos vietos pradžią — mygtukas ekrane rodo, nuo kurios vietos tęsiama (pvz.
*Tęsti nuo Parkas*).

Skaniukai, surinkti iki kontrolinio taško, išlieka; tos vietos skaniukai atstatomi, nes
per ją bėgama iš naujo. Surinkti skaniukai **atiduodami tik pasibaigus bėgimui** — pasiekus
finišą arba paspaudus *Baigti*. Todėl žūtis prie kontrolinio taško nieko neduoda ir nieko
neatima.

**Be kontrolinių taškų.** Vėliavėlių trasoje išvis nėra — jos nepiešiamos, nes jų nėra.
Vienintelis kontrolinis taškas yra starto linija, tad atsitrenkus prarandama viskas:
ir kelias, ir tame bėgime surinkti skaniukai. *Baigti* mygtukas ir tada atiduoda tai, kas
buvo surinkta iki žūties — premija už finišą yra tai, ko negaunama.

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
- pasiekus finišą → premija, priklausanti nuo to, ar bėgta su kontroliniais taškais
  (1 lygis +10 arba +50, 2 lygis +30 arba +100 — žr. „Kontroliniai taškai")

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
| `js/zones2.js` | 2 lygio 17 vietų + `BRANCHES2` (lapių urvas); `BG2` ir naujos grindys |
| `js/levels.js` | keturi lygiai, `TRACKS` (kas iš ko pastatoma), atrakinimo taisyklės, premijos už finišą, lygių nuotraukos |
| `js/level.js` | trasos generatorius + fizikos konstantos (`PHYS`) |
| `js/game.js` | variklis: įvestis, fizika, kamera, piešimas |
| `js/ui.js` | ekranai, HUD, aprangų parduotuvė |
| `dev/bgs.html` | visų vietų fonai vienoje lentelėje, po kelis kadrus iš eilės — kad kartojimasis matytųsi iš karto (atskiras puslapis) |
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
- **Lova ir ventiliacija** — `BED_TOP`, `BED_BODY`, `PHYS.BOUNCE_V`, `VENT_RISE` ir
  `buildDuct()` (`js/level.js`), vamzdžio vaizdas — `BRANCHES.upstairs.duct` (`js/zones.js`).
  Lovos plotis (`bw`) valdo, koks platus yra nusileidimo langas; `BED_TOP` — kiek anksti
  reikia atsispirti
- **Kontroliniai taškai ir premijos už finišą** — `bonus: { cp, raw }` lygio įraše `LEVELS`
  ir `Levels.bonus()` (`js/levels.js`); `choose: false` reiškia, kad lygis pasirinkimo
  nesiūlo. Kas įsimenama — `Save.mode()` (`js/util.js`), klausimo ekranas — `UI.showMode()`
  (`js/ui.js`)
- **Kada atsirakina kitas lygis** — `Levels.unlocked()` ir `Levels.blockedBy()`
  (`js/levels.js`); švarių perėjimų skaitiklis — `Save.rawClears()` / `Save.markCleared()`
  (`js/util.js`)
- **Kiek metro sutrumpina trasą** — `tail` funkcijoje `buildWorld()` (`js/level.js`): kiek
  sekundžių Londono lieka po išlipimo
- **Lapių urvas** — `BRANCHES2.foxcave` (`js/zones2.js`): `sec`, `drop`, `foxes`;
  lapių atstumai — `stepFoxes()` (`js/game.js`)
- **Žuvėdros** — `gulls:` zonoje (`js/zones2.js`), juosta — `BIRD_BOTTOM` ir `BIRD_H`
  (`js/level.js`)
- **Šuolis nuo tilto** — `dive: 1` zonoje ir `z.dive` blokas `buildWorld()` viduje
- **Ekrano pasisukimas** — `turn: 1` zonoje; pats efektas — `fx.spin` ir `drawTurnBlur()`
  (`js/game.js`)
- **Trasos aukštis** — `stairsUp` / `stairProp`, `climb: {n, h}` / `riseProp`,
  `dropEnd` / `dropTo` / `dropProp` / `dropRoom` zonos įraše (`js/zones2.js`); pačios
  pakopos — `P.riser()` ir `flight()` (`js/level.js`)
- **Jūros lygis seklumoje** — `surfaceY` ir `climb` zonoje `shallows` (`js/zones2.js`)
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
// `upstairs: true` reiškia ir lovą su ventiliacija, t. y. raktą; botas pats išsiskaičiuoja,
// kada atsispirti, kad nusileistų ant čiužinio. Be rakto `metro` nieko nekeičia, nes anga
// užrakinta. `down: false` — nesileisti nei į metro, nei į urvą.
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
LotaDev.clear(1, 'cp');      // vienas finišas su kontroliniais taškais
LotaDev.key(2);              // viskas, ko reikia 2 lygiui atrakinti
                             // (įskaitant perėjimą be kontrolinių taškų)
LotaDev.boss();              // atiduoda boso prizą — abi 4 lygio aprangas
LotaDev.reset();             // ištrina išsaugojimą
```

Progreso išsaugojimas — `localStorage`, raktas `lotago.save.v3` (senas `…v2` perkeliamas
automatiškai: jo skaniukai ir aprangos atitenka pirmam lygiui).
