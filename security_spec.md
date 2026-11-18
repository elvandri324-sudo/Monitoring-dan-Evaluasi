# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Verified Identity Gate**: No collection permits unauthenticated or unverified-email reads/writes (`request.auth != null && request.auth.token.email_verified == true`).
2. **Ownership & Workspace Isolation**: Every mutable document belongs to `ownerUid` matching `request.auth.uid` on creation and immutable across updates (`incoming().ownerUid == existing().ownerUid`), or is accessed by the bootstrapped Super Admin (`elvandri324@gmail.com` with `email_verified == true`) or a document in `/admins/{uid}`.
3. **PII Isolation**: Collections storing personal contact or credential fields (`beneficiaries`, `appUsers`) strictly prohibit blanket `isSignedIn()` reads and require `existing().ownerUid == request.auth.uid || isAdmin()`.
4. **No Client-Delegated List Queries**: Every `allow list` block strictly evaluates `resource.data.ownerUid == request.auth.uid || isTokenAdmin()` with zero `get()`/`exists()` reads inside `allow list`.
5. **Path ID & Payload Bounds**: Every single-document operation validates `isValidId(docId)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars), strict key allowlisting (`hasAll` + `hasOnly`), bounded string `.size()`, bounded array `.size()`, and server timestamps (`request.time`).
6. **Terminal State Protection**: Completed projects (`status == 'Selesai'`), published reports (`status == 'Telah Diterbitkan'`), and closed error tickets (`status == 'Ditutup (Closed)'`) reject non-admin modifications unless overridden by `isAdmin()`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: `PERMISSION_DENIED`)
1. **Unauthenticated Read/List**: Anonymous client attempts `getDocs(collection(db, 'projects'))` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Auth token with `email_verified: false` attempts `setDoc(doc(db, 'projects', 'p1'), ...)` -> `PERMISSION_DENIED`.
3. **Shadow / Ghost Field Injection**: Valid owner sends `{ ..., isVerified: true }` or `{ ..., isAdmin: true }` -> `PERMISSION_DENIED` (`hasOnly` rejects unknown keys).
4. **Owner Spoofing on Create**: User `uidA` attempts `setDoc(doc(db, 'beneficiaries', 'b1'), { ..., ownerUid: 'uidB' })` -> `PERMISSION_DENIED`.
5. **Owner Mutation on Update**: User `uidA` attempts `updateDoc(doc(db, 'projects', 'p1'), { ownerUid: 'uidB' })` -> `PERMISSION_DENIED`.
6. **Admin Privilege Escalation**: Non-admin user attempts `setDoc(doc(db, 'admins', 'uidA'), { uid: 'uidA', role: 'Super Admin', ... })` -> `PERMISSION_DENIED`.
7. **Spoofed Email Claim Attack**: Attacker has token email `elvandri324@gmail.com` with `email_verified: false` -> `PERMISSION_DENIED`.
8. **Cross-Owner PII Read**: Authenticated `uidB` attempts `getDoc(doc(db, 'appUsers', 'user-002'))` owned by `uidA` -> `PERMISSION_DENIED`.
9. **Blanket List Query Scraping**: Authenticated `uidB` executes unfiltered `getDocs(collection(db, 'beneficiaries'))` without matching `ownerUid == uidB` -> `PERMISSION_DENIED`.
10. **Path ID Poisoning**: Client passes doc ID `'../etc/passwd'` or 500-char ID -> `PERMISSION_DENIED` (`isValidId`).
11. **Resource Exhaustion / Oversized String**: Client sends `title` of 5000 chars (exceeding `maxLength: 300`) or `targetLocations` > 100 items -> `PERMISSION_DENIED`.
12. **Client-Spoofed Timestamp / Terminal State Bypass**: Client submits `createdAt: Timestamp(2020)` instead of `serverTimestamp()`, or non-admin modifies a `Telah Diterbitkan` report -> `PERMISSION_DENIED`.
