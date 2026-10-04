#!/usr/bin/env python3
"""LearnPeak courses v2 migration (locked by Naksh 2026-10-04, approved 2026-10-05).

Usage:  python3 lp_migrate.py [--apply]
Without --apply it only prints the plan. Idempotent: matches on (title, category).
Self-auths via `gcloud auth print-access-token` (Cloud Shell).
Descriptions are 100% English per Naksh's locked website rule (2026-10-05).
"""
import json, os, subprocess, sys, urllib.request, urllib.error

PROJECT = "gdl-database-b32f4"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents"
APPLY = "--apply" in sys.argv
try:
    TOKEN = subprocess.check_output(
        ["gcloud", "auth", "print-access-token"], timeout=30).decode().strip()
except Exception as e:
    TOKEN = os.environ.get("TOKEN", "")
    if not TOKEN:
        print("Could not get token:", e); sys.exit(1)
NOW = "2026-10-05T02:00:00.000Z"

V2 = {
    "Silicon Package": [
        ("Affiliate Marketing ABCs",
         "What affiliate marketing is, how it works, and how LearnPeak's referral system pays you - the complete foundation in 30 minutes."),
        ("Profile Makeover in 30 Minutes",
         "Turn your WhatsApp, Instagram and social profiles buyer-ready - photo, bio and link setup, step by step."),
        ("First Affiliate Link Launchpad",
         "Generate your first LearnPeak affiliate link and learn how to share it - your first practical win."),
        ("First 10 Leads \u2014 Taste",
         "A starter method to bring your first 10 leads without spending on ads - a taste of the system; the full system is inside Silver."),
        ("Roadmap Reveal & Referral Kickstart",
         "The complete roadmap ahead (Silver shown locked) plus your kickstart plan for first referral income."),
    ],
    "Silver Package": [
        ("Organic Affiliate Marketing Mastery",
         "The 9-module flagship course: mindset, profile setup, daily rituals, organic lead generation, presentation, prospecting, follow-up and objection handling."),
        ("First Money Sales Script",
         "A ready-to-use DM and chat script to close your first sale."),
        ("Content Creation Mastery",
         "Content ideas, formats and a posting system that brings leads."),
        ("Video Creation Mastery",
         "Shoot professional videos on your phone - from shooting to upload."),
    ],
    "Gold Package": [
        ("Advanced Affiliate Marketing",
         "Automation, systems, scaling and team-building - the growth engine after Silver."),
        ("Personal Branding & Authority Mastery",
         "Build your authority and personal brand that brings premium sales."),
        ("Advanced Video Editing & Reels Mastery",
         "Reels and advanced mobile editing - a viral-format video system."),
    ],
}

# package name (as stored in packages collection) -> v2 course title list
PKG_COURSES = {
    "Silicon Demo":   [t for t, _ in V2["Silicon Package"]],
    "Silver Package": [t for t, _ in V2["Silver Package"]],
    "Gold Package":   [t for t, _ in V2["Gold Package"]],
    "Diamond Package": ["Facebook Ads", "Google Ads", "Public Speaking", "Freelancing Mastery"],
}


def api(method, path, body=None):
    r = urllib.request.Request(
        BASE + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=30) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        print("HTTP ERROR", e.code, e.read()[:600]); sys.exit(1)


def S(s):
    return {"stringValue": s}


def rel(name):
    # "projects/P/databases/(default)/documents/courses/abc" -> "courses/abc"
    return name.split("/documents/", 1)[1]


def main():
    print("MODE:", "APPLY" if APPLY else "DRY-RUN (use --apply to execute)")
    print("TOKEN:", "ok" if TOKEN else "MISSING")
    if not TOKEN:
        sys.exit(1)
    ops = []

    courses = api("GET", "/courses?pageSize=200").get("documents", [])
    have = {}
    for d in courses:
        f = d.get("fields", {})
        have[(f.get("title", {}).get("stringValue", ""),
              f.get("category", {}).get("stringValue", ""))] = d["name"]

    for cat, items in V2.items():
        for title, desc in items:
            key = (title, cat)
            if key in have:
                cur = None
                for d in courses:
                    if d["name"] == have[key]:
                        cur = d["fields"].get("description", {}).get("stringValue", "")
                if cur != desc:
                    ops.append(("PATCH course desc", title,
                                f"/{rel(have[key])}?updateMask.fieldPaths=description&updateMask.fieldPaths=updatedAt",
                                {"fields": {"description": S(desc), "updatedAt": S(NOW)}}))
                else:
                    ops.append(("SKIP (already v2)", title, None, None))
            else:
                ops.append(("CREATE course", f"{cat} / {title}", "/courses",
                            {"fields": {"title": S(title), "description": S(desc),
                                        "videoLink": S(""), "category": S(cat),
                                        "createdAt": S(NOW), "updatedAt": S(NOW)}}))

    pkgs = api("GET", "/packages?pageSize=50").get("documents", [])
    for d in pkgs:
        f = d.get("fields", {})
        pname = f.get("name", {}).get("stringValue", "")
        if pname not in PKG_COURSES:
            continue
        want = PKG_COURSES[pname]
        cur = [v.get("stringValue") for v in
               f.get("courses", {}).get("arrayValue", {}).get("values", [])]
        if cur != want:
            ops.append(("PATCH package courses", pname, f"/{rel(d['name'])}?updateMask.fieldPaths=courses",
                        {"fields": {"courses": {"arrayValue": {"values": [S(t) for t in want]}}}}))
        else:
            ops.append(("SKIP (package ok)", pname, None, None))

    for kind, what, _path, _body in ops:
        print(f"[{kind}] {what}")

    n = sum(1 for o in ops if not o[0].startswith("SKIP"))
    print(f"--- {n} write ops planned ---")
    if not APPLY or n == 0:
        return
    for kind, what, path, body in ops:
        if kind.startswith("SKIP"):
            continue
        api("PATCH" if kind.startswith("PATCH") else "POST", path, body)
        print("done:", kind, what)
    print("ALL WRITES COMPLETE")


main()
