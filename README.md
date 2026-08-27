# Lota Go Go! 🐾

**▶︎ Žaisti: https://arvis00.github.io/Lota-Go-Go/**

2D endless-runner stiliaus žaidimas su juoda šnaucere Lota — viena ilga trasa nuo namų
iki Londono finišo. Grynas HTML5 + Canvas, be jokių bibliotekų ir be paveikslėlių: visa
grafika piešiama kodu, todėl visas žaidimas telpa į ~90 KB ir veikia telefone, planšetėje
ir kompiuteryje.

Šokti — `↑` / `W` / `Space` arba mygtukas **▲**. Pasilenkti — `↓` / `S` arba **▼**.
Lota bėga pati.

Visas žaidimo aprašymas — trasa, kontroliniai taškai, skanėstai, derinimo parametrai —
yra [`web/README.md`](web/README.md).

## Kas kur

| Katalogas | Kas ten |
|---|---|
| `web/` | pats žaidimas — `index.html`, `css/`, `js/`, testinis botas `dev/` |
| visa kita | tuščias Unity 6 HDRP projektas (`hdrp-blank` šablonas), žaidimo jame nėra |

## Publikavimas

Kiekvienas `main` šakos pakeitimas kataloge `web/` automatiškai išleidžiamas į GitHub
Pages — žr. [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Publikuojamas
tik `web/` turinys.

Vietoje paleidžiama be jokios kompiliacijos:

```bash
cd web && python3 -m http.server 8777
```
