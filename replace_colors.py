import re

files = [
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\todolists\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\todolists\[id]\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\todolists\[id]\edit\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\todolists\[id]\tasks\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\todolists\[id]\tasks\create\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\tasks\[id]\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\tasks\[id]\edit\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\users\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\users\[id]\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\users\[id]\edit\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\users\create\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\todolists\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\todolists\[id]\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\todolists\[id]\edit\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\todolists\[id]\tasks\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\admin\todolists\[id]\tasks\create\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\dashboard\profile\page.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\not-found.tsx",
    r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\page.tsx",
]

replacements = [
    ("hover:bg-blue-700", "hover:bg-primary-dark"),
    ("hover:bg-red-700", "hover:bg-danger"),
    ("hover:bg-gray-700", "hover:bg-sidebar-hover"),
    ("hover:bg-gray-50", "hover:bg-background"),
    ("hover:text-blue-800", "hover:text-primary-dark"),
    ("hover:text-red-800", "hover:text-danger"),
    ("hover:text-yellow-800", "hover:text-warning"),
    ("hover:text-green-800", "hover:text-success"),
    ("bg-gray-50", "bg-background"),
    ("bg-gray-100", "bg-secondary-light"),
    ("bg-white", "bg-card-bg"),
    ("bg-gray-800", "bg-sidebar-bg"),
    ("text-gray-900", "text-foreground"),
    ("text-gray-800", "text-foreground"),
    ("text-gray-700", "text-foreground"),
    ("text-gray-600", "text-muted"),
    ("text-gray-500", "text-muted"),
    ("text-gray-400", "text-muted"),
    ("text-gray-300", "text-sidebar-text"),
    ("bg-blue-600", "bg-primary"),
    ("bg-blue-700", "bg-primary-dark"),
    ("text-blue-600", "text-primary"),
    ("text-blue-800", "text-primary-dark"),
    ("bg-blue-100", "bg-primary-light"),
    ("text-blue-700", "text-primary-dark"),
    ("border-gray-300", "border-border"),
    ("border-gray-200", "border-border"),
    ("bg-red-600", "bg-danger"),
    ("text-red-600", "text-danger"),
    ("text-red-700", "text-danger"),
    ("bg-red-100", "bg-red-50"),
    ("border-red-400", "border-danger"),
    ("bg-green-100", "bg-green-50"),
    ("text-green-800", "text-success"),
    ("bg-yellow-100", "bg-yellow-50"),
    ("text-yellow-800", "text-warning"),
]

summary = {}
unreplaced_patterns = {}

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for old, new in replacements:
        content = content.replace(old, new)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        rel_path = filepath.replace(r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\", "")
        changed = []
        for old, new in replacements:
            if old in original and old not in content:
                changed.append(f"{old} -> {new}")
        summary[rel_path] = changed

remaining_checks = [
    "bg-gray-", "text-gray-", "border-gray-", "bg-blue-", "text-blue-",
    "bg-red-", "text-red-", "bg-green-", "text-green-", "bg-yellow-", "text-yellow-",
    "hover:bg-gray-", "hover:text-blue-", "hover:text-red-", "hover:text-green-", "hover:text-yellow-",
]

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    rel_path = filepath.replace(r"C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app\", "")
    for pattern in remaining_checks:
        matches = re.findall(rf'\S*{re.escape(pattern)}\S*', content)
        if matches:
            if rel_path not in unreplaced_patterns:
                unreplaced_patterns[rel_path] = []
            for m in matches:
                if m not in unreplaced_patterns[rel_path]:
                    unreplaced_patterns[rel_path].append(m)

print("=== FILES UPDATED ===")
for f, changes in summary.items():
    print(f"\n{f}:")
    for c in changes:
        print(f"  {c}")

print("\n=== REMAINING OLD PATTERNS (not in replacement list) ===")
if unreplaced_patterns:
    for f, patterns in unreplaced_patterns.items():
        print(f"\n{f}:")
        for p in sorted(set(patterns)):
            print(f"  {p}")
else:
    print("None - all listed patterns were replaced.")

print(f"\nTotal files updated: {len(summary)}")