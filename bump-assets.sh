#!/bin/sh
# Aggiorna ?v=<hash> su CSS e JS in index.html, così i browser non riusano versioni in cache dopo un aggiornamento.
# Uso: ./bump-assets.sh   (poi commit e push)
cd "$(dirname "$0")" || exit 1
for f in assets/style.css assets/app.js; do
  h=$(md5sum "$f" 2>/dev/null | cut -c1-8 || md5 -q "$f" | cut -c1-8)
  sed -i.bak -E "s#($f)(\?v=[0-9a-f]+)?\"#\1?v=$h\"#" index.html && rm -f index.html.bak
done
grep -n 'assets/\(style.css\|app.js\)' index.html
