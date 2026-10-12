import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from audit_artifacts import scan_ooxml

class ArtifactAuditTests(unittest.TestCase):
    def test_scans_nested_workbooks(self):
        nested = io.BytesIO()
        with zipfile.ZipFile(nested, "w") as archive:
            archive.writestr("xl/sharedStrings.xml", "private contact: real" + "@" + "company.invalid")
        with tempfile.TemporaryDirectory() as root:
            file = Path(root) / "deck.pptx"
            with zipfile.ZipFile(file, "w") as archive:
                archive.writestr("ppt/embeddings/data.xlsx", nested.getvalue())
            findings = []
            scan_ooxml(file, findings)
            self.assertTrue(any(f["rule"] == "non-example-email" and "embeddings" in f["part"] for f in findings))

    def test_unknown_embedded_binary_requires_review(self):
        with tempfile.TemporaryDirectory() as root:
            file = Path(root) / "deck.pptx"
            with zipfile.ZipFile(file, "w") as archive:
                archive.writestr("ppt/embeddings/object.bin", b"opaque")
            findings = []
            scan_ooxml(file, findings)
            self.assertTrue(any(f["rule"] == "uninspected-embedding" for f in findings))

if __name__ == "__main__":
    unittest.main()
