#!/usr/bin/env bash
# Rebuilds the music from its original sources.
#
# The eight .m4a files next to this script are committed, so a clone already has
# them and nothing here has to be run to play the game. This exists to record
# where each recording came from and to rebuild them: it downloads the originals
# from Wikimedia Commons and re-encodes them exactly the way the committed ones
# were made, byte for byte.
#
# The files have to stay committed. GitHub Pages serves the game straight out of
# web/, so anything missing from the repository is a 404 on the phone and the
# game plays nothing.
#
#   cd web/audio && ./fetch.sh          # fetch whatever is missing
#   cd web/audio && ./fetch.sh --force  # rebuild everything from scratch
#
# Needs curl and ffmpeg (brew install ffmpeg). Without the files the game runs
# fine, just silently: js/music.js gives up after the whole shelf fails to load.
#
# Every licence is recorded in CREDITS.md. Seven of the eight are public domain
# or CC0; the Tchaikovsky is CC BY 3.0 and must keep its credit. If you add a
# recording here, check that recording's own licence first — a classical work
# being old says nothing about who owns the performance of it. Check who is
# *playing*, too: the Minuet in G that used to sit here was public domain and
# perfectly legal, and was performed by a 1970s four-voice square-wave
# synthesiser, which is exactly the sound this shelf exists to get away from.
set -euo pipefail
cd "$(dirname "$0")"

command -v curl   >/dev/null || { echo "need curl";  exit 1; }
command -v ffmpeg >/dev/null || { echo "need ffmpeg (brew install ffmpeg)"; exit 1; }

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

UA='LotaGoGo/1.0 (https://github.com/arvis00/Lota-Go-Go; game asset fetch)'
C='https://upload.wikimedia.org/wikipedia/commons'

# Everything is levelled to this. The recordings come from eight different
# sources and arrived nearly 18 dB apart — one of them clipping, another so
# quiet it vanished under the sound effects. -18 LUFS is a normal resting
# level for music that has to sit *under* something else.
I=-18; TP=-2.0; LRA=11

# name|source url|kbps
# 48k for the two Nachtmusik files: their sources are already about that, and
# encoding higher would only spend bytes inventing detail that is not there.
TRACKS=(
  "nachtmusik-allegro|$C/6/68/Mozart_K525_Serenade_in_G_Major_1_-_Allegro.ogg|48"
  "nachtmusik-rondo|$C/3/3b/Mozart_K525_Serenade_in_G_Major_4_-_Rondo.ogg|48"
  "fur-elise|$C/7/7b/FurElise.ogg|64"
  "vivaldi-spring|$C/1/18/The_Modena_Chamber_Orchestra_-_Vivaldi%27s_Spring%2C_RV_269_-_I._Allegro.ogg|64"
  "mountain-king|$C/b/bb/Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg|64"
  "gymnopedie-1|$C/9/90/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg|64"
  "blue-danube|$C/9/91/Strauss%2C_An_der_sch%C3%B6nen_blauen_Donau.ogg|64"
  "sugar-plum-fairy|$C/9/9d/Tchaikovsky_-_Dance_of_the_Sugar_Plum_Fairy_-_The_Nutcracker.ogg|64"
)

# pull one "key" : "value" pair out of ffmpeg's loudnorm JSON
jget() { grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"$/\1/'; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for row in "${TRACKS[@]}"; do
  IFS='|' read -r name url kbps <<<"$row"
  if [ -f "$name.m4a" ] && [ "$FORCE" -eq 0 ]; then echo "have  $name.m4a"; continue; fi
  ext="${url##*.}"
  printf 'fetch %-20s ' "$name"
  curl -sSLf -A "$UA" -o "$tmp/$name.$ext" "$url"

  # pass 1: measure how loud this recording actually is
  probe="$(ffmpeg -hide_banner -i "$tmp/$name.$ext" \
            -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | tail -14)"
  mi=$(echo "$probe"  | jget input_i)
  mtp=$(echo "$probe" | jget input_tp)
  mlra=$(echo "$probe"| jget input_lra)
  mth=$(echo "$probe" | jget input_thresh)
  off=$(echo "$probe" | jget target_offset)

  # pass 2: encode, correcting by exactly that much. mono AAC — this is
  # background music on a phone speaker, and stereo would double the
  # download for width nobody is going to hear.
  ffmpeg -v error -y -i "$tmp/$name.$ext" \
    -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true" \
    -ac 1 -ar 44100 -c:a aac -b:a "${kbps}k" -movflags +faststart "$name.m4a"
  printf '%6s  (was %s LUFS)\n' "$(du -h "$name.m4a" | cut -f1)" "$mi"
done

echo
echo "done — $(ls -1 ./*.m4a 2>/dev/null | wc -l | tr -d ' ')/8 tracks, $(ls -l ./*.m4a | awk '{s+=$5} END {printf "%.1f MB", s/1048576}') total"
