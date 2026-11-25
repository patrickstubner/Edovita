import { createHashRouter, Navigate } from 'react-router';
import { HomePage } from '../pages/HomePage.tsx';
import { LanguageSettingsPage } from '../pages/LanguageSettingsPage.tsx';
import { PlanPage } from '../pages/PlanPage.tsx';
import { PrivacyPage } from '../pages/PrivacyPage.tsx';
import { ProfilePage } from '../pages/ProfilePage.tsx';
import { RecipeDetailPage } from '../pages/RecipeDetailPage.tsx';
import { RecipesPage } from '../pages/RecipesPage.tsx';
import { ShoppingListPage } from '../pages/ShoppingListPage.tsx';
import { StatusPage } from '../pages/StatusPage.tsx';
import { Shell } from './Shell.tsx';

export const appRoutes = [
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'profil', element: <ProfilePage /> },
      { path: 'profil/sprache', element: <LanguageSettingsPage /> },
      { path: 'profil/datenschutz', element: <PrivacyPage /> },
      { path: 'plan', element: <PlanPage /> },
      { path: 'rezepte', element: <RecipesPage /> },
      { path: 'rezept/:id', element: <RecipeDetailPage /> },
      { path: 'einkauf', element: <ShoppingListPage /> },
      { path: 'status', element: <StatusPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export function createAppRouter() {
  return createHashRouter(appRoutes);
}
