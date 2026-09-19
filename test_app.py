import re
import os

SCRATCH_DIR = '/Users/yashuraghuvanshi/.gemini/antigravity/scratch/focuslist'

with open(os.path.join(SCRATCH_DIR, 'styles.css')) as f:
    css = f.read()

with open(os.path.join(SCRATCH_DIR, 'app.js')) as f:
    js = f.read()

with open(os.path.join(SCRATCH_DIR, 'index.html')) as f:
    html = f.read()

# Dynamic classes created in JS templates
classes_in_templates = set(re.findall(r'class="([^"]+)"', js))
all_dynamic_classes = set()
for group in classes_in_templates:
    for cls in group.split():
        if not cls.startswith('$'): # ignore template literals like ${...}
            all_dynamic_classes.add(cls)

print(f"Total dynamic classes found in JS: {len(all_dynamic_classes)}")
missing_styles = []
for cls in sorted(all_dynamic_classes):
    # check if class exists in css
    if f".{cls}" not in css:
        missing_styles.append(cls)

if missing_styles:
    print("Warning, these classes might be missing in styles.css:", missing_styles)
else:
    print("✓ All dynamic classes in JS exist in styles.css!")
