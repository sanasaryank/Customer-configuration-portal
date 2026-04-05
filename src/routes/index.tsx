import React, { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { FullPageSpinner } from '../components/ui/Spinner';

// Lazy-loaded pages
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const CustomersPage = lazy(() => import('../features/customers/CustomersPage'));
const ProductsPage = lazy(() => import('../features/products/ProductsPage'));
const HistoryPage = lazy(() => import('../features/history/HistoryPage'));
const EmployeesPage = lazy(() => import('../features/employees/EmployeesPage'));
const WorkingDaysPage = lazy(() => import('../features/workingDays/WorkingDaysPage'));
const DictionaryPage = lazy(() => import('../features/dictionaries/DictionaryPage'));

function Fallback() {
  return <FullPageSpinner />;
}

function buildRouter() {
  return createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<Fallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Default redirect
          {
            index: true,
            path: '/',
            element: <Navigate to={ROUTES.CUSTOMERS} replace />,
          },
          {
            path: ROUTES.CUSTOMERS,
            element: (
              <Suspense fallback={<Fallback />}>
                <CustomersPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.PRODUCTS,
            element: (
              <Suspense fallback={<Fallback />}>
                <ProductsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.HISTORY,
            element: (
              <Suspense fallback={<Fallback />}>
                <HistoryPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.EMPLOYEES,
            element: (
              <Suspense fallback={<Fallback />}>
                <EmployeesPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.WORKING_DAYS,
            element: (
              <Suspense fallback={<Fallback />}>
                <WorkingDaysPage />
              </Suspense>
            ),
          },
          // Geo entities — handled via DictionaryPage with parent linking
          {
            path: ROUTES.COUNTRIES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="countries" dictKey="countries" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CITIES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="cities" dictKey="cities" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.DISTRICTS,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="districts" dictKey="districts" />
              </Suspense>
            ),
          },
          // Dictionary pages — all share the same DictionaryPage with a key prop
          {
            path: ROUTES.INTEGRATION_TYPES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="integrationTypes" dictKey="integrationTypes" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.RESTAURANT_TYPES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="restaurantTypes" dictKey="restaurantTypes" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.HOTEL_TYPES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="hotelTypes" dictKey="hotelTypes" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.MENU_TYPES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="menuTypes" dictKey="menuTypes" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.PRICE_SEGMENTS,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="priceSegments" dictKey="priceSegments" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.PRODUCT_GROUPS,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="productGroups" dictKey="productGroups" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CUSTOMER_GROUPS,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="customerGroups" dictKey="customerGroups" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.CUSTOMER_STATUS,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="customerStatus" dictKey="customerStatus" />
              </Suspense>
            ),
          },
          {
            path: ROUTES.LICENSE_TYPES,
            element: (
              <Suspense fallback={<Fallback />}>
                <DictionaryPage key="licenseTypes" dictKey="licenseTypes" />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
}

export function AppRouter() {
  const [router] = React.useState(buildRouter);
  return <RouterProvider router={router} />;
}
