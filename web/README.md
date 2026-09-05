# Lota Go 🐾

2D endless-runner stiliaus žaidimas su juoda šnaucere Lota. Visi keturi lygiai turi tikras
trasas — **1: nuo namų iki Londono**, **2: nuo viešbučio iki miško**, **3: nuo debesų iki
žvaigždžių** ir **4: Didysis pabėgimas** — boso lygis nuo veterinaro stalo iki pat namų,
ilgiausias, greičiausias ir sunkiausias iš visų. Grynas HTML5 + Canvas, be jokių
bibliotekų ir be paveikslėlių: visa grafika piešiama kodu (vektoriai).

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

**Atnaujinimas telefone (⟳).** Pridėtas į pradžios ekraną žaidimas neturi nei adreso
juostos, nei perkrovimo mygtuko, todėl iPhone gali savaitėmis rodyti seną, savo talpykloje
gulinčią versiją. Pradžios ekrano viršuje dešinėje yra **⟳**: jis išmeta visas talpyklas,
iš naujo parsiunčia kiekvieną `js/` failą (`fetch(..., { cache: 'reload' })`) ir grįžta
nauju adresu `?v=<laikas>`. Šalia jo maža data — tai `BUILD` iš `js/main.js`, t. y. versija,
kuri iš tikrųjų veikia. **Keičiant žaidimą `BUILD` reikia pasikelti ranka** — kitaip data
neparodys, kad atnaujinimas suveikė.

## Valdymas

| Veiksmas | Telefonas / iPad | Kompiuteris |
|---|---|---|
| Šokti | mygtukas **▲** arba swipe aukštyn (arba bakstelėti) | `↑` / `W` / `Space` |
| Pasilenkti | mygtukas **▼** arba swipe žemyn (laikyti) | `↓` / `S` |
| Pagreitis ⚡ (tik boso lygyje) | mygtukas **⚡** | `X` / `E` / `⇧ Shift` |
| Eiti kairėn / dešinėn (**tik boso kovoje**) | mygtukai **◀ ▶** apačioje kairėje | `←` / `→` / `A` / `D` |
| Pauzė | mygtukas viršuje | `Esc` / `P` |
| Praleisti filmuką (boso lygyje) | mygtukas **PRALEISTI** | `Esc` |
| Kitas / ankstesnis lygis (pradžios ekrane) | swipe į kairę / dešinę arba **‹ ›** | `←` / `→` |

Lota bėga pati — kryptis nevaldoma. **Vienintelė išimtis — paskutinė boso arena:** ten ji
nustoja bėgti, ir tada kryptį valdo žaidėjas. Du nauji mygtukai **◀ ▶** atsiranda ekrano
apačioje kairėje būtent tada — ir tik tada — ir prieš kovą parodoma kortelė, kas jie tokie.

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
| 3 | Nuo debesų iki žvaigždžių | skaniukai 🦴 (18) **ir** žaisliukai 🧸 (12) | +35 / +120 | pereiti 2 lygį **be kontrolinių taškų** ir atrakinti visas 2 lygio aprangas |
| 4 | Didysis pabėgimas (bosas) | energija ⚡ (84) — ne į piniginę, o į pagreitį | visada su K.T.; prizas — dvi aprangos | pereiti 3 lygį **be kontrolinių taškų** ir atrakinti visas 3 lygio aprangas |

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

**Kainos suderintos su tuo, kiek per bėgimą uždirbama.** Vienas tobulas bėgimas be
kontrolinių taškų duoda: 1 lygyje 30 🦴 + 50 = **80**, 2 lygyje 40 🧸 + 100 = **140**,
3 lygyje 36 🦴 + 120 = **156** ir 24 🧸 + 120 = **144**. Brangiausia kiekvieno lygio
apranga kainuoja maždaug **pusantro–du tokius bėgimus**, o visa lentyna — keturis ar
penkis. Anksčiau antrame lygyje buvo atvirkščiai: už vieną bėgimą duodavo 140 🧸, o
brangiausia to lygio apranga kainavo 85, tad visą spintą buvo galima nupirkti nespėjus
jos net panorėti.

| Lygis | Vienas tobulas bėgimas | Brangiausia apranga | Visa lentyna |
|---|---|---|---|
| 1 | 80 🦴 | 140 🦴 (1,8×) | 600 🦴 (7,5×) |
| 2 | 140 🧸 | 260 🧸 (1,9×) | 825 🧸 (5,9×) |
| 3 | 156 🦴 / 144 🧸 | 260 🦴 + 245 🧸 (1,7×) | 745 🦴 + 715 🧸 (~4,9×) |

**Kiekvienas lygis turi savo piniginę.** Kas surinkta lygyje, tame lygyje ir išleidžiama:
pirmame lygyje pririnktais skaniukais trečio lygio aprangos nenusipirksi. Trečiame lygyje
renkami abu dalykai, nes jo aprangos kainuoja ir skaniukų, ir žaisliukų — kiekviena
skirtingą kiekį, kad nė viena nebūtų uždirbama taip pat kaip kita.

## Muzika ir garsai

Viršutiniame dešiniajame pradžios ekrano kampe yra du atskiri jungikliai:

| Mygtukas | Ką išjungia |
|---|---|
| **♫** | dainas (garsai lieka) |
| **♪** | garsus: šuolius, kaulus, dūžius — **ir kalbą** (daina lieka) |

