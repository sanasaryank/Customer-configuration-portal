import React, { createContext, useContext } from 'react';
import clsx from 'clsx';

type Orientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orientation: Orientation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  defaultTab: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  orientation?: Orientation;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  orientation = 'horizontal',
  children,
  className,
}: TabsProps) {
  const [uncontrolledTab, setUncontrolledTab] = React.useState(defaultTab);
  const activeTab = controlledTab ?? uncontrolledTab;
  const setActiveTab = onTabChange ?? setUncontrolledTab;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div className={clsx(orientation === 'vertical' && 'flex', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  const { orientation } = useTabsContext();
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={clsx(
        'flex',
        isVertical
          ? 'flex-col border-r border-gray-200 shrink-0 w-44 sticky top-0 self-start'
          : 'border-b border-gray-200 overflow-x-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabTrigger({ value, children, className }: TabTriggerProps) {
  const { activeTab, setActiveTab, orientation } = useTabsContext();
  const isActive = activeTab === value;
  const isVertical = orientation === 'vertical';

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={clsx(
        'px-4 py-2.5 text-sm font-medium transition-colors',
        isVertical
          ? clsx(
              'text-left w-full border-l-2 -mr-px',
              isActive
                ? 'border-primary-600 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            )
          : clsx(
              'whitespace-nowrap border-b-2 -mb-px',
              isActive
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ),
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab, orientation } = useTabsContext();
  if (activeTab !== value) return null;
  return (
    <div className={clsx(orientation === 'vertical' ? 'flex-1 pl-6 min-w-0' : 'pt-4', className)}>
      {children}
    </div>
  );
}
