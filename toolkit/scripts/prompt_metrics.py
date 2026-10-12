#!/usr/bin/env python3
"""Report simple, reproducible prompt size and clarity signals."""
import argparse
import json
import re
from pathlib import Path

VAGUE = ["try to", "consider", "maybe", "when appropriate", "if needed", "probably", "as necessary"]

def analyze(path):
    text = Path(path).read_text(encoding="utf-8")
    words = len(text.split())
    findings = []
    for line_number, line in enumerate(text.splitlines(), 1):
        for phrase in VAGUE:
            if re.search(rf"\b{re.escape(phrase)}\b", line, re.I):
                findings.append({"phrase": phrase, "line": line_number, "text": line.strip()[:120]})
    return {
        "file": str(path),
        "lines": len(text.splitlines()),
        "words": words,
        "estimated_tokens": round(words * (1.5 if "```" in text else 1.3)),
        "headings": len(re.findall(r"^#{1,6}\s", text, re.M)),
        "todo_markers": len(re.findall(r"TODO", text, re.I)),
        "vague_language": findings
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("prompt")
    args = parser.parse_args()
    print(json.dumps(analyze(args.prompt), indent=2))

if __name__ == "__main__":
    main()
