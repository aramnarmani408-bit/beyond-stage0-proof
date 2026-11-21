package com.beyondx.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

// READ-ONLY screen understanding. Reports the current screen's text +
// element labels to the bridge. The user must enable this service in
// Settings > Accessibility; BEYOND X can never enable it. Screen text
// is kept in memory only, never logged, never stored, never sent.
// No taps, no gestures in 2A (Phase 2B, with the confirmation pipeline).
public class BeyondXAccessibilityService extends AccessibilityService {
  private static volatile String lastText = "";
  private static volatile long lastTime = 0;

  public static String getLastText() { return lastText; }
  public static long getLastTime() { return lastTime; }

  @Override
  public void onAccessibilityEvent(AccessibilityEvent event) {
    int t = event.getEventType();
    if (t != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        && t != AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) return;
    AccessibilityNodeInfo root = getRootInActiveWindow();
    if (root == null) return;
    List<AccessibilityNodeInfo> owned = new ArrayList<>();
    owned.add(root);
    try {
      StringBuilder sb = new StringBuilder();
      ArrayDeque<AccessibilityNodeInfo> q = new ArrayDeque<>();
      q.add(root);
      int nodes = 0;
      while (!q.isEmpty() && nodes < 200 && sb.length() < 2000) {
        AccessibilityNodeInfo n = q.poll();
        nodes++;
        CharSequence tx = n.getText();
        if (tx == null || tx.length() == 0) tx = n.getContentDescription();
        if (tx != null && tx.length() > 0) {
          if (sb.length() > 0) sb.append(" ");
          sb.append(tx);
        }
        for (int i = 0; i < n.getChildCount(); i++) {
          AccessibilityNodeInfo c = n.getChild(i);
          if (c != null) { owned.add(c); q.add(c); }
        }
      }
      lastText = sb.toString();
      lastTime = System.currentTimeMillis();
    } finally {
      for (AccessibilityNodeInfo n : owned) { try { n.recycle(); } catch (Exception e) { } }
    }
  }

  @Override
  public void onInterrupt() { }
}
