#!/usr/bin/env python3
"""
Faith Tribe icon kit generator.
Generates: UI icons (line + tonal), game badges (shape identifiers), brand/app icons,
PNG exports, sprite sheet, React components, tokens, manifest snippets.

Requires: pip install cairosvg pillow
Usage:    python3 build_icons.py [output_dir]
"""
import json, math, os, sys, shutil
import cairosvg
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else "faith-tribe-icons"

# ---------------------------------------------------------------- palette
FOREST = "#2F5D3A"
FOREST_LIGHT = "#3B7049"
CREAM = "#FFF8E7"
INK = "#1B2A21"
PASTEL = ["#CFEFD2", "#F3EBA0", "#E3DDF5", "#F9D6DB", "#FBDDBF", "#D2E7F6"]
DEEP = ["#4C9A63", "#D9B93C", "#8E7BD1", "#E58A9B", "#EE9A57", "#5AA4D6"]

# ---------------------------------------------------------------- helpers
def n(x):
    s = f"{x:.2f}".rstrip("0").rstrip(".")
    return s if s != "-0" else "0"

def C(cx, cy, r):
    return f"M{n(cx - r)} {n(cy)}a{n(r)} {n(r)} 0 1 0 {n(2 * r)} 0a{n(r)} {n(r)} 0 1 0 {n(-2 * r)} 0z"

def R(x, y, w, h, r):
    return (f"M{n(x + r)} {n(y)}h{n(w - 2 * r)}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(r)}v{n(h - 2 * r)}"
            f"a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(r)}h{n(-(w - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(-r)}"
            f"v{n(-(h - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(-r)}z")

def rpoly(pts, r):
    """Polygon with rounded corners (quadratic corners)."""
    m = len(pts)
    d = ""
    for i in range(m):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % m]
        def unit(a, b):
            dx, dy = a[0] - b[0], a[1] - b[1]
            L = math.hypot(dx, dy)
            return dx / L, dy / L, L
        u1x, u1y, L1 = unit(p0, p1)
        u2x, u2y, L2 = unit(p2, p1)
        rr = min(r, L1 / 2, L2 / 2)
        a = (p1[0] + u1x * rr, p1[1] + u1y * rr)
        b = (p1[0] + u2x * rr, p1[1] + u2y * rr)
        d += ("M" if i == 0 else "L") + f"{n(a[0])} {n(a[1])}"
        d += f"Q{n(p1[0])} {n(p1[1])} {n(b[0])} {n(b[1])}"
    return d + "z"

def polar(cx, cy, fn, steps=240):
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        r = fn(t)
        pts.append((cx + r * math.cos(t - math.pi / 2), cy + r * math.sin(t - math.pi / 2)))
    return "M" + "L".join(f"{n(x)} {n(y)}" for x, y in pts) + "z"

def superellipse(cx, cy, r, p=4, steps=200):
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        c, s = math.cos(t), math.sin(t)
        x = r * math.copysign(abs(c) ** (2 / p), c)
        y = r * math.copysign(abs(s) ** (2 / p), s)
        pts.append((cx + x, cy + y))
    return "M" + "L".join(f"{n(x)} {n(y)}" for x, y in pts) + "z"

def edge(p, q, r):
    """Line between circle centres p,q trimmed by radius r at both ends."""
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    a = (p[0] + ux * r, p[1] + uy * r)
    b = (q[0] - ux * r, q[1] - uy * r)
    return f"M{n(a[0])} {n(a[1])}L{n(b[0])} {n(b[1])}"

# ---------------------------------------------------------------- UI icons (24 grid, 2px stroke)
ICONS = {}
def icon(name, d, tone=None, cat="misc", tags=""):
    ICONS[name] = {"d": d if isinstance(d, list) else [d], "tone": tone, "cat": cat, "tags": tags}

# navigation
icon("home", ["M3.5 11.5 12 4l8.5 7.5", "M5.5 10v8.5A1.5 1.5 0 0 0 7 20h10a1.5 1.5 0 0 0 1.5-1.5V10",
              "M10 20v-5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v5"],
     "M5.5 10 12 4.5 18.5 10v8.5A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5Z", "navigation", "house start")
icon("play", "M8.5 5.4v13.2a.9.9 0 0 0 1.4.75l10-6.6a.9.9 0 0 0 0-1.5l-10-6.6a.9.9 0 0 0-1.4.75z",
     "M8.5 5.4v13.2a.9.9 0 0 0 1.4.75l10-6.6a.9.9 0 0 0 0-1.5l-10-6.6a.9.9 0 0 0-1.4.75z", "navigation", "start host join")
icon("games", [C(7.5, 7.5, 3.5), R(13, 4, 7, 7, 2), "M7.5 13 11.3 19.5H3.7z", "M16.5 12.8 20 16.5 16.5 20.2 13 16.5z"],
     C(7.5, 7.5, 3.5) + "M16.5 12.8 20 16.5 16.5 20.2 13 16.5z", "navigation", "library catalogue")
icon("profile", [C(12, 8, 3.8), "M4.8 20a7.2 7.2 0 0 1 14.4 0"], C(12, 8, 3.8) + "M4.8 20a7.2 7.2 0 0 1 14.4 0z", "navigation", "user person account")
icon("settings", ["M4 7h6.5", C(13, 7, 2.5), "M15.5 7H20", "M4 12h1.5", C(8, 12, 2.5), "M10.5 12H20",
                  "M4 17h8.5", C(15, 17, 2.5), "M17.5 17H20"],
     C(13, 7, 2.5) + C(8, 12, 2.5) + C(15, 17, 2.5), "navigation", "preferences sliders")
