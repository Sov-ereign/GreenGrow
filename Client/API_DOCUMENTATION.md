# FarmWise API Documentation

## Overview
FarmWise is a modern farming advisory platform with a complete backend powered by Supabase, featuring authentication, real-time database operations, and comprehensive API services.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context API
- **Routing**: React Router v7
- **AI Integration**: Google Gemini API

### Project Structure
```
Client/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries (Supabase client)
│   ├── pages/             # Page components
│   ├── services/          # API service layers
│   └── App.tsx            # Root application component
```

## Database Schema

### Tables

#### farmer_profiles
- `id` (uuid, PK, references auth.users)
- `full_name` (text)
- `email` (text, unique)
- `phone_number` (text)
- `location` (text)
- `farm_size` (numeric)
- `language` (text)
- `created_at`, `updated_at` (timestamptz)

#### crops
- `id` (uuid, PK)
- `farmer_id` (uuid, FK)
- `name` (text)
- `area` (numeric)
- `stage` (text)
- `health_status` (text)
- `days_to_harvest` (integer)
- `expected_yield` (numeric)
- `image_url` (text)
- `created_at`, `updated_at` (timestamptz)

#### weather_alerts
- `id` (uuid, PK)
- `farmer_id` (uuid, FK)
- `location` (text)
- `alert_type` (text)
- `severity` (text)
- `message` (text)
- `is_read` (boolean)
- `created_at` (timestamptz)

#### market_prices
- `id` (uuid, PK)
- `crop_name` (text)
- `current_price` (numeric)
- `previous_price` (numeric)
- `market_location` (text)
- `unit` (text)
- `updated_at` (timestamptz)

#### recommendations
- `id` (uuid, PK)
- `farmer_id` (uuid, FK)
- `title` (text)
- `description` (text)
- `priority` (text)
- `category` (text)
- `is_read` (boolean)
- `created_at` (timestamptz)

## API Services

### Authentication Service (`authService.ts`)

#### Sign Up
```typescript
await authService.signUp({
  email: string,
  password: string,
  fullName: string,
  phoneNumber?: string,
  location?: string,
  farmSize?: number,
  language?: string
});
```

#### Login
```typescript
await authService.login({
  email: string,
  password: string
});
```

#### Get Current User
```typescript
const user = await authService.getCurrentUser();
```

#### Get Profile
```typescript
const profile = await authService.getProfile(userId);
```

#### Update Profile
```typescript
await authService.updateProfile(userId, updates);
```

#### Logout
```typescript
await authService.logout();
```

### Crop Service (`cropService.ts`)

#### Get All Crops
```typescript
const crops = await cropService.getCrops(farmerId);
```

#### Get Single Crop
```typescript
const crop = await cropService.getCrop(cropId);
```

#### Create Crop
```typescript
await cropService.createCrop(farmerId, {
  name: string,
  area: number,
  stage: string,
  health_status?: string,
  days_to_harvest: number,
  expected_yield: number,
  image_url?: string
});
```

#### Update Crop
```typescript
await cropService.updateCrop(cropId, updates);
```

#### Delete Crop
```typescript
await cropService.deleteCrop(cropId);
```

#### Get Crop Statistics
```typescript
const stats = await cropService.getCropStats(farmerId);
// Returns: { totalYield, totalArea, avgDaysToHarvest, cropCount }
```

### Market Service (`marketService.ts`)

#### Get All Market Prices
```typescript
const prices = await marketService.getMarketPrices();
```

#### Get Prices by Crop
```typescript
const prices = await marketService.getMarketPricesByCrop('Wheat');
```

#### Get Prices by Location
```typescript
const prices = await marketService.getMarketPricesByLocation('Delhi');
```

#### Calculate Price Change
```typescript
const change = marketService.calculatePriceChange(current, previous);
// Returns: { change: number, percentage: string }
```

### Recommendation Service (`recommendationService.ts`)

#### Get Recommendations
```typescript
const recommendations = await recommendationService.getRecommendations(farmerId);
```

#### Get Unread Recommendations
```typescript
const unread = await recommendationService.getUnreadRecommendations(farmerId);
```

#### Mark as Read
```typescript
await recommendationService.markAsRead(recommendationId);
```

#### Create Recommendation
```typescript
await recommendationService.createRecommendation(farmerId, {
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  category: string
});
```

### Weather Service (`weatherService.ts`)

#### Get Weather Alerts
```typescript
const alerts = await weatherService.getWeatherAlerts(farmerId);
```

#### Get Unread Alerts
```typescript
const unread = await weatherService.getUnreadAlerts(farmerId);
```

#### Mark Alert as Read
```typescript
await weatherService.markAlertAsRead(alertId);
```

## Authentication Flow

### Protected Routes
All application routes except `/login` and `/signup` are protected and require authentication.

### Auth Context
The `AuthContext` provides:
- `user`: Current authenticated user
- `profile`: User profile data
- `loading`: Authentication state loading
- `signUp()`: Sign up function
- `login()`: Login function
- `logout()`: Logout function
- `updateProfile()`: Update profile function

### Usage Example
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, profile, logout } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return <div>Welcome {profile?.full_name}</div>;
}
```

## Custom Hooks

### useCrops
Fetches and manages crop data with loading and error states:
```typescript
const { crops, loading, error, refetch } = useCrops();
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Market prices are publicly readable
- All write operations are restricted to data owners

### Authentication
- JWT-based authentication via Supabase Auth
- Secure password hashing
- Protected API endpoints
- Session management

## Environment Variables

Required environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Error Handling

### Global Error Boundary
Catches and displays errors gracefully with reload option.

### Service-Level Error Handling
All services throw descriptive errors that can be caught and handled at the component level.

### Example
```typescript
try {
  await cropService.createCrop(farmerId, cropData);
} catch (error) {
  console.error('Failed to create crop:', error.message);
}
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Best Practices

1. **Always use services** - Don't call Supabase directly from components
2. **Handle loading states** - Show spinners during data fetching
3. **Handle errors gracefully** - Display user-friendly error messages
4. **Use TypeScript types** - Leverage type safety for all data
5. **Protect routes** - Wrap sensitive routes with ProtectedRoute
6. **Validate data** - Validate form inputs before submission

## Future Enhancements

- Real-time weather API integration
- Push notifications for alerts
- Image upload for crop monitoring
- Advanced analytics dashboard
- Mobile app version
- Multi-language support
- Offline mode with sync
