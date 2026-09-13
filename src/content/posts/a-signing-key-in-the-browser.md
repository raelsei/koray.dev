---
title: I put a signing key in the browser on purpose
description: What that buys, split by what the attacker can already do, and why the property that actually protects the user is not in my code at all.
pubDatetime: 2026-05-30T06:00:00.000Z
tags: [signing]
---

## the constraint that removes every good option

Each action needs a signature. At the interaction rate involved, a wallet prompt
per action is not a product. And the whole premise is that no server ever holds
key material, so moving the key server-side is not a tradeoff; it is the thing
being sold.

That leaves a signing key living in a browser tab, which is the one place
everybody agrees a key should never live.

## sealed under a wrapper the page cannot export

```typescript file="delegate.ts" accent
// The wrapping key is created non-extractable and stored as a live key handle,
// never as bytes. Storage inspection yields an opaque object and ciphertext.
const wrapper = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  false, // ← the entire security delta
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

The plaintext is zeroed after sealing and again after every unseal. Loading
checks expiry first and an expired record deletes itself rather than handing back
a key that would fail later as an opaque signature error. Clearing removes the
ciphertext _and_ the wrapper. Signing out treats that deletion as a
precondition. If it throws, the sign-out aborts loudly, because the alternative
is leaving a signing-capable tab on a shared machine while the UI says otherwise.

## be precise about what this buys

Three weaker versions fail in ways worth naming. A raw key in storage is
readable by any script and exfiltrable forever. A key encrypted under a
passphrase-derived or byte-stored key sits next to its own unlock material, so
the encryption is decoration. A key encrypted under an _extractable_ wrapper is
exported once and held offline.

Non-extractability changes what an attacker walks away with. It does not change
what they can do while they are there:

- **Storage read access** (a stolen disk, another local account, devtools on an
  unattended machine) yields ciphertext and a handle that will not export. In
  practice, nothing. This is the case the design defeats.
- **Script execution in the page** yields full signing capability for as long as
  the tab is compromised. They cannot steal the key. They do not need to; they
  can call the same decrypt-and-sign path the application calls.

> Non-extractability buys non-persistence of the compromise, not prevention of
> it. Anyone who says "we encrypt keys in the browser" and stops there has
> described the weaker property.

## the part that actually protects the user is not mine

The delegated key is scope-limited by the upstream protocol to a specific class
of action. It cannot move funds. That is the property doing the real work here,
and I did not implement it; I depend on it.

Which means the honest risk statement is not about my encryption. It is that if
that upstream scope were ever widened, every line above becomes an elaborate way
of describing a withdrawal key in a browser tab. The custody design is
downstream of somebody else's authorisation model, and it is worth knowing which
of your security properties you own and which you are renting.

The same reasoning drives the split between the two signers. Rare, high-authority
actions (granting the delegation, setting the fee ceiling) are signed by the
main wallet. Frequent, low-authority ones are signed by the delegate. The split
is not by how often the button is pressed; it is by what you would accept an
injected script authorising on your behalf. The fee ceiling belongs on the
owner's side not because it is rare but because it is the one control that
bounds what the front end can charge, and letting the hot key raise its own
ceiling would be self-dealing by construction.

## the expiry encoding is a joke that works

There is no expiry field in the delegation. The convention is that the timestamp
is appended to the delegation's human-readable _display name_, and parsed back
out of it upstream.

I want to be rude about this and cannot entirely, because it has a real
consequence that saves the design: since the suffix is stripped when names are
matched, re-approving under the same base name **replaces** the previous
delegation instead of accumulating toward the per-account cap. Rotation works as
a side effect of a display-name convention.

## when this stops working

The gate is checked on both sides: a local record that exists and has not
expired, and an address present in the upstream delegation list with its own
unexpired stamp. Neither side is scoped to the connected account. Switch wallet
accounts mid-session and the local key is still there, still valid, still
belonging to the previous address; the upstream gate is the only thing that
catches it, and it catches it as a rejection rather than as a prompt.

There is no proactive rotation and no revocation from this surface. The recovery
story for an expired or lost key is re-running setup, which costs one wallet
signature. That is acceptable, and it is not the same thing as designed.

Payload canonicalisation (field ordering, nonce, replay window) is entirely
the vendored client's. Replay resistance is therefore a property I assume rather
than verify, and the one failure mode that leaks through is clock skew: a device
with a wrong clock produces rejections with no message that would ever lead
someone to look at their clock.

_written in İstanbul, may 2026 · EOF_
