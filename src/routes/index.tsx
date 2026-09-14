import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ADMIN_PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/admin/dashboard/DashboardPage';
import { UsersListPage } from '@/pages/admin/users/UsersListPage';
import { UserFormPage } from '@/pages/admin/users/UserFormPage';
import { UserViewPage } from '@/pages/admin/users/UserViewPage';
import { RolesPage } from '@/pages/admin/roles/RolesPage';
import { DepotsPage } from '@/pages/admin/depots/DepotsPage';
import { ProductsPage } from '@/pages/admin/products/ProductsPage';
import { ProductionListPage } from '@/pages/admin/factory/ProductionListPage';
import { ProductionFormPage } from '@/pages/admin/factory/ProductionFormPage';
import { SupplyHistoryListPage } from '@/pages/admin/factory/SupplyHistoryListPage';
import { SupplyFormPage } from '@/pages/admin/factory/SupplyFormPage';
import { FactoryStockPage } from '@/pages/admin/factory/FactoryStockPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorPage } from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ADMIN_PATHS.dashboard} replace /> },
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: ADMIN_PATHS.dashboard, element: <DashboardPage /> },
      { path: ADMIN_PATHS.roles, element: <RolesPage /> },
      { path: ADMIN_PATHS.users.list, element: <UsersListPage /> },
      { path: ADMIN_PATHS.users.add, element: <UserFormPage /> },
      { path: '/admin/users/:id', element: <UserViewPage /> },
      { path: '/admin/users/:id/edit', element: <UserFormPage /> },
      { path: ADMIN_PATHS.depots.list, element: <DepotsPage /> },
      { path: ADMIN_PATHS.products.list, element: <ProductsPage /> },
      { path: ADMIN_PATHS.factory.production.list, element: <ProductionListPage /> },
      { path: ADMIN_PATHS.factory.production.add, element: <ProductionFormPage /> },
      { path: '/admin/factory/production/:id/edit', element: <ProductionFormPage /> },
      { path: ADMIN_PATHS.factory.supplies.list, element: <SupplyHistoryListPage /> },
      { path: ADMIN_PATHS.factory.supplies.add, element: <SupplyFormPage /> },
      { path: '/admin/factory/supplies/:id/edit', element: <SupplyFormPage /> },
      { path: ADMIN_PATHS.factory.stock, element: <FactoryStockPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);