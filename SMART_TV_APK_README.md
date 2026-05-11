# Big Buttons TV APK Build Instructions

This project has been adjusted for Android TV / Google TV APK builds.

## What was changed

- App name changed to **Big Buttons TV**.
- Android package changed to `com.vincienterprises.bigbuttonstv`.
- App orientation changed to **landscape** for TV screens.
- Added Android TV launcher support using `LEANBACK_LAUNCHER`.
- Added Android TV banner artwork at `assets/images/tv_banner.png`.
- Added D-pad focus highlighting on the main profile screen, loved-one big button screen, and picture/video choice screen.
- Added a GitHub Actions workflow at `.github/workflows/build-tv-apk.yml`.

## How to build the APK on GitHub

1. Create a new GitHub repository.
2. Upload everything from this ZIP into the repository.
3. Commit the files to `main`.
4. Open the **Actions** tab.
5. Click **Build Big Buttons TV APK**.
6. Click **Run workflow**.
7. When it finishes, open the completed run.
8. Download the artifact named **big-buttons-tv-apk**.
9. Inside it, you will find:

```text
big-buttons-tv-debug.apk
```

That APK can be sideloaded onto Android TV / Google TV devices.

## Important note

This is a **debug APK**, which is perfect for testing and sideloading. It is not a Play Store release APK. For Play Store release later, you would create a signed release build.
