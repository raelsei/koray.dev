---
title: What a non-extractable key actually protects
description: "Keeping a signing key in the browser under a WebCrypto key that cannot be exported: what that stops, what it does not, and where the real protection comes from."
pubDatetime: 2026-05-30T06:00:00.000Z
tags: [security]
---

The product needed every user action signed with the user's key. Asking the user
to approve each signature would have made it unusable, and the design ruled out
any server holding key material. So the user approves a delegated key once, with
narrow permissions, and the app keeps that key in the browser: the one place
everyone agrees a key should not live.

## Sealed under a key the page cannot export

```typescript file="delegate.ts" accent
// The wrapping key is non-extractable and stored in IndexedDB as a CryptoKey
// handle, never as bytes. Reading storage yields a handle and ciphertext.
const wrapper = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  false, // extractable: this flag is the whole design
  ["encrypt", "decrypt"]
);

const iv = crypto.getRandomValues(new Uint8Array(12));
const sealed = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  wrapper,
  secret
);
secret.fill(0);

await store.put({ sealed, iv, wrapper, expiresAt });
```

The plaintext is zeroed after sealing and after every use. Loading checks expiry
first; an expired record deletes itself instead of returning a key that would
fail later with an unhelpful signature error. Clearing removes both the
ciphertext and the wrapper.

Sign-out requires that deletion to succeed. If it throws, sign-out fails loudly,
because the alternative is a tab that can still sign on a shared machine while
the UI says you are signed out.

## What it stops and what it does not

Three weaker designs are worth naming. A raw key in storage can be read by any
script and copied forever. A key encrypted under a wrapping key stored as bytes
sits next to its own unlock material, so the encryption is decoration. A key
encrypted under an extractable wrapper can be exported once and used offline.

A non-extractable wrapper changes what an attacker can take away. It does not
change what they can do while they are in:

- **Read access to storage** (a stolen disk, another local account, devtools on
  an unattended machine) yields ciphertext and a handle that will not export.
  This is the case the design defeats.
- **Script execution in the page** (XSS, a compromised dependency) yields full
  signing ability for as long as the page is compromised. The attacker cannot
  steal the key, and does not need to: they can call the same decrypt-and-sign
  path the app uses.

So non-extractability limits how long a compromise lasts. It does not prevent
one. "We encrypt keys in the browser" describes the weaker property unless it
says which of these two threats it covers.

## The real protection is the key's scope

The delegated key can authorise one class of low-risk action and nothing
irreversible. That restriction does most of the work, and it is not mine: the
upstream protocol enforces it.

So the real risk statement is not about my encryption. If the upstream scope
were ever widened, everything above would describe a high-value key sitting in a
browser tab. It is worth knowing which security properties you own and which
you depend on someone else for.

The same reasoning decides which key signs what. Rare, high-authority actions,
such as creating the delegation or setting its limits, are signed by the user's
main key. Frequent, low-authority actions are signed by the delegate. The split
is not about frequency. It is about what you would accept an injected script
approving in the user's name, and a key must never be able to raise its own
limits.

## Known gaps

The key is checked on both sides: a local record that exists and has not
expired, and an upstream record of the delegation with its own expiry. Neither
is tied to the connected account. If the user switches accounts mid-session, the
local key is still there and still valid for the previous account. Only the
upstream check catches it, and the user sees a rejection, not a prompt to set up
again.

There is no proactive rotation and no revocation from the app. Recovering from
an expired or lost key means running setup again, which costs one approval from
the main key. That is acceptable, but it is a fallback, not a design.

Replay protection (field ordering, nonces, time windows) comes from the vendored
client library. I rely on it rather than verify it. The one failure that leaks
through is clock skew: a device with the wrong time gets rejections with no
message that would lead anyone to check their clock.
