---
name: Industrial Precision
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#b9caca'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#849495'
  outline-variant: '#3a494a'
  surface-tint: '#00dce5'
  primary: '#e9feff'
  on-primary: '#003739'
  primary-container: '#00f5ff'
  on-primary-container: '#006c71'
  inverse-primary: '#00696e'
  secondary: '#ffdb9d'
  on-secondary: '#412d00'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#fef8ff'
  on-tertiary: '#3c0091'
  tertiary-container: '#e5d7ff'
  on-tertiary-container: '#703eda'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#63f7ff'
  primary-fixed-dim: '#00dce5'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for field-use reliability and technical precision. It targets industrial and electrical engineers who require high-performance tools in potentially high-glare or low-light environments. 

The visual style is a fusion of **Corporate Modern** and **Tactile Minimalism**. It utilizes a deep charcoal base to reduce eye strain, paired with high-chroma accents that categorize complex engineering data. The aesthetic is "technical-premium"—it feels like a sophisticated piece of lab equipment translated into a digital interface. Information hierarchy is paramount, ensuring that critical calculation results are immediately distinguishable from input parameters.

## Colors
The palette is built on a "Dark Industrial" foundation. The background uses a near-black neutral to provide maximum contrast for functional colors.

- **Primary (Teal):** Used for general calculations, primary actions, and "Transformer Loss" categories.
- **Secondary (Amber):** Dedicated to "Resistance" and warning-adjacent data points.
- **Tertiary (Indigo):** Reserved for "Voltage" parameters and secondary navigation.
- **Quaternary (Emerald):** Exclusively for successful "Result" states and finalized data.

Each category color includes a low-opacity "Wash" version (10-15% alpha) for card backgrounds to group related inputs without overwhelming the user.

## Typography
This design system utilizes **Inter** for its exceptional legibility in technical contexts. The scale prioritizes clarity and "glanceability." 

Numerical data must use **tabular figures** (`tnum`) to ensure columns of numbers align perfectly in result tables. Labels use a slightly heavier weight and uppercase styling to differentiate themselves from user-entered data. Mobile views scale large display sizes down by 20% while maintaining the line-height ratio to preserve touch-target integrity.

## Layout & Spacing
The layout follows a **Fluid Grid** system with a focus on logical grouping. 

- **Mobile:** A 4-column grid with 16px margins.
- **Desktop:** A 12-column grid with 24px margins.

Spacing follows a strict 4px base unit. Related input groups (e.g., "Resistance Values") are contained within cards with 16px internal padding. Vertical rhythm is maintained by using 24px spacing between distinct sections and 8px between a label and its corresponding input field. Result cards are visually separated from input areas by a larger 32px vertical gap.

## Elevation & Depth
Depth is communicated through **Tonal Layering** rather than traditional shadows, ensuring the UI remains crisp under bright field conditions.

- **Level 0 (Background):** The deepest neutral color.
- **Level 1 (Cards/Containers):** A slightly lighter surface color with a 1px solid border.
- **Level 2 (Inputs/Active Elements):** Defined by the accent color borders and a subtle inner glow when focused.

Shadows are used sparingly, only for "Floating Action Buttons" or "Modals," and are highly diffused with a 20% opacity black tint to prevent a "muddy" appearance on dark backgrounds.

## Shapes
The shape language balances industrial "sturdiness" with modern software approachability. 

A standard radius of **12px (rounded-lg)** is applied to main cards and input fields. Larger containers or result hero cards use **16px (rounded-xl)**. Buttons use a fully rounded "pill" shape only when they represent secondary actions (like 'Clear'); primary actions (like 'Calculate') maintain the 12px standard to feel more integrated into the grid.

## Components

### Input Fields
Inputs are the core of the experience. They feature a dark background (slightly darker than the card) with a 1px border. Upon focus, the border transitions to the category's accent color (Teal, Amber, etc.). Labels are always positioned above the field, never floating as placeholders, to ensure context is never lost.

### Result Cards
Result cards are high-contrast blocks. The background uses a 15% tint of the category color, with a 2px left-accent bar. The calculated value is displayed in `numeric-display` typography for maximum prominence.

### Buttons
- **Primary:** Solid accent color with black text for maximum contrast.
- **Secondary:** Outlined with 1px border and accent-colored text.
- **Destructive (Clear):** Grayscale/Neutral ghost button to prevent accidental clicks.

### Section Dividers
Used to group complex calculations. They consist of a 1px dashed line with a centered label in `label-caps` typography, creating a technical "blueprint" aesthetic.

### Icons
Use stroke-based icons (2px weight) to match the technicality of the typography. Avoid filled icons unless used as status indicators.