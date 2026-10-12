# Review before sharing the folder

This checklist explains what to inspect before distributing this repository. Generic scans catch common residue; they cannot certify that every organization-specific detail has been removed.

## What belongs in this public edition

Keep reusable principles, the six workflow skills, audited templates, generic evaluation code, synthetic examples, and the conference artifacts. The method and structure are attributed to Valentina Ibba. CERA conference branding is intentionally retained. No private source agents, business records, traces, credentials, operational metrics, infrastructure, or source history belong here.

## Inspect the actual distribution

Run `npm run audit` in the folder you will send, not only in a clean clone. Git ignores do not protect a folder copied or zipped in the file manager. Remove desktop metadata, environment files, generated run output, caches, and build output from the distributable copy. Keep any valuable run evidence separately rather than deleting it.

The text scan flags generic private paths, ticket-shaped identifiers, credentials, and non-example addresses. It also flags symlinks, desktop metadata, and runtime folders. It skips Git internals, installed dependencies, and Python caches; inspect those separately or exclude them from the distribution. Do not add private organization names to a public denylist: that would itself publish the names.

The artifact scan inspects PDF text and metadata, Office XML and relationships, and nested embedded Office workbooks. Unknown embedded binaries, custom properties, and PDF attachments require review. PDF inspection needs `pypdf`; a missing parser fails the audit instead of silently accepting compressed raw bytes. Install document-inspection dependencies from `talk/requirements.txt` in a separate environment if needed.

## Human content and visual review

- Read every changed text file for private examples, distinctive wording, real identifiers, operational claims, and hidden references.
- Inspect every slide and script page visually. Text extraction does not inspect pictures or guarantee that embedded screenshots are public.
- Inspect speaker notes, comments, tracked changes, hidden slides, hidden worksheet content, external links, attachments, and metadata.
- Confirm that every result is labeled synthetic or measured, with the right denominator. The deck's teaching probability illustration is not the replay's result.
- Review Git history if sending `.git`, including old blobs and unreachable objects. A clean current tree does not sanitize history.

## Current artifact scope

The existing public deck has nine slides and the printable script has eleven pages. They were visually reviewed in the sanitization workflow, along with their text, notes, metadata, and embedded chart workbook. The chart data is synthetic. This framework update changes text and code only; it does not replace those reviewed binaries or alter the retained conference branding.

Before any later publication, repeat review on the exact final bundle and obtain the owner's approval. No default command publishes, creates a remote, or sends a model request. A successful automated audit is evidence of the checks it ran, not a blanket privacy guarantee.
