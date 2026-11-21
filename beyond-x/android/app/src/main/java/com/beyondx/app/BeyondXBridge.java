package com.beyondx.app;

import android.content.Context;
import android.content.Intent;
import android.bluetooth.BluetoothAdapter;
import android.net.wifi.WifiManager;
import android.provider.Settings;
import android.view.accessibility.AccessibilityManager;
import android.accessibilityservice.AccessibilityServiceInfo;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// BEYOND X native bridge (Phase 2A). JS side: mobilebridge.js.
// Every method resolves {data} or rejects with a CODE the JS maps to
// a registry status (usage_access_required / accessibility_disabled /
// consent_denied -> USER_ACTION_REQUIRED; unsupported_api ->
// BLOCKED_BY_ANDROID). Nothing here enables a service or permission
// silently — the user always grants in Android Settings or dialogs.
@CapacitorPlugin(name = "BeyondXBridge")
public class BeyondXBridge extends Plugin {

  @PluginMethod
  public void listApps(PluginCall call) {
    try {
      JSObject r = new JSObject();
      r.put("apps", BeyondXApps.list(getContext()));
      call.resolve(r);
    } catch (Exception e) { call.reject("list_failed", e.getMessage()); }
  }

  @PluginMethod
  public void launchApp(PluginCall call) {
    String pkg = call.getString("package");
    if (pkg == null || pkg.isEmpty()) { call.reject("no_package", "package is required"); return; }
    try {
      Intent i = getContext().getPackageManager().getLaunchIntentForPackage(pkg);
      if (i == null) { call.reject("no_launch_intent", "This app has no launcher"); return; }
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(i);
      JSObject r = new JSObject();
      r.put("launched", true);
      call.resolve(r);
    } catch (Exception e) { call.reject("launch_failed", e.getMessage()); }
  }

  @PluginMethod
  public void appUsage(PluginCall call) {
    int days = call.getInt("days", 7);
    if (days < 1) days = 1;
    if (days > 30) days = 30;
    try {
      JSObject r = new JSObject();
      r.put("apps", BeyondXUsage.query(getContext(), days));
      call.resolve(r);
    } catch (SecurityException e) { call.reject("usage_access_required", "Grant usage access in Settings");
    } catch (Exception e) { call.reject("usage_failed", e.getMessage()); }
  }

  @PluginMethod
  public void readScreen(PluginCall call) {
    AccessibilityManager am = (AccessibilityManager) getContext().getSystemService(Context.ACCESSIBILITY_SERVICE);
    boolean on = false;
    for (AccessibilityServiceInfo info : am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)) {
      if (info.getId().startsWith(getContext().getPackageName())) { on = true; break; }
    }
    if (!on) { call.reject("accessibility_disabled", "Enable BEYOND X in Settings > Accessibility"); return; }
    JSObject r = new JSObject();
    r.put("text", BeyondXAccessibilityService.getLastText());
    r.put("time", BeyondXAccessibilityService.getLastTime());
    call.resolve(r);
  }

  @PluginMethod
  public void scheduleTask(PluginCall call) {
    String title = call.getString("title", "BEYOND X");
    String text = call.getString("text", "");
    int mins = call.getInt("delayMinutes", 60);
    if (mins < 1) mins = 1;
    if (mins > 10080) mins = 10080;
    try {
      JSObject r = new JSObject();
      r.put("id", BeyondXTasks.schedule(getContext(), title, text, mins));
      call.resolve(r);
    } catch (Exception e) { call.reject("schedule_failed", e.getMessage()); }
  }

  // Radio states (Phase 3 help): each read try/caught, null on failure.
  @PluginMethod
  public void radioStates(PluginCall call) {
    JSObject r = new JSObject();
    try { WifiManager w = (WifiManager) getContext().getApplicationContext().getSystemService(Context.WIFI_SERVICE); r.put("wifi", w != null && w.isWifiEnabled()); } catch (Exception e) { r.put("wifi", JSObject.NULL); }
    try { BluetoothAdapter b = BluetoothAdapter.getDefaultAdapter(); r.put("bluetooth", b != null && b.isEnabled()); } catch (Exception e) { r.put("bluetooth", JSObject.NULL); }
    try { r.put("airplane", Settings.Global.getInt(getContext().getContentResolver(), Settings.Global.AIRPLANE_MODE_ON, 0) == 1); } catch (Exception e) { r.put("airplane", JSObject.NULL); }
    call.resolve(r);
  }
}
