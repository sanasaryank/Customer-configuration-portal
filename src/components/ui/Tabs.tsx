import React, { createContext, useContext } from 'react';
import clsx from 'clsx';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolledTab, setUncontrolledTab] = React.useState(defaultTab);
  const activeTab = controlledTab ?? uncontrolledTab;
  const setActiveTab = onTabChange ?? setUncontrolledTab;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      className={clsx(
        'flex border-b border-gray-200 overflow-x-auto',
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
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={clsx(
        'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
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
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div className={clsx('pt-4', className)}>{children}</div>;
}
