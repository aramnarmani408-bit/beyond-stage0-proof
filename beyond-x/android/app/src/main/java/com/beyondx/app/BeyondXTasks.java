package com.beyondx.app;

import android.content.Context;

import androidx.work.Data;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

// One-shot scheduled tasks (WorkManager). A task posts a local
// notification at its time; Android decides the exact execution
// window (Doze/battery rules apply — never promised to the second).
public class BeyondXTasks {
  public static String schedule(Context ctx, String title, String text, int mins) {
    String id = UUID.randomUUID().toString();
    Data input = new Data.Builder()
        .putString("title", title)
        .putString("text", text)
        .build();
    OneTimeWorkRequest req = new OneTimeWorkRequest.Builder(BeyondXTaskWorker.class)
        .setInitialDelay(mins, TimeUnit.MINUTES)
        .setInputData(input)
        .addTag(id)
        .build();
    WorkManager.getInstance(ctx).enqueue(req);
    return id;
  }
}
