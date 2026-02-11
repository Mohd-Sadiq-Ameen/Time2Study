import { useState, useRef, useEffect, useCallback } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const TOOLS = {
  SELECT: "select",
  PEN: "pen",
  LINE: "line",
  ARROW: "arrow",
  RECT: "rect",
  ELLIPSE: "ellipse",
  TEXT: "text",
  ERASER: "eraser",
};
const COLORS = [
  "#1a1a2e",
  "#e94560",
  "#0f3460",
  "#533483",
  "#2b9348",
  "#e9c46a",
  "#f4a261",
  "#e76f51",
  "#ffffff",
  "#adb5bd",
];
const STROKE_WIDTHS = [1, 2, 4, 7];
const MIN_ZOOM = 0.1,
  MAX_ZOOM = 5;

function uid() {
  return Math.random().toString(36).slice(2);
}
function dist(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Slightly wobbly point for hand-drawn feel
function wobble(x, y, amt = 0.6) {
  return {
    x: x + (Math.random() - 0.5) * amt,
    y: y + (Math.random() - 0.5) * amt,
  };
}

export default function NoteTaking() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null); // for text input
  const [elements, setElements] = useState([]);
  const [tool, setTool] = useState(TOOLS.PEN);
  const [color, setColor] = useState("#1a1a2e");
  const [strokeW, setStrokeW] = useState(2);
  const [fill, setFill] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([[]]);
  const [histIdx, setHistIdx] = useState(0);
  const [showColors, setShowColors] = useState(false);

  // Drawing state (refs to avoid stale closures in event handlers)
  const drawing = useRef(false);
  const dragging = useRef(false); // for pan
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const currentEl = useRef(null);
  const selectedId = useRef(null);
  const moveOffset = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);
  const textDiv = useRef(null);

  // ── PREVENT CANVAS EVENTS WHEN TEXT INPUT IS ACTIVE ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventCanvasEvents = (e) => {
      if (textDiv.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    canvas.addEventListener("mousedown", preventCanvasEvents, true);
    canvas.addEventListener("mousemove", preventCanvasEvents, true);
    canvas.addEventListener("mouseup", preventCanvasEvents, true);
    canvas.addEventListener("wheel", preventCanvasEvents, true);

    return () => {
      canvas.removeEventListener("mousedown", preventCanvasEvents, true);
      canvas.removeEventListener("mousemove", preventCanvasEvents, true);
      canvas.removeEventListener("mouseup", preventCanvasEvents, true);
      canvas.removeEventListener("wheel", preventCanvasEvents, true);
    };
  }, []);

  // ── COORD TRANSFORM ──────────────────────────────────────────────────────────
  const toCanvas = useCallback(
    (clientX, clientY) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  // ── DRAW ALL ELEMENTS ────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = darkMode ? "#1a1a2e" : "#f8f9fa";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    const dotColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
    const step = 24;
    const startX = Math.floor(-pan.x / zoom / step) * step;
    const startY = Math.floor(-pan.y / zoom / step) * step;
    const endX = startX + W / zoom + step * 2;
    const endY = startY + H / zoom + step * 2;
    ctx.fillStyle = dotColor;
    for (let x = startX; x < endX; x += step)
      for (let y = startY; y < endY; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.restore();

    // Elements
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    elements.forEach((el) =>
      drawElement(ctx, el, selectedId.current === el.id, darkMode),
    );
    ctx.restore();
  }, [elements, pan, zoom, darkMode]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // Resize canvas to window
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  // ── UNDO / REDO ──────────────────────────────────────────────────────────────
  function pushHistory(els) {
    const newHist = history.slice(0, histIdx + 1);
    newHist.push(JSON.parse(JSON.stringify(els)));
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
  }

  function undo() {
    if (histIdx <= 0) return;
    const idx = histIdx - 1;
    setHistIdx(idx);
    setElements(JSON.parse(JSON.stringify(history[idx])));
  }

  function redo() {
    if (histIdx >= history.length - 1) return;
    const idx = histIdx + 1;
    setHistIdx(idx);
    setElements(JSON.parse(JSON.stringify(history[idx])));
  }

  // ── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.contentEditable === "true"
      )
        return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "z") {
        e.shiftKey ? redo() : undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && k === "y") {
        redo();
        return;
      }
      if (k === " ") {
        spaceDown.current = true;
        e.preventDefault();
      }
      if (k === "v" || k === "escape") setTool(TOOLS.SELECT);
      if (k === "p") setTool(TOOLS.PEN);
      if (k === "l") setTool(TOOLS.LINE);
      if (k === "r") setTool(TOOLS.RECT);
      if (k === "o") setTool(TOOLS.ELLIPSE);
      if (k === "t") setTool(TOOLS.TEXT);
      if (k === "e") setTool(TOOLS.ERASER);
      if (k === "a") setTool(TOOLS.ARROW);
      if (k === "delete" || k === "backspace") {
        if (selectedId.current) {
          const next = elements.filter((el) => el.id !== selectedId.current);
          setElements(next);
          pushHistory(next);
          selectedId.current = null;
        }
      }
    }
    function onKeyUp(e) {
      if (e.key === " ") spaceDown.current = false;
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [elements, histIdx, history]);

  // ── MOUSE DOWN ───────────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (e.button !== 0) return;
    const pos = toCanvas(e.clientX, e.clientY);

    // Pan mode
    if (spaceDown.current) {
      dragging.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    // Select tool
    if (tool === TOOLS.SELECT) {
      const hit = [...elements].reverse().find((el) => hitTest(el, pos));
      if (hit) {
        selectedId.current = hit.id;
        moveOffset.current = {
          x: pos.x - (hit.x || 0),
          y: pos.y - (hit.y || 0),
        };
        dragging.current = true;
        dragStart.current = pos;
      } else {
        selectedId.current = null;
      }
      redraw();
      return;
    }

    // Text tool
    if (tool === TOOLS.TEXT) {
      spawnTextInput(pos);
      return;
    }

    // Eraser
    if (tool === TOOLS.ERASER) {
      drawing.current = true;
      currentEl.current = { id: uid(), type: "eraser", points: [pos] };
      return;
    }

    // Drawing tools
    drawing.current = true;
    const base = { id: uid(), color, strokeW, fill, x: pos.x, y: pos.y };
    if (tool === TOOLS.PEN)
      currentEl.current = { ...base, type: "pen", points: [pos] };
    if (tool === TOOLS.LINE)
      currentEl.current = { ...base, type: "line", x2: pos.x, y2: pos.y };
    if (tool === TOOLS.ARROW)
      currentEl.current = { ...base, type: "arrow", x2: pos.x, y2: pos.y };
    if (tool === TOOLS.RECT)
      currentEl.current = { ...base, type: "rect", w: 0, h: 0 };
    if (tool === TOOLS.ELLIPSE)
      currentEl.current = { ...base, type: "ellipse", rx: 0, ry: 0 };
  }

  // ── MOUSE MOVE ───────────────────────────────────────────────────────────────
  function onMouseMove(e) {
    const pos = toCanvas(e.clientX, e.clientY);

    if (dragging.current && spaceDown.current) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
      return;
    }

    if (tool === TOOLS.SELECT && dragging.current && selectedId.current) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedId.current) return el;
          const dx = pos.x - moveOffset.current.x;
          const dy = pos.y - moveOffset.current.y;
          if (el.type === "pen") {
            const ox = el.points[0].x - el.x,
              oy = el.points[0].y - el.y;
            return {
              ...el,
              x: dx,
              y: dy,
              points: el.points.map((p) => ({
                x: dx + (p.x - el.x),
                y: dy + (p.y - el.y),
              })),
            };
          }
          return { ...el, x: dx, y: dy };
        }),
      );
      return;
    }

    if (!drawing.current || !currentEl.current) return;
    const el = currentEl.current;

    if (el.type === "pen") {
      el.points.push(wobble(pos.x, pos.y));
    } else if (el.type === "eraser") {
      el.points.push(pos);
      const r = 20;
      setElements((prev) =>
        prev.filter((other) => {
          if (other.type === "pen")
            return !other.points.some((p) => dist(p, pos) < (r / zoom) * 2);
          return !hitTest(other, pos, r / zoom);
        }),
      );
      return;
    } else if (el.type === "line" || el.type === "arrow") {
      el.x2 = pos.x;
      el.y2 = pos.y;
    } else if (el.type === "rect") {
      el.w = pos.x - el.x;
      el.h = pos.y - el.y;
    } else if (el.type === "ellipse") {
      el.rx = Math.abs(pos.x - el.x) / 2;
      el.ry = Math.abs(pos.y - el.y) / 2;
      el.cx = el.x + (pos.x - el.x) / 2;
      el.cy = el.y + (pos.y - el.y) / 2;
    }
    currentEl.current = { ...el };
    redrawWithCurrent();
  }

  function redrawWithCurrent() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const bg = darkMode ? "#1a1a2e" : "#f8f9fa";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    // grid
    const dotColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
    const step = 24,
      startX = Math.floor(-pan.x / zoom / step) * step,
      startY = Math.floor(-pan.y / zoom / step) * step;
    ctx.fillStyle = dotColor;
    for (let x = startX; x < startX + W / zoom + step * 2; x += step)
      for (let y = startY; y < startY + H / zoom + step * 2; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    elements.forEach((el) =>
      drawElement(ctx, el, selectedId.current === el.id, darkMode),
    );
    if (currentEl.current) drawElement(ctx, currentEl.current, false, darkMode);
    ctx.restore();
  }

  // ── MOUSE UP ─────────────────────────────────────────────────────────────────
  function onMouseUp() {
    if (dragging.current) {
      dragging.current = false;
    }
    if (!drawing.current || !currentEl.current) {
      drawing.current = false;
      return;
    }
    if (currentEl.current.type === "eraser") {
      drawing.current = false;
      currentEl.current = null;
      return;
    }
    const el = currentEl.current;
    // Discard tiny strokes
    const meaningful =
      el.type === "pen"
        ? el.points.length > 2
        : el.type === "rect"
          ? Math.abs(el.w) > 4 || Math.abs(el.h) > 4
          : el.type === "ellipse"
            ? el.rx > 2 || el.ry > 2
            : true;
    if (meaningful) {
      const next = [...elements, el];
      setElements(next);
      pushHistory(next);
    }
    drawing.current = false;
    currentEl.current = null;
  }

  // ── SCROLL TO ZOOM ───────────────────────────────────────────────────────────
  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left,
      cy = e.clientY - rect.top;
    setZoom((z) => {
      const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta));
      setPan((p) => ({
        x: cx - (cx - p.x) * (nz / z),
        y: cy - (cy - p.y) * (nz / z),
      }));
      return nz;
    });
  }

  // ── TEXT INPUT ───────────────────────────────────────────────────────────────
  // ── TEXT INPUT ───────────────────────────────────────────────────────────────
  function spawnTextInput(pos) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const screenX = pos.x * zoom + pan.x + rect.left;
    const screenY = pos.y * zoom + pan.y + rect.top;

    const div = document.createElement("div");
    div.contentEditable = "true";
    div.style.cssText = `
    position:fixed; left:${screenX}px; top:${screenY}px;
    min-width:120px; min-height:32px; max-width:320px;
    font-size:${16 * zoom}px; font-family:'Caveat', cursive;
    color:${color}; background:${darkMode ? "rgba(30,30,50,0.9)" : "rgba(255,255,255,0.9)"}; 
    border:1px solid ${color}; border-radius:4px;
    padding:8px 12px; white-space:pre-wrap; word-break:break-word; 
    z-index:10000; caret-color:${color}; line-height:1.5;
    box-shadow:0 2px 8px rgba(0,0,0,0.1); backdrop-filter:blur(4px);
    outline:2px solid ${color}40;
  `;
    div.setAttribute("aria-label", "text input");
    document.body.appendChild(div);

    // Focus with a slight delay to ensure the div is in the DOM
    setTimeout(() => {
      div.focus();
    }, 10);

    const handleBlur = () => {
      commit();
    };

    const handleKeyDown = (e) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        div.remove();
        textDiv.current = null;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commit();
      }
    };

    const handleClick = (e) => {
      e.stopPropagation();
    };

    function commit() {
      const text = div.innerText.trim();
      if (text) {
        const textEl = {
          id: uid(),
          type: "text",
          x: pos.x,
          y: pos.y,
          text: text,
          color: color,
          fontSize: 16,
          strokeW: strokeW,
        };
        const next = [...elements, textEl];
        setElements(next);
        pushHistory(next);
      }
      div.remove();
      textDiv.current = null;
    }

    div.addEventListener("blur", handleBlur);
    div.addEventListener("keydown", handleKeyDown);
    div.addEventListener("click", handleClick);
    div.addEventListener("mousedown", (e) => e.stopPropagation());
    div.addEventListener("mousemove", (e) => e.stopPropagation());
    div.addEventListener("mouseup", (e) => e.stopPropagation());

    textDiv.current = div;
  }

  // ── EXPORT ───────────────────────────────────────────────────────────────────
  function exportPNG() {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "sketch.png";
    a.click();
  }

  // ── CLEAR ────────────────────────────────────────────────────────────────────
  function clearAll() {
    setElements([]);
    pushHistory([]);
    selectedId.current = null;
  }

  // ── CURSOR ───────────────────────────────────────────────────────────────────
  const cursor = spaceDown.current
    ? "grab"
    : tool === TOOLS.ERASER
      ? "cell"
      : tool === TOOLS.SELECT
        ? "default"
        : tool === TOOLS.TEXT
          ? "text"
          : "crosshair";

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: darkMode ? "#1a1a2e" : "#f8f9fa",
        fontFamily: "'DM Sans',system-ui,sans-serif",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Caveat:wght@500;700&display=swap');
        .tb-btn { display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;border-radius:8px;transition:all 0.15s ease; }
        .tb-btn:hover { transform:scale(1.08); }
        .tb-sep { width:1px;height:20px;background:rgba(128,128,128,0.2);margin:0 2px; }
      `}</style>

      {/* ── TOP TOOLBAR ── */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: darkMode
            ? "rgba(30,30,50,0.95)"
            : "rgba(255,255,255,0.96)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 14,
          padding: "6px 10px",
          zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Tool buttons */}
        {[
          { t: TOOLS.SELECT, icon: "⬡", tip: "Select (V)" },
          { t: TOOLS.PEN, icon: "✏", tip: "Pen (P)" },
          { t: TOOLS.LINE, icon: "╱", tip: "Line (L)" },
          { t: TOOLS.ARROW, icon: "→", tip: "Arrow (A)" },
          { t: TOOLS.RECT, icon: "▭", tip: "Rectangle (R)" },
          { t: TOOLS.ELLIPSE, icon: "○", tip: "Ellipse (O)" },
          { t: TOOLS.TEXT, icon: "T", tip: "Text (T)" },
          { t: TOOLS.ERASER, icon: "◫", tip: "Eraser (E)" },
        ].map(({ t, icon, tip }) => (
          <button
            key={t}
            className="tb-btn"
            title={tip}
            onClick={() => setTool(t)}
            style={{
              width: 34,
              height: 34,
              fontSize: t === TOOLS.TEXT ? 14 : 16,
              fontWeight: 600,
              background:
                tool === t
                  ? darkMode
                    ? "rgba(233,69,96,0.25)"
                    : "rgba(233,69,96,0.12)"
                  : "transparent",
              color:
                tool === t
                  ? "#e94560"
                  : darkMode
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.55)",
              border:
                tool === t
                  ? `1.5px solid rgba(233,69,96,0.4)`
                  : "1.5px solid transparent",
            }}
          >
            {icon}
          </button>
        ))}

        <div className="tb-sep" />

        {/* Stroke widths */}
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            className="tb-btn"
            onClick={() => setStrokeW(w)}
            style={{
              width: 30,
              height: 30,
              background:
                strokeW === w
                  ? darkMode
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.08)"
                  : "transparent",
              border: "none",
            }}
          >
            <div
              style={{
                width: w === 1 ? 16 : w === 2 ? 14 : w === 4 ? 12 : 10,
                height: w,
                borderRadius: 9,
                background: darkMode
                  ? "rgba(255,255,255,0.7)"
                  : "rgba(0,0,0,0.5)",
                margin: "auto",
              }}
            />
          </button>
        ))}

        <div className="tb-sep" />

        {/* Fill toggle */}
        <button
          className="tb-btn"
          title="Toggle fill"
          onClick={() => setFill((p) => !p)}
          style={{
            width: 30,
            height: 30,
            fontSize: 13,
            background: fill
              ? darkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.07)"
              : "transparent",
            color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            border: "none",
          }}
        >
          {fill ? "▪" : "▫"}
        </button>

        {/* Color picker trigger */}
        <div style={{ position: "relative" }}>
          <button
            className="tb-btn"
            onClick={() => setShowColors((p) => !p)}
            style={{
              width: 30,
              height: 30,
              border: `2px solid ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}`,
              borderRadius: 8,
              background: color,
              cursor: "pointer",
            }}
          />
          {showColors && (
            <div
              style={{
                position: "absolute",
                top: 40,
                left: "50%",
                transform: "translateX(-50%)",
                background: darkMode ? "#1e1e3a" : "white",
                border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                borderRadius: 10,
                padding: 8,
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 5,
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                zIndex: 200,
              }}
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setShowColors(false);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: c,
                    border:
                      color === c
                        ? "2px solid #e94560"
                        : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            </div>
          )}
        </div>

        <div className="tb-sep" />

        {/* Undo / Redo */}
        <button
          className="tb-btn"
          title="Undo (⌘Z)"
          onClick={undo}
          disabled={histIdx <= 0}
          style={{
            width: 30,
            height: 30,
            fontSize: 14,
            opacity: histIdx <= 0 ? 0.3 : 1,
            background: "transparent",
            color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
            border: "none",
          }}
        >
          ↩
        </button>
        <button
          className="tb-btn"
          title="Redo (⌘Y)"
          onClick={redo}
          disabled={histIdx >= history.length - 1}
          style={{
            width: 30,
            height: 30,
            fontSize: 14,
            opacity: histIdx >= history.length - 1 ? 0.3 : 1,
            background: "transparent",
            color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
            border: "none",
          }}
        >
          ↪
        </button>

        <div className="tb-sep" />

        {/* Dark mode */}
        <button
          className="tb-btn"
          title="Toggle theme"
          onClick={() => setDarkMode((p) => !p)}
          style={{
            width: 30,
            height: 30,
            fontSize: 14,
            background: "transparent",
            border: "none",
            color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
          }}
        >
          {darkMode ? "☀" : "🌙"}
        </button>

        {/* Export */}
        <button
          className="tb-btn"
          title="Export PNG"
          onClick={exportPNG}
          style={{
            width: 30,
            height: 30,
            fontSize: 13,
            background: "transparent",
            border: "none",
            color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
          }}
        >
          ⤓
        </button>

        {/* Clear */}
        <button
          className="tb-btn"
          title="Clear canvas"
          onClick={clearAll}
          style={{
            width: 30,
            height: 30,
            fontSize: 13,
            background: "transparent",
            border: "none",
            color: "rgba(233,69,96,0.7)",
          }}
        >
          ⌫
        </button>
      </div>

      {/* ── ZOOM INDICATOR ── */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: darkMode ? "rgba(30,30,50,0.9)" : "rgba(255,255,255,0.9)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 10,
          padding: "5px 10px",
          zIndex: 100,
          fontSize: 11,
          fontFamily: "'DM Mono',monospace",
          color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.2))}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "inherit",
            padding: "0 2px",
          }}
        >
          −
        </button>
        <span style={{ minWidth: 38, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.2))}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "inherit",
            padding: "0 2px",
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 10,
            color: "inherit",
            padding: "0 2px",
          }}
        >
          ⊙
        </button>
      </div>

      {/* ── HINT ── */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          fontSize: 10,
          fontFamily: "'DM Mono',monospace",
          color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
          zIndex: 100,
          lineHeight: 1.7,
        }}
      >
        Space+drag: pan · Scroll: zoom · Del: delete selected
      </div>

      {/* ── CANVAS ── */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: cursor,
          touchAction: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onClick={() => setShowColors(false)}
      />
    </div>
  );
}

// ── DRAW A SINGLE ELEMENT ──────────────────────────────────────────────────────
function drawElement(ctx, el, selected, darkMode) {
  ctx.save();
  ctx.strokeStyle = el.color || "#1a1a2e";
  ctx.fillStyle = el.color || "#1a1a2e";
  ctx.lineWidth = el.strokeW || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (selected) {
    ctx.shadowColor = "#e94560";
    ctx.shadowBlur = 8;
  }

  switch (el.type) {
    case "pen": {
      if (!el.points || el.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length - 1; i++) {
        const mx = (el.points[i].x + el.points[i + 1].x) / 2;
        const my = (el.points[i].y + el.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, mx, my);
      }
      ctx.lineTo(
        el.points[el.points.length - 1].x,
        el.points[el.points.length - 1].y,
      );
      ctx.stroke();
      break;
    }
    case "line": {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      break;
    }
    case "arrow": {
      const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x);
      const headLen =
        Math.min(
          20,
          dist({ x: el.x, y: el.y }, { x: el.x2, y: el.y2 }) * 0.3,
        ) || 14;
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(el.x2, el.y2);
      ctx.lineTo(
        el.x2 - headLen * Math.cos(angle - 0.4),
        el.y2 - headLen * Math.sin(angle - 0.4),
      );
      ctx.moveTo(el.x2, el.y2);
      ctx.lineTo(
        el.x2 - headLen * Math.cos(angle + 0.4),
        el.y2 - headLen * Math.sin(angle + 0.4),
      );
      ctx.stroke();
      break;
    }
    case "rect": {
      if (el.fill) {
        ctx.globalAlpha = 0.15;
        ctx.fillRect(el.x, el.y, el.w, el.h);
        ctx.globalAlpha = 1;
      }
      // Slightly hand-drawn corners
      drawRoughRect(ctx, el.x, el.y, el.w, el.h);
      break;
    }
    case "ellipse": {
      if (!el.cx && !el.cy) break;
      ctx.beginPath();
      ctx.ellipse(
        el.cx,
        el.cy,
        Math.max(1, el.rx),
        Math.max(1, el.ry),
        0,
        0,
        Math.PI * 2,
      );
      if (el.fill) {
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.stroke();
      break;
    }
    case "text": {
      ctx.font = `${el.fontSize || 16}px 'Caveat', cursive`;
      ctx.fillStyle = el.color;
      const lines = (el.text || "").split("\n");
      lines.forEach((line, i) =>
        ctx.fillText(line, el.x, el.y + (i + 1) * (el.fontSize || 16) * 1.2),
      );
      if (selected) {
        ctx.strokeStyle = "rgba(233,69,96,0.5)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
          el.x - 4,
          el.y - 4,
          200,
          lines.length * (el.fontSize || 16) * 1.3 + 8,
        );
        ctx.setLineDash([]);
      }
      break;
    }
  }
  ctx.restore();
}

function drawRoughRect(ctx, x, y, w, h) {
  const r = 0.5;
  function jit(v) {
    return v + (Math.random() - 0.5) * r;
  }
  ctx.beginPath();
  ctx.moveTo(jit(x), jit(y));
  ctx.lineTo(jit(x + w), jit(y));
  ctx.lineTo(jit(x + w), jit(y + h));
  ctx.lineTo(jit(x), jit(y + h));
  ctx.closePath();
  ctx.stroke();
}

// ── HIT TEST ──────────────────────────────────────────────────────────────────
function hitTest(el, pos, tol = 8) {
  switch (el.type) {
    case "pen":
      return el.points.some((p) => dist(p, pos) < tol + el.strokeW);
    case "line":
    case "arrow":
      return (
        distToSegment(pos, { x: el.x, y: el.y }, { x: el.x2, y: el.y2 }) <
        tol + el.strokeW
      );
    case "rect": {
      const [rx, ry, rw, rh] = [
        Math.min(el.x, el.x + el.w),
        Math.min(el.y, el.y + el.h),
        Math.abs(el.w),
        Math.abs(el.h),
      ];
      return (
        pos.x >= rx - tol &&
        pos.x <= rx + rw + tol &&
        pos.y >= ry - tol &&
        pos.y <= ry + rh + tol
      );
    }
    case "ellipse":
      if (!el.cx || !el.cy || !el.rx || !el.ry) return false;
      return (
        Math.pow((pos.x - el.cx) / el.rx, 2) +
          Math.pow((pos.y - el.cy) / el.ry, 2) <=
        1.3
      );
    case "text": {
      const lines = (el.text || "").split("\n").length;
      return (
        pos.x >= el.x - 4 &&
        pos.x <= el.x + 200 &&
        pos.y >= el.y - 4 &&
        pos.y <= el.y + lines * 22
      );
    }
    default:
      return false;
  }
}

function distToSegment(p, a, b) {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const t = Math.max(
    0,
    Math.min(1, (ap.x * ab.x + ap.y * ab.y) / (ab.x * ab.x + ab.y * ab.y) || 0),
  );
  return dist(p, { x: a.x + t * ab.x, y: a.y + t * ab.y });
}
