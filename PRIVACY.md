# Privacy Policy for websocket-tools

_Last updated: 2026-05-18_

`websocket-tools` is a Chrome DevTools extension that helps developers inspect
WebSocket traffic on pages they are debugging. This document explains, in plain
language, exactly what the extension does and does not do with data.

## TL;DR

- We do **not** collect, transmit, sell, or share any personal data.
- All captured WebSocket traffic stays **inside your browser**.
- The extension has **no backend service** of any kind.
- The only data persisted locally is your own UI settings (e.g. saved filter
  favorites and language preference), stored via the standard
  [`chrome.storage`](https://developer.chrome.com/docs/extensions/reference/api/storage)
  API on your device.

## What the extension can access

To do its job, the extension requests the following Chrome permissions:

| Permission | Why it is needed |
|---|---|
| `activeTab` | To attach the DevTools panel to the tab you are currently inspecting. |
| `storage` | To persist your filter favorites, language choice, and other UI preferences locally on your device. |
| `host_permissions` for `http://*/*` and `https://*/*` | To inject the WebSocket proxy on the page you are debugging so that connection lifecycle events and frames can be displayed inside the DevTools panel. |

## What data is processed

When the DevTools panel is open, the extension observes WebSocket connections
that the inspected page opens, including:

- the connection URL,
- lifecycle events (open / close / error),
- the contents of frames sent and received.

This data is rendered inside the DevTools panel **in memory** for as long as
the panel is open. It is **not** sent to any remote server, and it is **not**
written to disk by the extension.

If you explicitly click **Export**, a log file is generated and saved via your
own browser's download flow — the extension itself never uploads anything.

## What data is stored on your device

Only the following items are written to `chrome.storage` on your local machine:

- saved filter favorites (names and filter expressions you created),
- selected UI language,
- minor UI preferences (such as panel layout state).

You can clear all of this at any time by removing the extension or by clearing
extension storage in `chrome://extensions`.

## What we do NOT do

- We do not collect analytics, telemetry, crash reports, or usage statistics.
- We do not include any third-party tracking SDKs.
- We do not transmit WebSocket payloads, URLs, cookies, credentials, page
  content, or any other browsing data off your device.
- We do not sell or transfer user data to third parties.
- We do not use the data for purposes unrelated to the single purpose of the
  extension (inspecting WebSocket traffic in DevTools).
- We do not use the data to determine creditworthiness or for lending purposes.

## Children's privacy

This extension is a developer tool and is not directed at children under 13.
We do not knowingly process data from children.

## Changes to this policy

We may update this policy to reflect changes in the extension's behavior or
for legal reasons. The "Last updated" date at the top indicates when the
policy was last modified.

## Source code

`websocket-tools` is open source. You can audit the full behavior of the
extension at:

<https://github.com/kaka-personal/websocket-tools>

## Contact

For privacy-related questions, please open an issue on the GitHub repository
linked above.