icon("back", "M15 5l-7 7 7 7", None, "navigation", "chevron left previous")
icon("forward", "M9 5l7 7-7 7", None, "navigation", "chevron right next")
icon("up", "M5 15l7-7 7 7", None, "navigation", "chevron up")
icon("down", "M5 9l7 7 7-7", None, "navigation", "chevron down")
icon("arrow-right", ["M4.5 12h15", "M13.5 6l6 6-6 6"], None, "navigation", "go open")
icon("arrow-left", ["M19.5 12h-15", "M10.5 6l-6 6 6 6"], None, "navigation", "back")
icon("close", ["M6 6l12 12", "M18 6 6 18"], None, "navigation", "x dismiss")
icon("menu", ["M4 7h16", "M4 12h16", "M4 17h16"], None, "navigation", "hamburger")
icon("more", [C(5, 12, .9), C(12, 12, .9), C(19, 12, .9)], None, "navigation", "dots overflow")

# actions
icon("check", "M5 12.5l4.5 4.5L19 7.5", None, "action", "done correct")
icon("plus", ["M12 5v14", "M5 12h14"], None, "action", "add")
icon("minus", "M5 12h14", None, "action", "remove")
icon("search", [C(11, 11, 6.5), "M16 16l4.5 4.5"], C(11, 11, 6.5), "action", "find")
icon("filter", ["M4 6.5h16", "M7 12h10", "M10 17.5h4"], None, "action", "sort")
icon("share", [C(6, 12, 2.5), C(18, 6, 2.5), C(18, 18, 2.5), "M8.3 10.8 15.7 7.2", "M8.3 13.2 15.7 16.8"], None, "action", "send invite")
icon("copy", [R(9, 9, 11, 11, 2.5), "M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9"], R(9, 9, 11, 11, 2.5), "action", "duplicate")
icon("link", ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"], None, "action", "url chain")
icon("qr", [R(4, 4, 6, 6, 1.5), R(14, 4, 6, 6, 1.5), R(4, 14, 6, 6, 1.5), C(14.5, 14.5, .6) + C(17.5, 17.5, .6) + C(20, 14.5, .6) + C(14.5, 20, .6) + C(20, 20, .6)],
     R(4, 4, 6, 6, 1.5) + R(14, 4, 6, 6, 1.5) + R(4, 14, 6, 6, 1.5), "action", "scan join code")
icon("edit", ["M5 19l.8-3.5L16.5 4.8a2.1 2.1 0 0 1 3 3L8.8 18.5z", "M14.5 6.8l3 3"], None, "action", "pencil")
icon("trash", ["M5 7h14", "M10 4h4", "M7 7l.8 11.2a2 2 0 0 0 2 1.8h4.4a2 2 0 0 0 2-1.8L17 7", "M10 11v5", "M14 11v5"], None, "action", "delete")
icon("refresh", ["M19.5 12a7.5 7.5 0 1 1-2.2-5.3", "M19.5 4.5v4h-4"], None, "action", "retry rematch")
icon("info", [C(12, 12, 9), "M12 11v5", "M12 8h.01"], C(12, 12, 9), "action", "about")
icon("help", [C(12, 12, 9), "M9.5 9.5a2.6 2.6 0 0 1 5 1c0 1.7-2.5 2-2.5 3.5", "M12 17h.01"], C(12, 12, 9), "action", "question")
icon("bell", ["M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z", "M10 21a2 2 0 0 0 4 0"], "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z", "action", "notification")
icon("sound-on", ["M4 9.5v5h3.5l4.5 4v-13l-4.5 4z", "M15.5 9a4 4 0 0 1 0 6", "M18 6.5a8 8 0 0 1 0 11"], "M4 9.5v5h3.5l4.5 4v-13l-4.5 4z", "action", "volume")
icon("sound-off", ["M4 9.5v5h3.5l4.5 4v-13l-4.5 4z", "M16 9.5l5 5", "M21 9.5l-5 5"], "M4 9.5v5h3.5l4.5 4v-13l-4.5 4z", "action", "mute")
icon("vibrate", [R(7.5, 3.5, 9, 17, 2.3), "M3.5 9v6", "M20.5 9v6"], R(7.5, 3.5, 9, 17, 2.3), "action", "haptics")
icon("eye", ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", C(12, 12, 3)], C(12, 12, 3), "action", "show view")
icon("lock", [R(5, 10.5, 14, 10, 2.5), "M8 10.5V8a4 4 0 0 1 8 0v2.5"], R(5, 10.5, 14, 10, 2.5), "action", "locked answer")
icon("unlock", [R(5, 10.5, 14, 10, 2.5), "M8 10.5V8a4 4 0 0 1 7.6-1.7"], R(5, 10.5, 14, 10, 2.5), "action", "unlocked")
icon("flag", ["M6 21V4", "M6 5h11l-2.2 3.6L17 12H6"], "M6 5h11l-2.2 3.6L17 12H6z", "action", "report")

# game UI
icon("timer", [C(12, 13.5, 7.5), "M12 9.5v4l2.5 1.5", "M9.5 3h5"], C(12, 13.5, 7.5), "game", "clock countdown")
icon("hint", ["M12 3.5a6 6 0 0 0-3.5 10.9c.7.6 1 1.4 1 2.1h5c0-.7.3-1.5 1-2.1A6 6 0 0 0 12 3.5z", "M9.5 19h5", "M10.5 21.5h3"],
     "M12 3.5a6 6 0 0 0-3.5 10.9c.7.6 1 1.4 1 2.1h5c0-.7.3-1.5 1-2.1A6 6 0 0 0 12 3.5z", "game", "lightbulb clue")
icon("book-open", ["M12 6.5C10 5 7 4.6 3.8 5v12.7c3.2-.4 6.2.1 8.2 1.6 2-1.5 5-2 8.2-1.6V5C17 4.6 14 5 12 6.5z", "M12 6.5v12.8"],
     "M12 6.5C10 5 7 4.6 3.8 5v12.7c3.2-.4 6.2.1 8.2 1.6 2-1.5 5-2 8.2-1.6V5C17 4.6 14 5 12 6.5z", "game", "rules read")
icon("scoreboard", [R(3.5, 12.5, 5.2, 8, 1.3), R(9.4, 5.5, 5.2, 15, 1.3), R(15.3, 14.5, 5.2, 6, 1.3)], R(9.4, 5.5, 5.2, 15, 1.3), "game", "podium leaderboard")
icon("trophy", ["M8 4h8v6a4 4 0 0 1-8 0z", "M8 6H5v1.5A3 3 0 0 0 8 10.5", "M16 6h3v1.5a3 3 0 0 1-3 3", "M12 14v3.5", "M9 20.5h6", "M10 17.5h4"],
     "M8 4h8v6a4 4 0 0 1-8 0z", "game", "winner")
icon("crown", ["M4.5 17.5 3.5 7.5l4.7 4L12 5l3.8 6.5 4.7-4-1 10z", "M6.5 20.5h11"], "M4.5 17.5 3.5 7.5l4.7 4L12 5l3.8 6.5 4.7-4-1 10z", "game", "host champion")
icon("medal", [C(12, 15, 5), "M8.6 11.3 6 3.5h4l2 4", "M15.4 11.3 18 3.5h-4l-2 4"], C(12, 15, 5), "game", "award rank")
icon("star", "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z",
     "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z", "game", "favorite")
icon("flame", ["M12 3c.6 3.2 5 5.2 5 10a5 5 0 0 1-10 0c0-1.8.9-3.2 2-4.3.2 1.4 1 2.1 1.8 2.3C10.5 8.8 10.6 5.6 12 3z",
               "M12 17.8a2.2 2.2 0 0 1-2.2-2.2c0-1.2.9-1.9 2.2-3.2 1.3 1.3 2.2 2 2.2 3.2a2.2 2.2 0 0 1-2.2 2.2z"],
     "M12 3c.6 3.2 5 5.2 5 10a5 5 0 0 1-10 0c0-1.8.9-3.2 2-4.3.2 1.4 1 2.1 1.8 2.3C10.5 8.8 10.6 5.6 12 3z", "game", "streak fire")
icon("heart", "M12 20S4 15 4 9.5A4.2 4.2 0 0 1 12 7.8 4.2 4.2 0 0 1 20 9.5C20 15 12 20 12 20z",
     "M12 20S4 15 4 9.5A4.2 4.2 0 0 1 12 7.8 4.2 4.2 0 0 1 20 9.5C20 15 12 20 12 20z", "game", "like favorite")
icon("bolt", "M13.5 3 5.5 13.5h5.5L10.5 21l8-10.5H13z", "M13.5 3 5.5 13.5h5.5L10.5 21l8-10.5H13z", "game", "power-up fast")
icon("shield", "M12 3.5l7 2.5v5.5c0 4.3-2.9 7.8-7 9-4.1-1.2-7-4.7-7-9V6z", "M12 3.5l7 2.5v5.5c0 4.3-2.9 7.8-7 9-4.1-1.2-7-4.7-7-9V6z", "game", "protect power-up")
icon("fifty", [C(12, 12, 8.5), "M12 3.5v17"], "M12 3.5a8.5 8.5 0 0 0 0 17z", "game", "fifty-fifty power-up half")
icon("double", ["M4.5 9l4.5 6", "M9 9l-4.5 6", "M13 10.3a2.5 2.5 0 0 1 5 0c0 2.2-5 3.4-5 5.2h5"], None, "game", "double down x2 wager")
icon("skip", ["M5.5 6.2v11.6a.8.8 0 0 0 1.25.65l8-5.8a.8.8 0 0 0 0-1.3l-8-5.8A.8.8 0 0 0 5.5 6.2z", "M18.5 5.5v13"],
     "M5.5 6.2v11.6a.8.8 0 0 0 1.25.65l8-5.8a.8.8 0 0 0 0-1.3l-8-5.8A.8.8 0 0 0 5.5 6.2z", "game", "next pass")
icon("pause", [R(6.5, 5, 3.8, 14, 1.3), R(13.7, 5, 3.8, 14, 1.3)], R(6.5, 5, 3.8, 14, 1.3) + R(13.7, 5, 3.8, 14, 1.3), "game", "hold")
icon("shuffle", ["M4 7h3.5c4 0 5 10 9 10H20", "M4 17h3.5c1.5 0 2.5-1.3 3.5-3", "M13 9.2c1-1.4 2-2.2 3.5-2.2H20", "M17.5 4.5 20 7l-2.5 2.5", "M17.5 14.5 20 17l-2.5 2.5"], None, "game", "random surprise")
icon("target", [C(12, 12, 8.5), C(12, 12, 4.5), "M12 12h.01"], None, "game", "aim goal")

# session & people
icon("host", ["M4 10.2v3.6a1 1 0 0 0 1 1h2.5l7 4.2V5L7.5 9.2H5a1 1 0 0 0-1 1z", "M18 9.5a3.5 3.5 0 0 1 0 5", "M7.5 15v4"],
     "M4 10.2v3.6a1 1 0 0 0 1 1h2.5l7 4.2V5L7.5 9.2H5a1 1 0 0 0-1 1z", "session", "megaphone create room")
icon("join", ["M14 4.5h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4", "M10 8l4 4-4 4", "M14 12H4"], None, "session", "enter room")
icon("team", [C(9, 8.5, 3), "M3.5 19a5.5 5.5 0 0 1 11 0", C(17, 9.5, 2.3), "M16.8 14.3a4.7 4.7 0 0 1 4.2 4.2"], C(9, 8.5, 3), "session", "players group")
icon("person-add", [C(9.5, 8.5, 3.2), "M3.5 19.5a6 6 0 0 1 12 0", "M18.5 8.5v5", "M16 11h5"], C(9.5, 8.5, 3.2), "session", "invite player")
tribe_d = [C(12, 12, 2.4)] + [C(12 + 7.5 * math.cos(math.radians(a)), 12 + 7.5 * math.sin(math.radians(a)), 1.5) for a in range(0, 360, 60)]
icon("tribe", tribe_d, C(12, 12, 2.4), "session", "community gather brand")
icon("code", ["M5 9h15", "M4 15h15", "M10 4 8 20", "M16 4l-2 16"], None, "session", "room code hash")

# Bible symbols
icon("bible", [R(5, 3.5, 14, 17, 2), "M12 8v7", "M9 10.5h6"], R(5, 3.5, 14, 17, 2), "bible", "book new testament")
icon("scroll", [R(5, 3.5, 14, 3.5, 1.75), R(5, 17, 14, 3.5, 1.75), "M7 7v10", "M17 7v10", "M10 10.5h4", "M10 13.5h4"], "M7 7h10v10H7z", "bible", "old testament torah")
icon("tablets", ["M4 20V9a3.5 3.5 0 0 1 7 0v11z", "M13 20V9a3.5 3.5 0 0 1 7 0v11z", "M6.5 11h2", "M6.5 14h2", "M15.5 11h2", "M15.5 14h2"],
     "M4 20V9a3.5 3.5 0 0 1 7 0v11zM13 20V9a3.5 3.5 0 0 1 7 0v11z", "bible", "law commandments")
icon("shofar", ["M3.5 20.5C3.5 12.5 8 6 15 5L20.5 3.5 21 11C14.5 9.8 9.5 12.5 6.2 20.5z", "M10 7.2 12.6 11.4"],
     "M3.5 20.5C3.5 12.5 8 6 15 5L20.5 3.5 21 11C14.5 9.8 9.5 12.5 6.2 20.5z", "bible", "horn trumpet gather")
icon("wheat", ["M12 21V10.5", "M12 10c-2.5 0-4-1.7-4-4 2.5 0 4 1.7 4 4z", "M12 10c2.5 0 4-1.7 4-4-2.5 0-4 1.7-4 4z",
               "M12 15c-2.5 0-4-1.7-4-4 2.5 0 4 1.7 4 4z", "M12 15c2.5 0 4-1.7 4-4-2.5 0-4 1.7-4 4z", "M12 3.5c1.2 1 1.2 3 0 4.5-1.2-1.5-1.2-3.5 0-4.5z"],
     None, "bible", "harvest grain")
icon("mountain", ["M3 19.5 9.5 8.2l3.7 6.3 2.1-3 5.7 8z"], "M3 19.5 9.5 8.2l3.7 6.3 2.1-3 5.7 8z", "bible", "sinai carmel")
icon("cross", ["M12 3.5v17", "M6.5 9h11"], None, "bible", "christ faith")

# testament & name types
icon("ot", ICONS["scroll"]["d"], ICONS["scroll"]["tone"], "types", "old testament")
icon("nt", ICONS["bible"]["d"], ICONS["bible"]["tone"], "types", "new testament")
icon("both", [C(9, 12, 5.5), C(15, 12, 5.5)], "M12 7.4a5.5 5.5 0 0 1 0 9.2 5.5 5.5 0 0 1 0-9.2z", "types", "overlap both testaments")
icon("person", ICONS["profile"]["d"], ICONS["profile"]["tone"], "types", "name type person")
icon("place", ["M12 21s6.5-5.8 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z", C(12, 10, 2.3)],
     "M12 21s6.5-5.8 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.2 12 21 12 21z", "types", "name type place pin")
icon("thing", ["M12 3.5 19.5 7.5v9L12 20.5 4.5 16.5v-9z", "M12 12l7.5-4.5", "M12 12v8.5", "M12 12 4.5 7.5"],
     "M12 3.5 19.5 7.5v9L12 20.5 4.5 16.5v-9z", "types", "name type object cube")

# ---------------------------------------------------------------- game glyphs (24 grid) & shapes (96 grid)
node = [(5, 18), (9.5, 8), (17, 14), (19, 5.5)]
GLYPHS = {
    "fake-a-proverb": {"d": [R(5, 3.5, 14, 3.5, 1.75), R(5, 17, 14, 3.5, 1.75), "M7 7v10", "M17 7v10", "M10 10.5h4",
                             "M8.5 14.2c1.2-1.6 2.3-1.6 3.5 0s2.3 1.6 3.5 0"], "tone": "M7 7h10v10H7z"},
    "tares-among-the-wheat": {"d": ICONS["wheat"]["d"], "tone": None},
    "hot-coal": {"d": ICONS["flame"]["d"], "tone": ICONS["flame"]["tone"]},
    "who-said-that": {"d": ["M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 4v-4H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z",
                            "M9.2 9.3v2.6c0 .9-.4 1.4-1.2 1.6", "M14.7 9.3v2.6c0 .9-.4 1.4-1.2 1.6"],
                      "tone": "M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 4v-4H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"},
    "testament-sort": {"d": ICONS["both"]["d"], "tone": ICONS["both"]["tone"]},
    "blueprint-from-the-mountain": {"d": ICONS["mountain"]["d"] + ["M9.5 8.2V3.8", "M9.5 3.8h3.5l-1 1.3 1 1.2H9.5"], "tone": ICONS["mountain"]["tone"]},
    "six-degrees-of-abraham": {"d": [C(*node[0], 2), C(*node[1], 2), C(*node[2], 2), C(*node[3], 2),
                                     edge(node[0], node[1], 2.9), edge(node[1], node[2], 2.9), edge(node[2], node[3], 2.9)], "tone": None},
    "one-accord": {"d": [C(12, 12, 2.2), "M9.5 4.5 12 7l2.5-2.5", "M9.5 19.5 12 17l2.5 2.5", "M4.5 9.5 7 12l-2.5 2.5", "M19.5 9.5 17 12l2.5 2.5"], "tone": C(12, 12, 2.2)},
}

SHAPES = {
    "arch": "M10 80V50a38 38 0 0 1 76 0v30a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8z",
    "leaf": "M48 6C66 20 86 34 86 56c0 20-17 34-38 34S10 76 10 56C10 34 30 20 48 6z",
    "burst": polar(48, 48, lambda t: 40 * (1 + 0.075 * math.cos(9 * t))),
    "squircle": superellipse(48, 48, 42, 4),
    "hexagon": rpoly([(48 + 43 * math.cos(math.radians(-90 + 60 * k)), 48 + 43 * math.sin(math.radians(-90 + 60 * k))) for k in range(6)], 9),
    "triangle": rpoly([(48, 7), (91, 82), (5, 82)], 10),
    "clover": polar(48, 48, lambda t: 33 * (1 + 0.26 * math.cos(4 * t))),
    "diamond": rpoly([(48, 5), (91, 48), (48, 91), (5, 48)], 12),
}

GAMES = [
    {"id": "fake-a-proverb", "name": "Fake-a-Proverb", "shape": "arch", "container": "#F9D6DB", "ink": "#7A2E3B", "dy": 6, "scale": 2.6, "status": "launch"},
    {"id": "tares-among-the-wheat", "name": "Tares Among the Wheat", "shape": "leaf", "container": "#CFEFD2", "ink": "#1F4D2C", "dy": 6, "scale": 2.5, "status": "launch"},
    {"id": "hot-coal", "name": "Hot Coal", "shape": "burst", "container": "#FBDDBF", "ink": "#8A3B10", "dy": 0, "scale": 2.7, "status": "launch"},
    {"id": "who-said-that", "name": "Who Said That?", "shape": "squircle", "container": "#F3EBA0", "ink": "#5C5410", "dy": 0, "scale": 2.7, "status": "launch"},
    {"id": "testament-sort", "name": "Testament Sort", "shape": "hexagon", "container": "#E3DDF5", "ink": "#43337A", "dy": 0, "scale": 2.6, "status": "launch"},
    {"id": "blueprint-from-the-mountain", "name": "Blueprint from the Mountain", "shape": "triangle", "container": "#D2E7F6", "ink": "#1B4D72", "dy": 12, "scale": 2.2, "status": "planned"},
    {"id": "one-accord", "name": "One Accord", "shape": "clover", "container": "#C9EDE8", "ink": "#145A52", "dy": 0, "scale": 2.4, "status": "planned"},
    {"id": "six-degrees-of-abraham", "name": "Six Degrees of Abraham", "shape": "diamond", "container": "#EADFCB", "ink": "#5B4620", "dy": 0, "scale": 2.3, "status": "planned"},
]

# ---------------------------------------------------------------- SVG builders
def mk_dirs(*paths):
    for p in paths:
        os.makedirs(os.path.join(OUT, p), exist_ok=True)

def write(rel, text):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def icon_svg(d, tone, variant="line", color="currentColor", size=24, sw=2):
    parts = []
    if variant == "tonal" and tone:
        parts.append(f'<path d="{tone}" fill="{color}" fill-opacity=".2" stroke="none"/>')
    parts += [f'<path d="{x}"/>' for x in d]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" '
            f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{"".join(parts)}</svg>')

def badge_svg(g, variant="tonal", size=96):
    shape = SHAPES[g["shape"]]
    glyph = GLYPHS[g["id"]]
    if variant == "solid":
        bg, fg = g["ink"], g["container"]
    else:
        bg, fg = g["container"], g["ink"]
    tr = f'translate(48 {48 + g["dy"]}) scale({g["scale"]}) translate(-12 -12)'
    sw = 1.8
    tone = f'<path d="{glyph["tone"]}" fill="{fg}" fill-opacity=".18" stroke="none"/>' if glyph["tone"] else ""
    paths = "".join(f'<path d="{x}"/>' for x in glyph["d"])
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 96 96">'
            f'<path d="{shape}" fill="{bg}"/>'
            f'<g transform="{tr}" fill="none" stroke="{fg}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{tone}{paths}</g></svg>')

def shape_svg(g, size=96):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 96 96">'
            f'<path d="{SHAPES[g["shape"]]}" fill="currentColor"/></svg>')

