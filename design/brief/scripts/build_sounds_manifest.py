#!/usr/bin/env python3
"""Build design/brief/sounds-ship-manifest.csv from sounds/ (nur lokal beim Projektinhaber, nicht im Repo)."""
from __future__ import annotations

import csv
from pathlib import Path

SOUNDS = Path("design/sounds")
OUT = Path("design/brief/sounds-ship-manifest.csv")
FIELDS = [
    "id",
    "rel_path",
    "role",
    "label_de",
    "default",
    "ki_generated",
    "credit",
    "include_phase1",
    "notes",
]

MULDJORD = "Drum samples provided by DrumGizmo.org"
ACE = "KI-generiert mit ACE-Step v1 (Apache-2.0); als KI kennzeichnen"

# Explicit excludes (path prefixes / globs as path parts)
EXCLUDE_PREFIXES = (
    "ai_hymnen_v1/raw/",
    "stile_v3/_discarded/",
    "stile_v3/samples/",
)
EXCLUDE_CONTAINS = (
    "hymne_AI_H2",
    "hymne_AI_H3",
)

# Defaults from prep-checklist
DEFAULT_IDS = {
    "hymne_AI_H1",
    "hymne_AI_H5",
    "hymne_AI_H4",
    "stile_v2_rock_v3",
    "stile_v2_rock_v4",
    "stile_v2_hiphop_v2",
}

LABELS = {
    "A_aufbruch": "Aufbruch (Sting A)",
    "B_erfolg": "Erfolg (Sting B)",
    "C_zusammen": "Zusammen (Sting C)",
    "hymne_AI_H1": "Hymne H1 – Duett «E-do-VI-ta»",
    "hymne_AI_H4": "Hymne H4 – Whoa-oh-Pop",
    "hymne_AI_H5": "Hymne H5 – Epischer Trailer-Chor",
    "hymne_AI_H1_s1": "Hymne H1 Alt-Take s1",
    "hymne_AI_H1_s2": "Hymne H1 Alt-Take s2",
    "hymne_AI_H4_s2": "Hymne H4 Alt-Take s2",
    "hymne_AI_H4_s3": "Hymne H4 Alt-Take s3",
    "hymne_AI_H5_s2": "Hymne H5 Alt-Take s2",
    "hymne_AI_H5_s3": "Hymne H5 Alt-Take s3",
}


def should_exclude(rel: str) -> bool:
    if any(rel.startswith(p) for p in EXCLUDE_PREFIXES):
        return True
    if any(x in rel for x in EXCLUDE_CONTAINS):
        return True
    # skip non-audio and tooling
    if not rel.endswith(".mp3"):
        return True
    # skip demos as ship? keep demos as include_phase1=no catalog
    return False


def role_for(rel: str) -> str:
    name = Path(rel).name
    if name.startswith("hymne_AI_"):
        return "hymne"
    if name in ("A_aufbruch.mp3", "B_erfolg.mp3", "C_zusammen.mp3"):
        return "sting"
    if "_sting" in name or name.endswith("_sting.mp3"):
        return "sting"
    if name.startswith("melodie_"):
        return "jingle"
    if "/demo_" in rel or name.startswith("demo_"):
        return "ui"
    return "jingle"


def label_for(rel: str) -> str:
    stem = Path(rel).stem
    if stem in LABELS:
        return LABELS[stem]
    # humanize
    parts = stem.replace("_", " ")
    if rel.startswith("stile_v2/"):
        return f"Stil v2 – {parts}"
    if rel.startswith("stile_v3/"):
        return f"Stil v3 – {parts}"
    if rel.startswith("stile/"):
        return f"Stil v1 – {parts}"
    if rel.startswith("melodien_"):
        return f"Melodie – {parts}"
    return parts


def credit_for(rel: str) -> str:
    if rel.startswith("ai_hymnen_v1/"):
        return ACE
    if rel.startswith("stile_v2/") or rel.startswith("stile_v3/") or rel.startswith("stile/") or rel.startswith("melodien_"):
        return MULDJORD
    if Path(rel).name in ("A_aufbruch.mp3", "B_erfolg.mp3", "C_zusammen.mp3"):
        return MULDJORD
    return ""


def make_id(rel: str) -> str:
    stem = Path(rel).stem
    if rel.startswith("ai_hymnen_v1/alt/"):
        return f"ai_alt_{stem}"
    if rel.startswith("ai_hymnen_v1/"):
        return stem
    if rel.startswith("stile_v3/"):
        return f"stile_v3_{stem}"
    if rel.startswith("stile_v2/"):
        return f"stile_v2_{stem}"
    if rel.startswith("stile/"):
        return f"stile_v1_{stem}"
    if rel.startswith("melodien_v1/"):
        return f"mel_v1_{stem}"
    if rel.startswith("melodien_v2/"):
        return f"mel_v2_{stem}"
    if rel.startswith("melodien_v3/"):
        return f"mel_v3_{stem}"
    return stem


