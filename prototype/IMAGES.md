# Rezeptbilder im Prototyp

Internes Manifest und Lizenznotiz. **Nicht in der Benutzeroberfläche angezeigt.** Fotografennamen und Ursprungs-URLs sind nur hier und in `images/recipes/manifest.json` festgehalten.

**Stand:** 24. November 2026, Europe/Zurich.

## Lizenzprüfung (vor der Auswahl)

Geprüft am 24. November 2026 (Europe/Zurich). Es wurden nur Quellen verwendet, bei denen **keine Urhebernennung Pflicht** ist. Wikimedia und CC-BY sind ausgeschlossen. Die APIs von Unsplash und Pexels wurden **nicht** genutzt (Unsplash-API verlangt Hotlinking und Namensnennung; Pexels-API braucht ein kostenloses Konto). Beschafft wurden die Dateien über öffentliche Seiten bzw. öffentliche Download-Links (`images.pexels.com`), einmalig heruntergeladen und lokal gebündelt.

### Unsplash License

Quellen: [Unsplash License](https://unsplash.com/license) und das Unsplash Help Center (die Lizenzseite war beim direkten Abruf durch Bot-Schutz/Anubis zeitweise nicht lesbar).

- Kostenlose Nutzung für private und kommerzielle Projekte, auch in Apps.
- Namensnennung ist nicht Pflicht, wird aber geschätzt.
- Unveränderte Fotos dürfen nicht als solche verkauft werden (z. B. als Poster oder Druck ohne eigene Leistung).
- Kein Aufbau eines konkurrierenden Stock-Angebots.
- Die Lizenz deckt keine Marken, Logos, erkennbare Personen (Modellrechte) und keine abgebildeten urheberrechtlich geschützten Werke.
- Offline-Bündelung heruntergeladener Dateien ist unter der Lizenz zulässig. Die Unsplash-API (hier ungenutzt) verlangt Hotlinking und Attribution.

In dieser Runde wurde **kein Unsplash-Foto** verwendet; die Prüfung gilt trotzdem, falls später welche dazukommen.

### Pexels License

Quelle: [Pexels License](https://www.pexels.com/license/).

- Kostenlose Nutzung, Bearbeitung erlaubt, auch auf Websites, Blogs und in Apps. Namensnennung ist nicht Pflicht.
- Unveränderte Fotos dürfen nicht einzeln/unverändert verkauft werden.
- Keine beleidigende Verwendung erkennbarer Personen; keine suggerierte Unterstützung durch abgebildete Personen.
- Nicht als Stock-Sammlung weitergeben. Markenrechte sind nicht abgedeckt.
- Offline-Bündelung heruntergeladener Dateien ist zulässig.

## Technische Umsetzung

- Kein Hotlinking, kein `fetch` in der App. Dateien liegen unter `images/recipes/` (`*.webp` ca. 800 px breit, `*-thumb.webp` ca. 400 px, Seitenverhältnis 4:3).
- Beim Umrechnen (Pillow) werden EXIF/GPS nicht übernommen; die WebP-Dateien enthalten keine GPS-Daten.
- Der Cloudflare-Worker bettet die Dateien als Base64 ein und liefert sie unter `img-src 'self'` aus. CSP bleibt `connect-src 'none'`.
- In der UI: Listen-, Detail- und Plan-Miniaturen mit `alt` (Rezepttitel), `loading="lazy"`, festem Seitenverhältnis gegen Layout Shift. Neutraler Platzhalter (farbige Fläche und Blatt-Icon), wenn kein passendes Foto vorliegt.

## Auswahl (12 Fotos, alle Pexels)

| Rezept | Foto | Fotograf/in | Ursprungsseite | Abgerufen |
|--------|------|-------------|----------------|-----------|
| `oven_salmon` | Pexels 20182302 | Valeria Boltneva | https://www.pexels.com/photo/potatoes-and-fish-in-a-meal-20182302/ | 2026-11-24 |
| `thai_curry` | Pexels 10527603 | Nourishment DECODED | https://www.pexels.com/photo/cooked-food-on-white-ceramic-bowl-10527603/ | 2026-11-24 |
| `pho` | Pexels 6646022 | Ana Karotkaya Photography | https://www.pexels.com/photo/cooked-food-in-the-bowl-6646022/ | 2026-11-24 |
| `summer_rolls` | Pexels 6646031 | Ana Karotkaya Photography | https://www.pexels.com/photo/spring-rolls-on-the-plate-6646031/ | 2026-11-24 |
| `birchermuesli` | Pexels 6133456 | Regina Ferraz | https://www.pexels.com/photo/oatmeal-served-for-breakfast-6133456/ | 2026-11-24 |
| `yogurt_bowl` | Pexels 4220141 | Javier Disabato | https://www.pexels.com/photo/healthy-breakfast-bowl-with-oatmeal-and-fruits-4220141/ | 2026-11-24 |
| `lentil_curry` | Pexels 28286241 | Nic Wood | https://www.pexels.com/photo/vegan-lentil-dhal-28286241/ | 2026-11-24 |
| `scrambled_eggs` | Pexels 32134464 | Anthony Rahayel | https://www.pexels.com/photo/scrambled-eggs-and-avocado-on-toast-with-greens-32134464/ | 2026-11-24 |
| `chicken_bowl` | Pexels 17308548 | Vitaliy Haiduk | https://www.pexels.com/photo/close-up-of-a-dish-with-rice-and-chicken-in-sauce-topped-with-spring-onion-17308548/ | 2026-11-24 |
| `miso_salmon` | Pexels 39641632 | Valeria Boltneva | https://www.pexels.com/photo/delicious-glazed-salmon-with-spinach-and-edamame-39641632/ | 2026-11-24 |
| `shakshuka` | Pexels 35672951 | Valeria Boltneva | https://www.pexels.com/photo/delicious-shakshuka-in-cast-iron-skillet-35672951/ | 2026-11-24 |
| `burrito_bowl` | Pexels 16123122 | Raphael Loquellano | https://www.pexels.com/photo/close-up-of-salad-16123122/ | 2026-11-24 |

**Dateigrösse gesamt:** 919072 Bytes (898 KB), davon Vollbilder 687 KB und Miniaturen 210 KB. 12 Rezepte × 2 Dateien = 24 WebP.

## Rezepte ohne passendes Foto (neutraler Platzhalter)

- `quinoa_pan` (Quinoa-Gemüsepfanne mit Kichererbsen): kein Foto, das das Gericht klar und ohne irreführende Zutaten zeigt.
- `mushroom_polenta` (Pilzpfanne mit Polenta): kein Foto mit erkennbaren Pilzen *und* Polenta.
- `hummus_wrap` (Hummus-Gemüse-Wrap): kein schlichtes, passendes Wrap-Foto (Kandidaten passten nicht oder waren irreführend).

Namensnennung in der App ist bewusst unterlassen (Lizenz erlaubt das; intern bleibt die Herkunft dokumentiert).