FLAME_OUT = "M12 3c.6 3.2 5 5.2 5 10a5 5 0 0 1-10 0c0-1.8.9-3.2 2-4.3.2 1.4 1 2.1 1.8 2.3C10.5 8.8 10.6 5.6 12 3z"
FLAME_IN = "M12 17.8a2.2 2.2 0 0 1-2.2-2.2c0-1.2.9-1.9 2.2-3.2 1.3 1.3 2.2 2 2.2 3.2a2.2 2.2 0 0 1-2.2 2.2z"

def mark_group(cx, cy, ring_r, dot_r, flame_scale, dots, flame, cutout, mono=False):
    out = []
    for i, a in enumerate(range(-90, 270, 60)):
        x = cx + ring_r * math.cos(math.radians(a))
        y = cy + ring_r * math.sin(math.radians(a))
        out.append(f'<circle cx="{n(x)}" cy="{n(y)}" r="{n(dot_r)}" fill="{dots[i % len(dots)]}"/>')
    tr = f'translate({cx} {cy}) scale({flame_scale}) translate(-12 -10.5)'
    if mono:
        out.append(f'<path transform="{tr}" fill="{flame}" fill-rule="evenodd" d="{FLAME_OUT}{FLAME_IN}"/>')
    else:
        out.append(f'<path transform="{tr}" fill="{flame}" d="{FLAME_OUT}"/>')
        if cutout:
            out.append(f'<path transform="{tr}" fill="{cutout}" d="{FLAME_IN}"/>')
    return "".join(out)

