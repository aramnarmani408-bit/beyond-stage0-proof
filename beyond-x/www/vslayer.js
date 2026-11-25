// BEYOND X Visual Studio — layer/project state. The ORIGINAL image is
// never mutated: adjustments are an op list, text is a box list. Undo /
// redo operate on those lists (bounded: VS_UNDO_MAX entries); a delete
// or a move is its own undo entry. Storage + export live in vsstore.js
// and vsexport.js.
var VS_PROJECT_KEY = "beyondx-vs-projects-v1";
var VS_PROJECT_MAX = 10;
var VS_SRC_MAX_B64 = 150000;
function vsProjectNew(src, generated, watermarked, name) {
    return { name: name || "", generated: !!generated, watermarked: !!watermarked, src: src || "", srcMissing: false, ops: [], texts: [], undo: [], redo: [], fmt: "jpeg", q: 0.9 };
}
function vsProjectPushUndo(p, u) {
    p.undo.push(u);
    if (p.undo.length > VS_UNDO_MAX) p.undo.shift();
    p.redo = [];
}
function vsProjectPushOp(p, op) {
    if (!p || !vsOpValidate(op)) return false;
    p.ops.push(op);
    vsProjectPushUndo(p, { t: "op", op: op });
    return true;
}
function vsProjectPushText(p, box) {
    if (!p || !vsTextValidate(box)) return false;
    p.texts.push(box);
    vsProjectPushUndo(p, { t: "text", box: box });
    return true;
}
function vsProjectMoveText(p, id, dx, dy) {
    if (!p) return false;
    for (var i = 0; i < p.texts.length; i++) {
        if (p.texts[i].id === id) {
            var b = p.texts[i];
            var nx = Math.min(1, Math.max(0, b.x + dx)), ny = Math.min(1, Math.max(0, b.y + dy));
            vsProjectPushUndo(p, { t: "move", id: id, ox: b.x, oy: b.y, nx: nx, ny: ny });
            b.x = nx; b.y = ny;
            return true;
        }
    }
    return false;
}
function vsProjectDeleteText(p, id) {
    if (!p) return false;
    for (var i = 0; i < p.texts.length; i++) {
        if (p.texts[i].id === id) {
            vsProjectPushUndo(p, { t: "del", box: p.texts[i], at: i });
            p.texts.splice(i, 1);
            return true;
        }
    }
    return false;
}
function vsProjectUndo(p) {
    if (!p) return false;
    var u = p.undo.pop();
    if (!u) return false;
    if (u.t === "op") p.ops.pop();
    else if (u.t === "text") p.texts = p.texts.filter(function (b) { return b.id !== u.box.id; });
    else if (u.t === "del") p.texts.splice(Math.min(u.at, p.texts.length), 0, u.box);
    else if (u.t === "move") { for (var i = 0; i < p.texts.length; i++) if (p.texts[i].id === u.id) { p.texts[i].x = u.ox; p.texts[i].y = u.oy; } }
    p.redo.push(u);
    return true;
}
function vsProjectRedo(p) {
    if (!p) return false;
    var u = p.redo.pop();
    if (!u) return false;
    if (u.t === "op") p.ops.push(u.op);
    else if (u.t === "text") p.texts.push(u.box);
    else if (u.t === "del") p.texts = p.texts.filter(function (b) { return b.id !== u.box.id; });
    else if (u.t === "move") { for (var i = 0; i < p.texts.length; i++) if (p.texts[i].id === u.id) { p.texts[i].x = u.nx; p.texts[i].y = u.ny; } }
    p.undo.push(u);
    return true;
}
function vsProjectReset(p) {
    if (!p) return false;
    p.ops = []; p.texts = []; p.undo = []; p.redo = [];
    return true;
}
function vsProjectCopy(p) {
    var c = vsProjectNew(p.src, p.generated, p.watermarked, p.name);
    c.ops = p.ops.slice();
    c.texts = p.texts.map(function (b) { var n = {}; for (var k in b) n[k] = b[k]; return n; });
    c.fmt = p.fmt; c.q = p.q;
    return c;
}
