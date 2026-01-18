#!/usr/bin/env python3
import json, os, sys
from typing import Dict, List

try:
    from pdfminer.high_level import extract_text
except Exception as e:
    print("Missing pdfminer.six; please install with: pip3 install pdfminer.six", file=sys.stderr)
    sys.exit(2)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_DIR = os.path.join(ROOT, 'PDF')
OUT_PATH = os.path.join(ROOT, 'data', 'faction_rules.json')

PDFS = [
    'LI_Xenos_04.pdf',
    'LI_HiveWar_02.pdf',
    'Legions Imperialis Rulebook - Optimised.pdf'
]

FACTIONS = ['Tyranids', 'Eldar', 'Orks']
SECTION_KEYS = [
    'Army Special Rules', 'Special Rules', 'Psychic Powers', 'Options',
    'Detachment', 'Formation Options', 'Sub-faction Notes', 'Traits'
]

def load_pdf_text(name: str, pages: List[int] = None) -> str:
    path = os.path.join(PDF_DIR, name)
    if not os.path.exists(path):
        return ''
    try:
        if pages:
            return extract_text(path, page_numbers=pages)
        return extract_text(path)
    except Exception:
        return ''

def slice_between(text: str, start_key: str, end_keys: List[str]) -> str:
    sidx = text.lower().find(start_key.lower())
    if sidx == -1:
        return ''
    eidx = len(text)
    for k in end_keys:
        i = text.lower().find(k.lower(), sidx + len(start_key))
        if i != -1:
            eidx = min(eidx, i)
    return text[sidx:eidx]

def extract_sections(block: str) -> List[Dict]:
    lines = [l.strip() for l in block.splitlines()]
    sections = []
    current = {'title': 'Army Special Rules', 'items': []}
    for ln in lines:
        if not ln:
            continue
        # detect headers
        if any(ln.lower().startswith(k.lower()) for k in [
            'army special rules', 'special rules', 'psychic powers', 'options', 'formation options', 'sub-faction', 'traits'
        ]):
            # push previous
            if current['items']:
                sections.append(current)
            # start new
            title = ln.split(':')[0].strip().title()
            current = {'title': title, 'items': []}
            continue
        # collect bullets or sentences
        if ln.startswith('•') or ln.startswith('-') or ln.startswith('*'):
            item = ln.lstrip('•-*').strip()
            current['items'].append(item)
        else:
            # heuristics: capture short lines as items
            if len(ln) <= 140:
                current['items'].append(ln)
    if current['items']:
        sections.append(current)
    return sections

def main():
    # Targeted extract for Tyranids if Hive War PDF present
    tyr_text = load_pdf_text('LI_HiveWar_02.pdf', pages=list(range(4,15)))
    combined_text = tyr_text + '\n' + '\n'.join(load_pdf_text(p) for p in PDFS)
    out: Dict[str, List[Dict]] = {}
    for fac in FACTIONS:
        tailers = [f for f in FACTIONS if f != fac]
        block = slice_between(combined_text, fac, tailers)
        if not block:
            # fallback: try occurrences of key units
            if fac == 'Tyranids':
                block = slice_between(combined_text, 'Hive Tyrant', tailers)
            elif fac == 'Eldar':
                block = slice_between(combined_text, 'Craftworld', tailers)
            elif fac == 'Orks':
                block = slice_between(combined_text, 'Warband', tailers)
        sections = extract_sections(block) if block else []
        out[fac] = sections

    os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print('Wrote', OUT_PATH)

if __name__ == '__main__':
    main()
