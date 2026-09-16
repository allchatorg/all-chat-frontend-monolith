# AllChat radio integration handoff

Radio service last verified: **16 September 2026**.

## Production release check — 16 September 2026

- **No new environment variables, API keys, backend deployment or database changes are needed.** The frontend uses the public `https://radio.allchat.org` API directly and discovers stream URLs by station shortcode.
- Both Daybreak and Nightwave currently report `is_online: true` with different, non-placeholder track metadata. The empty-library descriptions below are historical provisioning observations from 10 September, not the current station state.
- Public station discovery succeeds over trusted HTTPS with `Access-Control-Allow-Origin: *`. Both MP3 streams return HTTP 200, `Content-Type: audio/mpeg`, the correct station names and audio bytes, with `Access-Control-Allow-Origin: https://allchat.org` for the production origin.
- The production site responds over HTTPS without a Content-Security-Policy header that would block the radio API or streams.
- The radio-only release passed a clean `npm ci` and `npm run build`, including TypeScript validation, in an isolated directory using the committed dependency lockfile. No test suites were added or run. The separate mobile side-panel migration and its dependency overrides are not required for radio.
- Physical iPhone/iPad audible volume and lock/unlock checks remain unverified. Earlier browser UI checks are described below.

## Task for the next chat

AllChat now has two separate AzuraCast stations, **Daybreak** and **Nightwave**. Their public APIs and HTTPS MP3 streams are available. Both libraries were empty at the provisioning snapshot below. Nightwave was subsequently observed broadcasting a real track during the radio-menu UI checks; consult the public APIs for current on-air status.

The frontend integration is implemented; see `src/features/radio/` and `src/components/providers/RadioProvider.tsx` for its source. Type-check, production build and browser UI checks passed. Radio controls are now under the chat header's **three-dot menu → Radio**, including empty and loading views; there is no separate radio header row. Desktop uses a nested submenu; mobile closes the menu and opens a modal bottom sheet with larger touch controls. Changes save immediately, and closing the sheet leaves playback running. Profile settings retain their Radio card. Physical-device and audible-volume validation remain pending.

The mobile sheet was checked in the browser with a selected public room, expanded message search, and no private conversation selected. Checks covered keyboard volume changes, mute preserving the volume level, playback continuing after close/reopen, Escape dismissal, focus returning to the options button, and internal scrolling on a small phone viewport. The sheet's drag handle is separate from the slider gesture area. The updated production build and type-check passed; no tests were added or executed.

## Current progress

| Area | Status |
| --- | --- |
| VPS access | SSH works using the existing local SSH key. |
| AzuraCast installation | Installed with the official Docker installer; v0.23.8 Stable. |
| Administrator account | Created by the user. Use the same account at the public login URL. |
| Light-mode station | Daybreak, station ID `1`, retained shortcode `allchat_radio`. |
| Dark-mode station | Nightwave, station ID `2`, shortcode `nightwave`. |
| Domain and HTTPS | `radio.allchat.org` is live with a trusted Let's Encrypt certificate. |
| Public APIs | Station discovery and station now-playing endpoints return HTTP 200 without authentication. |
| Audio services | Both stations have separate running Icecast and Liquidsoap processes; both HTTPS streams serve 192 kbps MP3 audio. |
| Music libraries | No music uploaded. Both stations report `is_online: false` and “Station Offline”; their streams contain the built-in placeholder audio. |
| Playlists | Daybreak Rotation (ID `1`) and Nightwave Rotation (ID `2`): enabled, general rotation, songs source, shuffled order, zero songs. |
| AllChat integration | Implemented station discovery, theme/manual selection, shared radio audio, radio-only volume/mute, header controls and Profile settings, including empty-chat views. No backend room association is required. |
| Application validation | Type-check and production build passed; browser checks verified selection, settings, persistence and the mobile empty-chat layout. Audible music and physical iOS validation remain pending. |
| Earlier DNS delay | Resolved on the network used for the final check. Normal DNS lookup and HTTPS login now work without an IP override. |

## URLs and identifiers