def app_icon(kind="rounded", size=512):
    """kind: rounded | maskable | apple | mono | mark-dark | mark-light | favicon"""
    S = 512
    if kind == "mark-light":
        body = mark_group(256, 256, 160, 38, 12.5, DEEP, FOREST, CREAM)
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 512 512">{body}</svg>'
    if kind == "mark-dark":
        body = mark_group(256, 256, 160, 38, 12.5, PASTEL, CREAM, FOREST)
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 512 512">{body}</svg>'
    if kind == "mono":
        body = mark_group(256, 256, 150, 34, 12, ["#000"], "#000", None, mono=True)
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 512 512">{body}</svg>'
    if kind == "favicon":
        body = mark_group(256, 256, 150, 52, 11.5, PASTEL, CREAM, FOREST)
        bg = f'<rect width="512" height="512" rx="112" fill="{FOREST}"/>'
        return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 512 512">{bg}{body}</svg>'
    ring_r, dot_r, fs = 148, 35, 12
    body = mark_group(256, 256, ring_r, dot_r, fs, PASTEL, CREAM, FOREST)
    glow = f'<circle cx="256" cy="256" r="205" fill="{FOREST_LIGHT}"/>'
    if kind == "rounded":
        bg = f'<rect width="512" height="512" rx="112" fill="{FOREST}"/>'
    else:  # maskable / apple: full bleed
        bg = f'<rect width="512" height="512" fill="{FOREST}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 512 512">{bg}{glow}{body}</svg>'

