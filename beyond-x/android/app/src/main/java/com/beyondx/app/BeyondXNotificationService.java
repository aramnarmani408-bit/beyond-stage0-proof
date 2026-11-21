package com.beyondx.app;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

// Notification read / reply / dismiss (2B). The user must enable this
// listener in Settings > Notifications; BEYOND X can never enable it.
// Notifications are kept in memory only (capped at 20, newest last),
// never stored, never sent. Reply works only for notifications that
// expose a RemoteInput action; others honestly report no_action.
// Reply/dismiss run through the confirmation pipeline in the JS panel.
public class BeyondXNotificationService extends NotificationListenerService {
  private static final int CAP = 20;
  private static final LinkedHashMap<String, Entry> active = new LinkedHashMap<>();
  private static volatile BeyondXNotificationService instance = null;

  private static class Entry {
    String key, pkg, title, text;
    long time;
    Notification.Action action;
    RemoteInput input;
  }

  public static boolean isEnabled(Context ctx) {
    String enabled = Settings.Secure.getString(ctx.getContentResolver(), "enabled_notification_listeners");
    return enabled != null && enabled.contains(ctx.getPackageName());
  }

  public static JSArray list() {
    JSArray out = new JSArray();
    List<Entry> copy;
    synchronized (active) { copy = new ArrayList<>(active.values()); }
    for (int i = copy.size() - 1; i >= 0; i--) {
      Entry e = copy.get(i);
      JSObject o = new JSObject();
      o.put("key", e.key);
      o.put("package", e.pkg);
      o.put("title", e.title);
      o.put("text", e.text);
      o.put("time", e.time);
      o.put("canReply", e.action != null);
      out.put(o);
    }
    return out;
  }

  // Returns "ok", "no_key", "no_action", or "failed".
  public static String reply(String key, String text) {
    Entry e;
    synchronized (active) { e = active.get(key); }
    if (e == null) return "no_key";
    if (e.action == null || e.input == null) return "no_action";
    Intent fill = new Intent();
    Bundle results = new Bundle();
    results.putCharSequence(e.input.getResultKey(), text);
    RemoteInput.addResultsToIntent(new RemoteInput[]{e.input}, fill, results);
    try {
      e.action.actionIntent.send(null, 0, fill);
      return "ok";
    } catch (PendingIntent.CanceledException ex) { return "failed"; }
  }

  public static boolean dismiss(String key) {
    BeyondXNotificationService s = instance;
    if (s == null) return false;
    synchronized (active) { if (!active.containsKey(key)) return false; }
    s.cancelNotification(key);
    return true;
  }

  @Override
  public void onListenerConnected() {
    instance = this;
    try {
      for (StatusBarNotification sbn : getActiveNotifications()) add(sbn);
    } catch (Exception e) { }
  }

  @Override
  public void onListenerDisconnected() { if (instance == this) instance = null; }

  @Override
  public void onNotificationPosted(StatusBarNotification sbn) { add(sbn); }

  @Override
  public void onNotificationRemoved(StatusBarNotification sbn) {
    synchronized (active) { active.remove(sbn.getKey()); }
  }

  private static void add(StatusBarNotification sbn) {
    Notification n = sbn.getNotification();
    if (n == null) return;
    Entry e = new Entry();
    e.key = sbn.getKey();
    e.pkg = sbn.getPackageName();
    Bundle ex = n.extras;
    CharSequence t = ex != null ? ex.getCharSequence(Notification.EXTRA_TITLE) : null;
    CharSequence x = ex != null ? ex.getCharSequence(Notification.EXTRA_TEXT) : null;
    e.title = t == null ? "" : t.toString();
    e.text = x == null ? "" : x.toString();
    e.time = sbn.getPostTime();
    if (n.actions != null) {
      for (Notification.Action a : n.actions) {
        if (a == null || a.getRemoteInputs() == null) continue;
        for (RemoteInput r : a.getRemoteInputs()) {
          if (r != null) { e.action = a; e.input = r; break; }
        }
        if (e.action != null) break;
      }
    }
    synchronized (active) {
      active.put(e.key, e);
      while (active.size() > CAP) active.remove(active.keySet().iterator().next());
    }
  }
}