| Purpose | Value |
| --- | --- |
| AzuraCast base URL | `https://radio.allchat.org` |
| Administrator login | `https://radio.allchat.org/login` |
| Daybreak dashboard after login | `https://radio.allchat.org/station/1` |
| Nightwave dashboard after login | `https://radio.allchat.org/station/2` |
| Daybreak listener page | `https://radio.allchat.org/public/allchat_radio` |
| Nightwave listener page | `https://radio.allchat.org/public/nightwave` |
| Public station discovery API | `https://radio.allchat.org/api/stations` |
| Daybreak metadata API | `https://radio.allchat.org/api/nowplaying/1` |
| Nightwave metadata API | `https://radio.allchat.org/api/nowplaying/2` |
| Daybreak HTTPS audio stream | `https://radio.allchat.org/listen/allchat_radio/radio.mp3` |
| Nightwave HTTPS audio stream | `https://radio.allchat.org/listen/nightwave/radio.mp3` |
| M3U playlist | `https://radio.allchat.org/public/allchat_radio/playlist.m3u` |
| PLS playlist | `https://radio.allchat.org/public/allchat_radio/playlist.pls` |
| Daybreak ID / shortcode | `1` / `allchat_radio` |
| Nightwave ID / shortcode | `2` / `nightwave` |

Two stations currently exist. Map Daybreak to `allchat_radio` and Nightwave to `nightwave`; never infer roles from discovery-list order. Use each station's returned `listen_url` instead of deriving stream URLs from display names. Daybreak retains its original shortcode and stream URL for compatibility.

The public endpoints above require no administrator password or API key. No persistent API key was created during setup. The two-station provisioning used the supported CLI's two-minute `--type login` token for the existing administrator, then the supported management API with a session cookie and `X-API-CSRF`. The login token was consumed, the session was logged out, and temporary cookie/CSRF files were removed; an authenticated endpoint returned 403 afterward. No password, 2FA, roles or authentication settings were changed. Existing AzuraCast administration can continue through its dashboard; AllChat single sign-on has not been configured.

## API details verified against the running service

`GET /api/stations` returns an array containing both station objects. Daybreak includes:

```json
{
  "id": 1,
  "name": "Daybreak",
  "shortcode": "allchat_radio",
  "timezone": "Europe/Rome",
  "listen_url": "https://radio.allchat.org/listen/allchat_radio/radio.mp3",
  "public_player_url": "https://radio.allchat.org/public/allchat_radio",
  "is_public": true,
  "requests_enabled": false,
  "hls_enabled": false
}
```

This is a subset of the actual response. Nightwave has ID `2`, name `Nightwave`, shortcode `nightwave`, and its separate `/listen/nightwave/radio.mp3` URL. `mounts` describes each station's default `/radio.mp3` mount, MP3 format and 192 kbps bitrate.

`GET /api/nowplaying/{id}` returns one object with useful fields:

- `station`: station information, including `id`, `name`, and `listen_url`.
- `is_online`: whether the station is currently broadcasting normal content.
- `now_playing.song`: `title`, `artist`, `text`, `art`, and other metadata.
- `now_playing`: timing information such as `duration`, `elapsed`, and `remaining`.
- `listeners.current`: current listener count.
- `live.is_live`: whether a live streamer is broadcasting.
- `playing_next`: may be `null`.
- `song_history`: may be empty.

Discovery and both metadata endpoints return `Access-Control-Allow-Origin: *`. Requests with both `Origin: https://allchat.org` and `Origin: http://localhost:3000` succeeded. The now-playing response advertises `Cache-Control: public, max-age=15`; the frontend polls roughly every 15 seconds.

Both MP3 endpoints return HTTP 200 and `Content-Type: audio/mpeg`, reflect the requesting origin in `Access-Control-Allow-Origin`, and delivered audio bytes for both production and localhost origins. The `icy-name` headers are respectively Daybreak and Nightwave. The frontend's radio-specific volume uses Web Audio, so the audio element must set `crossOrigin = "anonymous"` before assigning `src`; metadata CORS alone would not be sufficient.

