const { withMainActivity, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * withTVKeyEvents
 *
 * Stock react-native (not the tvos fork) does not surface Android TV / Fire TV
 * D-pad or MENU key presses to JS. Pressable.onFocus / onBlur are unreliable
 * on Android TV with stock RN. This plugin patches MainActivity.kt to override
 * dispatchKeyEvent, forwards every keyDown to JS via DeviceEventEmitter under
 * the event name "BigButtonsTVKey", and lets a JS focus manager handle
 * navigation and the MENU button.
 *
 * It does NOT consume the events — super.dispatchKeyEvent is still called so
 * default behavior (text input, BACK) is preserved.
 */

const EMITTER_FILE_NAME = 'BigButtonsTVKeyEmitter.kt';

function emitterSource(packageName) {
  return `package ${packageName}

import android.app.Activity
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Helper that finds the current ReactContext (works under both old and new
 * architecture) and emits a JS event named "BigButtonsTVKey" with the keyCode.
 *
 * Failures are swallowed so an early key event (before the bridge is ready)
 * cannot crash the app.
 */
object BigButtonsTVKeyEmitter {
    fun emitKey(activity: Activity, keyCode: Int) {
        try {
            val ctx: ReactContext? = resolveReactContext(activity)
            if (ctx != null) {
                val params = Arguments.createMap()
                params.putInt("keyCode", keyCode)
                ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("BigButtonsTVKey", params)
            }
        } catch (t: Throwable) {
            // ignore - early boot, hot reload, etc.
        }
    }

    private fun resolveReactContext(activity: Activity): ReactContext? {
        val app = activity.application as? ReactApplication ?: return null
        // New architecture (Expo SDK 54 with newArchEnabled: true)
        try {
            val getReactHost = app.javaClass.methods.firstOrNull { it.name == "getReactHost" }
            val reactHost = getReactHost?.invoke(app)
            if (reactHost != null) {
                val getCurrentReactContext = reactHost.javaClass.methods.firstOrNull { it.name == "getCurrentReactContext" }
                val ctx = getCurrentReactContext?.invoke(reactHost) as? ReactContext
                if (ctx != null) return ctx
            }
        } catch (t: Throwable) {
            // fall through
        }
        // Old architecture fallback
        try {
            val host = app.reactNativeHost
            val rim = host.reactInstanceManager
            return rim.currentReactContext
        } catch (t: Throwable) {
            return null
        }
    }
}
`;
}

function withTVKeyEmitterFile(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const pkg = (config.android && config.android.package) || 'com.app';
      const pkgPath = pkg.split('.').join(path.sep);
      const javaRoot = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', pkgPath);
      if (!fs.existsSync(javaRoot)) {
        fs.mkdirSync(javaRoot, { recursive: true });
      }
      fs.writeFileSync(path.join(javaRoot, EMITTER_FILE_NAME), emitterSource(pkg), 'utf8');
      return config;
    },
  ]);
}

function withDispatchKeyEvent(config) {
  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;
    const language = config.modResults.language; // 'kt' or 'java'

    if (language !== 'kt') {
      // Big Buttons targets Expo SDK 54 which emits Kotlin MainActivity. If we
      // see Java, skip rather than corrupt the file.
      return config;
    }

    // Add KeyEvent import if missing
    if (!/import android\.view\.KeyEvent/.test(contents)) {
      contents = contents.replace(
        /(package [^\n]+\n)/,
        `$1\nimport android.view.KeyEvent\n`
      );
    }

    // Inject dispatchKeyEvent override if not already there
    if (!/fun dispatchKeyEvent\(/.test(contents)) {
      // Insert right before the final closing brace of the class
      contents = contents.replace(/\n\}\s*$/, `
  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    try {
      if (event.action == KeyEvent.ACTION_DOWN) {
        BigButtonsTVKeyEmitter.emitKey(this, event.keyCode)
      }
    } catch (t: Throwable) {
      // never let a key event crash the activity
    }
    // For D-pad navigation and MENU we want our JS focus manager to be the
    // sole authority - returning true tells Android we handled the event so
    // its default focus search does not also move focus. BUT if a text
    // input is currently focused (soft keyboard up) we let the default
    // handler run so D-pad inside the input still works and typing keys
    // are not swallowed.
    val keyCode = event.keyCode
    val isNavKey = keyCode == KeyEvent.KEYCODE_DPAD_UP ||
                   keyCode == KeyEvent.KEYCODE_DPAD_DOWN ||
                   keyCode == KeyEvent.KEYCODE_DPAD_LEFT ||
                   keyCode == KeyEvent.KEYCODE_DPAD_RIGHT ||
                   keyCode == KeyEvent.KEYCODE_DPAD_CENTER ||
                   keyCode == KeyEvent.KEYCODE_ENTER ||
                   keyCode == KeyEvent.KEYCODE_MENU
    if (isNavKey) {
      val focused = currentFocus
      if (focused is android.widget.EditText) {
        return super.dispatchKeyEvent(event)
      }
      // Still call super so other listeners (e.g. accessibility) can react,
      // then return true to suppress Android default focus traversal.
      super.dispatchKeyEvent(event)
      return true
    }
    return super.dispatchKeyEvent(event)
  }
}
`);
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withTVKeyEvents(config) {
  config = withTVKeyEmitterFile(config);
  config = withDispatchKeyEvent(config);
  return config;
};
