// Export auth feature components
export { default as AuthModal } from './components/AuthModal';
export { CompulsoryFormModal, WelcomeMessageModal } from './components/UpdatedAuthModal';



// Export auth hooks (from app/providers)
export { useAuth } from '@/app/providers';

// Export auth types (from app/providers)
export type { UserRole } from '@/app/providers';
