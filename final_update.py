#!/usr/bin/env python3
import re

# Station Hauling Page
with open('src/pages/StationHaulingPage.jsx', 'r') as f:
    content = f.read()

# 1. Add formError state
content = re.sub(
    r"(  const \[toInput, setToInput\] = useState\(''\);)\n",
    r"\1\n\n  // Form validation error\n  const [formError, setFormError] = useState('');\n",
    content,
    count=1
)

# 2. Update addStation callback
content = re.sub(
    r"(    if \(type === 'from'\) setFromInput\(''\);\n    else setToInput\(''\);)\n(  }, \[\]);)",
    r"\1\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n\2",
    content,
    count=1
)
content = content.replace("  }, []);  // addStation", "  }, [formError]);", 1)

# 3. Update removeStation callback
content = re.sub(
    r"(      \[`\$\{type\}Stations`\]: prev\[`\$\{type\}Stations`\]\.filter\(\(s\) => s !== station\),\n    }\)\);)\n(  }, \[\]);)",
    r"\1\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n\2",
    content,
    count=1
)
# Find second }, []); after removeStation
parts = content.split("  }, []);")
if len(parts) >= 3:
    parts[1] = parts[1] + "  }, [formError]);"
    content = parts[0] + parts[2]

# 4. Update updateForm callback
content = re.sub(
    r"(  const updateForm = useCallback\(\(key, value\) => \{\n    setForm\(\(prev\) => \(\{ \.\.\.prev, \[key\]: value \}\)\);)\n(  }, \[\]);)",
    r"\1\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n\2",
    content,
    count=1
)
# Find third }, []); after updateForm
parts = content.split("  }, []);")
if len(parts) >= 4:
    parts[2] = parts[2] + "  }, [formError]);"
    content = parts[0] + parts[1] + "  }, [formError]);" + parts[3]

# 5. Replace alert
content = content.replace(
    "alert('Please select at least one station for both origin and destination')",
    "setFormError('Please select at least one station for both origin and destination')"
)

# 6. Add error clear on valid submission
content = re.sub(
    r"(      if \(!fromLocation \|\| !toLocation\) \{\n        setFormError\('Please select at least one station for both origin and destination'\);\n        return;\n      \})\n\n(      try \{)",
    r"\1\n\n      // Clear form error on valid submission\n      setFormError('');\n\n\2",
    content
)

# 7. Add form validation error UI
content = re.sub(
    r"(        </GlassmorphicCard>\n\n        \{/\* Error \*/\})\n        \{error && \(",
    r'''\1

        {/* Form Validation Error */}
        {formError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
          >
            <strong>Validation Error:</strong> {formError}
          </div>
        )}

        {/* API Error */}
        {error && (''',
    content
)

# 8. Add ARIA to API error
content = re.sub(
    r'(\{error && \(\n          )<div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">',
    r'''\1<div
            role="alert"
            aria-live="polite"
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
          >''',
    content
)

with open('src/pages/StationHaulingPage.jsx', 'w') as f:
    f.write(content)

print("✓ Updated StationHaulingPage.jsx")

# Region Hauling Page
with open('src/pages/RegionHaulingPage.jsx', 'r') as f:
    content = f.read()

# 1. Add formError state
content = re.sub(
    r"(  }\);)\n\n(  // Get nearby regions)",
    r"\1\n\n  // Form validation error\n  const [formError, setFormError] = useState('');\n\n\2",
    content,
    count=1
)

# 2. Update updateForm callback
content = re.sub(
    r"(  const updateForm = useCallback\(\(key, value\) => \{\n    setForm\(\(prev\) => \(\{ \.\.\.prev, \[key\]: value \}\)\);)\n\n(    // Reset toRegion)",
    r"\1\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n\n\2",
    content,
    count=1
)
content = re.sub(
    r"(      setForm\(\(prev\) => \(\{ \.\.\.prev, toRegion: 'Nearby Regions' \}\)\);\n    \}\n  }, \[\]);)",
    r"\1",
    content,
    count=1
)
content = content.replace("  }, []);  // updateForm Region", "  }, [formError]);", 1)
# Find the dependency array for updateForm
parts = content.split("  }, []);")
if len(parts) >= 2:
    # The first one should be for updateForm in RegionHauling
    parts[0] = parts[0] + "  }, [formError]);"
    content = "  }, []);".join(parts[1:])
    content = parts[0] + content

# 3. Replace alerts
content = content.replace(
    "alert('Please select a valid origin region')",
    "setFormError('Please select a valid origin region')"
)
content = content.replace(
    "alert('Please select a valid destination region')",
    "setFormError('Please select a valid destination region')"
)

# 4. Add error clear on valid submission
content = re.sub(
    r"(\n      const fromParam = )",
    r"\n      // Clear form error on valid submission\n      setFormError('');\n\n\1",
    content,
    count=1
)

# 5. Add form validation error UI
content = re.sub(
    r"(        </GlassmorphicCard>\n\n        \{/\* Error \*/\})\n        \{error && \(",
    r'''\1

        {/* Form Validation Error */}
        {formError && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
          >
            <strong>Validation Error:</strong> {formError}
          </div>
        )}

        {/* API Error */}
        {error && (''',
    content
)

# 6. Add ARIA to API error
content = re.sub(
    r'(\{error && \(\n          )<div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">',
    r'''\1<div
            role="alert"
            aria-live="polite"
            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
          >''',
    content
)

with open('src/pages/RegionHaulingPage.jsx', 'w') as f:
    f.write(content)

print("✓ Updated RegionHaulingPage.jsx")
print("\n✅ All changes applied successfully!")