def png(svg_text, rel, w, h=None, bg=None):
    h = h or w
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cairosvg.svg2png(bytestring=svg_text.encode("utf-8"), write_to=path, output_width=w, output_height=h, background_color=bg)

def png_scale(svg_text, rel, scale):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cairosvg.svg2png(bytestring=svg_text.encode("utf-8"), write_to=path, scale=scale)

# ---------------------------------------------------------------- build
if os.path.exists(OUT):
    shutil.rmtree(OUT)
mk_dirs("icons/line", "icons/tonal", "icons/png", "games/png", "brand/png", "web", "src", "preview", "tools")

INK_PNG = INK

# UI icons
for name, ic in ICONS.items():
    write(f"icons/line/{name}.svg", icon_svg(ic["d"], ic["tone"], "line"))
    write(f"icons/tonal/{name}.svg", icon_svg(ic["d"], ic["tone"], "tonal"))
    for variant in ("line", "tonal"):
        svg = icon_svg(ic["d"], ic["tone"], variant, color=INK_PNG)
        for s in (48, 96):
            png(svg, f"icons/png/{variant}/{s}/{name}.png", s)

# sprite
sym = []
for name, ic in ICONS.items():
    for variant in ("line", "tonal"):
        inner = ""
        if variant == "tonal" and ic["tone"]:
            inner += f'<path d="{ic["tone"]}" fill="currentColor" fill-opacity=".2" stroke="none"/>'
        inner += "".join(f'<path d="{x}"/>' for x in ic["d"])
        sid = f"ft-{name}" + ("-tonal" if variant == "tonal" else "")
        sym.append(f'<symbol id="{sid}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</symbol>')
