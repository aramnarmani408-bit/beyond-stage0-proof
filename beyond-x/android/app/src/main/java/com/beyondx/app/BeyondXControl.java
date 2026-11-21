package com.beyondx.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Build;

import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

// Controlled interaction (2B) — taps/gestures + screen capture.
// Every tap/gesture runs only through the confirmation pipeline in
// the JS panel: plan shown in Pashto, user confirms, execute, screen
// re-read to verify. Capture needs Android's consent dialog every
// time; on API 34+ it runs through the foreground service.
@CapacitorPlugin(name = "BeyondXControl")
public class BeyondXControl extends Plugin {

  @PluginMethod
  public void tapScreen(final PluginCall call) {
    BeyondXAccessibilityService s = BeyondXAccessibilityService.getInstance();
    if (s == null) { call.reject("accessibility_disabled", "Enable BEYOND X in Settings > Accessibility"); return; }
    int x = call.getInt("x", -1), y = call.getInt("y", -1);
    if (x < 0 || y < 0) { call.reject("no_target", "x and y are required"); return; }
    call.setKeepAlive(true);
    BeyondXGestures.tapAt(s, x, y, new BeyondXGestures.Done() {
      public void done(boolean ok) {
        if (ok) { JSObject r = new JSObject(); r.put("tapped", true); call.resolve(r); }
        else call.reject("tap_failed", "Tap did not complete");
      }
    });
  }

  @PluginMethod
  public void swipeScreen(final PluginCall call) {
    BeyondXAccessibilityService s = BeyondXAccessibilityService.getInstance();
    if (s == null) { call.reject("accessibility_disabled", "Enable BEYOND X in Settings > Accessibility"); return; }
    int x1 = call.getInt("x1", -1), y1 = call.getInt("y1", -1);
    int x2 = call.getInt("x2", -1), y2 = call.getInt("y2", -1);
    int ms = call.getInt("ms", 300);
    if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0) { call.reject("no_target", "start and end points are required"); return; }
    call.setKeepAlive(true);
    BeyondXGestures.swipe(s, x1, y1, x2, y2, ms, new BeyondXGestures.Done() {
      public void done(boolean ok) {
        if (ok) { JSObject r = new JSObject(); r.put("swiped", true); call.resolve(r); }
        else call.reject("tap_failed", "Swipe did not complete");
      }
    });
  }

  @PluginMethod
  public void tapText(final PluginCall call) {
    BeyondXAccessibilityService s = BeyondXAccessibilityService.getInstance();
    if (s == null) { call.reject("accessibility_disabled", "Enable BEYOND X in Settings > Accessibility"); return; }
    String text = call.getString("text", "");
    if (text.isEmpty()) { call.reject("no_target", "text is required"); return; }
    call.setKeepAlive(true);
    final String[] label = new String[1];
    String found = BeyondXGestures.tapText(s, text, new BeyondXGestures.Done() {
      public void done(boolean ok) {
        if (ok) { JSObject r = new JSObject(); r.put("tapped", true); r.put("label", label[0]); call.resolve(r); }
        else call.reject("tap_failed", "Tap did not complete");
      }
    });
    if (found == null) { call.reject("no_target", "No such text on screen"); return; }
    label[0] = found;
  }

  @PluginMethod
  public void captureScreen(PluginCall call) {
    MediaProjectionManager mpm = (MediaProjectionManager) getContext().getSystemService(Context.MEDIA_PROJECTION_SERVICE);
    call.setKeepAlive(true);
    startActivityForResult(call, mpm.createScreenCaptureIntent(), "onCaptureResult");
  }

  @ActivityCallback
  private void onCaptureResult(PluginCall call, ActivityResult result) {
    if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
      call.reject("consent_denied", "Screen capture consent was not given");
      return;
    }
    if (Build.VERSION.SDK_INT >= 34) {
      Intent si = new Intent(getContext(), BeyondXCaptureService.class);
      si.putExtra("code", result.getResultCode());
      si.putExtra("data", result.getData());
      BeyondXCaptureService.pendingCall = call;
      getContext().startForegroundService(si);
      return;
    }
    BeyondXCapture.run(this, call, result.getResultCode(), result.getData());
  }
}
