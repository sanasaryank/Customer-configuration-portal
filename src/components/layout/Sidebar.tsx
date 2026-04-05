import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { t } = useTranslation();
  const [handbooksOpen, setHandbooksOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const topNav: NavItem[] = [
    { label: t('nav.customers'), path: ROUTES.CUSTOMERS },
    { label: t('nav.products'), path: ROUTES.PRODUCTS },
  ];

  const historyItems: NavItem[] = [
    { label: t('nav.historyActions'), path: ROUTES.HISTORY_ACTIONS },
    { label: t('nav.historyLicenseMoving'), path: ROUTES.HISTORY_LICENSE_MOVING },
  ];

  const handbooks: NavItem[] = [
    { label: t('nav.employees'), path: ROUTES.EMPLOYEES },
    { label: t('nav.workingDays'), path: ROUTES.WORKING_DAYS },
    { label: t('nav.integrationTypes'), path: ROUTES.INTEGRATION_TYPES },
    { label: t('nav.restaurantTypes'), path: ROUTES.RESTAURANT_TYPES },
    { label: t('nav.hotelTypes'), path: ROUTES.HOTEL_TYPES },
    { label: t('nav.menuTypes'), path: ROUTES.MENU_TYPES },
    { label: t('nav.priceSegments'), path: ROUTES.PRICE_SEGMENTS },
    { label: t('nav.productGroups'), path: ROUTES.PRODUCT_GROUPS },
    { label: t('nav.customerGroups'), path: ROUTES.CUSTOMER_GROUPS },
    { label: t('nav.customerStatus'), path: ROUTES.CUSTOMER_STATUS },
    { label: t('nav.countries'), path: ROUTES.COUNTRIES },
    { label: t('nav.cities'), path: ROUTES.CITIES },
    { label: t('nav.districts'), path: ROUTES.DISTRICTS },
  ];

  if (!isOpen) {
    return (
      <aside className="w-12 bg-gray-900 flex flex-col items-center py-4 shrink-0" />
    );
  }

  return (
    <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <span className="text-sm font-bold tracking-wide text-white">
          Config Portal
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {topNav.map((item) => (
          <SidebarLink key={item.path} {...item} />
        ))}

        {/* History section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>{t('nav.history')}</span>
            <span className="text-xs">{historyOpen ? '▾' : '▸'}</span>
          </button>
          {historyOpen && (
            <div className="space-y-1 mt-1">
              {historyItems.map((item) => (
                <SidebarLink key={item.path} {...item} indent />
              ))}
            </div>
          )}
        </div>

        {/* Handbooks section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setHandbooksOpen((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span>{t('nav.handbooks')}</span>
            <span className="text-xs">{handbooksOpen ? '▾' : '▸'}</span>
          </button>
          {handbooksOpen && (
            <div className="space-y-1 mt-1">
              {handbooks.map((item) => (
                <SidebarLink key={item.path} {...item} indent />
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({
  label,
  path,
  indent,
}: NavItem & { indent?: boolean }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        clsx(
          'flex items-center rounded-md text-sm transition-colors',
          indent ? 'px-4 py-1.5' : 'px-3 py-2',
          isActive
            ? 'bg-primary-700 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white',
        )
      }
    >
      {label}
    </NavLink>
  );
}