**Kalba.** Boso lygio replikos yra tikrai ištariamos: `Sfx.say()` paduoda tekstą naršyklės
`speechSynthesis` varikliui, pakelia toną ir paskubina, kad skambėtų komiškai — veterinarė
gauna pirmą angliškų balsų sąrašo balsą, Lota ir kirpėjas kitą. Jei per 380 ms niekas taip
ir nepradeda kalbėti (senesnė naršyklė, išjungtas kalbos variklis), tą pačią repliką
suurzgia `Sfx.babble()` — po burbtelėjimą skiemeniui. Jokių garso failų nė čia nėra.

Kiekvienas lygis turi savo dainą, ir ji groja tol, kol Lota bėga: pauzė ją sustabdo toje
pačioje vietoje, dūžis ir finišas — nutildo, kad būtų girdėti pats dūžis ar finišo melodija.
Bėgant lygis greitėja, ir daina kartu su juo paskuba iki 14 % (`Music.setRate()`). Įjungus
**♫** pradžios ekrane, kelios taktos pagrojamos iš karto — kad girdėtųsi, kas įjungta.

Dainos gyvena `js/music.js` ir, kaip ir visa kita čia, jokių failų neturi: melodija —
kvadratinė banga, bosas — trikampė, būgnai — triukšmo pliūpsniai. Daina užrašoma trimis
eilutėmis aštuntinių tinklelyje:

```js
2: {
  bpm: 126,
  lead:  'f4 .  a4 .  c5 -  a4 . | ...',   // melodija
  bass:  'f2 .  f2 .  c3 .  f2 . | ...',   // bosas
  drums: 'k .  s h  k h  s . | ...'        // k bosinis būgnas, s būgnelis, h lėkštė
}
```

`.` — pauzė, `-` — pratęsia prieš tai buvusią natą dar vienam aštuntiniui, `|` — taktos
brūkšnys (skaitytojui, ne kodui). Natos rašomos `c5`, `fs5` (diezas), `bb4` (bemolis).
Trys eilutės sukasi kiekviena savo ilgiu, tad vienos taktos būgnai po aštuonių taktų
melodija patys grįžta į vietą. Naują dainą pakanka įrašyti į `SONGS` prie lygio numerio.

## Aprangos

Iš viso jų 25. **Kiekviena apranga priklauso konkrečiai vietai tame lygyje**, ir
parduotuvėje po pavadinimu parašyta, kuriai: Senelė — iš Senelės namo, Piratė — iš
nuskendusio laivo, Astronautė — iš raketos ir orbitos. Lentyna sudėliota ta pačia tvarka,
kuria bėgamas lygis: pigiausia yra iš pirmųjų vietų, brangiausia — iš paskutinių. Taip
matyti ne tik kiek kainuoja, bet ir *iš kur ji*.

- **1 lygis — Kelias į Londoną** (25–140 🦴): Pižamos *(Lotos namai)*, Rudeninė
  *(Rudens kiemas)*, Senelė *(Senelės namas)*, Futbolininkė *(Parkas)*, Autobuso
  vairuotoja *(Autobusas)*, Skrydžio palydovė *(Oro uostas)*, Pilotė *(Lėktuvas)*,
  Detektyvė *(Londonas)*, Karalienė *(Londonas)*
- **2 lygis — Nuo viešbučio iki miško** (40–260 🧸): Pokylių suknelė *(Viešbučio fojė)*,
  Pajūrio žvaigždė *(Promenada)*, Piratė *(Nuskendęs laivas)*, Undinė *(Jūros dugnas)*,
  Miško fėja *(Miškas)*, Miško vienaragė *(Tankus miškas)*
- **3 lygis — Nuo debesų iki žvaigždžių** (50🦴+20🧸 … 260🦴+245🧸): Auksinė princesė
  *(Dirižablio salonas)*, Sodininkė *(Žydintis sodas ir šiltnamiai)*, Ugnies paukštė
  *(Raketinė kuprinė)*, Druskos karalienė *(Druskos kasykla)*, Astronautė *(Raketa ir
  orbita)*, Žvaigždžių burtininkė *(Kosminė stotis)*, Krištolo šokėja *(Mėnulis)*

**Kas pasikeitė.** Anksčiau aprangos su lygiais nesisiejo: pirmame lygyje, kuris baigiasi
Londone, buvo parduodama Astronautė, o antrame, kuriame nėra nė snaigės, — Snieguolė.
Dabar Astronautė persikėlė į trečią lygį, kur yra tikra raketa; Snieguolė tapo **Druskos
karaliene** druskos kasykloje (tie patys kristalai, tik rausvi); Undinė iš trečio lygio
persikėlė į antrą, kur yra jūros dugnas; Vienaragė — į antro lygio tankų mišką; Kadetė
tapo **Skrydžio palydove** oro uoste, Baletė — **Pokylių suknele** viešbučio fojė, Roko
žvaigždė — **Pajūrio žvaigžde** promenadoje, o Fėja — **Miško fėja**. Trys nupieštos iš
naujo: **Pižamos**, **Rudeninė** ir **Sodininkė**.
- **4 lygis** — **neparduodamos**. Įveikus bosą abi atiduodamos iš karto:
  **Vaivorykštės suknelė** (mirguliuojanti suknelė, skrybėlaitė su žiedu ir šydu, batukai
  ir ilga pirštinaitė ant vienos priekinės letenos) ir prie jos derantis
  **Vaivorykštės frakas** (frakas su uodegomis, cilindras, peteliškė, batai ir lazdelė).
  Spalvos tos pačios, tad galima rinktis moterišką arba vyrišką variantą.

**Kol kas tik boso lygis yra nuotrauka.** Trasos jame dar nėra: paspaudus mygtuką
parodoma to lygio nuotrauka (piešiama kodu, kaip ir visa kita) ir paaiškinama, kas ten
bus. Aprangos jau veikia. Kai trasa atsiras, `js/levels.js` faile užtenka
`playable: false` pakeisti į `true` ir prirašyti tam lygiui `TRACKS` įrašą.

