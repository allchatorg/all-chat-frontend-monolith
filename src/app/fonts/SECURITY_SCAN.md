# Font safety verification — 2026-09-29

## Malware scan

- Scanner: ClamAV 1.5.4, official macOS package, extracted to temporary storage without installation.
- Package SHA-256: `df7fa753e2f9f67f3bc99b2a40a3be7ef559088c68ad6bdf66b4b5764e965bd6`; matched the official Cisco-Talos GitHub release asset digest. Runtime library paths were relocated to the temporary directory.
- Official signature databases: daily version 28138 (2026-09-29 06:26 UTC), main version 63, bytecode version 339. FreshClam signature verification and database load tests passed.
- Scan time: 2026-09-29 22:48:30–22:48:41 Europe/Skopje.
- Scope: all 11 supplied ZIPs; all 41 entries extracted separately; entire `src/app/fonts` directory, including all 19 delivered WOFF2 files and existing source assets.
- Result: exit code 0; 96 files scanned; 0 infected files; 3,628,100 known virus signatures loaded; 26.67 MiB scanned. No scanner errors or scan-limit alerts.
- Options included recursive archive scanning, all matching signatures, and alerts for scan-limit exclusions.
- All scanning was local. No user files were uploaded to an external scanning service.

## Archive and font validation

- All 11 ZIP CRC checks passed. No encrypted entries, symlinks, absolute paths, or parent-directory traversal paths.
- The 41 entries contain only font files, preview images, and text documents. File signatures match these types. Rain Kiss files named `.ttf` contain valid OpenType/CFF data, as do their `.otf` alternatives.
- Total extracted size: 7,159,643 bytes; maximum individual compression ratio: 2.59.
- FontTools 4.66.1 fully decompiled all tables and drew every glyph outline of all 21 supplied font files with checksum validation: no errors or warnings.
- The same validation passed for all 19 output WOFF2 assets (1,992,288 bytes): no errors or warnings.
- Evelyne includes an empty SVG table; no embedded SVG documents were present.
- Archive SHA-256 hashes and source/output font hashes are preserved in `font-assets.json`. The full scan log and detailed structural reports from this run are in `/private/tmp/allchat-font-av/` (temporary, not part of the repository).

## Limit

No malware was detected by the checks above. Signature scanning and successful font parsing cannot guarantee the absence of unknown malware or font-renderer vulnerabilities. These results apply to the recorded files and hashes at the time of scanning.
