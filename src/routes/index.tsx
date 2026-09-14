import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ADMIN_PATHS, FACTORY_PATHS, DEPOT_PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/admin/dashboard/DashboardPage';
import { UsersListPage } from '@/pages/admin/users/UsersListPage';
import { UserFormPage } from '@/pages/admin/users/UserFormPage';
import { UserViewPage } from '@/pages/admin/users/UserViewPage';
import { RolesPage } from '@/pages/admin/roles/RolesPage';
import { DepotsPage } from '@/pages/admin/depots/DepotsPage';
import { ProductsPage } from '@/pages/admin/products/ProductsPage';
import { ProductionPage } from '@/pages/factory/ProductionPage';
import { ProductionFormPage } from '@/pages/factory/ProductionFormPage';
import { SuppliesPage } from '@/pages/factory/SuppliesPage';
import { SupplyFormPage } from '@/pages/factory/SupplyFormPage';
import { FactoryStockPage } from '@/pages/factory/FactoryStockPage';
import { RestockListPage } from '@/pages/depot/RestockListPage';
import { RestockDecidePage } from '@/pages/depot/RestockDecidePage';
import { RestockEditPage } from '@/pages/depot/RestockEditPage';
import { DepotStockPage } from '@/pages/depot/DepotStockPage';
import { SalesListPage } from '@/pages/depot/SalesListPage';
import { SaleFormPage } from '@/pages/depot/SaleFormPage';
import { CurrentSalesPage } from '@/pages/depot/CurrentSalesPage';
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
      { path: FACTORY_PATHS.production.list, element: <ProductionPage /> },
      { path: FACTORY_PATHS.production.add, element: <ProductionFormPage /> },
      { path: '/factory/production/:id/edit', element: <ProductionFormPage /> },
      { path: FACTORY_PATHS.supplies.list, element: <SuppliesPage /> },
      { path: FACTORY_PATHS.supplies.add, element: <SupplyFormPage /> },
      { path: '/factory/supplies/:id/edit', element: <SupplyFormPage /> },
      { path: FACTORY_PATHS.stock, element: <FactoryStockPage /> },
      { path: DEPOT_PATHS.restock.list, element: <RestockListPage /> },
      { path: DEPOT_PATHS.restock.decide, element: <RestockDecidePage /> },
      { path: '/depot/restock/:id/edit', element: <RestockEditPage /> },
      { path: DEPOT_PATHS.stock, element: <DepotStockPage /> },
      { path: DEPOT_PATHS.sales.list, element: <SalesListPage /> },
      { path: DEPOT_PATHS.sales.add, element: <SaleFormPage /> },
      { path: '/depot/sales/:id/edit', element: <SaleFormPage /> },
      { path: DEPOT_PATHS.currentSales, element: <CurrentSalesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);