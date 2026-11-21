package com.beyondx.app;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

// Installed-app inventory (PackageManager). Needs QUERY_ALL_PACKAGES
// in the manifest for the full list; without it Android returns only
// the apps visible to this app. Sorted by label, capped at 500.
public class BeyondXApps {
  public static JSArray list(Context ctx) {
    PackageManager pm = ctx.getPackageManager();
    List<ApplicationInfo> apps = new ArrayList<>(pm.getInstalledApplications(0));
    Collections.sort(apps, new Comparator<ApplicationInfo>() {
      public int compare(ApplicationInfo a, ApplicationInfo b) {
        return label(pm, a).compareToIgnoreCase(label(pm, b));
      }
    });
    JSArray out = new JSArray();
    int n = 0;
    for (ApplicationInfo a : apps) {
      if (n++ >= 500) break;
      JSObject o = new JSObject();
      o.put("package", a.packageName);
      o.put("label", label(pm, a));
      String ver = "";
      long first = 0;
      try {
        PackageInfo pi = pm.getPackageInfo(a.packageName, 0);
        if (pi.versionName != null) ver = pi.versionName;
        first = pi.firstInstallTime;
      } catch (Exception e) { /* stays empty */ }
      o.put("version", ver);
      o.put("system", (a.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
      o.put("installed", first);
      out.put(o);
    }
    return out;
  }

  private static String label(PackageManager pm, ApplicationInfo a) {
    CharSequence l = pm.getApplicationLabel(a);
    return l == null ? a.packageName : l.toString();
  }
}
