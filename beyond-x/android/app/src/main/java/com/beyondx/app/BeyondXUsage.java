package com.beyondx.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// App usage (UsageStatsManager). The user must grant usage access in
// Settings first; without it this throws SecurityException and the
// plugin reports USER_ACTION_REQUIRED. Top 15 by foreground minutes.
public class BeyondXUsage {
  public static JSArray query(Context ctx, int days) {
    AppOpsManager ops = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
    int mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(), ctx.getPackageName());
    if (mode != AppOpsManager.MODE_ALLOWED) throw new SecurityException("usage access not granted");
    UsageStatsManager usm = (UsageStatsManager) ctx.getSystemService(Context.USAGE_STATS_SERVICE);
    long now = System.currentTimeMillis();
    long start = now - (long) days * 86400000L;
    List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, now);
    Map<String, Long> total = new HashMap<>();
    for (UsageStats s : stats) {
      long t = s.getTotalTimeInForeground();
      if (t <= 0) continue;
      Long old = total.get(s.getPackageName());
      total.put(s.getPackageName(), t + (old == null ? 0 : old));
    }
    List<Map.Entry<String, Long>> rows = new ArrayList<>(total.entrySet());
    Collections.sort(rows, new Comparator<Map.Entry<String, Long>>() {
      public int compare(Map.Entry<String, Long> a, Map.Entry<String, Long> b) {
        return Long.compare(b.getValue(), a.getValue());
      }
    });
    PackageManager pm = ctx.getPackageManager();
    JSArray out = new JSArray();
    int n = 0;
    for (Map.Entry<String, Long> e : rows) {
      if (n++ >= 15) break;
      JSObject o = new JSObject();
      o.put("package", e.getKey());
      String label = e.getKey();
      try {
        ApplicationInfo ai = pm.getApplicationInfo(e.getKey(), 0);
        CharSequence l = pm.getApplicationLabel(ai);
        if (l != null) label = l.toString();
      } catch (Exception ex) { /* package name stays */ }
      o.put("label", label);
      o.put("minutes", Math.round(e.getValue() / 60000.0));
      out.put(o);
    }
    return out;
  }
}