## Kad būtų aišku, kas vyksta

Trasa, kuri kas dvidešimt sekundžių pakeičia vietą, privalo pati pasiaiškinti — kitaip
lieka jausmas, kad tiesiog pasikeitė paveikslėlis. Todėl:

**Kiekviena vieta baigiasi durimis, pro kurias iš tikrųjų prabėgama, ir ant jų parašyta,
kur jos veda.** Trečiame lygyje jų yra visur: liukas žemyn į dirižablio saloną, lieptas
`BOKŠTAS →` iš dirižablio ant bokšto, `TERASOS →`, stiklinės durys `Į SODĄ →`,
`ŠILTNAMIAI →`, laukų vartai `KARJERAS →`, rampa `Į AIKŠTELĘ →`, medžiais paremta
kasyklos anga `KASYKLA →`, sprogimų durys `RAKETOS ŠACHTA →`, `RAKETA →`, `Į KOSMOSĄ →`,
`Į STOTĮ →` ir galiausiai `NUSILEIDIMO MODULIS →`.

**Kiekviena vieta pasako viena eilute, kas ji tokia.** Įbėgus rodomas ne tik pavadinimas,
bet ir paaiškinimas: *„Bokšto terasos — stiklinėmis pakopomis žemyn, pro debesų
sluoksnį"*, *„Druskos kasykla — į kalno vidų, dabar jau po žeme"*. Jei toje vietoje dar ir
užsidega kontrolinis taškas, prieš eilutę atsiranda ✓.

**HUD'as visada rodo tikrąją vietą.** Nusileidus pro skylę grindyse viršuje užsirašo ne
zonos, o kambario vardas — *Balasto denis*, *Sėklų rūsys*, *Transporterio galerija*,
*Bandymų bunkeris*, *Virš debesų* — ir tas pats pavadinimas trumpam parodomas ekrane, kad
būtų aišku, kad ji nuėjo kitur, o ne pasiklydo.

**Raketa iš tikrųjų kyla.** Įbėgus į ją ekranas krusteli, apačioje šviečia varikliai, o
pro iliuminatorius matyti, kaip debesys lieka žemai, dangus tamsėja, atsiranda žvaigždės
ir pasirodo mėlynas Žemės kraštas. Ekranai viduje pirma skaičiuoja `T-7`, `T-6`, o paskui
rodo aukštį: `12 km`, `48 km`, `106 km`. Tarp „raketos šachtos" ir „orbitos" nebėra jokio
šuolio — visą kelią ji tiesiog kyla.

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
vartus į promenadą ir paplūdimį. Nuo paplūdimio ji išbėga ant **tilto** (kaip Palangoje),
nubėga juo iki pat galo, o nuo galo **šoka į vandenį**. Po vandeniu ji
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

### 3 lygis — Nuo debesų iki žvaigždžių

Seed `20260905`, **14 vietų**, ir jos kyla: iš oro į žemę, iš žemės po žeme, o iš ten į
kosmosą.

`Dirižablio nugara → Dirižablio salonas → Švartavimo bokštas → Bokšto terasos →
Žydintis sodas → Šiltnamiai → Marmuro karjeras → Kasyklos aikštelė → Druskos kasykla →
Raketos šachta → Raketos viduje → Orbita → Kosminė stotis → Mėnulis`

Nė viena iš jų nėra pasiskolinta iš ankstesnių lygių, ir perėjimas iš vienos į kitą visada
yra tikras: **ant dirižablio nugaros** ji bėga virš debesų ir pro liuką nulipa **į jo
saloną**; salonas baigiasi ties **švartavimo bokšto** gembe, prie kurios dirižablis
pririštas; nuo gembės **stikliniais laiptais** ji nusileidžia bokšto terasomis pro debesų
sluoksnį **į žemę**; po bokštu stovi **žydintis vyšnių sodas**, už jo — sodo
**šiltnamiai**, už šiltnamių — **marmuro karjeras**, karjero papėdėje — **kasyklos
aikštelė** su kopimo bokštu, o pro jos angą einama **į druskos kasyklą**. Kasyklos galerija
atsiveria į **raketos šachtą**; laiptais užbėgama pro liuką **į raketą**; raketa pakyla, ir
Lota išlipa **ant stoties korpuso orbitoje**, iš ten pro šliuzą **į stotį**, o iš stoties —
**į Mėnulį**, kur stovi finišas.

**Sunkiausias ir greičiausias iš trijų.** Pradeda 460 px/s — greičiau, negu antras lygis
bėga pačioje pabaigoje — ir įsibėgėja iki 1010 px/s (antras — iki 880). Sunkiausiose
vietose reakcijai lieka 0,36 s vietoj 0,40 s. Trunka **~3 min 30 s**.

**Kliūtys visos naujos.** Nė vienos iš pirmo ar antro lygio: ventiliacijos gaubtai,
takelažo kilpos ir saulės plokštės ant dirižablio nugaros; pintos kėdės, arbatos vežimėlis
ir gaublys salone; įrankių skrynios, kabelio ritės ir vėjo rankovė ant gembės; vazonai,
stiklinės staliukai ir skėčiai terasose; aviliai, kopėčios ir dėžės sode; sėklų padėklai,
laistytuvai ir vazonų bokštai šiltnamyje; marmuro blokai, pjūklas ir kaušas karjere;
druskos luitai ir vagonėliai kasykloje; kuro statinės ir roboto ranka šachtoje; sėdynės ir
pultai raketoje; antenos, varikliukai ir lėkštės ant korpuso; maišai ir stelažai stotyje;
Mėnulio uolos, nusileidimo modulio koja ir gręžinys Mėnulyje.

