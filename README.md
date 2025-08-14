# Yeshua Cleaning - Booking & Pricing Web App

A modern, responsive Next.js application for booking professional cleaning services with real-time pricing, secure payment processing, and an intuitive user interface.

## Features

### 🏠 Comprehensive Booking System
- **Contact Information**: Customer details collection
- **Service Address**: Complete address with state dropdown
- **Service Selection**: Bedrooms, bathrooms, and cleaning type options
- **Add-on Services**: Fridge, oven, windows, cabinets, laundry, walls, pet hair removal
- **Flexible Scheduling**: Date and time selection with frequency options
- **Promo Codes**: Discount system with popular codes

### 💰 Smart Pricing Engine
- **Flat-fee Structure**: Based on bedrooms/bathrooms and cleaning type
- **Dynamic Add-ons**: Real-time pricing updates for extras
- **Recurring Discounts**: Automatic savings for weekly, bi-weekly, and monthly services
- **Travel & Rush Fees**: Intelligent surcharge calculation
- **Promo Code Integration**: FIRST20, WELCOME15, SAVE10 support

### 🎨 Modern UI/UX
- **Two-column Layout**: Form on left, summary on right
- **Real-time Updates**: Instant pricing recalculation
- **Mobile Responsive**: Optimized for all device sizes
- **Clean Design**: Professional styling with Tailwind CSS
- **Interactive Components**: Smooth animations and transitions

### 🔒 Secure Payment
- **Stripe Integration**: Ready for secure payment processing
- **SSL Security**: Protected data transmission
- **Card Validation**: Real-time input formatting and validation
- **Payment Logos**: Trust indicators for major card types

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Custom hooks with class-based managers
- **Architecture**: Object-oriented with single responsibility principle
- **Icons**: Lucide React

## Architecture

### 🏗️ Modular Design
- **Services**: Separate managers for booking and pricing logic
- **Components**: Reusable UI components following SRP
- **Types**: Comprehensive TypeScript interfaces
- **Hooks**: Custom hooks for state management

### 📁 File Structure
```
src/
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # Reusable UI components
│   └── booking/           # Booking-specific components
├── services/
│   ├── booking/           # Booking management
│   └── pricing/           # Pricing calculation engine
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yeshua-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Configuration

### Environment Variables
Create a `.env.local` file:

```env
# Stripe Configuration (when ready to integrate)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_key
```

### Pricing Configuration
Modify pricing in `src/services/pricing/PricingEngine.ts`:

```typescript
private readonly baseRates = {
  [CleaningType.REGULAR]: {
    bedrooms: { 1: 80, 2: 100, 3: 120, 4: 140, 5: 160 },
    bathrooms: { 1: 20, 2: 35, 3: 50, 4: 65 }
  },
  // ... other cleaning types
};
```

## Customization

### Styling
- Colors: Modify `tailwind.config.js` for brand colors
- Components: Update component styles in respective files
- Global styles: Edit `src/app/globals.css`

### Business Logic
- Pricing rules: `src/services/pricing/PricingEngine.ts`
- Booking validation: `src/services/booking/BookingManager.ts`
- Form validation: Individual form components

### Content
- Service descriptions: `src/components/booking/ServiceSelectionForm.tsx`
- Benefits list: `src/components/booking/BenefitsList.tsx`
- Terms and contact info: `src/app/page.tsx`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Drag and drop build folder
- **AWS**: Use Amplify or S3 + CloudFront
- **Digital Ocean**: App Platform deployment

## Future Enhancements

### Phase 2 Features
- [ ] Email/SMS confirmations
- [ ] Customer dashboard
- [ ] Cleaner management portal
- [ ] Review and rating system
- [ ] Advanced scheduling (recurring bookings)
- [ ] Service history tracking

### Technical Improvements
- [ ] Unit tests with Jest
- [ ] E2E tests with Playwright
- [ ] Performance monitoring
- [ ] SEO optimization
- [ ] PWA capabilities

## Support

For questions or support:
- Email: hello@yeshuacleaning.com
- Phone: (555) 123-4567

## License

© 2024 Yeshua Cleaning. All rights reserved.
