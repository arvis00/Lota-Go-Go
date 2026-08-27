# Lota Go 🐾

2D endless-runner stiliaus žaidimas su juoda šnaucere Lota — viena ilga trasa nuo
namų iki Londono finišo. Grynas HTML5 + Canvas, be jokių bibliotekų ir be paveikslėlių:
visa grafika piešiama kodu (vektoriai), todėl visas žaidimas telpa į ~90 KB.

## Paleidimas

**Kompiuteryje:** tiesiog atidarykite `index.html` naršyklėje.

**Telefone / iPad (tame pačiame Wi-Fi):** paleiskite serverį šiame kataloge ir
telefone atidarykite `http://<kompiuterio-IP>:8777`

```bash
python3 -m http.server 8777
```

iPhone/iPad: Safari → Share → „Add to Home Screen" — žaidimas veiks per visą ekraną.

## Valdymas

| Veiksmas | Telefonas / iPad | Kompiuteris |
|---|---|---|
| Šokti | swipe **aukštyn** (arba bakstelėti) | `↑` / `W` / `Space` |
| Pasilenkti | swipe **žemyn** (laikyti pirštą) | `↓` / `S` |
| Pauzė | mygtukas viršuje | `Esc` / `P` |

Lota bėga pati — kryptis nevaldoma.

## Kaip veikia trasa

Trasa yra **viena, fiksuota ir vienoda kiekvieną kartą** (deterministinis seed
`20260827` faile `js/level.js`). 13 vietų iš eilės:

`Lotos namai → Kiemas → Kaimynų namas → Rudens kiemas → Senelės namas → Miesto gatvė →
Parkas → Vakaro gatvė → Prekybos centras → Autobusas → Oro uostas → Lėktuvas → Londonas`

Pilnas nubėgimas trunka **~2 min 50 s**; greitis auga nuo 330 iki 730 px/s.

**Sąžiningumo garantija.** Kliūtys dėliojamos ne pikseliais, o *laiku*: generatorius
žino, koks bus greitis konkrečioje trasos vietoje, ir tarp kliūčių visada palieka bent
0,46 s reakcijos. Visi šuoliai telpa į šuolio lanką (aukštis 188 px, oro laikas 0,755 s),
o alternatyvūs keliai (lentynos, šakos, markizės) yra **vienpusės platformos** — pro jas
galima prabėgti apačia, todėl niekada nesusidaro aklavietė.

**Kas pavojinga, o kas — tik dekoracija.** Kiekvienas objektas turi *vieną* reikšmę
visame žaidime: arba į jį galima atsitrenkti, arba jis yra fonas — niekada abu. Dekoracijos
yra plokščios (≤15 px aukščio) ir guli ant grindų: žolė, akmenukai, lapai, kelio ženklinimas,
Lotos pėdutės. Todėl galioja paprasta taisyklė: **jei objektas stovi — jį reikia peršokti
arba pralįsti**. Kliūtys papildomai meta šešėlį ant grindų ir turi vos pastebimą kontūrą.
`assertPropRoles()` faile `js/level.js` neleidžia šiai taisyklei sugesti — jei koks nors
objektas atsidurtų abiejuose sąrašuose, konsolėje pasirodytų klaida.

## Skanėstai

Trasoje paslėpta lygiai **15 kaulų**, po vieną kiekvienoje vietoje (+ po vieną papildomą
oro uoste ir Londone). Dauguma jų — ant alternatyvių kelių, virš duobių arba
trumpiniuose, todėl reikia rizikuoti.

- surinkti < 15 → gauni tiek, kiek surinkai
- surinkti visi 15 → **dvigubai** (15 → 30)
- pasiekus finišą → **+10**

## Failai

| Failas | Ką daro |
|---|---|
| `js/util.js` | matematika, spalvos, `localStorage`, WebAudio garsai |
| `js/lota.js` | Lotos piešimas (bėgimas / šuolis / pasilenkimas / sėdėjimas) + 10 aprangų |
| `js/props.js` | ~70 kliūčių, platformų ir dekoracijų piešiniai |
| `js/zones.js` | 13 vietų: paletės, parallax fonai, grindų stiliai, kliūčių rinkiniai |
| `js/level.js` | trasos generatorius + fizikos konstantos (`PHYS`) |
| `js/game.js` | variklis: įvestis, fizika, kamera, piešimas |
| `js/ui.js` | ekranai, HUD, aprangų parduotuvė |
| `dev/bot.js` | testinis botas (žaidimo neįkeliamas) |

## Derinimas

Dažniausiai keičiami dalykai:

- **Trasos ilgis** — `sec:` reikšmės kiekvienoje zonoje (`js/zones.js`)
- **Greitis** — `PHYS.V_MIN`, `PHYS.V_MAX`, `PHYS.X_FULL` (`js/level.js`)
- **Sunkumas** — `diff:` zonoje (0…1) valdo kliūčių tipų dažnį ir tarpus
- **Šuolis** — `PHYS.JUMP_V`, `PHYS.GRAV`
- **Aprangos ir kainos** — `SKINS` masyvas (`js/lota.js`)

## Testinis botas

`dev/bot.js` — refleksinis botas, kuris pats pereina visą trasą. Naudojamas patikrinti,
ar trasa apskritai įveikiama ir kiek yra reakcijos atsargos.

Naršyklės konsolėje:

```js
var s=document.createElement('script'); s.src='/dev/bot.js'; document.head.appendChild(s);
runBot(400);                 // idealios reakcijos — turi grąžinti state:"win"
window.BOT_EVERY = 12; runBot(400);   // ~100 ms vėlavimas — vis dar įveikia
inspect(15000);              // kas yra trasoje ties nurodyta pozicija
```

Progreso išsaugojimas — `localStorage`, raktas `lotago.save.v2`.
