"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables with proper priority (system > .env)
require("./scripts/load-env.js");
// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
// Bundle ID can only contain letters, numbers, and dots
// Android requires each dot-separated segment to start with a letter
var rawBundleId = "space.manus.big.buttons.t20260421085540";
var bundleId = rawBundleId
    .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
    .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
    .replace(/\.+/g, ".") // Collapse consecutive dots
    .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
    .toLowerCase()
    .split(".")
    .map(function (segment) {
    // Android requires each segment to start with a letter
    // Prefix with 'x' if segment starts with a digit
    return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
})
    .join(".") || "space.manus.app";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
var timestamp = (_b = (_a = bundleId.split(".").pop()) === null || _a === void 0 ? void 0 : _a.replace(/^t/, "")) !== null && _b !== void 0 ? _b : "";
var schemeFromBundleId = "manus".concat(timestamp);
var env = {
    // App branding - update these values directly (do not use env vars)
    appName: "Big Buttons TV",
    appSlug: "big-buttons-tv",
    // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
    // Leave empty to use the default icon from assets/images/icon.png
    logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663583323129/CjFhUoEGpPKuEFuXP4nrSe/big-buttons-icon-Jn55SEpBGjL9FRXQSF6pTq.png",
    scheme: schemeFromBundleId,
    iosBundleId: bundleId,
    androidPackage: "com.vincienterprises.bigbuttonstv",
};
var config = {
    name: env.appName,
    slug: env.appSlug,
    version: "1.0.0",
    orientation: "landscape",
    icon: "./assets/images/icon.png",
    scheme: env.scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
        bundleIdentifier: env.iosBundleId,
        "infoPlist": {
            "ITSAppUsesNonExemptEncryption": false
        }
    },
    android: {
        icon: "./assets/images/icon.png",
        banner: "./assets/images/tv_banner.png",
        adaptiveIcon: {
            backgroundColor: "#E6F4FE",
            foregroundImage: "./assets/images/android-icon-foreground.png",
            backgroundImage: "./assets/images/android-icon-background.png",
            monochromeImage: "./assets/images/android-icon-monochrome.png",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: env.androidPackage,
        permissions: ["INTERNET"],
        intentFilters: [
            {
                action: "VIEW",
                autoVerify: true,
                data: [
                    {
                        scheme: env.scheme,
                        host: "*",
                    },
                ],
                category: ["BROWSABLE", "DEFAULT"],
            },
        ],
    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png",
    },
    plugins: [
        "expo-router",
        "./plugins/withAndroidTv",
        [
            "expo-audio",
            {
                microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
            },
        ],
        [
            "expo-splash-screen",
            {
                image: "./assets/images/splash-icon.png",
                imageWidth: 200,
                resizeMode: "contain",
                backgroundColor: "#ffffff",
                dark: {
                    backgroundColor: "#000000",
                },
            },
        ],
        [
            "expo-build-properties",
            {
                android: {
                    buildArchs: ["armeabi-v7a", "arm64-v8a"],
                    minSdkVersion: 24,
                    targetSdkVersion: 35,
                },
            },
        ],
    ],
    experiments: {
        typedRoutes: false,
        reactCompiler: false,
    },
};
exports.default = config;
