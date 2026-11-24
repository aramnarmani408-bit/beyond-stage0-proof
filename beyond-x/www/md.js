// Design Phase 2: the answer fill + wrap (D4). Long answers collapse
// after ~800 chars with a show-more button; every AI message gets its
// action row (actions.js). The wrapper runs at load; the store still
// holds the raw text, so history and search never see the markup.
var MD_LONG = 1500;
function mdFill(el, text) {
  var blocks = mdParse(text);
  var long = text.length > MD_LONG;
  var kept = 0, more = null;
  for (var i = 0; i < blocks.length; i++) {
    var target = el;
    if (long && kept >= 800) {
      if (!more) {
        more = document.createElement("div");
        more.style.display = "none";
      }
      target = more;
    }
    mdRenderBlock(target, blocks[i]);
    kept += mdBlockLen(blocks[i]);
  }
  if (more) {
    el.appendChild(more);
    var btn = document.createElement("button");
    btn.className = "md-more";
    btn.textContent = "نور وښیه";
    btn.addEventListener("click", function () { more.style.display = ""; btn.style.display = "none"; });
    el.appendChild(btn);
  }
}
function mdWrapMsg(msg, text) {
  if (mdHasMarkers(text)) {
    while (msg.firstChild) msg.removeChild(msg.firstChild);
    mdFill(msg, text);
  }
  if (typeof attachActions === "function") attachActions(msg, text);
}
// Wrap addMessage (ui.js): AI answers render as structured DOM.
var mdOrigAddMessage = addMessage;
addMessage = function (text, who) {
  mdOrigAddMessage(text, who);
  if (who !== "ai") return;
  var area = typeof document !== "undefined" ? document.getElementById("chatArea") : null;
  if (!area || !area.children || !area.children.length) return;
  mdWrapMsg(area.children[area.children.length - 1], text);
};
