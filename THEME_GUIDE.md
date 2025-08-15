# 🎨 Yeshua Cleaning Dashboard Theme System

## Overview

This comprehensive theme system provides consistent styling across the entire Yeshua Cleaning dashboard. It includes colors, typography, spacing, components, and utilities for maintaining design consistency.

## 🎯 Quick Start

### Using Themed Components

```tsx
import { ThemedButton, ThemedInput, ThemedCard, ThemedBadge } from '@/components/ui';

// Button with theme variants
<ThemedButton variant="primary" size="lg" isLoading={loading}>
  Save Changes
</ThemedButton>

// Input with theme styling
<ThemedInput
  label="Email Address"
  variant="default"
  leftIcon={<MailIcon />}
  error={errors.email}
/>

// Card with theme variants
<ThemedCard variant="interactive" padding="lg">
  <h3>Job Details</h3>
  <p>Content here...</p>
</ThemedCard>

// Badge with status colors
<ThemedBadge variant="success" icon={<CheckIcon />}>
  Completed
</ThemedBadge>
```

### Using Theme Hook

```tsx
import { useTheme } from '@/components/ui';

const MyComponent = () => {
  const { theme, getColor, getComponentClass } = useTheme();
  
  return (
    <div style={{ backgroundColor: getColor('primary.50') }}>
      <button className={getComponentClass('button', 'primary', 'lg')}>
        Themed Button
      </button>
    </div>
  );
};
```

## 🎨 Color System

### Primary Brand Colors (Yeshua Cleaning Red)
```
primary-50:  #fef2f2  (Lightest)
primary-100: #fee2e2
primary-200: #fecaca
primary-300: #fca5a5
primary-400: #f87171
primary-500: #ef4444
primary-600: #7c2429  ← Main brand color
primary-700: #6b1f23
primary-800: #5a1a1d
primary-900: #4a1518
primary-950: #3a1013  (Darkest)
```

### Status Colors
- **Success**: Green shades for completed jobs, success states
- **Warning**: Yellow/orange for pending actions, cautions
- **Error**: Red shades for errors, failed states
- **Info**: Blue shades for informational content

### Usage Examples
```tsx
// CSS classes
className="bg-primary-600 text-white"
className="text-success-700 bg-success-50"
className="border-error-300 text-error-600"

// Theme function
style={{ color: getColor('primary.600') }}
```

## 📝 Typography

### Font Families
- **Sans**: Inter (primary), system-ui, sans-serif
- **Mono**: Fira Code, monospace

### Font Sizes
```
xs:   0.75rem (12px)
sm:   0.875rem (14px)
base: 1rem (16px)     ← Default
lg:   1.125rem (18px)
xl:   1.25rem (20px)
2xl:  1.5rem (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem (36px)
5xl:  3rem (48px)
6xl:  3.75rem (60px)
```

### Font Weights
```
thin:      100
light:     300
normal:    400  ← Default
medium:    500
semibold:  600
bold:      700
extrabold: 800
black:     900
```

## 📏 Spacing System

Consistent spacing using rem-based scale:
```
0:    0px
0.5:  0.125rem (2px)
1:    0.25rem (4px)
2:    0.5rem (8px)
3:    0.75rem (12px)
4:    1rem (16px)      ← Base unit
6:    1.5rem (24px)
8:    2rem (32px)
12:   3rem (48px)
16:   4rem (64px)
20:   5rem (80px)
24:   6rem (96px)
```

## 🧩 Component System

### Buttons

```tsx
// Variants
<ThemedButton variant="primary">Primary Action</ThemedButton>
<ThemedButton variant="secondary">Secondary</ThemedButton>
<ThemedButton variant="outline">Outline</ThemedButton>
<ThemedButton variant="ghost">Ghost</ThemedButton>
<ThemedButton variant="danger">Delete</ThemedButton>
<ThemedButton variant="success">Approve</ThemedButton>

// Sizes
<ThemedButton size="xs">Extra Small</ThemedButton>
<ThemedButton size="sm">Small</ThemedButton>
<ThemedButton size="md">Medium (default)</ThemedButton>
<ThemedButton size="lg">Large</ThemedButton>
<ThemedButton size="xl">Extra Large</ThemedButton>

// States
<ThemedButton isLoading>Loading...</ThemedButton>
<ThemedButton disabled>Disabled</ThemedButton>

// With icons
<ThemedButton leftIcon={<PlusIcon />}>Add Job</ThemedButton>
<ThemedButton rightIcon={<ArrowRightIcon />}>Continue</ThemedButton>
```

### Inputs

