# Privacy Policy

**DragonWatch**. Last updated: November 2026

## Summary

DragonWatch inspects your Mac to tell you what is running on it, and checks
files you choose to see whether their contents match what they claim to be.
Everything it learns stays on your Mac. There is no account, no server, and no
analytics. Nothing about your processes or your files is ever sent anywhere.
The one feature that downloads anything fetches a public vulnerability
catalog, and it is off until you turn it on.

## Data Collection

The developer collects **nothing**. DragonWatch has no account system, no
server, no analytics, no telemetry, and no crash reporting. Nothing you see in
the app is transmitted to N8Codes, and no data about you or your Mac is ever
sent to the developer.

## What DragonWatch Reads

To do its job the app reads, locally:

- The processes running on your Mac, including each one's name, path, process
  id, CPU and memory use, and the parent processes and start time that say
  what launched it.
- Executables on disk, to check their code signature and compute their SHA-256
  hash.
- Install provenance from Homebrew receipts, and LaunchAgent and LaunchDaemon
  files, whose contents it fingerprints so a change can be noticed.
- Files you choose to inspect, and only those, whether you pick one file or a
  folder of them: the first and last 64 KB of each, the whole file (up to 2
  GB) to compute its SHA-256 hash, and the macOS quarantine and "where from"
  attributes, which can hold the URL a download came from. For JPEG and PNG
  images, and for HEIC, AVIF, MP4, MOV, M4A and related files, it also follows
  the file's own structure from start to end to find where the file really
  ends, reading its headers and any Content Credentials (C2PA) record of up to
  16 MB. For an app bundle it checks the code signature. Nothing inspected is
  executed, and no picture, sound or video is decoded or extracted.

This reading is what the app is for. It is read-only. DragonWatch never stops,
kills, quarantines, or modifies a process or a file.

## Data Storage

DragonWatch keeps its records in its own folder inside your Library's
Application Support directory, readable only by your user account:

- `baseline.json`, the ledger of what it has seen before. For each program it
  holds when it was first and last seen, its signature tier and the verdict
  you gave it, plus the launch items it has seen and a SHA-256 fingerprint of
  each one's contents, so a change can be recognised. A program you have given
  a verdict stays until you press Reset under Baseline in the app's settings.
  The rest are forgotten once they have not run for the history period you
  choose (below).
- `observations.json`, the history: what was flagged, when, and the chain of
  processes that launched it. For each executable it has seen, the same file
  keeps when it was first and last seen and its signature tier, and once it
  has been hashed, the SHA-256, the file's size and date when the hash was
  taken, and any change in its signature tier. You choose how long history is
  kept (30, 90, or 365 days). Alerts older than that are removed, and so is
  the record of any executable that has not run for that long.
- In the same file, for each file format the inspector did not recognise, its
  first sixteen bytes and extension, when it was first and last seen and how
  many times, and any name you give it. No other file contents are stored.
- `seal-verifications.json`, the app bundles whose seals it has checked, with
  a fingerprint of each binary inside them, so an unchanged binary need not be
  checked again.
- A cached copy of the public vulnerability catalog in `kev-catalog.json`, and
  the version data fetched for it in `nvd-ranges.json`, once you have enabled
  that feature.
- If a ledger is found corrupt, it is set aside as a `.bak` copy in the same
  folder and a fresh one is started.

Settings live in macOS user defaults. Deleting the app's Application Support
folder erases its records. You can export the history file, with everything
listed for `observations.json` above, or a file inspection report, to a file
yourself, and it is written readable only by your account wherever you save
it. Nothing is exported unless you ask for it.

Two things are kept by macOS outside that folder, still on your Mac. If you
allow notifications, each alert is also posted to Notification Center with its
title and detail, which can include a program's path. And the app writes
diagnostic lines to the macOS system log: CPU figures and whether
notifications are allowed, never a program's name or path.

## Network Access

With the vulnerability catalog off, which is the default, the only network
request DragonWatch makes is a latency measurement against Apple's captive-
portal address (`captive.apple.com`), and only while its window is open. Its
only purpose is to time the round trip. Like any web request, it reaches Apple
from your IP address and carries the standard headers macOS adds, which name
the app, the system's networking version and your language. It sends nothing
else: nothing about your processes or your files.

## Vulnerability Catalog

The **CISA KEV and NVD** feature is **off by default** and states what it does
before you enable it. When you enable it and run a check, it downloads CISA's
public catalog of known exploited vulnerabilities, refreshed at most once a
day once it has a copy, and NVD version data for every entry in it. Each
entry's version data is fetched once and kept, and a fetch that fails is tried
again after six hours, or sooner if the app is restarted. It then matches
against your processes locally. Version data is fetched for *every* catalog
entry rather than only the ones relevant to you, precisely so the request
pattern reveals nothing about what you run. These requests replace the standard headers described above with fixed ones that are the same on every Mac, so nothing about your Mac is sent.

DragonWatch deliberately has no cloud reputation lookup, no malware-hash list,
and no feature that uploads a hash, a path, a name, or a file. It is not an
antivirus and does not claim to be.

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
