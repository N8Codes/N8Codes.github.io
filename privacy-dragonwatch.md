# Privacy Policy

**DragonWatch** — Last updated: September 2026

## Summary

DragonWatch inspects your Mac to tell you what is running on it, and checks
files you choose to see whether their contents match what they claim to be.
Everything it learns stays on your Mac. There is no account, no server, and
no analytics. Nothing about your Mac, your processes, or your files is ever
sent anywhere. The one feature that uses the network downloads a public
vulnerability catalog, and it is off until you turn it on.

## Data Collection

The developer collects **nothing**. DragonWatch has no account system, no
server, no analytics, no telemetry, and no crash reporting. Nothing you see in
the app is transmitted to N8Codes, and no data about you or your Mac is ever
sent to the developer.

## What DragonWatch Reads

To do its job the app reads, locally:

- The processes running on your Mac, including each one's name, path, process
  id, CPU use, and the parent process and start time that say what launched
  it.
- Executables on disk, to check their code signature and compute their
  SHA-256 hash.
- Install provenance from Homebrew receipts and from LaunchAgent and
  LaunchDaemon files.
- Files you choose to inspect, and only those: the first and last 64 KB of
  each, the whole file (up to 2 GB) to compute its SHA-256 hash, and the macOS
  quarantine and "where from" attributes, which can hold the URL a download
  came from. Nothing inspected is executed, decoded, or extracted.

This reading is what the app is for. It is read-only. DragonWatch never stops,
kills, quarantines, or modifies a process or a file.

## Data Storage

DragonWatch keeps its records in its own folder inside your Library's
Application Support directory, readable only by your user account:

- `baseline.json`, the ledger of what it has seen before. It holds first-seen
  dates, hashes, and signature details, so a changed binary can be recognised.
- `observations.json`, the alert history: what was flagged, when, and what
  launched it, plus the SHA-256 of executables it has hashed. You choose how
  long alerts are kept (30, 90, or 365 days).
- In the same file, for each file format the inspector did not recognise, its
  first sixteen bytes and extension, and any name you give it. No other file
  contents are stored.
- A cached copy of the public vulnerability catalog, once you have enabled
  that feature.

Settings live in macOS user defaults. Deleting the app's Application Support
folder erases its records. You can export the alert history, or a file
inspection report, to a file yourself, and it is written readable only by
your account wherever you save it. Nothing is exported unless you ask for it.

## Network Access

With the vulnerability catalog off, which is the default, the only network
request DragonWatch makes is a latency measurement against Apple's
captive-portal address (`captive.apple.com`), and only while its window is
open. It sends nothing about your Mac. Its only purpose is to time the round
trip.

## Vulnerability Catalog

The **CISA KEV and NVD** feature is **off by default** and states what it
does before you enable it. When you enable it and run a check, it downloads
CISA's public catalog of known exploited vulnerabilities and NVD version data
for every entry in it, at most once a day, then matches against your
processes locally. Version data is fetched for every catalog entry rather
than only the ones relevant to you, precisely so the request pattern reveals
nothing about what you run. Nothing about your Mac is sent.

DragonWatch deliberately has no cloud reputation lookup, no malware-hash
list, and no feature that uploads a hash, a path, a name, or a file. It is
not an antivirus and does not claim to be.

## Security

There is no server or account to breach, and nothing about your Mac is held
anywhere but your Mac. The app's records sit in its own directory under your
user account, protected by the same macOS file permissions as the rest of your
home folder, and it asks for no elevated privileges. Any code already running
as you can read them, which is why the app records what it observed rather
than anything secret.

## Contact

Questions about this policy or your data can be sent to N8Codes at
[n8codesandcreates@gmail.com](mailto:n8codesandcreates@gmail.com).

## Changes

If this policy changes, the updated version will be posted at this URL with a
new date.
