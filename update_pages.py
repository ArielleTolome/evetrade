#!/usr/bin/env python3
import re

# Update StationHaulingPage.jsx
with open('src/pages/StationHaulingPage.jsx', 'r') as f:
    content = f.read()

# Add formError state
content = content.replace(
    "  const [toInput, setToInput] = useState('');\n\n  // Add station to list",
    "  const [toInput, setToInput] = useState('');\n\n  // Form validation error\n  const [formError, setFormError] = useState('');\n\n  // Add station to list"
)

# Update addStation to clear error
content = content.replace(
    "    if (type === 'from') setFromInput('');\n    else setToInput('');\n  }, []);",
    "    if (type === 'from') setFromInput('');\n    else setToInput('');\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n  }, [formError]);"
)

# Update removeStation to clear error
content = content.replace(
    "      [`${type}Stations`]: prev[`${type}Stations`].filter((s) => s !== station),\n    }));\n  }, []);",
    "      [`${type}Stations`]: prev[`${type}Stations`].filter((s) => s !== station),\n    }));\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n  }, [formError]);"
)

# Update updateForm to clear error
content = content.replace(
    "  const updateForm = useCallback((key, value) => {\n    setForm((prev) => ({ ...prev, [key]: value }));\n  }, []);",
    "  const updateForm = useCallback((key, value) => {\n    setForm((prev) => ({ ...prev, [key]: value }));\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n  }, [formError]);"
)

# Replace alert with setFormError
content = content.replace(
    "        alert('Please select at least one station for both origin and destination');",
    "        setFormError('Please select at least one station for both origin and destination');"
)

# Add error clear on success
content = content.replace(
    "      if (!fromLocation || !toLocation) {\n        setFormError('Please select at least one station for both origin and destination');\n        return;\n      }\n\n      try {",
    "      if (!fromLocation || !toLocation) {\n        setFormError('Please select at least one station for both origin and destination');\n        return;\n      }\n\n      // Clear form error on valid submission\n      setFormError('');\n\n      try {"
)

# Add form error UI
content = content.replace(
    "        </GlassmorphicCard>\n\n        {/* Error */}",
    """        </GlassmorphicCard>

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

        {/* API Error */}"""
)

# Add ARIA to API error
content = content.replace(
    '        {error && (\n          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">',
    '        {error && (\n          <div\n            role="alert"\n            aria-live="polite"\n            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"\n          >'
)

with open('src/pages/StationHaulingPage.jsx', 'w') as f:
    f.write(content)

print("Updated StationHaulingPage.jsx")

# Update RegionHaulingPage.jsx
with open('src/pages/RegionHaulingPage.jsx', 'r') as f:
    content = f.read()

# Add formError state
content = content.replace(
    "  });\n\n  // Get nearby regions",
    "  });\n\n  // Form validation error\n  const [formError, setFormError] = useState('');\n\n  // Get nearby regions"
)

# Update updateForm to clear error
content = content.replace(
    "  const updateForm = useCallback((key, value) => {\n    setForm((prev) => ({ ...prev, [key]: value }));\n\n    // Reset toRegion when switching to nearby\n    if (key === 'useNearby' && value) {\n      setForm((prev) => ({ ...prev, toRegion: 'Nearby Regions' }));\n    }\n  }, []);",
    "  const updateForm = useCallback((key, value) => {\n    setForm((prev) => ({ ...prev, [key]: value }));\n    // Clear form error when user makes changes\n    if (formError) setFormError('');\n\n    // Reset toRegion when switching to nearby\n    if (key === 'useNearby' && value) {\n      setForm((prev) => ({ ...prev, toRegion: 'Nearby Regions' }));\n    }\n  }, [formError]);"
)

# Replace alerts with setFormError
content = content.replace(
    "        alert('Please select a valid origin region');",
    "        setFormError('Please select a valid origin region');"
)
content = content.replace(
    "          alert('Please select a valid destination region');",
    "          setFormError('Please select a valid destination region');"
)

# Add error clear on success
content = content.replace(
    "      const fromParam = `${form.fromPreference}-${fromId}`;",
    "      // Clear form error on valid submission\n      setFormError('');\n\n      const fromParam = `${form.fromPreference}-${fromId}`;"
)

# Add form error UI
content = content.replace(
    "        </GlassmorphicCard>\n\n        {/* Error */}",
    """        </GlassmorphicCard>

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

        {/* API Error */}"""
)

# Add ARIA to API error
content = content.replace(
    '        {error && (\n          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">',
    '        {error && (\n          <div\n            role="alert"\n            aria-live="polite"\n            className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"\n          >'
)

with open('src/pages/RegionHaulingPage.jsx', 'w') as f:
    f.write(content)

print("Updated RegionHaulingPage.jsx")
print("All files updated successfully!")
