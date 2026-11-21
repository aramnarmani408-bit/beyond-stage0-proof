package com.beyondx.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.IBinder;

import com.getcapacitor.PluginCall;

// Foreground service for screen capture on Android 14+ (2B). On API
// 34+, MediaProjection must be created from a foreground service of
// type mediaProjection — the 2A direct path is refused there. One-shot
// only: the service stops itself after the frame. The PluginCall
// crosses via a static holder (same process; call.resolve is
// thread-safe in Capacitor). The A10 (API 29/30) never uses this path.
public class BeyondXCaptureService extends Service {
  public static volatile PluginCall pendingCall = null;
  private static final String CH = "bx-capture";
  private MediaProjection proj = null;

  @Override
  public IBinder onBind(Intent intent) { return null; }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent == null || !intent.hasExtra("code")) { stopSelf(); return START_NOT_STICKY; }
    NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    nm.createNotificationChannel(new NotificationChannel(CH, "BEYOND X سکرین شاټ", NotificationManager.IMPORTANCE_LOW));
    Notification n = new Notification.Builder(this, CH)
        .setContentTitle("BEYOND X")
        .setContentText("سکرین شاټ اخیستل کېږي...")
        .setSmallIcon(android.R.drawable.ic_menu_camera)
        .build();
    if (Build.VERSION.SDK_INT >= 29) {
      startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);
    } else {
      startForeground(1, n);
    }
    int code = intent.getIntExtra("code", 0);
    Intent data = intent.getParcelableExtra("data");
    MediaProjectionManager mpm = (MediaProjectionManager) getSystemService(MEDIA_PROJECTION_SERVICE);
    try {
      proj = mpm.getMediaProjection(code, data);
    } catch (Exception e) {
      PluginCall call = pendingCall;
      pendingCall = null;
      if (call != null) call.reject("projection_failed", e.getMessage());
      stopSelf();
      return START_NOT_STICKY;
    }
    final PluginCall call = pendingCall;
    pendingCall = null;
    BeyondXCapture.captureFromProjection(this, proj, call, new Runnable() {
      public void run() {
        try { stopForeground(true); } catch (Exception e) { }
        stopSelf();
      }
    });
    return START_NOT_STICKY;
  }

  @Override
  public void onDestroy() {
    try { if (proj != null) proj.stop(); } catch (Exception e) { }
    super.onDestroy();
  }
}
