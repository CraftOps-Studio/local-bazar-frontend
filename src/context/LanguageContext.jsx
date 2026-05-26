import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    brandName: 'Local Bazar',
    tagline: 'Empowering Local Businesses',
    searchPlaceholder: 'Search products, local shops...',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    transactions: 'Transactions',
    analytics: 'Analytics',
    settings: 'Settings',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    cart: 'Shopping Cart',
    checkout: 'Checkout',
    profile: 'Profile',
    shopRegister: 'Register Shop',
    home: 'Home',
    totalRevenue: 'Total Revenue',
    totalOrders: 'Total Orders',
    totalProducts: 'Total Products',
    activeCustomers: 'Active Customers',
    payNow: 'Pay Now',
    successTitle: 'Successful Payment!',
    errorTitle: 'Payment Failed',
    languageLabel: 'Language',
    themeLabel: 'Theme',
  },
  ta: {
    brandName: 'லோக்கல் பஜார்',
    tagline: 'உள்ளூர் வணிகங்களை மேம்படுத்துதல்',
    searchPlaceholder: 'தயாரிப்புகள், உள்ளூர் கடைகளைத் தேடுங்கள்...',
    login: 'உள்நுழைய',
    signup: 'பதிவு செய்க',
    logout: 'வெளியேறு',
    dashboard: 'கட்டுப்பாட்டு அறை',
    products: 'தயாரிப்புகள்',
    orders: 'ஆர்டர்கள்',
    transactions: 'பரிவர்த்தனைகள்',
    analytics: 'பகுப்பாய்வு',
    settings: 'அமைப்புகள்',
    addToCart: 'வண்டியில் சேர்',
    addedToCart: 'வண்டியில் சேர்க்கப்பட்டது',
    cart: 'கூடை',
    checkout: 'செக்அவுட்',
    profile: 'சுயவிவரம்',
    shopRegister: 'கடை பதிவு',
    home: 'முகப்பு',
    totalRevenue: 'மொத்த வருவாய்',
    totalOrders: 'மொத்த ஆர்டர்கள்',
    totalProducts: 'மொத்த தயாரிப்புகள்',
    activeCustomers: 'செயலில் உள்ள வாடிக்கையாளர்கள்',
    payNow: 'இப்போதே செலுத்துங்கள்',
    successTitle: 'பணம் செலுத்துதல் வெற்றி!',
    errorTitle: 'பணம் செலுத்துதல் தோல்வி',
    languageLabel: 'மொழி',
    themeLabel: 'தீம்',
  },
  hi: {
    brandName: 'लोकल बाज़ार',
    tagline: 'स्थानीय व्यवसायों का सशक्तिकरण',
    searchPlaceholder: 'उत्पादों, स्थानीय दुकानों को खोजें...',
    login: 'लॉगिन',
    signup: 'साइन अप',
    logout: 'लॉगआउट',
    dashboard: 'डैशबोर्ड',
    products: 'उत्पाद',
    orders: 'ऑर्डर',
    transactions: 'लेन-देन',
    analytics: 'विश्लेषण',
    settings: 'सेटिंग्स',
    addToCart: 'कार्ट में जोड़ें',
    addedToCart: 'कार्ट में जोड़ा गया',
    cart: 'शॉपिंग कार्ट',
    checkout: 'चेकआउट',
    profile: 'प्रोफ़ाइल',
    shopRegister: 'दुकान पंजीकरण',
    home: 'होम',
    totalRevenue: 'कुल राजस्व',
    totalOrders: 'कुल ऑर्डर',
    totalProducts: 'कुल उत्पाद',
    activeCustomers: 'सक्रिय ग्राहक',
    payNow: 'अभी भुगतान करें',
    successTitle: 'भुगतान सफल!',
    errorTitle: 'भुगतान विफल',
    languageLabel: 'भाषा',
    themeLabel: 'थीम',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslate = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslate must be used within a LanguageProvider');
  }
  return context;
};
