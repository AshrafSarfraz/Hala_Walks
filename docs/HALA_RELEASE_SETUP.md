# Hala UI and release setup

The review branch unifies title/search toolbars, RTL back controls, safe area spacing, tabs, photo captions, category badges and detail typography. Chat retains its avatar/status content inside the same toolbar dimensions. Brand/gallery data and check-in photos fetch concurrently; the gallery appears without waiting for the check-in API. Galleries deduplicate URLs, omit the brand logo when photos are available, page at the actual visible width, cache neighbouring photos, and expose loading/retry states.

## Install and verify on devices

```sh
npm ci --legacy-peer-deps
cd ios
pod install
```

The new native dependency is react-native-device-info 14.1.1. The Podfile also registers the Camera, LocationWhenInUse and LocationAlways handlers already provided by react-native-permissions. Pod installation and a native rebuild are required; a Metro reload alone cannot install them.

Android/iOS native compilation and visual QA on a physical device must be completed before release. Test small phones, notches, Arabic/English and large system font sizes. Check headers/tabs, keyboard scrolling, image retry, galleries/swipe dots, permission denial/blocked/approximate location, returning from Settings, background alerts, notification taps and login/logout. The execution environment does not include an Android device/emulator or an iOS build toolchain.

## Permission behaviour

- Location and notification explanation cards appear after first real login, once per installation. Existing signed-in users see the updated flow once. Each card has an optional Not now action. Guest browsing does not request location from catalog/country widgets.
- Later, taking a photo or locating yourself opens a contextual explanation if access is missing. Concurrent calls share one explanation rather than opening overlapping dialogs.
- Settings → App permissions reopens the same cards. First-time requests use the native in-app permission prompt. Permanently blocked permissions expose an Open Settings action, and access is checked again when the app resumes.
- Camera access is requested when taking a photo. Gallery selection uses the system photo picker; the app does not request all contacts or all photos at startup.
- Settings → Nearby offer alerts is a separate opt-in. It asks for foreground location, notifications and background location. The tracker starts only with explicit consent and actual permission grants. Turning the switch off or logging out stops it. Android 11+ requires Settings for Allow all the time; this cannot be replaced by a custom in-app approval.

## Mandatory updates: Firebase configuration

The app reads Firestore `appConfig/hala` on release builds, listens for changes and rechecks when returning to the foreground. Debug builds bypass the gate. No remote configuration has been published by this change.

Create the document in the Firebase project the app already uses. Add a narrowly scoped public **read-only** rule for this document, since the update check runs before sign-in; writes must remain limited to trusted administrators. Integrate this rule into the project's existing rules rather than replacing them:

```text
match /appConfig/hala {
  allow read: if true;
  allow write: if false;
}
```

Firebase Console administrators can manage the document; untrusted app clients cannot.

Example structure (replace the iOS link with the actual App Store listing before enabling):

```json
{
  "enabled": false,
  "android": {
    "minimumBuild": 43,
    "latestVersion": "1.4.3",
    "storeUrl": "https://play.google.com/store/apps/details?id=com.halabsaudiappreactnativeversion"
  },
  "ios": {
    "minimumBuild": 143,
    "latestVersion": "1.4.3",
    "storeUrl": "https://apps.apple.com/app/hala/idREPLACE_WITH_NUMERIC_APP_ID"
  }
}
```

**Release order matters:**

1. Android is currently versionCode 42/versionName 1.4.2; iOS is build 142/version 1.4.2. Increase each native build number for the next release. They intentionally remain unchanged in this review branch.
2. Build and sign with the existing application ID/signing identity. Publish the update to Google Play/App Store and verify availability for the intended users/regions. Finish staged rollout before forcing everyone.
3. Install and test this update-capable version first. Older app binaries without this gate cannot be forced by this new frontend code. Any restriction on those older versions requires backend enforcement, which is outside this repository.
4. Set `minimumBuild` independently for Android/iOS to a build already available in that store. A build equal to or above the minimum remains usable. Set `enabled: true` after both platform configuration entries are valid, or provide only the released platform entry.
5. Older gate-capable builds show an Arabic/English Update now screen with no skip/back path. The button opens the appropriate store. Updates are installed by the user/store; the app does not silently install APKs.
6. To stop enforcing updates, set `enabled: false` or lower the minimum. Do not force users to a release that has been withdrawn.

A valid last-known policy is cached for offline use. On a first install with no known policy, an unavailable config service fails open after at most eight seconds. Malformed policies/unsafe URLs are rejected. Therefore this is an app experience gate, not a security boundary or an absolute offline guarantee. Enforce a minimum supported API/client version on the backend too if server access must be strictly denied for obsolete clients.

## Validation performed on this branch

- Android and iOS Metro release bundles generated successfully with their assets. This checks JavaScript compilation, not native linking or device rendering.
- 37 tests passed in 8 suites: app foreground notification identity, gallery URL handling, permission checks/queue/iOS handling, update policy boundaries/URLs, collection normalization, chat storage, message model and brand catalog.
- New shared header, media, permissions and update modules have no ESLint errors. Existing changed screens still contain pre-existing hook-dependency/unused-local lint errors; a repository-wide lint pass is not claimed.
- Full TypeScript checking has 46 pre-existing errors in `src/westwalk`; no Hala errors remain. Three Hala errors from the baseline were fixed.
- The full Jest suite is not green: `DarkControls` expects the former dark palette; `socket` lacks an AsyncStorage mock; `Profile` expects removed follow/post labels and has teardown errors. The Profile failure was reproduced with its original source. These existing tests were left unchanged.