```tsx
// Basic input
<ThemedInput
  label="Job Title"
  placeholder="Enter job title..."
  helpText="This will be visible to customers"
/>

// With validation
<ThemedInput
  label="Email"
  variant="error"
  error="Please enter a valid email address"
/>

// With icons
<ThemedInput
  label="Search"
  leftIcon={<SearchIcon />}
  rightIcon={<FilterIcon />}
/>

// Sizes
<ThemedInput inputSize="sm" />
<ThemedInput inputSize="md" /> // default
<ThemedInput inputSize="lg" />
```

### Cards

```tsx
// Basic card
<ThemedCard>
  <h3>Job Details</h3>
  <p>Content...</p>
</ThemedCard>

// Interactive card (clickable)
<ThemedCard variant="interactive" onClick={() => selectJob(job.id)}>
  <JobPreview job={job} />
</ThemedCard>

// Elevated card
<ThemedCard variant="elevated" padding="xl">
  <ImportantContent />
</ThemedCard>
```

### Badges

```tsx
// Status badges
<ThemedBadge variant="success">Completed</ThemedBadge>
<ThemedBadge variant="warning">Pending</ThemedBadge>
<ThemedBadge variant="error">Failed</ThemedBadge>
<ThemedBadge variant="info">In Progress</ThemedBadge>

// With icons
<ThemedBadge variant="primary" icon={<StarIcon />}>
  Featured
</ThemedBadge>

// Sizes
<ThemedBadge size="sm">Small</ThemedBadge>
<ThemedBadge size="md">Medium</ThemedBadge>
<ThemedBadge size="lg">Large</ThemedBadge>
```

## 🎭 Job Status Colors

Specific color mappings for cleaning job statuses:

```tsx
// Job status badge examples
const getJobStatusBadge = (status: JobStatus) => {
  const statusConfig = {
    pending: { variant: 'warning', text: 'Pending' },
    confirmed: { variant: 'info', text: 'Confirmed' },
    assigned: { variant: 'primary', text: 'Assigned' },
    in_progress: { variant: 'info', text: 'In Progress' },
    completed: { variant: 'success', text: 'Completed' },
    cancelled: { variant: 'error', text: 'Cancelled' },
  };
  
  const config = statusConfig[status];
  return <ThemedBadge variant={config.variant}>{config.text}</ThemedBadge>;
};
```

## 🔧 Customization

### Extending Colors

```tsx
// In your component
const customColors = {
  ...theme.colors,
  brand: {
    light: '#f0f9ff',
    main: '#0ea5e9',
    dark: '#0c4a6e'
  }
};
```

### Creating Custom Components

```tsx
import { useTheme } from '@/components/ui';

const CustomJobCard = ({ job }) => {
  const { getComponentClass, getColor } = useTheme();
  
  return (
    <div className={getComponentClass('card', 'interactive')}>
      <div style={{ borderLeft: `4px solid ${getColor('primary.600')}` }}>
        {/* Job content */}
      </div>
    </div>
  );
};
```

## 📱 Responsive Design

The theme system works seamlessly with Tailwind's responsive prefixes:

```tsx
<ThemedCard className="p-4 md:p-6 lg:p-8">
  <ThemedButton 
    size="sm" 
    className="w-full md:w-auto"
  >
    Responsive Button
  </ThemedButton>
</ThemedCard>
```

## 🎨 Design Tokens

All theme values are available as design tokens:

```tsx
// Accessing theme values
const { theme } = useTheme();

console.log(theme.colors.primary[600]); // #7c2429
console.log(theme.spacing[4]); // 1rem
console.log(theme.borderRadius.lg); // 0.5rem
```

## 🔄 Migration from Old Components

Replace existing components gradually:

```tsx
// Old way
<button className="bg-primary-600 text-white px-4 py-2 rounded-lg">
  Submit
</button>

// New themed way
<ThemedButton variant="primary" size="md">
  Submit
</ThemedButton>
```

## 🎯 Best Practices

1. **Consistency**: Always use themed components for consistent styling
2. **Semantic Colors**: Use status colors (success, warning, error) semantically
3. **Spacing**: Use the spacing scale instead of arbitrary values
4. **Accessibility**: Themed components include proper focus states and ARIA attributes
5. **Performance**: Theme values are optimized and cached for performance

## 🚀 Future Enhancements

The theme system is designed to support:
- Dark mode (coming soon)
- Multiple brand themes
- Dynamic color generation
- Advanced component variants
- CSS-in-JS integration

---

## 📚 Examples in Action

Check these files for real-world usage examples:
- `/src/components/auth/LoginForm.tsx` - Authentication forms
- `/src/components/dashboard/JobsTab.tsx` - Job management interface
- `/src/components/booking/BookingSummary.tsx` - Booking interface

This theme system ensures your Yeshua Cleaning dashboard maintains professional, consistent styling while being flexible enough for future enhancements! 🎨✨
