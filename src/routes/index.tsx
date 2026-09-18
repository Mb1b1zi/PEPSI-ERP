import { createBrowserRouter } from 'react-router-dom';
import { AUTH_PATHS, ADMIN_PATHS, FACTORY_PATHS, DEPOT_PATHS, REPORTS_PATHS } from './paths';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RootRedirect } from '@/components/auth/RootRedirect';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/admin/dashboard/DashboardPage';
import { UsersListPage } from '@/pages/admin/users/UsersListPage';
import { UserFormPage } from '@/pages/admin/users/UserFormPage';
import { UserViewPage } from '@/pages/admin/users/UserViewPage';
import { RolesPage } from '@/pages/admin/roles/RolesPage';
import { RolePermissionsPage } from '@/pages/admin/roles/RolePermissionsPage';
import { DepotsPage } from '@/pages/admin/depots/DepotsPage';
import { DepotFormPage } from '@/pages/admin/depots/DepotFormPage';
import { ProductsPage } from '@/pages/admin/products/ProductsPage';
import { ProductFormPage } from '@/pages/admin/products/ProductFormPage';
import { QuantitiesPage } from '@/pages/admin/quantities/QuantitiesPage';
import { QuantityFormPage } from '@/pages/admin/quantities/QuantityFormPage';
import { PricesPage } from '@/pages/admin/prices/PricesPage';
import { PriceFormPage } from '@/pages/admin/prices/PriceFormPage';
import { ProductionPage } from '@/pages/factory/ProductionPage';
import { ProductionFormPage } from '@/pages/factory/ProductionFormPage';
import { SuppliesPage } from '@/pages/factory/SuppliesPage';
import { SupplyFormPage } from '@/pages/factory/SupplyFormPage';
import { FactoryStockPage } from '@/pages/factory/FactoryStockPage';
import { FactoryDashboardPage } from '@/pages/factory/FactoryDashboardPage';
import { DepotDashboardPage } from '@/pages/depot/DepotDashboardPage';
import { RestockListPage } from '@/pages/depot/RestockListPage';
import { RestockDecidePage } from '@/pages/depot/RestockDecidePage';
import { RestockEditPage } from '@/pages/depot/RestockEditPage';
import { DepotStockPage } from '@/pages/depot/DepotStockPage';
import { SalesListPage } from '@/pages/depot/SalesListPage';
import { SaleFormPage } from '@/pages/depot/SaleFormPage';
import { CurrentSalesPage } from '@/pages/depot/CurrentSalesPage';
import { CompanyOverviewPage } from '@/pages/reports/CompanyOverviewPage';
import { WorkersPage } from '@/pages/reports/WorkersPage';
import { SalesReportPage } from '@/pages/reports/SalesReportPage';
import { StockReportPage } from '@/pages/reports/StockReportPage';
import { ProductionReportPage } from '@/pages/reports/ProductionReportPage';
import { SupplyReportPage } from '@/pages/reports/SupplyReportPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorPage } from '@/pages/ErrorPage';

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: AUTH_PATHS.login, element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ADMIN_PATHS.dashboard, element: <DashboardPage /> },
          { path: ADMIN_PATHS.roles, element: <RolesPage /> },
          { path: '/admin/roles/:roleId/permissions', element: <RolePermissionsPage /> },
          { path: ADMIN_PATHS.users.list, element: <UsersListPage /> },
          { path: ADMIN_PATHS.users.add, element: <UserFormPage /> },
          { path: '/admin/users/:id', element: <UserViewPage /> },
          { path: '/admin/users/:id/edit', element: <UserFormPage /> },
          { path: ADMIN_PATHS.depots.list, element: <DepotsPage /> },
          { path: ADMIN_PATHS.depots.add, element: <DepotFormPage /> },
          { path: '/admin/depots/:id/edit', element: <DepotFormPage /> },
          { path: ADMIN_PATHS.products.list, element: <ProductsPage /> },
          { path: ADMIN_PATHS.products.add, element: <ProductFormPage /> },
          { path: '/admin/products/:id/edit', element: <ProductFormPage /> },
          { path: ADMIN_PATHS.quantities.list, element: <QuantitiesPage /> },
          { path: ADMIN_PATHS.quantities.add, element: <QuantityFormPage /> },
          { path: '/admin/quantities/:id/edit', element: <QuantityFormPage /> },
          { path: ADMIN_PATHS.prices.list, element: <PricesPage /> },
          { path: ADMIN_PATHS.prices.add, element: <PriceFormPage /> },
          { path: '/admin/prices/:quantityId/edit', element: <PriceFormPage /> },
          { path: FACTORY_PATHS.dashboard, element: <FactoryDashboardPage /> },
          { path: FACTORY_PATHS.production.list, element: <ProductionPage /> },
          { path: FACTORY_PATHS.production.add, element: <ProductionFormPage /> },
          { path: '/factory/production/:id/edit', element: <ProductionFormPage /> },
          { path: FACTORY_PATHS.supplies.list, element: <SuppliesPage /> },
          { path: FACTORY_PATHS.supplies.add, element: <SupplyFormPage /> },
          { path: '/factory/supplies/:id/edit', element: <SupplyFormPage /> },
          { path: FACTORY_PATHS.stock, element: <FactoryStockPage /> },
          { path: DEPOT_PATHS.dashboard, element: <DepotDashboardPage /> },
          { path: DEPOT_PATHS.restock.list, element: <RestockListPage /> },
          { path: DEPOT_PATHS.restock.decide, element: <RestockDecidePage /> },
          { path: '/depot/restock/:id/edit', element: <RestockEditPage /> },
          { path: DEPOT_PATHS.stock, element: <DepotStockPage /> },
          { path: DEPOT_PATHS.sales.list, element: <SalesListPage /> },
          { path: DEPOT_PATHS.sales.add, element: <SaleFormPage /> },
          { path: '/depot/sales/:id/edit', element: <SaleFormPage /> },
          { path: DEPOT_PATHS.currentSales, element: <CurrentSalesPage /> },
          { path: REPORTS_PATHS.overview, element: <CompanyOverviewPage /> },
          { path: REPORTS_PATHS.workers, element: <WorkersPage /> },
          { path: REPORTS_PATHS.sales, element: <SalesReportPage /> },
          { path: REPORTS_PATHS.stock, element: <StockReportPage /> },
          { path: REPORTS_PATHS.production, element: <ProductionReportPage /> },
          { path: REPORTS_PATHS.supply, element: <SupplyReportPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);