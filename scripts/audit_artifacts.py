#!/usr/bin/env python3
"""Inspect distributable document contents and metadata for private residue."""
import argparse
import io
import json
import re
import zipfile
from pathlib import Path

RULES = [
    ("absolute-user-path", re.compile(r"/(?:Users|home)/[^\s<>'\"]+", re.I)),
    ("temporary-path", re.compile(r"\/private\/tmp\/[^\s<>'\"]+", re.I)),
    ("internal-ticket", re.compile(r"\b[A-Z]{2}-\d{3,}\b")),
    ("credential", re.compile(r"\bsk-[A-Za-z0-9_-]{16,}")),
    ("non-example-email", re.compile(r"\b[A-Z0-9._%+-]+@(?!example\.com\b)[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I))
]

def scan_text(path, source, text, findings):
    for rule, pattern in RULES:
        for match in pattern.finditer(text):
            findings.append({"file": str(path), "part": source, "rule": rule, "match": match.group(0)[:160]})

def scan_ooxml(path, findings, source=None, prefix="", depth=0):
    if depth > 4:
        findings.append({"file": str(path), "part": prefix, "rule": "nesting-limit", "match": "Nested package requires manual inspection"})
        return
    with zipfile.ZipFile(source or path) as archive:
        for member in archive.infolist():
            name = member.filename
            part = prefix + name
            if member.file_size > 25 * 1024 * 1024:
                findings.append({"file": str(path), "part": part, "rule": "oversize-part", "match": "Part requires manual inspection"})
                continue
            content = archive.read(member)
            if name.endswith((".xml", ".rels", ".txt")):
                scan_text(path, part, content.decode("utf-8", "ignore"), findings)
            if name == "docProps/custom.xml":
                findings.append({"file": str(path), "part": part, "rule": "custom-properties", "match": "Custom properties require review"})
            if "/embeddings/" in name and not name.endswith("/"):
                if zipfile.is_zipfile(io.BytesIO(content)):
                    scan_ooxml(path, findings, io.BytesIO(content), part + "::", depth + 1)
                else:
                    findings.append({"file": str(path), "part": part, "rule": "uninspected-embedding", "match": "Opaque embedded binary requires manual inspection"})

def scan_pdf(path, findings):
    try:
        from pypdf import PdfReader
        reader = PdfReader(path)
        metadata = json.dumps(dict(reader.metadata or {}), ensure_ascii=False)
        scan_text(path, "metadata", metadata, findings)
        for index, page in enumerate(reader.pages, 1):
            scan_text(path, f"page-{index}", page.extract_text() or "", findings)
        if reader.attachments:
            findings.append({"file": str(path), "part": "attachments", "rule": "pdf-attachments", "match": "Embedded files require manual inspection"})
    except ImportError:
        findings.append({"file": str(path), "part": "parser", "rule": "missing-parser", "match": "Install pypdf before claiming this PDF was inspected"})

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    args = parser.parse_args()
    root = Path(args.root)
    findings = []
    inspected = []
    for path in sorted(root.rglob("*")):
        if path.is_symlink() or not path.is_file() or any(part in {".git", "node_modules", "__pycache__"} for part in path.relative_to(root).parts):
            continue
        suffix = path.suffix.lower()
        if suffix in {".pptx", ".docx"}:
            inspected.append(str(path.relative_to(root)))
            scan_ooxml(path, findings)
        elif suffix == ".pdf":
            inspected.append(str(path.relative_to(root)))
            scan_pdf(path, findings)
    result = {"ok": not findings, "inspected": inspected, "findings": findings}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["ok"] else 1)

if __name__ == "__main__":
    main()