**Trijose vietose grindyse yra skylė.** Kiekvieną kartą pasirinkimas tas pats ir jis
niekada nebaudžia: **peršok ją ir nieko neatsitiks**, arba **nusileisk į ją** ir bėk žemesniu
keliu, kuris trunka lygiai tiek pat ir baigiasi toje pačioje vietoje.

| Kur | Kas apačioje | Kodėl ten yra skylė |
|---|---|---|
| Dirižablio salonas | **Balasto denis** ir **Variklių skyrius** | liukas grindyse — po salonu tikrai yra balasto bakai ir varikliai |
| Šiltnamiai | **Sėklų rūsys** ir **Šaknų sandėlis** | po šiltnamiais laikomos sėklos ir šaknys |
| Marmuro karjeras | **Transporterio galerija** ir **Trupintuvas** | akmuo iš karjero išvežamas juosta, o juosta eina po žeme |

**O galerijoje yra antra skylė, dar giliau.** Trupintuvo gale grindyse žioji dar viena
anga su užrašu *BANDYMŲ BUNKERIS — užverstas nuo seno*. Į ją nusileidus atsiduriama
betoniniame vamzdyje su senais raketų bandymų stendais, ant kurių raketos taip ir liko
pritvirtintos, o gale — nuolat mirksinčios avarinės lempos ir užgriuvusi lubų dalis.
Ten niekas neveda ir niekas apie tai neužsimena: reikia nusileisti pro vieną skylę, o
paskui — pro kitą.

**Ir ten guli raketinė kuprinė.** Ją palietus:

- ekranas nuplauna baltai, ir Lota **iškyla virš debesų** — į `sky` sluoksnį, kurio nėra
  kur kitur pasiekti;
- ji **skrenda greičiau, negu bėgtų apačia** (`JET_SPEED` = 1,55×), ir aukštai jokių
  kliūčių nėra: nei nuo ko pasilenkti, nei per ką šokti. Spaudyti irgi nieko nereikia;
- matyti tik vėjas: ilgi minkšti dryžiai ir pro šalį nuplėšti debesų skiautės. Tyliai,
  ne kaip greitkelyje;
- paskui kuprinė **užgęsta**, ir Lota **ramiai nusileidžia** ilgu slėniu iki pat kasyklos
  aikštelės — ne krisdama, o palengva leisdamasi (`JET_GLIDE` = 1500 px), ir aikštelės
  pradžia specialiai palikta tuščia, kad būtų kur nusileisti.

**Kuprinė nieko neatima.** Visa, ką ta trasos atkarpa būtų davusi, padedama antrą kartą
danguje, ant skrydžio kelio — pasiimtas skaniukas danguje yra tas pats skaniukas, tad ir
skridusi, ir nubėgusi Lota gali surinkti visus 30. Skrendant kontroliniai taškai
nestatomi: taškas ore grąžintų ją ant žemės, o skaniukai liktų danguje.

**Kamuoliukus reikia rasti, o ne prabėgti.** Nė vieno iš dvylikos žaisliukų pagrindiniame
kelyje nėra — visi jie guli **žemesniuose keliuose** (balasto denyje, sėklų rūsyje,
transporterio galerijoje) ir **bunkeryje**. Pralėkus lygį tiesiai, nieko nesustabdant,
gaunami 18 skaniukų ir **nulis** žaisliukų. Skaniukai savo ruožtu padėti sunkiau nei
ankstesniuose lygiuose: pirmenybė teikiama vietoms, kurias pasiekia tik šuolis ant lentynos,
ant kliūties viršaus arba pro tunelį.

### 4 lygis — Didysis pabėgimas (bosas)

Seed `20260906`, **penkios arenos** — ne daugiau ir ne mažiau, ir jos pasakoja vieną
istoriją:

`Veterinarijos kabinetas → Klinikos koridorius → Miesto gatvė → Šunų kirpykla →
Paskutinis pabėgimas`

Tai **ilgiausias, greičiausias ir sunkiausias** žaidimo lygis. Vienas bėgimas trunka
**~4 min** — 245 s bėgant, kiek trumpiau naudojant pagreitį (trečias lygis — ~3 min 37 s);
trasa yra 206 500 px ilgio (trečio lygio — 176 000), greitis auga
nuo **520 iki 1180 px/s** (trečias lygis prasideda 460 ir baigiasi 1010), o siauriausioje
vietoje kliūčiai perskaityti lieka **0,33 s** vietoj 0,36. Tempas auga visą laiką: greičio
rampa (`X_FULL` = 200 000) baigiasi tik ties pačiu finišu, tad kuo toliau, tuo sunkiau.

**Lygis prasideda filmuku.** Lota sėdi ant stalo ir laiko ištiesusi leteną, o veterinarė
stovi prie pat stalo, palinkusi, ir **mašinėle kerpa jai nagus** — mašinėlės žandikauliai
matomai atsidaro ir užsidaro, nuo letenos nulekia nago pjuvenos, *cvakšt*, *cvakšt*.
Tada Lota **nušoka nuo stalo per pačią veterinarę** — virš jos galvos, į kitą pusę — ir
nusileidžia jai už nugaros. Veterinarė apsisuka ant vietos, ir toliau viskas vyksta į
priekį, ta pačia kryptimi, kuria bėgs visas lygis.