def include_phase1(rel: str, rid: str) -> str:
    # Favorites + A/B/C + defaults
    name = Path(rel).name
    if name in ("A_aufbruch.mp3", "B_erfolg.mp3", "C_zusammen.mp3"):
        return "yes"
    if rid in DEFAULT_IDS:
        return "yes"
    # stile_v3 copies of hiphop_v2 / rock – note only, not double-ship as default
    if rel in ("stile_v3/hiphop_v2.mp3", "stile_v3/rock_v3.mp3", "stile_v3/rock_v4.mp3"):
        return "yes"  # same favorites mirrored; coding can pick one path
    # matching stings for defaults
    if rid in (
        "stile_v2_rock_v3_sting",
        "stile_v2_rock_v4_sting",
        "stile_v2_hiphop_v2_sting",
        "stile_v3_rock_v3_sting",
        "stile_v3_rock_v4_sting",
        "stile_v3_hiphop_v2_sting",
    ):
        return "yes"
    return "no"


def is_default(rid: str, rel: str) -> str:
    if rid in DEFAULT_IDS:
        return "yes"
    return "no"


def notes_for(rel: str, rid: str) -> str:
    notes = []
    if rid in ("hymne_AI_H1", "hymne_AI_H4", "hymne_AI_H5"):
        notes.append("Default-Hymne; Projektinhaber Hör-QC offen; ggf. Intro-Schnitt 5–8 s")
    if rid in ("stile_v2_rock_v3", "stile_v2_rock_v4"):
        notes.append("Default Rock; Kopie auch in stile_v3/")
    if rid == "stile_v2_hiphop_v2":
        notes.append("Default Hip-Hop v2 #2; Kopie auch in stile_v3/hiphop_v2.mp3")
    if rel.startswith("stile_v3/") and Path(rel).stem in ("hiphop_v2", "rock_v3", "rock_v4"):
        notes.append("Spiegel von stile_v2 Favorit")
    if "/alt/" in rel:
        notes.append("Alt-Take; nicht Default")
    if Path(rel).name.startswith("demo_"):
        notes.append("Demo-Medley; optional Katalog")
    if should_exclude.__name__:  # placate linters
        pass
    return "; ".join(notes)


def main() -> None:
    rows = []
    # Explicit exclude rows for documentation
    exclude_docs = [
        {
            "id": "EXCLUDE_hymne_AI_H2",
            "rel_path": "ai_hymnen_v1/hymne_AI_H2.mp3",
            "role": "hymne",
            "label_de": "Hymne H2 – ausgeschlossen",
            "default": "no",
            "ki_generated": "yes",
            "credit": ACE,
            "include_phase1": "no",
            "notes": "EXCLUDE laut Scope: hymne_AI_H2 inkl. alt-Takes",
        },
        {
            "id": "EXCLUDE_hymne_AI_H3",
            "rel_path": "ai_hymnen_v1/hymne_AI_H3.mp3",
            "role": "hymne",
            "label_de": "Hymne H3 – ausgeschlossen",
            "default": "no",
            "ki_generated": "yes",
            "credit": ACE,
            "include_phase1": "no",
            "notes": "EXCLUDE laut Scope: hymne_AI_H3 inkl. alt-Takes",
        },
        {
            "id": "EXCLUDE_raw",
            "rel_path": "ai_hymnen_v1/raw/",
            "role": "hymne",
            "label_de": "AI raw Takes – ausgeschlossen",
            "default": "no",
            "ki_generated": "yes",
            "credit": ACE,
            "include_phase1": "no",
            "notes": "EXCLUDE: Rohausgaben",
        },
        {
            "id": "EXCLUDE_stile_v3_discarded",
            "rel_path": "stile_v3/_discarded/",
            "role": "jingle",
            "label_de": "stile_v3 discarded – ausgeschlossen",
            "default": "no",
            "ki_generated": "no",
            "credit": MULDJORD,
            "include_phase1": "no",
            "notes": "EXCLUDE",
        },
        {
            "id": "EXCLUDE_stile_v3_samples",
            "rel_path": "stile_v3/samples/",
            "role": "ui",
            "label_de": "Sample-Quellen – ausgeschlossen",
            "default": "no",
            "ki_generated": "no",
            "credit": MULDJORD,
            "include_phase1": "no",
            "notes": "EXCLUDE: Sample-Bibliothek, nicht App-Audio",
        },
    ]
    rows.extend(exclude_docs)

    for path in sorted(SOUNDS.rglob("*.mp3")):
        rel = path.relative_to(SOUNDS).as_posix()
        if should_exclude(rel):
            continue
        rid = make_id(rel)
        ki = "yes" if rel.startswith("ai_hymnen_v1/") else "no"
        rows.append(
            {
                "id": rid,
                "rel_path": rel,
                "role": role_for(rel),
                "label_de": label_for(rel),
                "default": is_default(rid, rel),
                "ki_generated": ki,
                "credit": credit_for(rel),
                "include_phase1": include_phase1(rel, rid),
                "notes": notes_for(rel, rid),
            }
        )

    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    phase1 = sum(1 for r in rows if r["include_phase1"] == "yes")
    defaults = sum(1 for r in rows if r["default"] == "yes")
    print(f"Wrote {len(rows)} rows ({phase1} phase1, {defaults} defaults) → {OUT}")


if __name__ == "__main__":
    main()
