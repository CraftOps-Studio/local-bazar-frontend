# Local Bazar - Frontend 🛍️

The web frontend for Local Bazar, a platform connecting local shops with customers. This React application features a beautiful storefront for customers, a management dashboard for shop owners, and dynamic localization support.

## 🌟 Features
- **Modern Storefront:** Browse products, view shop details, and manage your cart.
- **Vendor Dashboard:** A dedicated space for shop owners to manage products, view analytics, and handle orders.
- **Responsive Design:** Fully responsive layout built with Tailwind CSS, ensuring a great experience on mobile and desktop.
- **Localization (i18n):** Multi-language support including English, Tamil, and Hindi.
- **Real-Time Notifications:** Socket.io integration to listen for live order updates.

## 🛠️ Tech Stack
- **Framework:** React.js
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State Management:** Custom React Context & Hooks
- **Real-Time:** Socket.io-client

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Local Bazar Backend running locally.

### Installation

1. Navigate to the frontend directory.
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Ensure the `.env` file is set up to point to the backend API:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```

## 📁 Project Structure
- `src/components/` - Reusable UI components grouped by feature (common, dashboard, storefront).
- `src/pages/` - Top-level page views (Landing, ShopRegister, Checkout, OrderConfirmation, etc.).
- `src/hooks/` - Custom React hooks (`useAuth`, `useCart`, `useShop`).
- `src/context/` - Global state providers.
- `src/i18n/` - Localization JSON files.
