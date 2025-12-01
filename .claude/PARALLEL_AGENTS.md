# Parallel Agent Workflows for EVETrade Development

This document describes how to run multiple Claude Code agents in parallel for maximum productivity.

## Quick Start

Run multiple agents in separate terminal windows/tabs:

```bash
# Terminal 1: Feature Development
claude --headless "Implement [feature name]"

# Terminal 2: Testing
claude --headless "Write tests for [component]"

# Terminal 3: Bug Fixes
claude --headless "Fix [bug description]"

# Terminal 4: Documentation
claude --headless "Document [feature]"
```

## Pre-configured Task Templates

### 1. Full Feature Implementation

```bash
claude --headless "
Task: Implement [FEATURE_NAME]

Requirements:
1. Create new component at src/components/[category]/[Name].jsx
2. Add unit tests
3. Integrate with existing pages
4. Update exports in index files

Context:
- Follow existing patterns in src/components/common/
- Use Tailwind CSS with the accent-cyan, accent-gold theme
- Use formatISK, formatNumber, formatPercent from utils/formatters
"
```

### 2. Test Coverage Agent

```bash
claude --headless "
Task: Improve test coverage for src/components/common/

Requirements:
1. Identify components without tests
2. Write comprehensive unit tests
3. Include edge cases and error states
4. Ensure tests pass with 'npm test'

Priority order:
1. TradingDashboard.jsx
2. TradeOpportunityScore.jsx
3. SmartFilters.jsx
"
```

### 3. Performance Optimization Agent

```bash
claude --headless "
Task: Optimize performance for Station Trading Page

Requirements:
1. Profile component renders using React DevTools
2. Add useMemo for expensive calculations
3. Implement virtualization for large lists
4. Optimize re-renders

Focus areas:
- src/pages/StationTradingPage.jsx
- src/components/tables/TradingTable.jsx
"
```

### 4. UI/UX Enhancement Agent

```bash
claude --headless "
Task: Enhance UI/UX for trading dashboard

Requirements:
1. Add loading skeletons
2. Improve mobile responsiveness
3. Add micro-animations
4. Ensure accessibility (ARIA labels)

Components to enhance:
- TradingDashboard.jsx
- TradingTable.jsx
- SmartFilters.jsx
"
```

### 5. API Integration Agent

```bash
claude --headless "
Task: Add new ESI API endpoint integration

Requirements:
1. Add endpoint to src/api/esi.js
2. Handle errors and retries
3. Add caching where appropriate
4. Write integration tests

Endpoint: [ESI_ENDPOINT_URL]
"
```

## Parallel Workflow Examples

### Example 1: Feature + Tests in Parallel

```bash
# Terminal 1
claude --headless "Create MarketDepth component showing buy/sell order depth visualization"

# Terminal 2 (start after component is created)
claude --headless "Write comprehensive tests for MarketDepth component"
```

### Example 2: Multi-Page Enhancement

```bash
# Run all in parallel
claude --headless "Add TradingDashboard to StationTradingPage"
claude --headless "Add TradingDashboard to StationHaulingPage"
claude --headless "Add TradingDashboard to RegionHaulingPage"
```

### Example 3: Bug Bash

```bash
# Run diagnostics first
claude --headless "Run npm run build and list all TypeScript errors"

# Then fix in parallel
claude --headless "Fix TypeScript errors in src/components/"
claude --headless "Fix TypeScript errors in src/pages/"
claude --headless "Fix TypeScript errors in src/hooks/"
```

## Task Queue System

For complex multi-step workflows, use a task queue:

```bash
# Create task file
cat > .claude/tasks.txt << 'EOF'
1. Add trade hub presets to StationAutocomplete - DONE
2. Create TradingDashboard component - DONE
3. Add TradeOpportunityScore component - DONE
4. Integrate dashboard into StationTradingPage - IN_PROGRESS
5. Add keyboard shortcuts for dashboard - PENDING
6. Write tests for new components - PENDING
7. Update documentation - PENDING
EOF

# Run next task
claude --headless "Complete task 4 from .claude/tasks.txt"
```

## Monitoring Agents

### Check agent status
```bash
# List running Claude processes
ps aux | grep claude

# Check agent logs (if using --output)
tail -f /tmp/claude-agent-*.log
```

### Agent Output Collection
```bash
# Run with output capture
claude --headless "Task description" > /tmp/agent-output.log 2>&1 &

# Or use tee for real-time output
claude --headless "Task description" 2>&1 | tee /tmp/agent-output.log
```

## Best Practices

1. **Isolate Tasks**: Each agent should work on independent files/features to avoid conflicts
2. **Clear Instructions**: Be specific about file paths, patterns to follow, and expected outputs
3. **Context Awareness**: Reference existing code patterns the agent should follow
4. **Incremental Work**: Break large features into smaller parallel tasks
5. **Git Branches**: Consider using separate branches for each agent's work

## Resource Management

- Each headless agent uses ~200-500MB RAM
- Limit to 3-4 parallel agents on 8GB machines
- Limit to 6-8 parallel agents on 16GB+ machines

## Common Issues

### Agent Conflicts
If multiple agents modify the same file:
```bash
# After agents complete, resolve conflicts
git diff
git checkout --ours/--theirs [file]
```

### Stuck Agents
```bash
# Find and kill stuck agent
pkill -f "claude.*headless"
```

### Memory Issues
```bash
# Monitor memory
watch -n 5 'free -h'

# Kill lowest priority agent if needed
```

## EVETrade-Specific Tasks

### Station Trading Enhancements
```bash
claude --headless "
Enhance StationTradingPage with:
1. TradingDashboard at-a-glance view
2. TradeOpportunityScore in table rows
3. QuickFiltersBar for one-click filtering
"
```

### Data Export Improvements
```bash
claude --headless "
Improve DataExport component:
1. Add CSV export with all columns
2. Add JSON export for API integration
3. Add clipboard copy for EVE Multibuy format
"
```

### Price Alert System
```bash
claude --headless "
Implement price alert notifications:
1. Browser notifications when alert triggers
2. Sound alerts (optional)
3. Alert history panel
4. Recurring alert support
"
```