write("icons/sprite.svg", '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' + "".join(sym) + "</svg>")

# manifest
write("icons/icons.json", json.dumps(
    [{"name": k, "category": v["cat"], "tags": v["tags"].split(), "hasTonal": bool(v["tone"])} for k, v in ICONS.items()], indent=1))

# game badges
for g in GAMES:
    gid = g["id"]
    write(f"games/{gid}-badge.svg", badge_svg(g, "tonal"))
    write(f"games/{gid}-badge-solid.svg", badge_svg(g, "solid"))
    write(f"games/{gid}-shape.svg", shape_svg(g))
    gl = GLYPHS[gid]
    write(f"games/{gid}-glyph.svg", icon_svg(gl["d"], gl["tone"], "tonal"))
    for s in (128, 256, 512):
        png(badge_svg(g, "tonal"), f"games/png/{gid}-badge-{s}.png", s)
        png(badge_svg(g, "solid"), f"games/png/{gid}-badge-solid-{s}.png", s)
    png(icon_svg(gl["d"], gl["tone"], "tonal", color=INK_PNG), f"games/png/{gid}-glyph-96.png", 96)

# brand
write("brand/mark-on-dark.svg", app_icon("mark-dark"))
write("brand/mark-on-light.svg", app_icon("mark-light"))
write("brand/app-icon.svg", app_icon("rounded"))
write("brand/app-icon-maskable.svg", app_icon("maskable"))
write("brand/app-icon-monochrome.svg", app_icon("mono"))
write("brand/favicon.svg", app_icon("favicon"))
for s in (48, 72, 96, 144, 192, 384, 512, 1024):
    png(app_icon("rounded"), f"brand/png/app-icon-{s}.png", s)
