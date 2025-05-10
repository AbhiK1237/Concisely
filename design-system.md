# Concisely Design System

## Color Palette
- Primary gradient: `from-purple-600 to-blue-600`
- Secondary gradient: `from-blue-500 to-indigo-600`
- Accent gradients: `from-pink-500 to-purple-600`, `from-green-500 to-teal-600`
- Background gradient: `linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)`
- Header/footer gradient: `bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50`

## Typography
- Headings: Font-bold, text-3xl for section titles
- Subheadings: Font-medium, text-xl for card titles
- Body: text-gray-600/700/800 based on background contrast

## Component Styling
### Cards
- White background with rounded-xl
- Shadow-lg with hover transform
- Border border-gray-100
- Decorative accent in top-right: `absolute top-0 right-0 w-20 h-20 -mt-10 -mr-10 bg-[color]/10 rounded-full`
- Hover effect: `group-hover:-translate-y-2 transition-transform duration-300`
- Icon container: `w-16 h-16 bg-[color]/10 rounded-2xl flex items-center justify-center mb-6`

### Buttons
- Primary: `bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0`
- Outline: `bg-white/80 hover:bg-white border`
- Hover shadows: `shadow-lg shadow-indigo-500/30`

### Section Headers
- Badge pill: `inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm mb-4`
- Indicator dot: `flex h-2 w-2 rounded-full bg-[color] mr-2`
- Title: `text-3xl font-bold mb-4`
- Description: `text-gray-700 max-w-2xl mx-auto`

### Backgrounds
- Pattern overlays with SVG: `absolute inset-0 opacity-5`
- Blur effects: `backdrop-blur-sm`, `blur-xl`
- Glassmorphism: `bg-white/90 backdrop-blur-lg`

### Animations
- GSAP animations with staggered entrances
- Sections fade in and move up: `opacity: 0, y: 40` to `opacity: 1, y: 0`
- CTA scales in: `opacity: 0, scale: 0.98` to `opacity: 1, scale: 1`

## Layout Patterns
- Container with max-width: `container mx-auto max-w-6xl`
- Grid layouts: `grid grid-cols-1 md:grid-cols-3 gap-10`
- Section padding: `py-24 px-6`