Abi replikos yra **tikrai įgarsintos**: veterinarė sušunka **„Why you?!"** (aukštu, greitu,
nustebusiu balsu), Lota atsisuka ir atsako **„What did I do?"** (dar aukštesniu ir mažesniu).
Kalba naršyklės `speechSynthesis` — jokių garso failų; jei įrenginys balso neturi, `Sfx.say()`
pats pakeičia jį trumpais burbtelėjimais, kad replika niekada nebūtų tyli. Burbulai su tekstu
lieka tiems, kas žaidžia be garso. Filmukas trunka ~11 s, valdyti jame nieko negalima, o
viršuje dešinėje visą laiką kabo **PRALEISTI** (jis nutildo ir balsą). Filmukas rodomas
kaskart pradedant lygį iš naujo nuo pradžios; grįžus nuo kontrolinio taško jo nebūna.

| Arena | Kiek trunka | Kas joje |
|---|---|---|
| 1 · Veterinarijos kabinetas | ~14 s | kėdutės, svarstyklės, narveliai, operacinė lempa — tik tam, kad ji spėtų įsibėgėti |
| 2 · Klinikos koridorius | ~32 s | narvų siena su akimis tamsoje, dėžės, kibirai, deguonies balionai. Trumpa: čia mokomasi |
| 3 · Miesto gatvė | ~89 s | **ilgiausia ir sunkiausia** dalis. Vitrinos, markizės, pastoliai, šiukšliadėžės — ir iš už ekrano lekiantys daiktai |
| 4 · Šunų kirpykla | ~48 s | vonelės, džiovintuvai, veidrodžiai, muilo burbulai. Tris kartus Lota apsisuka ant vietos |
| 5 · Paskutinis pabėgimas | — | **čia bėgimas baigiasi.** Lota sustoja arenos pradžioje, visi susirenka, ir prasideda boso kova |

**Kliūtys atlekia iš už nugaros.** Gatvėje ir kirpykloje veterinarė ir kirpėja mėto viską,
kas po ranka: adatas, nagų žirkles, žirkles, termometrą, tablečių stiklainį, šukas,
kirpimo mašinėlę, purškiklį. Kiekvienas toks daiktas yra visiškai paprasta kliūtis —
**jo dėžutė nuo pat pradžių stovi vietoje ir niekur nejuda**, todėl niekas neatsiranda
netikėtai po nosimi. Kinta tik tai, **kur jis piešiamas**:

- daiktas **išlekia iš persekiotojos rankos** (jos ranka tuo metu ir užsimoja) **Lotai už
  nugaros**, perskrieja **virš jos galvos** ir nulekia į priekį, į savo vietą. Skrisdamas jis
  palieka pėdsaką, o po juo ant grindų slenka **šešėlis** — iš jo matyti, kokiame aukštyje
  daiktas yra;
- **nukritęs jis nedingsta.** Kai Lota jį praeina, daiktas nukrenta ant žemės, apsiverčia ir
  lieka gulėti už jos — o ne kabo ore amžinai;
- **kiekviena kliūtis pasako, ko iš jos norima.** Virš peršokamos kliūties šviečia geltona
  **▲**, o po pralendama kliūtimi pažymimas pats **tarpas** — mėlyni skliaustai nuo grindų
  iki kliūties apačios ir **▼** viduryje. Vienodai atrodančių kliūčių, kurių viena šokama,
  o kita lendama, nebėra: aukštis ir ženklas visada sutampa;
- **ženklas ateina anksčiau už kliūtį.** Prie tokio greičio ekrane telpa vos pusė sekundės
  kelio į priekį, todėl viskas, kas yra artimesnėje nei **1,75 s** atkarpoje, iš pradžių
  paskelbiama **dešiniajame ekrano krašte**: ženkliukas su ▲ arba ▼, tame pačiame aukštyje,
  kuriame bus pati kliūtis, o aplink jį besiveriantis žiedas rodo, kiek liko. Kai kliūtis
  įslenka į ekraną, atsakymas jau seniai matomas.

**Kirpykloje Lota apsisuka.** Trijose vietose kamera staigiai nusisuka kartu su ja
(tas pats efektas, kaip pirmame lygyje ant molo), kirpėja akimirkai ją pameta ir atsilieka.

#### Energija ir pagreitis

Boso lygyje **nieko nerenkama į piniginę** — nei kaulų, nei žaisliukų. Ant trasos guli tik
**energijos ženklai ⚡** (84 visame lygyje), ir jie ne skaičiuojami, o naudojami:

- **penki ⚡ = vienas pilnas užtaisas.** HUD'e viršuje kairėje matosi penki taškeliai;
  užsipildę jie ima pulsuoti, o mygtukas **⚡** įsijungia;
- **užtaisą reikia panaudoti.** Paspaudus (`X` / `E` / `⇧`, arba mygtuką **⚡**) Lota
  **prasiveržia**: 2,6 s bėga pusantro karto greičiau, persekiotojai atmetami į patį galą,
  o viskas, kas pasitaiko kelyje, **išlekia į šalis** — pro pagreitį prasiveržiama, o ne
  atsitrenkiama;
- **nepanaudotas užtaisas prapuola.** Pralaikius jį 6,5 s jis subyra, persekiotojai
  gerokai priartėja, ir apie tai pasakoma. **Trys prapuolę užtaisai iš eilės — ir jie
  ją pagauna**, kad ir kokia būtų buvusi persvara;
- **pro šalį paleistas ⚡ irgi kainuoja.** Kiekvienas nepakeltas ženklas šiek tiek priartina
  persekiotojus, kiekvienas pakeltas — atitolina. Todėl bėgti reikia ne tik apeinant
  kliūtis, bet ir renkant.

