# Privacy Policy

**DragonWatch** — Last updated: September 2026

## Summary

DragonWatch inspects your Mac to tell you what is running on it. Everything it
learns stays on your Mac. There is no account, no server, and no analytics.
Threat-intel providers are the only features that use the network, and every
one of them is off until you turn it on. Only one sends anything about your
machine: VirusTotal, which is told a file's hash.

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

This reading is what the app is for. It is read-only. DragonWatch never stops,
kills, quarantines, or modifies a process or a file.

## Data Storage

DragonWatch keeps its records in its own folder inside your Library's
Application Support directory:

- `baseline.json`, the ledger of what it has seen before. It holds first-seen
  dates, hashes, and signature details, so a changed binary can be recognised.
- The alert history, recording what was flagged and when. You choose how long
  it is kept (30, 90, or 365 days).
- Cached copies of the public feeds (the CISA catalog, NVD version ranges, and
  the MalwareBazaar hash list), kept only when those providers are enabled.

Settings live in macOS user defaults. Deleting the app's Application Support
folder erases its records. You can export the history to a JSON file yourself.
Nothing is exported unless you ask for it.

## Network Access

Threat intel ships turned off. In that state the only network request
DragonWatch makes is a latency measurement against Apple's captive-portal
address (`captive.apple.com`), and only while its window is open. It sends
nothing about your Mac. Its only purpose is to time the round trip.

## Threat Intel Providers

Every provider is **off by default**, and each states what it sends before you
enable it.

- **CISA KEV and NVD** download the public known-exploited-vulnerabilities
  catalog and its version data, then match locally. Version data is fetched
  for every catalog entry rather than only the ones relevant to you, precisely
  so the request pattern reveals nothing about what you run.
- **MalwareBazaar** downloads abuse.ch's public malware-hash list and matches
  it on your Mac. Nothing about your machine is sent.
- **VirusTotal** is the one that sends data. When you ask for a check on a
  specific process, the executable's SHA-256 hash is sent to VirusTotal, which
  reveals to a third party what you run. It requires your own VirusTotal API
  key, it runs only when you press the button, and its responses are never
  written to disk. Your key is stored in macOS user defaults on your Mac.
  VirusTotal's handling of what it receives is covered by
  [their privacy policy](https://docs.virustotal.com/docs/privacy-policy).

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
