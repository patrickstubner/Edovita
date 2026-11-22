import { createHashRouter, Navigate } from 'react-router';
import { HomePage } from '../pages/HomePage.tsx';
import { StatusPage } from '../pages/StatusPage.tsx';
import { Shell } from './Shell.tsx';

export const appRoutes = [
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'status', element: <StatusPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export function createAppRouter() {
  return createHashRouter(appRoutes);
}