Handle offline stations explicitly. At verification, both have `is_online: false`, title `Station Offline`, no next song and empty history. Do not display misleading playback progress from the placeholder's timing values. Do not equate running Icecast/Liquidsoap processes or an HTTP 200 stream with normal music being on air. Actual music playback, audible gain changes and mobile interruptions still require browser/device verification after music is supplied.

## Repositories and existing application structure

| Project | Local path | Stack |
| --- | --- | --- |
| Frontend | `/Users/markoangelovski/IdeaProjects/all-chat-frontend-monolith` | Next.js App Router 15.4.8, React 19, TypeScript, Redux Toolkit, Tailwind/shadcn |
| Backend | `/Users/markoangelovski/IdeaProjects/all-chat-monolith` | Spring Boot 3.5.3, Java 21, Maven modules `chat`, `ads`, `shared-identity`, `bootstrap` |

Read `/Users/markoangelovski/IdeaProjects/AGENTS.md` before implementation. Its current instructions say to work in these monoliths, keep frontend/backend API contracts aligned, and **never create or run tests**. Validation is by frontend type-check/build and backend `./mvnw -DskipTests verify`. Re-read the file in case it changes.

AllChat REST uses `/api/v1`; chat real-time communication uses WebSocket/STOMP. Authentication is session-based with `X-Auth-Token`. Radio listening and preferences are handled in the frontend, and the chat room models have no station association.

Frontend paths below are relative to the frontend repository:

| File | Integration relevance |
| --- | --- |
| `src/app/layout.tsx` | Root layout wraps application providers and shell. |
| `src/components/providers/AppProviders.tsx` | Application provider composition. |
| `src/components/providers/RadioProvider.tsx` | Shared station selection, metadata and listening state. |
| `src/features/radio/RadioAudioController.ts` | One browser audio element and Web Audio gain stage. |
| `src/features/radio/types.ts` | Daybreak/Nightwave shortcode mappings and station descriptions. |
| `src/components/AppShell.tsx` | Chat navigation/shell; portal routes use different chrome. |
| `src/app/page.tsx` | Chat homepage layout with panels, room tabs, and chat section. |
| `src/features/chatroom/components/ChatSectionHeader.tsx` | Possible location for room-level controls if that behavior is selected. |
| `src/models/ChatRoom.ts` | Room model has no radio/station mapping today. |
| `src/lib/api.ts` | Existing Axios client automatically sends `X-Auth-Token` and uses credentials. |
| `src/redux/store.ts` | Existing persisted settings include notification mode and `mediaPlayerMuted`. |
| `src/components/providers/MediaOverlayProvider.tsx` | Existing media overlay provider. |
| `src/features/chatroom/components/MediaOverlay.tsx` | Existing attachment audio/video playback. |
| `src/lib/hooks/useNotificationSounds.ts` | Existing notification audio, including Safari/iOS interaction handling. |

**Use a separate unauthenticated client for public AzuraCast requests.** Do not reuse the AllChat Axios client with its session header and credentials. For browser `fetch`, use `credentials: "omit"` and no AllChat authentication headers. Public stream playback also needs no AllChat token.

Backend paths below are relative to the backend repository, if persistence or room associations are needed:

- `chat/src/main/java/com/mk3/chatapp/models/ChatRoom.java`
- `chat/src/main/java/com/mk3/chatapp/controllers/ChatRoomController.java`
- `chat/src/main/java/com/mk3/chatapp/services/ChatRoomInteractionService.java`
- `bootstrap/src/main/java/com/allchat/app/MonolithSecurityConfig.java`

The original server-installation handoff preceded application integration. The subsequent radio task added the frontend implementation and provisioned both stations without requiring backend API changes. The frontend already had an unrelated untracked `docs/greentext.md`; preserve it.

## Remaining music setup and validation

