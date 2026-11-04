import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import AuthGuard from './AuthGuard';

const Login = lazy(() => import('@/pages/login'));
const MainLayout = lazy(() => import('@/layouts/MainLayout'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const MaterialManagement = lazy(() => import('@/pages/material'));
const BomManagement = lazy(() => import('@/pages/bom'));
const EcoManagement = lazy(() => import('@/pages/eco'));
const DocumentManagement = lazy(() => import('@/pages/document'));
const CadIntegration = lazy(() => import('@/pages/cad'));
const Manufacturing = lazy(() => import('@/pages/manufacturing'));
const SystemManagement = lazy(() => import('@/pages/system'));
const NotFound = lazy(() => import('@/pages/404'));

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}>
    {element}
  </Suspense>
);

const routes: RouteObject[] = [
  {
    path: '/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/',
    element: <AuthGuard>{withSuspense(<MainLayout />)}</AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'material', element: withSuspense(<MaterialManagement />) },
      { path: 'bom', element: withSuspense(<BomManagement />) },
      { path: 'eco', element: withSuspense(<EcoManagement />) },
      { path: 'document', element: withSuspense(<DocumentManagement />) },
      { path: 'cad', element: withSuspense(<CadIntegration />) },
      { path: 'manufacturing', element: withSuspense(<Manufacturing />) },
      { path: 'system', element: withSuspense(<SystemManagement />) },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
];

export const router = createBrowserRouter(routes);