# Edovita – Logo-Konzepte («edo vita» = «ich esse für das Leben»)
1. Blatt + Gabel = V mit Herzschlag: Frische, Essen, Gesundheit. Loader: Blatt und Gabel fliegen von links/rechts ein, treffen sich im V, dann zeichnet sich die Pulslinie (stroke-dashoffset) – Loop.
2. Segment-Kreis (Teller/Uhr): Ausgewogene Mahlzeit + Zeit/Langlebigkeit. Loader: 8 Segmente setzen sich nacheinander im Uhrzeigersinn zusammen und lösen sich wieder auf; Blatt pulsiert. Bester Spinner-Kandidat.
3. Spross-«e»: Wachstum, Natürlichkeit, ruhig und vertrauenswürdig. Loader: Linie des «e» zeichnet sich, am Ende spriessen die zwei Blätter (scale 0→1), dann verblassen.
4. Partner-Herz: Zwei Blätter (grün/koralle) = Partner-Modus. Loader: Blätter schwingen auseinander und wieder zusammen, Überlappung leuchtet beim «Treffen» auf.

## Lottie vs. CSS/SVG
Empfehlung: Vorerst kein Lottie. Alle vier Loader sind mit SVG + CSS-Keyframes umsetzbar (wenige KB, kein Bundle-Zuwachs, läuft in Capacitor-WebView problemlos, respektiert prefers-reduced-motion). lottie-web wiegt ca. 250 KB min (~60–80 KB gzip, light-Variante kleiner), @lottiefiles/dotlottie-web nutzt WASM (~mehrere hundert KB). Beides funktioniert in Capacitor (reiner Web-Code), lohnt sich aber erst für komplexe Illustrationen/Onboarding-Animationen aus After Effects. Später bei Bedarf nachrüsten.

## Sound-Logo (3 Ideen)
A «Aufbruch»: C–E–G–C' aufsteigend (Dur-Arpeggio), Marimba, hell und motivierend (~1 s).
B «Erfolg»: G–C'–E' + kurzer Glockenschlag, Celesta/Glockenspiel, für erreichte Ziele.
C «Zusammen» (Partner): zwei Stimmen, E–G und C–E, die auf C' zusammenfinden; Kalimba + weiches Pad, warm, mit leichtem asiatischem Pentatonik-Touch.
Gratis produzieren: eigene Komposition in GarageBand, LMMS, BandLab oder Bosca Ceoil; Instrumente aus mitgelieferten Libraries bzw. CC0-Samples (z.B. Freesound mit CC0-Filter, Sonatina Symphonic Orchestra), Export mit Audacity. Kurze Dur-Arpeggios sind nicht schutzfähig; trotzdem keine bekannten Jingles nachahmen (Intel, Netflix, McDonald's) und KI-Generatoren nur mit klarer kommerzieller Lizenz nutzen. Klang kann beim IGE als Hörmarke angemeldet werden.

## Markenschutz
Logos werden nicht patentiert, sondern beim IGE als Marke eingetragen (Wort-/Bildmarke bzw. kombinierte Marke; Klassen z.B. 9 App, 42 Software/SaaS, 44 Ernährungsberatung). Kurze Websuche: «Edovita» wird von einer legitimierten Dietistin in Solna (Schweden, edovita.se) genutzt – gleiche Branche, Konfliktpotenzial bei EU/Schweden-Ausdehnung; «Edovit» ist ein indisches Multivitamin-Präparat; «Eat ViTA» ein Londoner Lebensmittel-Lieferdienst. Keine App «Edovita» gefunden. Vor Anmeldung Swissreg, WIPO Global Brand Database und EUIPO TMview prüfen (evtl. Ähnlichkeitsrecherche beim IGE). Nichts angemeldet/gekauft.
