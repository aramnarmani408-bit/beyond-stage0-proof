package com.beyondx.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.graphics.Rect;
import android.view.accessibility.AccessibilityNodeInfo;

import java.util.List;

// Controlled taps/gestures (2B). Called only through the confirmation
// pipeline in the JS panel: plan shown in Pashto, user confirms, tap
// executes, screen re-read to verify. The service instance comes from
// BeyondXAccessibilityService.getInstance(); null means the user has
// not enabled the service (the bridge rejects accessibility_disabled).
public class BeyondXGestures {
  public interface Done { void done(boolean ok); }

  public static void tapAt(BeyondXAccessibilityService s, int x, int y, final Done cb) {
    if (s == null) { cb.done(false); return; }
    Path p = new Path();
    p.moveTo(x, y);
    GestureDescription g = new GestureDescription.Builder()
        .addStroke(new GestureDescription.StrokeDescription(p, 0, 100)).build();
    s.dispatchGesture(g, new AccessibilityService.GestureResultCallback() {
      public void onCompleted(GestureDescription d) { cb.done(true); }
      public void onCancelled(GestureDescription d) { cb.done(false); }
    }, null);
  }

  public static void swipe(BeyondXAccessibilityService s, int x1, int y1, int x2, int y2, int ms, final Done cb) {
    if (s == null) { cb.done(false); return; }
    if (ms < 50) ms = 50;
    if (ms > 2000) ms = 2000;
    Path p = new Path();
    p.moveTo(x1, y1);
    p.lineTo(x2, y2);
    GestureDescription g = new GestureDescription.Builder()
        .addStroke(new GestureDescription.StrokeDescription(p, 0, ms)).build();
    s.dispatchGesture(g, new AccessibilityService.GestureResultCallback() {
      public void onCompleted(GestureDescription d) { cb.done(true); }
      public void onCancelled(GestureDescription d) { cb.done(false); }
    }, null);
  }

  // Finds the first visible node whose text contains `text`, taps its
  // centre, returns the node's label. Returns null when nothing matches
  // (the bridge rejects no_target); the callback fires only for a real tap.
  public static String tapText(BeyondXAccessibilityService s, String text, final Done cb) {
    if (s == null) return null;
    AccessibilityNodeInfo root = s.getRootInActiveWindow();
    if (root == null) return null;
    List<AccessibilityNodeInfo> found = root.findAccessibilityNodeInfosByText(text);
    String label = null;
    int cx = -1, cy = -1;
    for (AccessibilityNodeInfo n : found) {
      Rect r = new Rect();
      n.getBoundsInScreen(r);
      if (r.width() > 0 && r.height() > 0 && n.isVisibleToUser()) {
        CharSequence t = n.getText();
        if (t == null) t = n.getContentDescription();
        label = t == null ? text : t.toString();
        cx = r.centerX();
        cy = r.centerY();
        break;
      }
    }
    root.recycle();
    for (AccessibilityNodeInfo f : found) { try { f.recycle(); } catch (Exception e) { } }
    if (label == null) return null;
    tapAt(s, cx, cy, cb);
    return label;
  }
}
