package com.beyondx.app;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.Image;
import android.media.ImageReader;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Base64;
import android.util.DisplayMetrics;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicBoolean;

// One-shot screen capture (MediaProjection). Android shows its own
// consent dialog every time; one frame is taken, then everything is
// released. No continuous capture, no recording. API 34+ runs through
// the foreground service (BeyondXCaptureService, 2B); older Android
// uses the direct path below.
public class BeyondXCapture {
  public static void run(final Plugin plugin, final PluginCall call, int code, Intent data) {
    final Context ctx = plugin.getContext();
    final MediaProjectionManager mpm = (MediaProjectionManager) ctx.getSystemService(Context.MEDIA_PROJECTION_SERVICE);
    final MediaProjection proj;
    try {
      proj = mpm.getMediaProjection(code, data);
    } catch (Exception e) { call.reject("projection_failed", e.getMessage()); return; }
    captureFromProjection(ctx, proj, call, null);
  }

  // Shared core: one frame from an already-created projection, then
  // release everything. onDone runs after cleanup (the foreground
  // service uses it to stop itself); may be null.
  public static void captureFromProjection(final Context ctx, final MediaProjection proj, final PluginCall call, final Runnable onDone) {
    DisplayMetrics dm = ctx.getResources().getDisplayMetrics();
    int w = dm.widthPixels, h = dm.heightPixels;
    if (w > 720) { h = h * 720 / w; w = 720; }
    final int fw = w, fh = h;
    final HandlerThread thread = new HandlerThread("bx-capture");
    thread.start();
    final Handler handler = new Handler(thread.getLooper());
    final ImageReader reader = ImageReader.newInstance(fw, fh, PixelFormat.RGBA_8888, 2);
    final VirtualDisplay vd = proj.createVirtualDisplay("bx-capture", fw, fh, dm.densityDpi,
        DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, reader.getSurface(), null, handler);
    final AtomicBoolean done = new AtomicBoolean(false);
    final Runnable cleanup = new Runnable() {
      public void run() {
        try { vd.release(); } catch (Exception e) { }
        try { proj.stop(); } catch (Exception e) { }
        try { reader.close(); } catch (Exception e) { }
        thread.quitSafely();
        if (onDone != null) onDone.run();
      }
    };
    handler.postDelayed(new Runnable() {
      public void run() {
        if (done.compareAndSet(false, true)) {
          call.reject("capture_timeout", "No frame arrived in 5 seconds");
          cleanup.run();
        }
      }
    }, 5000);
    reader.setOnImageAvailableListener(new ImageReader.OnImageAvailableListener() {
      public void onImageAvailable(ImageReader r) {
        if (!done.compareAndSet(false, true)) return;
        Image img = null;
        try {
          img = r.acquireLatestImage();
          if (img == null) { call.reject("capture_failed", "Empty frame"); return; }
          Image.Plane plane = img.getPlanes()[0];
          ByteBuffer buf = plane.getBuffer();
          int pad = plane.getRowStride() - plane.getPixelStride() * fw;
          Bitmap raw = Bitmap.createBitmap(fw + pad / plane.getPixelStride(), fh, Bitmap.Config.ARGB_8888);
          raw.copyPixelsFromBuffer(buf);
          Bitmap bmp = Bitmap.createBitmap(raw, 0, 0, fw, fh);
          ByteArrayOutputStream out = new ByteArrayOutputStream();
          bmp.compress(Bitmap.CompressFormat.JPEG, 85, out);
          JSObject res = new JSObject();
          res.put("image", "data:image/jpeg;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
          call.resolve(res);
        } catch (Exception e) { call.reject("capture_failed", e.getMessage());
        } finally {
          if (img != null) img.close();
          cleanup.run();
        }
      }
    }, handler);
  }
}
