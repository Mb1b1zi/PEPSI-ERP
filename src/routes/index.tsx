import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ADMIN_PATHS, FACTORY_PATHS } from './paths';
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
import { RestockListPage } from '@/pages/admin/depotOps/RestockListPage';
import { RestockDecidePage } from '@/pages/admin/depotOps/RestockDecidePage';
import { RestockEditPage } from '@/pages/admin/depotOps/RestockEditPage';
import { DepotStockPage } from '@/pages/admin/depotOps/DepotStockPage';
import { SalesListPage } from '@/pages/admin/depotOps/SalesListPage';
import { SaleFormPage } from '@/pages/admin/depotOps/SaleFormPage';
import { CurrentSalesPage } from '@/pages/admin/depotOps/CurrentSalesPage';
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
      { path: ADMIN_PATHS.depotOps.restock.list, element: <RestockListPage /> },
      { path: ADMIN_PATHS.depotOps.restock.decide, element: <RestockDecidePage /> },
      { path: '/admin/depot-operations/restock/:id/edit', element: <RestockEditPage /> },
      { path: ADMIN_PATHS.depotOps.stock, element: <DepotStockPage /> },
      { path: ADMIN_PATHS.depotOps.sales.list, element: <SalesListPage /> },
      { path: ADMIN_PATHS.depotOps.sales.add, element: <SaleFormPage /> },
      { path: '/admin/depot-operations/sales/:id/edit', element: <SaleFormPage /> },
      { path: ADMIN_PATHS.depotOps.currentSales, element: <CurrentSalesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);