package com.beyondx.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;

// BEYOND X SQLite store (History §6). The JS side owns the schema
// + migrations (histstore.js); this plugin only executes SQL
// against the built-in android.database.sqlite. No new dependency.
@CapacitorPlugin(name = "BeyondXStore")
public class BeyondXStore extends Plugin {
  private BeyondXStoreDb db;
  private BeyondXStoreDb db() {
    if (db == null) db = new BeyondXStoreDb(getContext());
    return db;
  }
  private String[] params(PluginCall call) {
    JSONArray a = call.getArray("params");
    if (a == null) return new String[0];
    String[] out = new String[a.length()];
    for (int i = 0; i < a.length(); i++) out[i] = a.isNull(i) ? null : a.optString(i);
    return out;
  }
  @PluginMethod
  public void dbOpen(PluginCall call) {
    try { db().open(); JSObject r = new JSObject(); r.put("ok", true); call.resolve(r); }
    catch (Exception e) { call.reject("db_open_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbExec(PluginCall call) {
    String sql = call.getString("sql");
    if (sql == null) { call.reject("no_sql", "sql is required"); return; }
    try { JSObject r = new JSObject(); r.put("changes", db().exec(sql, params(call))); call.resolve(r); }
    catch (Exception e) { call.reject("db_exec_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbQuery(PluginCall call) {
    String sql = call.getString("sql");
    if (sql == null) { call.reject("no_sql", "sql is required"); return; }
    try { JSObject r = new JSObject(); r.put("rows", db().query(sql, params(call))); call.resolve(r); }
    catch (Exception e) { call.reject("db_query_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbStatus(PluginCall call) {
    try { JSObject r = new JSObject(); r.put("bytes", db().size()); r.put("exists", db().exists()); call.resolve(r); }
    catch (Exception e) { call.reject("db_status_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbBackup(PluginCall call) {
    try { db().backup(); JSObject r = new JSObject(); r.put("ok", true); call.resolve(r); }
    catch (Exception e) { call.reject("db_backup_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbRestore(PluginCall call) {
    try { JSObject r = new JSObject(); r.put("ok", db().restore()); call.resolve(r); }
    catch (Exception e) { call.reject("db_restore_failed", e.getMessage()); }
  }
  @PluginMethod
  public void dbDelete(PluginCall call) {
    try { db().deleteDb(); db = null; JSObject r = new JSObject(); r.put("ok", true); call.resolve(r); }
    catch (Exception e) { call.reject("db_delete_failed", e.getMessage()); }
  }
}
