# EVETrade - Continuous Development Notes

## Completed This Iteration

1. **Mobile-Friendly Footer** - Added `pb-safe` for iOS safe area, improved responsive padding `px-4 sm:px-6 py-6 sm:py-8`, tighter link spacing on mobile

2. **Mobile-Friendly Modal** - Bottom sheet pattern on mobile (slides up from bottom), responsive padding throughout Header/Body/Footer, `pb-safe` for footer buttons, max-height constraints, stacked buttons on mobile

3. **TradingTable Scroll Indicator** - Added gradient fade on right edge to hint at horizontal scroll availability on tablet-sized screens

4. **Form Input Consistency** - Changed text sizing from `text-base sm:text-sm` to consistent `text-sm` across FormInput and FormSelect

## Architecture Notes

- Safe area utilities (`pb-safe`, `pt-safe`) require Tailwind CSS safe-area plugin or custom CSS. Check if these are defined in tailwind config.
- Modal now uses bottom-sheet pattern on mobile (items-end on small screens, items-center on sm+)
- TradingTable already had good mobile card view - tablet-sized screens showing table now have scroll hint

## Next Iteration Tasks

### High Priority - Mobile UX
- [ ] Test autocomplete dropdowns (ItemAutocomplete, StationAutocomplete) on mobile - may need portal positioning fix for viewport overflow
- [ ] Check PageLayout padding on extra-small phones (<320px)
- [ ] Verify safe area CSS utilities are properly defined in Tailwind config

### Medium Priority
- [ ] Add aria-label accessibility attributes to icon buttons
- [ ] Integrate ESI endpoints into UI (LP Optimizer, Industry Profits pages)
- [ ] Add SSO scope requests for new endpoints

### Lower Priority
- [ ] Standardize toast notification pattern across all pages
- [ ] Remove unused console.log statements (320+ found)
- [ ] Add pagination UI warning when results are truncated

## Files Changed This Iteration
- `src/components/common/Footer.jsx` - safe area, responsive padding
- `src/components/common/Modal.jsx` - mobile bottom sheet, responsive padding
- `src/components/tables/TradingTable.jsx` - scroll hint gradient
- `src/components/forms/FormInput.jsx` - text sizing consistency
- `src/components/forms/FormSelect.jsx` - text sizing consistency
