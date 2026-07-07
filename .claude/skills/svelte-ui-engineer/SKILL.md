# Skill: Svelte UI Engineer

## Purpose
Build clean, responsive, accessible Svelte 5 UI using shared components, design tokens, Lucide icons, and minimalistic neutral design.

## Activation Triggers
- Building any UI component, page, or layout
- Converting a design into Svelte markup
- Adding interactivity, transitions, or micro-interactions
- Building forms, tables, cards, modals, drawers

## When to Use
- Any frontend Svelte work

## When NOT to Use
- Server-side logic (use svelte-architect + server route patterns)

## Required Inputs
- What the UI must display and do
- Which route it belongs to
- Existing design tokens from `src/lib/styles/tokens.css`

## Design Rules (Non-Negotiable)
- Minimalistic design: clean whitespace, no visual noise
- NO colorful buttons or icons
- Neutral tones only (grays, near-blacks, off-whites)
- Lucide icons only (from `lucide-svelte`)
- CSS custom properties from `tokens.css` for all colors, spacing, type
- Tailwind CSS v4 utility classes
- Dark mode: `dark:` Tailwind variants or CSS variable switching
- Font: readable, system or clean sans-serif
- Spacing: 8px base unit
- No decorative gradients, no rainbow borders, no glow effects

## Step-by-Step Workflow

1. Check `src/lib/components/` — reuse existing components.
2. Check `src/lib/styles/tokens.css` — use existing tokens.
3. Design the component structure (one responsibility per component).
4. Write the Svelte 5 component using `$props`, `$state`, `$derived`.
5. Use Tailwind classes mapped to design tokens.
6. Add Lucide icons where needed (import from `lucide-svelte`).
7. Add hover states, focus styles, transitions.
8. Add accessibility attributes (`aria-label`, `role`, `tabindex`).
9. Make it responsive (mobile-first with `sm:`, `md:`, `lg:` breakpoints).
10. Run the svelte-autofixer MCP tool.
11. Fix all reported issues.
12. Re-run until no issues.

## Svelte 5 Patterns

```svelte
<script>
  // Props with $props()
  let { label, onclick, disabled = false } = $props();
  
  // Local state with $state()
  let isOpen = $state(false);
  
  // Derived values with $derived()
  let classes = $derived(`base-class ${disabled ? 'opacity-50' : ''}`);
</script>
```

## Component Checklist
- [ ] Uses `$props()` not `export let`
- [ ] No hardcoded colors (use token classes or CSS vars)
- [ ] No colorful decorative elements
- [ ] Lucide icons (not emoji, not other icon libs)
- [ ] Focus visible (keyboard navigation)
- [ ] Responsive at mobile, tablet, desktop
- [ ] Loading and empty states handled
- [ ] Error states visible
- [ ] svelte-autofixer run with no remaining issues

## Output Format
- `.svelte` component file(s)
- Any new design tokens added to `tokens.css`
- No new CSS files (Tailwind only)

## Validation Checklist
- [ ] svelte-autofixer passes
- [ ] No `export let` (use `$props()`)
- [ ] No purple/indigo/violet colors
- [ ] No colorful buttons
- [ ] Accessible
- [ ] Responsive

## Failure Handling
- If svelte-autofixer reports issues: fix each one, rerun
- If a Lucide icon isn't available: use a close alternative from Lucide (never substitute with emoji)
- If a design token doesn't exist for a needed value: add it to `tokens.css`

## Examples
**Task:** Build a sidebar navigation.
**Key:** Uses Lucide icons, neutral grays, no color-coded items.

## Registry Update Requirements
- None for pure UI work
- If a new shared component is created: note it in `docs/REPOSITORY_MAP.md`
