# Muzikos failai

Aštuoni klasikos įrašai, kuriuos groja `js/music.js`.

**Failai yra sukommitinti** (~10,6 MB) ir turi būti: žaidimą serveruoja GitHub
Pages tiesiai iš `web/`, tad ko nėra repozitorijoje, to telefone nėra — 404.
Kurį laiką jie buvo laikomi ne git'e, ir tada paskelbtas žaidimas prašė aštuonių
failų, kurių niekas nebuvo įkėlęs, ir negrojo nieko.

Tai paprasti git objektai, ir tai svarbu: `.gitattributes` daugumą dvejetainių
failų siunčia į LFS, bet **Pages LFS rodyklių neišskleidžia** — per LFS šie
failai nusileistų kaip tekstiniai rodyklių failiukai ir grotų tylą.

Perkurti juos iš originalų (reikia `curl` ir `ffmpeg`):

```sh
cd web/audio && ./fetch.sh --force
```

## Kodėl `.m4a`, o ne originalus `.ogg`

**iPhone Safari nedekoduoja Ogg Vorbis.** Žaidimas daugiausia žaidžiamas
telefone, tad ogg lentyna ten būtų tiesiog tylėjusi ir niekas to nebūtų
pasakęs. AAC groja visur, o Apple įrenginiuose jis yra gimtasis formatas.
Suvedus į mono, 64 kbps, failai sumažėja maždaug perpus. Abu *Nachtmusik* failai
yra 48 kbps, nes jų originalai jau buvo maždaug tokie — koduoti aukščiau reikštų
eikvoti baitus detalėms, kurių ten nėra.

## Vienodas garsumas

Aštuoni įrašai iš aštuonių skirtingų šaltinių atėjo **beveik 18 dB skirtingo
garsumo**: Grieg'as kirto per viršų (+1,2 dBTP), o vienas Mozartas buvo toks
tylus, kad dingdavo po garso efektais — grojaraščiui apsivertus muzika
šokteldavo. Dabar visi suvesti į **-18 LUFS** (EBU R128, du praėjimai), t. y. į
lygį, kuriame muzika groja *po* kažkuo kitu. Liko 2,6 dB sklaida.

Tai daroma vieną kartą, `fetch.sh` metu, o ne žaidimo eigoje.

## Licencijos

**Kūrinio amžius nieko nelemia — svarbi įrašo licencija.** Klasikinė pjesė yra
viešame naudojime todėl, kad kompozitorius mirė seniai, bet **įrašas turi savo
atskirą autorių teisę**, priklausančią atlikėjui. Naujas Mozarto atlikimas
**nėra** laisvas vien dėl to, kad Mozartas laisvas. Kiekvienas failas tikrintas
po vieną. Prieš dedant į lentyną naują įrašą, reikia patikrinti būtent to
įrašo licenciją.

| Failas | Kūrinys | Kompozitorius | Atlikimas / šaltinis | Licencija |
|---|---|---|---|---|
| `nachtmusik-allegro.m4a` | *Eine kleine Nachtmusik*, K.525 — I. Allegro | Mozart | Musopen | Public domain |
| `nachtmusik-rondo.m4a` | *Eine kleine Nachtmusik*, K.525 — IV. Rondo | Mozart | Musopen | Public domain |
| `fur-elise.m4a` | *Für Elise*, WoO 59 | Beethoven | V. Gao | Public domain |
| `vivaldi-spring.m4a` | *Keturi metų laikai*: Pavasaris, RV 269 — I. Allegro | Vivaldi | The Modena Chamber Orchestra | Public Domain Mark |
| `mountain-king.m4a` | *Kalnų karaliaus menėje* (Peer Gynt) | Grieg | Musopen Symphony Orchestra | Public domain |
| `gymnopedie-1.m4a` | *Gymnopédie* Nr. 1 | Satie | Robin Alciatore / Musopen | Public domain |
| `blue-danube.m4a` | *Prie gražiojo mėlynojo Dunojaus*, op. 314 | Johann Strauss II | European Archive / Musopen | CC0 |
| `sugar-plum-fairy.m4a` | *Cukrinės fėjos šokis* (Spragtukas) | Čaikovskis | Free Classical Music | **CC BY 3.0** |

Visi originalai paimti iš Wikimedia Commons; tikslūs adresai — `fetch.sh`.

**Svarbu ne tik licencija, bet ir kas groja.** Anksčiau čia buvo Menuetas G-dur
(BWV Anh. 114) — licencija nepriekaištinga (CC0), bet grojo jį *Gooch Synthetic
Woodwind*, keturių balsų kvadratinių bangų sintezatorius iš PLATO sistemos.
Tai buvo lygiai tas skambesys, dėl kurio šios lentynos apskritai imtasi, tad
įrašas pakeistas tikru orkestru.

## Privaloma nuoroda

Septyni įrašai nereikalauja jokios nuorodos. **Vienas reikalauja:**

> *Dance of the Sugar Plum Fairy* (Čaikovskis) — Free Classical Music,
> [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

Jeigu `sugar-plum-fairy.m4a` iš žaidimo išimamas, šios nuorodos nebereikia.
