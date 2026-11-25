# NOMAD Proof — Official Release Assets

This public repository is the download and update-manifest host for NOMAD Proof. Application source and engineering work are maintained separately.

## Release verification

NOMAD Proof update clients verify an Ed25519-signed JSON manifest, semantic version, approved GitHub release URL, exact artifact size and SHA-256 digest before accepting an update. A checksum by itself is not a publisher signature.

Do not install an artifact unless its platform manifest is present in the same GitHub Release and the client reports that its signature and digest are valid.

## Supported release asset names

- `linux-stable.json` — Linux portable package manifest
- `windows-stable.json` — Windows installer manifest
- `android-stable.json` — Android APK manifest
- `nomad-proof-<version>-linux-amd64.tar.gz` — Linux portable package
- `NOMAD-Proof-<version>-Windows-x64.exe` — Windows installer
- `NOMAD-Proof-Android-release-<version>.apk` — Android release APK
- `NOMAD-Proof-Android-release-<version>.aab` — Android App Bundle

## Signing and trust

- Update manifests are signed with the project's Ed25519 release key. The private key is not stored in this repository.
- Android packages must be signed with the owner-controlled Android app-signing key.
- Windows installers must carry a trusted Authenticode signature before being described as publisher-verified. Until then, Windows may display SmartScreen warnings.
- Release assets are published only after platform acceptance, artifact checksums and signature verification.

## Current status

This repository is the official public release host. No public binary release is available yet. The first release remains gated on Android app-signing key custody, Windows trusted code signing or an approved alternative distribution route, and completion of the release acceptance checklist.

## Contact and reporting

Security issues should be reported privately to the project owner until a dedicated security contact and disclosure process are published.
