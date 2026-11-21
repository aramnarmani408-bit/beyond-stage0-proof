package com.beyondx.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

// Posts the scheduled task's notification. If the user has not
// granted the notification permission, the task completes silently
// (no notification, no error, no retry storm).
public class BeyondXTaskWorker extends Worker {
  public BeyondXTaskWorker(@NonNull Context ctx, @NonNull WorkerParameters params) {
    super(ctx, params);
  }

  @NonNull
  @Override
  public Result doWork() {
    String title = getInputData().getString("title");
    String text = getInputData().getString("text");
    if (title == null) title = "BEYOND X";
    if (text == null) text = "";
    Context ctx = getApplicationContext();
    if (Build.VERSION.SDK_INT >= 33
        && ctx.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) return Result.success();
    NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26) {
      nm.createNotificationChannel(new NotificationChannel("beyondx-tasks",
          "BEYOND X tasks", NotificationManager.IMPORTANCE_DEFAULT));
    }
    NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, "beyondx-tasks")
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setContentTitle(title)
        .setContentText(text)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true);
    NotificationManagerCompat.from(ctx).notify((int) System.currentTimeMillis(), b.build());
    return Result.success();
  }
}
