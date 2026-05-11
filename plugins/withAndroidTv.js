const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function addUsesFeature(manifest, name, required) {
  manifest.manifest['uses-feature'] = ensureArray(manifest.manifest['uses-feature']);
  const features = manifest.manifest['uses-feature'];
  const exists = features.some((feature) => feature.$ && feature.$['android:name'] === name);
  if (!exists) {
    features.push({
      $: {
        'android:name': name,
        'android:required': String(required),
      },
    });
  }
}

function addCategory(intentFilter, categoryName) {
  intentFilter.category = ensureArray(intentFilter.category);
  const exists = intentFilter.category.some((category) => category.$ && category.$['android:name'] === categoryName);
  if (!exists) {
    intentFilter.category.push({ $: { 'android:name': categoryName } });
  }
}

function withAndroidTvManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    addUsesFeature(manifest, 'android.software.leanback', true);
    addUsesFeature(manifest, 'android.hardware.touchscreen', false);

    const application = manifest.manifest.application?.[0];
    if (application?.$) {
      application.$['android:banner'] = '@drawable/tv_banner';
      application.$['android:isGame'] = 'false';
    }

    const mainActivity = application?.activity?.find((activity) => {
      return activity.$?.['android:name'] === '.MainActivity' || activity.$?.['android:name']?.includes('MainActivity');
    });

    if (mainActivity) {
      mainActivity.$['android:screenOrientation'] = 'landscape';
      mainActivity.$['android:resizeableActivity'] = 'true';
      mainActivity['intent-filter'] = ensureArray(mainActivity['intent-filter']);

      const launchFilter = mainActivity['intent-filter'].find((filter) => {
        const actions = ensureArray(filter.action);
        return actions.some((action) => action.$?.['android:name'] === 'android.intent.action.MAIN');
      });

      if (launchFilter) {
        addCategory(launchFilter, 'android.intent.category.LEANBACK_LAUNCHER');
      } else {
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [
            { $: { 'android:name': 'android.intent.category.LAUNCHER' } },
            { $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } },
          ],
        });
      }
    }

    return config;
  });
}

function withAndroidTvBanner(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const src = path.join(projectRoot, 'assets', 'images', 'tv_banner.png');
      const drawableDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable');
      const dest = path.join(drawableDir, 'tv_banner.png');
      if (fs.existsSync(src)) {
        fs.mkdirSync(drawableDir, { recursive: true });
        fs.copyFileSync(src, dest);
      }
      return config;
    },
  ]);
}

module.exports = function withAndroidTv(config) {
  config = withAndroidTvManifest(config);
  config = withAndroidTvBanner(config);
  return config;
};