**Persekiotojai matomi visą laiką.** Nuo tos akimirkos, kai kas nors ima vytis, jis yra
ekrane: bėga, mojuoja rankomis, kilnoja kojas, o veterinarė iš ten pat ir mėto daiktus.
Juosta rodo tik **kaip arti** jie yra — pilna reiškia gerą atkarpą kelio, tuščia reiškia,
kad pagavo, — bet net ir pilna juosta jų nebeslepia už ekrano krašto. Kai lieka mažai,
juosta ima mirksėti ir ekrano kraštai paraudonuoja.

**Persekiotojų juosta** yra po vietos pavadinimu, raudona, po greičio juosta.

Persekiotojas priklauso nuo arenos: **koridoriuje ir gatvėje** — veterinarė, **kirpykloje** —
kirpėja, **paskutiniame pabėgime** — abi. Pirmoje arenoje dar niekas nesiveja.

#### Kirpykla: skanėsto scena

Įbėgusi pro kirpyklos duris Lota **sustoja**, ir kartu sustoja visas lygis. Kirpėjas stovi
nugara, išgirsta ją, **apsisuka ant vietos**, pamato — virš galvos iššoka **!** — ir
susiraukia. Tada bando ją papirkti: pritupia, ištiesia skanėstą ir vilioja
(**„Come here, doggy!"**, irgi įgarsinta).

Lota šoka jo link. **Šuolio viduryje ji apsiverčia ant nugaros**, ir tuo pačiu momentu
vaizdas pereina į **sulėtintą** — juostos viršuje ir apačioje, brūkšniai ore, tamsa
kraštuose. Išsigandęs kirpėjas **sviedžia skanėstą į viršų**, skanėstas nulekia lanku, Lota
jį ore **pagauna** (*AM!*), ir vaizdas iškart grįžta į normalų greitį. Ji nusileidžia ant
kojų, ir žaidimas tęsiasi toje pačioje vietoje, kur buvo sustojęs — tik keliomis dešimtimis
pikselių toliau, ant tos pačios tuščios grindų atkarpos, kuria prasideda kiekviena arena.

Scena rodoma vieną kartą per bėgimą; grįžus nuo kontrolinio taško, esančio už jos, ji
nebekartojama.

#### Penkta arena: perėjimas į kovą

Paskutinės arenos pradžioje Lota **nustoja bėgti visam laikui**. Ji sustabdo save (dulkės
iš po letenų) ir atsisėda arenos viduryje. Tada:

1. **veterinarė** atbėga iš kairės ir sustoja savo vietoje;
2. **kirpėjas** atbėga paskui ją ir pereina į kitą arenos pusę;
3. **keturi dideli, skirtingų veislių šunys** — dogas, šventbernardis, pudelis ir buldogas —
   sueina iš anapus ir sustoja giliau už žmonių. Niekas nebebėga ratu: visi stovi savo
   vietose ir ruošiasi dvikovai;
4. ekrane blyksteli **BOSO KOVA · Nebebėgame. Dabar kaunamės.**;
5. ir tik tada parodoma **kortelė su naujais mygtukais** — ◀ kairėn, ▶ dešinėn, ▲ šuolis —
   bei vienintelė kovos taisyklė su abiem kaulais, nupieštais taip, kaip jie atrodys.
   Tuo pačiu momentu **◀ ▶ atsiranda ir ekrane**, apačioje kairėje.

Perėjimas trunka ~7,5 s ir rodomas tik pirmą kartą: pralaimėjus kova prasideda iš karto.

#### Boso kova

Iš viršaus **krenta kaulai**. Iš pradžių lėtai — pirmieji trys visada balti ir krenta beveik
tingiai, kad taisyklė būtų akivaizdi, — paskui vis greičiau: per ~50 s kritimo greitis auga
nuo 210 iki 555 px/s, tarpas tarp kaulų trumpėja nuo 1,15 iki 0,38 s, o oranžinių dalis
auga nuo 28 % iki 50 %. Po kiekvienu krentančiu kaulu ant grindų slenka šešėlis.

- **baltus kaulus reikia rinkti.** Pagautas baltas kaulas pats nuskrieja lanku į vieną iš
  bosų ir **atima jam vieną gyvybę** (taikosi į tą, kuris dar sveikesnis, kad abu kristų
  kartu);
- **oranžinių liesti negalima.** Jie pažymėti kryžiuku ir oranžine švyste; palietus —
  **minus viena Lotos gyvybė**, ekranas krusteli, ir pusantros sekundės ji nepažeidžiama;
- **kiekvienas bosas turi 10 gyvybių**, jos rodomos juostomis virš galvų (`Veterinarė`,
  `Kirpėjas`). **Lota turi 5 gyvybes** — penkios širdelės viršuje kairėje. Likus vienai,
  ekrano kraštai ima raudonuoti;
- viršutinė lygio juosta kovos metu rodo nebe nubėgtą kelią, o **kiek bosų gyvybių numušta**.

**Pralaimėjus — grįžtama tiesiai į kovą.** Netekusi visų penkių gyvybių Lota **nepradeda
boso lygio nuo pirmos arenos**. Kova pati yra kontrolinis taškas: mygtukas **„Kautis iš
naujo"** paleidžia ją iš karto penktoje arenoje, su penkiomis gyvybėmis ir abiem bosais po
10. Viso ilgo pabėgimo bėgti iš naujo nereikia.

#### Finalas

Nugalėjus abu bosus prasideda trumpas filmukas. Kirpėjas ir veterinarė **atbėga iš skirtingų
arenos pusių ir susiduria** viduryje (**„Ouch!"**, žvaigždutės), aplink stovi dideli šunys,
ir abu supranta, kas atsitiko (**„She won!"**). Lota tuo metu šokinėja iš džiaugsmo,
krinta konfeti, ekrane užsidega **LOTA LAIMĖJO!** — ir tada rodomas laimėjimo langas su
antrašte **BOSS LEVEL COMPLETE!**

**Kontroliniai taškai boso lygyje.** Jie visada įjungti (pasirinkimo nėra), ir jų yra ne
penki, o **penkiolika**: po vieną kiekvienos arenos pradžioje ir dar dešimt jų viduje —
koridoriuje vienas, gatvėje keturi, kirpykloje du, paskutinėje arenoje trys. Aplink
kiekvieną tokį tašką grindys specialiai paliekamos tuščios, kad grįžus būtų kur atsikvėpti.
Pusantros minutės trukmės arena be jų būtų ne sunki, o tiesiog nesąžininga.

**Už finišą nemokama nieko** — boso lygyje nėra piniginės. Perbėgus jį vieną kartą
atiduodamos **abi vaivorykštinės aprangos**.

## Du keliai

**Pirmame lygyje** trasa trijose vietose šakojasi. Du iš tų kelių — kaimynų antras aukštas ir ventiliacija virš
mergaitės kambario — nutiesti virš to paties trasos ruožo, tik kitame aukštyje, todėl
**trunka lygiai tiek pat** ir baigiasi toje pačioje vietoje. Trečias, Londono metro, yra
**trumpinys**: jis trasos ruožą ne pakartoja, o praleidžia, ir todėl užrakintas, kol
nerandamas raktas.

**Antrame lygyje** šakojimasis vienas — lapių urvas po mišku. **Trečiame** jų trys, ir
visi vienodo pavidalo: skylė grindyse, kurią galima peršokti arba į kurią galima
nusileisti (žr. „3 lygis" aukščiau). Trečioji jų turi savyje dar vieną, gilesnę, o jos gale
guli raketinė kuprinė.

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
| 3 · Nuo debesų iki žvaigždžių | +35 🦴 ir 🧸 | **+120 🦴 ir 🧸** |
| 4 · Didysis pabėgimas | visada su jais | — |

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

Pirmo lygio trasoje paslėpta lygiai **15 kaulų**, antro — lygiai **20 žaisliukų**,
trečio — **18 kaulų ir 12 kamuoliukų**. Kiekvienoje vietoje bent po vieną. Dauguma jų —
ant alternatyvių kelių, ant lentynų arba virš žuvėdrų, todėl reikia rizikuoti.

**Trečiame lygyje renkami abu dalykai, ir jie renkami skirtingai.** Kaulai guli trasoje,
tik sunkiau pasiekiamose vietose. Kamuoliukų pagrindiniame kelyje nėra išvis: visi dvylika
laukia žemesniuose keliuose ir bunkeryje po jais, tad kiekvienas kamuoliukas reiškia
apsisprendimą nusileisti. HUD'e tada rodomi du skaitikliai — 🦴 ir 🧸 atskirai.

**Nesvarbu, kurį kelią pasirinksi.** Ten, kur trasa šakojasi, tos vietos kaulas padėtas
**abiejuose** keliuose — tai tas pats kaulas, pasiimtas bet kurioje pusėje jis užsiskaito
vieną kartą. Likę tos vietos kaulai dedami tik ten, kur eina abu keliai. Tas pat galioja ir
trumpiniui: viskas, ką traukinys prašoka, dar kartą padedama stotyje arba vagone. Todėl
surinkti visus 15 galima ir viršumi, ir apačia, ir per ventiliaciją, ir per metro.

- surinkti ne visi → gauni tiek, kiek surinkai
- surinkti visi → **dvigubai** (1 lygis 15 → 30, 2 lygis 20 → 40, 3 lygis 18 🦴 → 36 ir
  12 🧸 → 24)
- pasiekus finišą → premija, priklausanti nuo to, ar bėgta su kontroliniais taškais
  (1 lygis +10 arba +50, 2 lygis +30 arba +100, 3 lygis +35 arba +120 — žr. „Kontroliniai
  taškai")

Visa tai keliauja į **to lygio** piniginę ir kitiems lygiams netinka: pirmas lygis moka
skaniukais, antras — žaisliukais, trečias — ir vienais, ir kitais (premija už finišą
įskaitoma į abi jo pinigines).

## Failai

| Failas | Ką daro |
|---|---|
| `js/util.js` | matematika, spalvos, `localStorage`, WebAudio garsai |
| `js/music.js` | keturios dainos (po vieną lygiui) ir jas grojantis WebAudio grotuvas |
| `js/lota.js` | Lotos piešimas (bėgimas / šuolis / pasilenkimas / sėdėjimas) + visos aprangos |
| `js/props.js` | ~130 pirmo lygio kliūčių, platformų ir dekoracijų piešiniai + jų natūralūs dydžiai |
| `js/props2.js` | ~70 antro lygio piešinių: viešbutis, paplūdimys, tiltas, jūros dugnas, urvas + `drawFox()` |
| `js/props3.js` | ~90 trečio lygio piešinių: dirižablis, bokštas, sodas, šiltnamiai, karjeras, kasykla, raketa, stotis, Mėnulis + raketinė kuprinė |
| `js/props4.js` | ~50 boso lygio piešinių: veterinarija, koridorius, gatvė, kirpykla, skersgatviai, skraidantys įrankiai + `drawVet()`, `drawGroomer()` ir `drawBigDog()` (keturios veislės) |
| `js/zones.js` | 1 lygio 13 vietų + `BRANCHES` (metro, antras aukštas, ventiliacija); `BG` ir grindų piešimas |
| `js/zones2.js` | 2 lygio 17 vietų + `BRANCHES2` (lapių urvas); `BG2` ir naujos grindys |
| `js/zones3.js` | 3 lygio 14 vietų + `BRANCHES3` (trys skylės grindyse, bunkeris po viena iš jų) + `SKY_ROOM`; `BG3` ir grindys |
| `js/zones4.js` | boso lygio **penkios arenos**; `BG4` ir jų grindys. Šakų nėra |
| `js/boss.js` | tik boso lygis: įžanginis filmukas, energija ir pagreitis, persekiotojų atstumas, skraidančių daiktų atlėkimas, kliūčių ženklai (▲ / ▼ ir kraštinis įspėjimas) |
| `js/fight.js` | tik boso lygis: trys scenos (kirpykla, arenos susirinkimas, finalas) ir pati boso kova — krentantys kaulai, gyvybės, bosų juostos |
| `js/levels.js` | keturi lygiai, `TRACKS` (kas iš ko pastatoma), atrakinimo taisyklės, premijos už finišą, lygių nuotraukos |
| `js/level.js` | trasos generatorius + fizikos konstantos (`PHYS`) |
| `js/game.js` | variklis: įvestis, fizika, kamera, piešimas |
| `js/ui.js` | ekranai, HUD (boso energija ir persekiotojų juosta taip pat), aprangų parduotuvė |
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
- **Dainos** — `SONGS` (`js/music.js`): `bpm`, `lead`, `bass`, `drums`; bendras garsumas —
  `Music.VOL`, greitėjimas bėgant — `Music.setRate()`
- **Kur pradžios ekrane sėdi Lota** — `lobbyFocus` ir `lobbySize` (`js/game.js`,
  `resize()`): gulsčiame ekrane mygtukai užima vidurį, tad ji, jos kilimėlis ir lygio
  numeris nukeliauja į kairį kraštą ir, jei ten ankšta, susitraukia; stačiame ekrane
  viskas lieka viduryje
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
  (`js/game.js`). Nė vienoje trasoje jis dabar nenaudojamas: antrame lygyje posūkio į
  dešinę nebėra, Lota tiesiog išbėga ant tilto
- **Trasos aukštis** — `stairsUp` / `stairProp`, `climb: {n, h}` / `riseProp`,
  `dropEnd` / `dropTo` / `dropProp` / `dropRoom` zonos įraše (`js/zones2.js`); pačios
  pakopos — `P.riser()` ir `flight()` (`js/level.js`)
- **Jūros lygis seklumoje** — `surfaceY` ir `climb` zonoje `shallows` (`js/zones2.js`)
- **Vietos paaiškinimas** — `sub:` zonos arba kambario įraše (`js/zones3.js`); rodo
  `updateZone()` ir `switchLayer()` (`js/game.js`)
- **Durys tarp vietų** — `exit:` zonoje; jų dydžiai — `GATEWAY_SIZE` (`js/level.js`),
  patys piešiniai — `doorway()` ir jo vartotojai (`js/props3.js`)
- **Raketos kilimas** — `launch: 1` zonoje (`js/game.js` krusteli ekraną) ir `up`
  reikšmė `rocket` zonos `bg()` viduje (`js/zones3.js`)
- **Aprangos ir jų vietos** — `SKINS` (`js/lota.js`): `level`, `cost: {b, t}` ir `from:`,
  kuris parduotuvėje rodomas po pavadinimu; lentyna rikiuojama pagal kainą
  `Levels.shop()` (`js/levels.js`)
- **Trys skylės 3 lygyje** — `BRANCHES3` (`js/zones3.js`): `drop`, `enterSec`, `sec`,
  `rooms[].share`
- **Gilesnė skylė ir bunkeris** — `BRANCHES3.conveyor.deep` + `deepRoom` (`js/zones3.js`);
  ją stato `buildDeep()` (`js/level.js`), kuris pats susitraukia iki to, kiek vietos
  likę viršuje esančiame kambaryje
- **Raketinė kuprinė** — `SKY_RISE`, `SKY_HOVER`, `JET_GLIDE`, `JET_SPEED`
  (`js/level.js`); skrydis ir nusileidimas — `Game.liftOff()` ir `Game.stepFly()`
  (`js/game.js`); kur nusileidžiama — `jetLand: 1` zonoje (`js/zones3.js`)
- **Kamuoliukai 3 lygyje** — `toys:` lygio įraše `TRACKS` (`js/levels.js`); jie dedami tik
  ant ne `main` sluoksnių, `buildWorld()` pabaigoje
- **Laiptai žemyn** — `stairsDown` / `stairProp` / `stairSign` zonoje (`js/zones3.js`)
- **Greitis** — `phys` lygio įraše `TRACKS` (`js/levels.js`); numatytasis — `PHYS`
  (`js/level.js`)
- **Sunkumas** — `diff:` zonoje (0…1) valdo kliūčių tipų dažnį, o `rest` ir `minRest`
  lygio įraše — kiek reakcijos laiko lieka tarp jų
- **Šuolis** — `PHYS.JUMP_V`, `PHYS.GRAV`
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

window.BOT_LEVEL = 4; runBot(600);    // boso lygis — botas pats naudoja kiekvieną ⚡;
                                      // scenos prabėga pačios, o pabaigoje botas dar
                                      // pažaidžia minutę boso kovos (`fight:` rezultate).
                                      // `window.BOT_FIGHT = 0` ją praleidžia
window.BOT_NOBOOST = 1; runBot(600);  // ir taip, kaip žaistų tas, kas ⚡ niekada nespaudžia:
                                      // reason:"caught" jau koridoriuje

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
