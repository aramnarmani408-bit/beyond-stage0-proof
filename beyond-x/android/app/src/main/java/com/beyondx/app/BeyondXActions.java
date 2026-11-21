package com.beyondx.app;

import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Controlled actions (2B) — notifications, SMS, install/uninstall.
// SMS/install/uninstall only OPEN Android's own dialog or app; the
// user confirms there. Nothing sends, installs, or uninstalls
// silently. Notification reply/dismiss run through the confirmation
// pipeline in the JS panel.
@CapacitorPlugin(name = "BeyondXActions")
public class BeyondXActions extends Plugin {

  @PluginMethod
  public void listNotifications(PluginCall call) {
    if (!BeyondXNotificationService.isEnabled(getContext())) { call.reject("notification_disabled", "Enable BEYOND X in Settings > Notifications"); return; }
    JSObject r = new JSObject();
    r.put("notifications", BeyondXNotificationService.list());
    call.resolve(r);
  }

  @PluginMethod
  public void replyNotification(PluginCall call) {
    if (!BeyondXNotificationService.isEnabled(getContext())) { call.reject("notification_disabled", "Enable BEYOND X in Settings > Notifications"); return; }
    String key = call.getString("key", "");
    String text = call.getString("text", "");
    if (key.isEmpty() || text.isEmpty()) { call.reject("no_target", "key and text are required"); return; }
    String st = BeyondXNotificationService.reply(key, text);
    if (st.equals("no_key")) { call.reject("no_target", "Notification not found"); return; }
    if (st.equals("no_action")) { call.reject("no_action", "This notification cannot be replied to"); return; }
    if (!st.equals("ok")) { call.reject("reply_failed", "Reply failed"); return; }
    JSObject r = new JSObject();
    r.put("replied", true);
    call.resolve(r);
  }

  @PluginMethod
  public void dismissNotification(PluginCall call) {
    if (!BeyondXNotificationService.isEnabled(getContext())) { call.reject("notification_disabled", "Enable BEYOND X in Settings > Notifications"); return; }
    String key = call.getString("key", "");
    if (key.isEmpty()) { call.reject("no_target", "key is required"); return; }
    if (!BeyondXNotificationService.dismiss(key)) { call.reject("no_target", "Notification not found"); return; }
    JSObject r = new JSObject();
    r.put("dismissed", true);
    call.resolve(r);
  }

  @PluginMethod
  public void sendSms(PluginCall call) {
    String number = call.getString("number", "");
    String body = call.getString("body", "");
    if (number.isEmpty()) { call.reject("no_number", "number is required"); return; }
    Intent i = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + number));
    i.putExtra("sms_body", body);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    if (i.resolveActivity(getContext().getPackageManager()) == null) { call.reject("no_sms_app", "No SMS app found"); return; }
    getContext().startActivity(i);
    JSObject r = new JSObject();
    r.put("opened", true);
    call.resolve(r);
  }

  @PluginMethod
  public void installApk(PluginCall call) {
    String path = call.getString("path", "");
    java.io.File f = new java.io.File(path);
    if (!f.exists()) { call.reject("no_file", "APK file not found"); return; }
    Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
    Intent i = new Intent(Intent.ACTION_VIEW);
    i.setDataAndType(uri, "application/vnd.android.package-archive");
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
    if (i.resolveActivity(getContext().getPackageManager()) == null) { call.reject("no_installer", "No installer found"); return; }
    getContext().startActivity(i);
    JSObject r = new JSObject();
    r.put("opened", true);
    call.resolve(r);
  }

  @PluginMethod
  public void uninstallApp(PluginCall call) {
    String pkg = call.getString("package", "");
    if (pkg.isEmpty()) { call.reject("no_package", "package is required"); return; }
    try { getContext().getPackageManager().getPackageInfo(pkg, 0); }
    catch (Exception e) { call.reject("no_app", "App not installed"); return; }
    Intent i = new Intent(Intent.ACTION_DELETE, Uri.parse("package:" + pkg));
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    getContext().startActivity(i);
    JSObject r = new JSObject();
    r.put("opened", true);
    call.resolve(r);
  }
}