1. Upload the user's chosen Daybreak music (upbeat indie, funk and chill pop) into station `1`, then assign it to **Daybreak Rotation**. Upload the chosen Nightwave music (lo-fi, ambient and downtempo electronic) into station `2`, then assign it to **Nightwave Rotation**. Files must belong to a playlist to enter AutoDJ rotation. No music was uploaded in this setup task.
2. Verify both stations become online and broadcast different content, with real artist/title metadata and track changes. Both already have separate media storage locations and empty enabled playlists; no additional station needs to be created.
3. After music is available, validate audible AllChat Play/Pause, station switching, radio-only volume/mute and navigation continuity. Verify actual audible gain on physical iPhone/iPad Safari, including lock/unlock and returning from another app, as well as desktop browsers. Web Audio contexts may need a user gesture to resume after interruption. UI selection, settings persistence and the mobile empty-chat layout have already been checked.
4. Monitor server CPU/memory after adding music and listeners; empty-station resource measurements below are not a capacity test. Frontend type-check/build passed for this implementation; future changes must continue using those checks rather than test suites, under the workspace instructions.

The light/dark station association is a listening preference; no room mapping or privileged station management is needed in AllChat. Default station mode follows the resolved app theme, with manual Daybreak/Nightwave overrides. The initial volume is 35% and playback requires a user action.

## Server and DNS operations reference

| Item | Current value |
| --- | --- |
| VPS address / hostname | `23.137.253.173` / `radio-portal` |
| Operating system | Ubuntu 24.04.5 |
| Resources | 1 CPU core, approximately 2 GB RAM, 30 GB disk, 512 MB swap |
| Install directory | `/var/azuracast` |
| Docker containers | `azuracast`, `azuracast_updater` |
| Main image | `ghcr.io/azuracast/azuracast:stable` |
| Web exposure | Public TCP 80 and 443; HTTP redirects to HTTPS except ACME validation. |
| Station audio | Icecast + Liquidsoap AutoDJ; MP3, 192 kbps, stereo, 44.1 kHz; mount `/radio.mp3`. |
| Initial station options | Europe/Rome timezone; public pages enabled; live DJs, song requests, and HLS disabled. |

