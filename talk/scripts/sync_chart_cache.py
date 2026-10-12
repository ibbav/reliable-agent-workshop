#!/usr/bin/env python3
"""Synchronize the editable chart cache with its embedded workbook."""
import argparse
import io
import re
import zipfile
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET
from openpyxl import load_workbook

CHART = "http://schemas.openxmlformats.org/drawingml/2006/chart"
DRAWING = "http://schemas.openxmlformats.org/drawingml/2006/main"
SHEET = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"

def rewrite_workbook(data):
    workbook = load_workbook(io.BytesIO(data))
    sheet = workbook["Chart Data"]
    sheet["B1"] = "Posterior difference"
    sheet["D1"] = "No difference"
    output = io.BytesIO()
    workbook.save(output)
    return output.getvalue()

def workbook_values(data):
    values = {}
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    for cell in root.findall(f".//{{{SHEET}}}c"):
        reference = cell.attrib["r"]
        value = cell.find(f"{{{SHEET}}}v")
        inline = cell.find(f"{{{SHEET}}}is/{{{SHEET}}}t")
        values[reference] = inline.text if inline is not None else (value.text if value is not None else "")
    return values

def column_number(name):
    result = 0
    for letter in name:
        result = result * 26 + ord(letter.upper()) - 64
    return result

def column_name(number):
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result

def range_cells(formula):
    match = re.search(r"!\$([A-Z]+)\$(\d+):\$([A-Z]+)\$(\d+)$", formula)
    if not match:
        raise ValueError(f"Unsupported chart range: {formula}")
    start_column, start_row, end_column, end_row = match.groups()
    cells = []
    for row in range(int(start_row), int(end_row) + 1):
        for column in range(column_number(start_column), column_number(end_column) + 1):
            cells.append(f"{column_name(column)}{row}")
    return cells

def sync_cache(container, cache_name, values):
    reference = container.find(f".//{{{CHART}}}f")
    cache = container.find(f".//{{{CHART}}}{cache_name}")
    if reference is None or cache is None:
        return
    selected = [values[cell] for cell in range_cells(reference.text)]
    for point in list(cache.findall(f"{{{CHART}}}pt")):
        cache.remove(point)
    count = cache.find(f"{{{CHART}}}ptCount")
    if count is None:
        count = ET.SubElement(cache, f"{{{CHART}}}ptCount")
    count.set("val", str(len(selected)))
    for index, value in enumerate(selected):
        point = ET.SubElement(cache, f"{{{CHART}}}pt", {"idx": str(index)})
        ET.SubElement(point, f"{{{CHART}}}v").text = value

def rewrite_chart(data, values):
    ET.register_namespace("c", CHART)
    ET.register_namespace("a", DRAWING)
    root = ET.fromstring(data)
    for title in root.findall(f".//{{{CHART}}}valAx/{{{CHART}}}title//{{{DRAWING}}}t"):
        title.text = "Candidate minus baseline in percentage points"
    for series_index, series in enumerate(root.findall(f".//{{{CHART}}}ser")):
        literal_title = series.find(f"{{{CHART}}}tx/{{{CHART}}}v")
        if literal_title is not None:
            literal_title.text = "Posterior difference" if series_index == 0 else "No difference"
        for tag, cache in [("tx", "strCache"), ("xVal", "numCache"), ("yVal", "numCache")]:
            container = series.find(f"{{{CHART}}}{tag}")
            if container is not None:
                sync_cache(container, cache, values)
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    source = Path(args.source)
    output = Path(args.output)
    with zipfile.ZipFile(source) as archive:
        entries = {name: archive.read(name) for name in archive.namelist()}
    workbook_names = [name for name in entries if name.startswith("ppt/embeddings/") and name.endswith(".xlsx")]
    if len(workbook_names) != 1:
        raise ValueError("Expected one embedded chart workbook.")
    workbook_name = workbook_names[0]
    entries[workbook_name] = rewrite_workbook(entries[workbook_name])
    values = workbook_values(entries[workbook_name])
    for name in [name for name in entries if name.startswith("ppt/charts/chart") and name.endswith(".xml")]:
        entries[name] = rewrite_chart(entries[name], values)
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in entries.items():
            archive.writestr(name, data)
    print(output)

if __name__ == "__main__":
    main()
