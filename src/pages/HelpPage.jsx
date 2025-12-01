import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageLayout } from '../components/layout/PageLayout';
import { GlassmorphicCard } from '../components/common/GlassmorphicCard';

const helpContent = `
# EVETrade Help

Welcome to EVETrade, your comprehensive market analysis tool for EVE Online.

## Trading Modes

### Station Trading (Margin Trading)

Station trading involves buying low and selling high within the **same station**. This mode helps you find items with profitable buy/sell spreads.

**How it works:**
1. Select a station (e.g., Jita IV - Moon 4 - Caldari Navy Assembly Plant)
2. Set your minimum profit threshold
3. Configure your tax rate based on your Accounting skill level
4. Set margin ranges to filter results
5. Click "Find Trades" to discover opportunities

**Tips:**
- Higher trade volume items are generally safer
- Watch out for items with very thin margins - they can be volatile
- Consider the 0.01 ISK game and update fees

---

### Station-to-Station Hauling

This mode finds profitable trades between **specific stations**. Ideal for pilots with known routes or those operating in specific regions.

**How it works:**
1. Add one or more origin stations
2. Add one or more destination stations
3. Set cargo capacity (m³) and budget limits
4. Configure trade preferences (buy vs sell orders)
5. Click "Find Trades" to see opportunities

**Trade Preferences:**
- **Sell Orders**: You buy from sell orders at origin (instant)
- **Buy Orders**: You sell to buy orders at destination (instant)
- Using both provides immediate transactions but may reduce profit

---

### Region-to-Region Hauling

The most comprehensive trading mode - searches entire **regions** for opportunities.

**How it works:**
1. Select an origin region
2. Select a destination region (or use "nearby regions")
3. Configure filters and preferences
4. Click "Find Trades"

**Nearby Regions Feature:**
Enable "Use nearby regions" to automatically search all regions adjacent to your origin. Great for exploratory trading!

---

## Understanding the Results

### Key Metrics

| Metric | Description |
|--------|-------------|
| **Profit** | Total profit after taxes and fees |
| **ROI** | Return on Investment percentage |
| **Profit/Jump** | Profit divided by number of jumps |
| **Volume** | Number of units available |
| **Margin** | Percentage difference between buy and sell |

### Security Status Colors

| Color | Security Level | Description |
|-------|---------------|-------------|
| 🔵 Cyan/Blue | 1.0 - 0.9 | Safest high-sec |
| 🟢 Green | 0.8 - 0.5 | High-sec |
| 🟡 Yellow | 0.4 - 0.1 | Low-sec (dangerous) |
| 🔴 Red | 0.0 and below | Null-sec (very dangerous) |

### Player Structures (Citadels)

Stations marked with a **★** or gold color are player-owned structures (Citadels, Engineering Complexes, etc.). These may have:
- Different tax rates
- Access restrictions
- Risk of being destroyed

---

## Settings Explained

### Sales Tax
Your sales tax rate depends on your Accounting skill:
- Level 0: 7.50%
- Level 5: 3.75%

### Broker Fee
The fee for placing orders. Depends on standings and skills:
- Base: 3%
- Can be reduced with skills and standings

### Route Safety
- **Shortest**: Fastest route, may go through low/null-sec
- **Prefer Secure**: Avoids dangerous systems when possible
- **High-Sec Only**: Only uses 0.5+ security systems

---

## Tips for Success

1. **Start Small**: Begin with smaller trades to learn the mechanics
2. **Check Volume**: High volume items are more reliable
3. **Watch for Manipulation**: Extreme prices may be market manipulation
4. **Consider Time**: Some trades require waiting for orders to fill
5. **Factor in Risk**: Low-sec/null-sec trades are riskier but often more profitable
6. **Update Regularly**: Market data is cached hourly

---

## Keyboard Shortcuts

- **Enter**: Submit current form
- **Escape**: Close dropdowns
- **Arrow Keys**: Navigate autocomplete suggestions

---

## Support

EVETrade is a free, community project.

- **GitHub**: [github.com/awhipp/evetrade](https://github.com/awhipp/evetrade)
- **Issues**: Report bugs on GitHub Issues
- **API Status**: Data updates every 5 minutes

---

*EVE Online and the EVE logo are the registered trademarks of CCP hf.*
`;

/**
 * Help Page Component
 */
export function HelpPage() {
  return (
    <PageLayout title="Help & Documentation">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <GlassmorphicCard>
          <article className="prose prose-invert dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-accent-cyan prose-a:text-accent-cyan prose-strong:text-text-primary prose-code:text-accent-purple">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {helpContent}
            </ReactMarkdown>
          </article>
        </GlassmorphicCard>
      </div>
    </PageLayout>
  );
}

export default HelpPage;