Both stations retain those options. The new station was created through `POST /api/admin/stations`; Daybreak was renamed through `PUT /api/admin/station/1`; playlists were updated through their station playlist endpoints. First startup of a new station must use the supported `POST /api/station/{id}/restart` route (the dashboard's station start/restart action), which sets its started state and generates its service configuration. `azuracast:radio:restart` by itself refuses a station that has never started. No direct database changes were made.

After provisioning, both station frontend/backend processes and core services were running. Container usage was approximately **596 MiB RAM and 14% CPU** in a short idle snapshot, versus approximately 451 MiB and 8% with one empty station. The host had approximately 973 MiB available RAM, 41 MiB swap used, and 22 GB disk available. Only host ports 80 and 443 remain published. DNS, Compose port overrides, TLS and ACME settings were not changed.

Docker is enabled at boot and the containers use `unless-stopped`. Final service checks showed nginx, MariaDB, Redis, PHP workers, and the station's Icecast/Liquidsoap processes running. Supervisor's `startup` process being `EXITED` is expected after initialization.

The domain is registered at **Epik**, but authoritative DNS is **Cloudflare**, using `kristin.ns.cloudflare.com` and `wilson.ns.cloudflare.com`. The obsolete `ads` A record was renamed to `radio` in both Cloudflare's active zone and Epik's otherwise inactive zone. `radio.allchat.org` points directly to `23.137.253.173` with Cloudflare proxy **disabled / DNS only**. There is no radio AAAA record. Other records such as `api-ads` and `www.ads` were left unchanged during setup.

AzuraCast's own web proxy is enabled so listener audio uses HTTPS `/listen/...` URLs on port 443. This is separate from Cloudflare's proxy setting. Direct station ports and SFTP are not published on the host for the current setup; additional live-DJ connectivity would need separate configuration if requested later.

Relevant persistent server configuration:

- `/var/azuracast/docker-compose.override.yml`: replaces the default port list using Compose `!override`, publishing only `80:80` and `443:443`, and mounts the custom HTTP redirect vhost.
- `/var/azuracast/nginx/radio-http-redirect.vhost`: redirects HTTP to `https://radio.allchat.org`, while retaining `/.well-known/acme-challenge` access for Let's Encrypt.
- AzuraCast settings: `base_url=https://radio.allchat.org`, `prefer_browser_url=false`, `always_use_ssl=true`, `use_radio_proxy=true`, `acme_domains=radio.allchat.org`.
- Certificate was obtained through AzuraCast's built-in ACME command. At issuance it was valid until **8 December 2026**. Preserve ACME configuration and validation access during future changes.
- Original/staging Compose overrides were retained as backups. Keep the active port override and redirect mount when changing Docker configuration.

SSH is available from the same Mac using the user's existing key:

```bash
ssh -F /dev/null \
  -o StrictHostKeyChecking=yes \
  -o UpdateHostKeys=no \
  -o BatchMode=yes \
  -i /Users/markoangelovski/.ssh/id_ed25519 \
  root@23.137.253.173
```

The host's ED25519 fingerprint, independently checked during the earlier SSH repair, is:

```text
SHA256:ddg6ZfJTSkh36d4o0PQJ/P7jNByGXhB0EMaQJ0Yke7Q
```

An old host-key entry after the VPS rebuild caused the earlier SSH problem and was corrected after verification. Temporary VNC access was disabled afterward. The temporary localhost SSH web tunnel was also closed; the public HTTPS URL is now the normal access route. This document contains no private key, root password, administrator password, or API token.

When automating remote shell scripts, attach `</dev/null` to non-interactive `docker compose exec -T` commands unless intentionally providing input; otherwise they can consume the rest of a surrounding SSH heredoc. AzuraCast boolean settings require the literal values `true` or `false`, not numeric `1` or `0`.

## Verification and troubleshooting

Completed checks:

- `npx tsc --noEmit` passed. `npm run build` passed in an isolated `/tmp` copy to preserve the running development server.
- Browser checks verified Follow theme in dark and light modes, a manual Daybreak selection retained in dark mode, keyboard volume adjustment from 35% to 20%, mute, synchronized header/Profile settings, and preference persistence across reload and navigation.
- At 390 px width, the private-chat empty view and volume popover rendered correctly.
- Trusted HTTPS login and public player returned HTTP 200.
- Public discovery returned both Daybreak (`1` / `allchat_radio`) and Nightwave (`2` / `nightwave`); both metadata endpoints returned HTTP 200.
- Both distinct MP3 streams returned HTTP 200, correct station names and 192 kbps headers, and audio bytes for production and localhost origins.
- Authenticated service status confirmed both stations' Icecast/Liquidsoap processes running; playlist reads confirmed their enabled general rotations contain zero songs.
- HTTP `/login` redirected to HTTPS with status 308.
- The HTTPS stream was inspected with `ffprobe`: MP3, 192000 bits/second, 44100 Hz, two channels.
- Final ordinary DNS lookup returned `23.137.253.173`; ordinary HTTPS login returned HTTP 200 with successful certificate verification.

These checks do not establish audible station music or physical iOS playback behavior: both libraries are empty and both stations report offline. Complete those listening checks after music is uploaded.

The earlier network resolver cached NXDOMAIN after the DNS rename. By the final check, the current network resolved the domain correctly. If another network is still stale, compare its resolver with public DNS:

```bash
dig +short radio.allchat.org
dig +short @1.1.1.1 radio.allchat.org
curl -I https://radio.allchat.org/login
```

Expected A record: `23.137.253.173`. A diagnostic origin request can bypass stale DNS while still checking the real hostname and certificate:

```bash
curl --resolve radio.allchat.org:443:23.137.253.173 \
  https://radio.allchat.org/api/nowplaying/1
```

Do not disable TLS verification or change correct DNS records merely to work around an old resolver cache.

Official documentation used during setup:

- [Docker installation](https://www.azuracast.com/docs/getting-started/installation/docker/)
- [SSL and Let's Encrypt](https://www.azuracast.com/docs/administration/ssl-and-lets-encrypt/)
- [Cloudflare considerations](https://www.azuracast.com/docs/administration/cloudflare/)
