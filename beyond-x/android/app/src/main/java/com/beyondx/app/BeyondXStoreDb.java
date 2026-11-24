package com.beyondx.app;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import org.json.JSONArray;
import org.json.JSONObject;

// SQLite helper for BeyondXStore. DB file: beyondx.db (default
// DELETE journal mode — no -wal/-shm files, so a plain file copy
// is a valid backup). DDL + migrations come from JS (histstore.js)
// — onCreate/onUpgrade stay empty on purpose. The backup is taken
// at init, when no write is in flight.
public class BeyondXStoreDb extends SQLiteOpenHelper {
  private static final String NAME = "beyondx.db";
  private final Context ctx;
  private SQLiteDatabase w;
  public BeyondXStoreDb(Context c) { super(c, NAME, null, 1); ctx = c; }
  @Override public void onCreate(SQLiteDatabase d) {}
  @Override public void onUpgrade(SQLiteDatabase d, int o, int n) {}
  public synchronized void open() { if (w == null || !w.isOpen()) w = getWritableDatabase(); }
  private SQLiteDatabase db() { open(); return w; }
  public synchronized int exec(String sql, String[] p) {
    db().execSQL(sql, p);
    return 1;
  }
  public synchronized JSONArray query(String sql, String[] p) throws Exception {
    Cursor c = db().rawQuery(sql, p);
    JSONArray rows = new JSONArray();
    String[] names = c.getColumnNames();
    while (c.moveToNext()) {
      JSONObject row = new JSONObject();
      for (int i = 0; i < names.length; i++) {
        int t = c.getType(i);
        if (t == Cursor.FIELD_TYPE_NULL) row.put(names[i], JSONObject.NULL);
        else if (t == Cursor.FIELD_TYPE_INTEGER) row.put(names[i], c.getLong(i));
        else if (t == Cursor.FIELD_TYPE_FLOAT) row.put(names[i], c.getDouble(i));
        else row.put(names[i], c.getString(i));
      }
      rows.put(row);
    }
    c.close();
    return rows;
  }
  public long size() { File f = ctx.getDatabasePath(NAME); return f.exists() ? f.length() : 0; }
  public boolean exists() { return ctx.getDatabasePath(NAME).exists(); }
  private void copy(File s, File d) throws Exception {
    FileInputStream in = new FileInputStream(s);
    FileOutputStream out = new FileOutputStream(d);
    FileChannel cin = in.getChannel(), cout = out.getChannel();
    cout.transferFrom(cin, 0, cin.size());
    in.close(); out.close();
  }
  public synchronized void backup() throws Exception {
    File f = ctx.getDatabasePath(NAME);
    if (f.exists()) copy(f, new File(f.getPath() + ".bak"));
  }
  public synchronized boolean restore() throws Exception {
    File f = ctx.getDatabasePath(NAME);
    File b = new File(f.getPath() + ".bak");
    if (!b.exists()) return false;
    if (w != null && w.isOpen()) { w.close(); w = null; }
    copy(b, f);
    return true;
  }
  public synchronized void deleteDb() {
    File f = ctx.getDatabasePath(NAME);
    File b = new File(f.getPath() + ".bak");
    if (w != null && w.isOpen()) { w.close(); w = null; }
    ctx.deleteDatabase(NAME);
    if (b.exists()) b.delete();
  }
}