png(app_icon("maskable"), "brand/png/app-icon-maskable-192.png", 192)
png(app_icon("maskable"), "brand/png/app-icon-maskable-512.png", 512)
png(app_icon("apple"), "brand/png/apple-touch-icon-180.png", 180)
png(app_icon("mono"), "brand/png/app-icon-monochrome-432.png", 432)
png(app_icon("mark-dark"), "brand/png/mark-on-dark-512.png", 512)
png(app_icon("mark-light"), "brand/png/mark-on-light-512.png", 512)
for s in (16, 32, 48):
    png(app_icon("favicon"), f"brand/png/favicon-{s}.png", s)

# web: favicon.ico + pwa copies + snippets
fav = Image.open(os.path.join(OUT, "brand/png/favicon-48.png")).convert("RGBA")
big = Image.open(os.path.join(OUT, "brand/png/app-icon-512.png")).convert("RGBA")
# ico from the favicon art at 256 for crisp downscales
png(app_icon("favicon"), "web/_fav256.png", 256)
Image.open(os.path.join(OUT, "web/_fav256.png")).save(os.path.join(OUT, "web/favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
os.remove(os.path.join(OUT, "web/_fav256.png"))
for src, dst in [("app-icon-192.png", "icon-192.png"), ("app-icon-512.png", "icon-512.png"),
                 ("app-icon-maskable-192.png", "icon-maskable-192.png"), ("app-icon-maskable-512.png", "icon-maskable-512.png"),
                 ("apple-touch-icon-180.png", "apple-touch-icon.png")]:
    shutil.copy(os.path.join(OUT, "brand/png", src), os.path.join(OUT, "web", dst))
shutil.copy(os.path.join(OUT, "brand/favicon.svg"), os.path.join(OUT, "web/favicon.svg"))
write("web/manifest.icons.json", json.dumps({"icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/icons/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
    {"src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
], "theme_color": FOREST, "background_color": "#F4F1E6"}, indent=2))
write("web/head-snippet.html", f"""<!-- Faith Tribe: paste inside <head>; copy web/* to /public/icons (favicon.ico to /public) -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="{FOREST}">
""")

# tokens
tok = [":root {", f"  --ft-forest: {FOREST};", f"  --ft-forest-light: {FOREST_LIGHT};", f"  --ft-cream: {CREAM};", f"  --ft-ink: {INK};"]
for g in GAMES:
    tok.append(f"  --ft-game-{g['id']}-container: {g['container']};")
    tok.append(f"  --ft-game-{g['id']}-ink: {g['ink']};")
tok.append("}")
write("src/tokens.css", "\n".join(tok) + "\n")

# TS data
names = list(ICONS.keys())
ts_icons = ("// Generated by tools/build_icons.py. Do not edit by hand.\n"
            f"export type IconName = {' | '.join(json.dumps(x) for x in names)};\n"
            "export interface IconDef { d: string[]; tone?: string }\n"
            "export const ICONS: Record<IconName, IconDef> = " + json.dumps({k: {"d": v["d"], **({"tone": v["tone"]} if v["tone"] else {})} for k, v in ICONS.items()}, indent=1) + ";\n")
write("src/icons.ts", ts_icons)
games_data = {g["id"]: {"id": g["id"], "name": g["name"], "shape": g["shape"], "shapePath": SHAPES[g["shape"]],
                        "container": g["container"], "ink": g["ink"], "dy": g["dy"], "scale": g["scale"], "status": g["status"],
                        "glyph": {"d": GLYPHS[g["id"]]["d"], **({"tone": GLYPHS[g["id"]]["tone"]} if GLYPHS[g["id"]]["tone"] else {})}} for g in GAMES}
ts_games = ("// Generated by tools/build_icons.py. Do not edit by hand.\n"
            f"export type GameId = {' | '.join(json.dumps(g['id']) for g in GAMES)};\n"
            "export interface GameVisual { id: GameId; name: string; shape: string; shapePath: string; container: string; ink: string; dy: number; scale: number; status: 'launch' | 'planned'; glyph: { d: string[]; tone?: string } }\n"
            "export const GAME_VISUALS: Record<GameId, GameVisual> = " + json.dumps(games_data, indent=1) + ";\n")
write("src/games.ts", ts_games)

write("src/Icon.tsx", """import type { SVGProps } from 'react';
import { ICONS, type IconName } from './icons';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** 'tonal' adds a soft fill behind the line; use it for active/selected states. */
  variant?: 'line' | 'tonal';
  size?: number | string;
  /** Stroke width in the 24px grid. Default 2. */
  strokeWidth?: number;
  /** Provide a title to expose the icon to screen readers; otherwise it is aria-hidden. */
  title?: string;
}

export function Icon({ name, variant = 'line', size = 24, strokeWidth = 2, title, ...rest }: IconProps) {
  const def = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {variant === 'tonal' && def.tone ? <path d={def.tone} fill="currentColor" fillOpacity={0.2} stroke="none" /> : null}
      {def.d.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
""")
write("src/GameBadge.tsx", """import type { SVGProps } from 'react';
import { GAME_VISUALS, type GameId } from './games';

export interface GameBadgeProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  game: GameId;
  /** 'tonal': pastel container, dark glyph. 'solid': dark container, pastel glyph. */
  variant?: 'tonal' | 'solid';
  size?: number | string;
  title?: string;
}

export function GameBadge({ game, variant = 'tonal', size = 56, title, ...rest }: GameBadgeProps) {
  const g = GAME_VISUALS[game];
  const bg = variant === 'solid' ? g.ink : g.container;
  const fg = variant === 'solid' ? g.container : g.ink;
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={g.shapePath} fill={bg} />
      <g
        transform={`translate(48 ${48 + g.dy}) scale(${g.scale}) translate(-12 -12)`}
        fill="none"
        stroke={fg}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {g.glyph.tone ? <path d={g.glyph.tone} fill={fg} fillOpacity={0.18} stroke="none" /> : null}
        {g.glyph.d.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Just the game's silhouette, for masks, outlines, and selection rings. */
export function GameShape({ game, size = 56, ...rest }: { game: GameId; size?: number | string } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden focusable="false" {...rest}>
      <path d={GAME_VISUALS[game].shapePath} fill="currentColor" />
    </svg>
  );
}
""")
write("src/index.ts", "export * from './icons';\nexport * from './games';\nexport { Icon } from './Icon';\nexport type { IconProps } from './Icon';\nexport { GameBadge, GameShape } from './GameBadge';\nexport type { GameBadgeProps } from './GameBadge';\n")

# ---------------------------------------------------------------- previews
def sheet(items, cols, cell=92, title=""):
    rows = math.ceil(len(items) / cols)
    W, H = cols * cell, rows * cell + 30
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
           f'<rect width="{W}" height="{H}" fill="#FBF9F2"/>',
           f'<text x="10" y="20" font-family="sans-serif" font-size="13" font-weight="700" fill="{INK}">{title}</text>']
    for i, (label, inner) in enumerate(items):
        x, y = (i % cols) * cell, (i // cols) * cell + 30
        out.append(f'<g transform="translate({x} {y})">{inner(cell)}<text x="{cell/2}" y="{cell-8}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#555">{label}</text></g>')
    out.append("</svg>")
    return "".join(out)

def ui_cell(name, variant):
    ic = ICONS[name]
    def f(cell):
        tone = f'<path d="{ic["tone"]}" fill="{FOREST}" fill-opacity=".2" stroke="none"/>' if (variant == "tonal" and ic["tone"]) else ""
        paths = "".join(f'<path d="{d}"/>' for d in ic["d"])
        return (f'<g transform="translate({cell/2-24} 10) scale(2)" fill="none" stroke="{FOREST}" stroke-width="2" '
                f'stroke-linecap="round" stroke-linejoin="round">{tone}{paths}</g>')
    return f

names_sorted = list(ICONS.keys())
write("preview/ui-line.svg", sheet([(nm, ui_cell(nm, "line")) for nm in names_sorted], 9, 92, "Faith Tribe UI icons: line"))
write("preview/ui-tonal.svg", sheet([(nm, ui_cell(nm, "tonal")) for nm in names_sorted], 9, 92, "Faith Tribe UI icons: tonal (active state)"))
png_scale(open(os.path.join(OUT, "preview/ui-line.svg")).read(), "preview/ui-line.png", 1)
png_scale(open(os.path.join(OUT, "preview/ui-tonal.svg")).read(), "preview/ui-tonal.png", 1)

def badge_cell(g, variant):
    def f(cell):
        inner = badge_svg(g, variant, 76).replace('<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 96 96">', f'<svg x="{(cell-76)/2}" y="4" width="76" height="76" viewBox="0 0 96 96">')
        return inner
    return f
items = [(g["name"][:16], badge_cell(g, "tonal")) for g in GAMES] + [(g["name"][:16] + " (solid)" if len(g["name"]) < 10 else g["name"][:10] + "… solid", badge_cell(g, "solid")) for g in GAMES]
write("preview/games.svg", sheet(items, 8, 104, "Game badges: shape identifiers (tonal + solid)"))
png_scale(open(os.path.join(OUT, "preview/games.svg")).read(), "preview/games.png", 1.6)

# brand preview
bp = ('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360"><rect width="1200" height="360" fill="#FBF9F2"/>'
      + "".join(f'<g transform="translate({20 + i * 195} 20) scale(.33)">{app_icon(k).split(">", 1)[1].rsplit("</svg>", 1)[0]}</g>' for i, k in enumerate(["rounded", "maskable", "favicon", "mark-light"]))
      + f'<g transform="translate({20 + 4 * 195} 20) scale(.33)"><rect width="512" height="512" fill="{FOREST}" rx="40"/>{app_icon("mark-dark").split(">", 1)[1].rsplit("</svg>", 1)[0]}</g>'
      + '</svg>')
write("preview/brand.svg", bp)
png(bp, "preview/brand.png", 1200, 360)

# copy the generator
shutil.copy(__file__, os.path.join(OUT, "tools/build_icons.py"))
print("icons:", len(ICONS), "games:", len(GAMES))
