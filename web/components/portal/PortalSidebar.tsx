"use client";

import React from "react";

interface NavTab {
  id: string;
  label: string;
  icon: string;
  badge?: number | null;
}

interface NavGroup {
  label: string;
  tabs: NavTab[];
}

interface PortalSidebarProps {
  navGroups: NavGroup[];
  activeTab: string;
  onNavTabClick: (tabId: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const COLLAPSE_STORAGE_KEY = "lkc_portal_sidebar_collapsed";

function NavItem({
  tab,
  isActive,
  collapsed,
  onClick,
}: {
  tab: NavTab;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/item relative w-full flex items-center gap-2.5 rounded-lg border-l-2 pl-2.5 pr-2 py-2 text-[13px] transition-colors cursor-pointer ${
        collapsed ? "justify-center" : ""
      } ${
        isActive
          ? "border-clinical-teal bg-clinical-teal/10 text-white"
          : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="text-[15px] leading-none shrink-0">{tab.icon}</span>
      {!collapsed && <span className="flex-1 text-left truncate">{tab.label}</span>}
      {!collapsed && tab.badge ? (
        <span className="bg-clinical-teal text-deep-navy text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
          {tab.badge}
        </span>
      ) : null}
      {collapsed && tab.badge ? (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-clinical-teal" aria-hidden="true" />
      ) : null}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded-lg border border-clinical-teal/30 bg-dark-overlay-navy px-2.5 py-1.5 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover/item:opacity-100 z-50">
          {tab.label}
          {tab.badge ? ` (${tab.badge})` : ""}
        </span>
      )}
    </button>
  );
}

function SidebarNavList({
  navGroups,
  activeTab,
  collapsed,
  onNavTabClick,
}: {
  navGroups: NavGroup[];
  activeTab: string;
  collapsed: boolean;
  onNavTabClick: (tabId: string) => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
      {navGroups.map((group, groupIdx) => (
        <div key={group.label || `root-${groupIdx}`}>
          {group.label && !collapsed && (
            <p className="px-2.5 mb-1.5 text-[10px] uppercase tracking-wider text-white/40 font-bold">
              {group.label}
            </p>
          )}
          {group.label && collapsed && groupIdx > 0 && (
            <div className="mx-2 mb-2 border-t border-white/10" aria-hidden="true" />
          )}
          <div className="space-y-0.5">
            {group.tabs.map((tab) => (
              <NavItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                collapsed={collapsed}
                onClick={() => onNavTabClick(tab.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function PortalSidebar({ navGroups, activeTab, onNavTabClick, mobileOpen, onMobileClose }: PortalSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === "1") setCollapsed(true);
    } catch {
      // localStorage unavailable — fall back to default expanded state
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // localStorage unavailable — collapse preference just won't persist
    }
  }, [collapsed, hydrated]);

  return (
    <>
      {/* Desktop / tablet: persistent column */}
      <aside
        className={`hidden md:flex md:flex-col sticky top-0 h-screen shrink-0 border-r border-white/10 bg-primary-navy transition-[width] duration-200 z-40 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className={`flex items-center py-3.5 ${collapsed ? "justify-center px-2" : "justify-between px-3.5"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-dark-overlay-navy border border-clinical-teal/30 rounded-lg flex items-center justify-center shrink-0">
                <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-xs font-bold text-white truncate">Practice Intelligence</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="w-7 h-7 shrink-0 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center text-xs cursor-pointer"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <SidebarNavList navGroups={navGroups} activeTab={activeTab} collapsed={collapsed} onNavTabClick={onNavTabClick} />
      </aside>

      {/* Mobile: off-canvas drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] bg-primary-navy border-r border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-dark-overlay-navy border border-clinical-teal/30 rounded-lg flex items-center justify-center shrink-0">
                  <img src="/brand/lkc-logo-k-transparent.png" alt="Lincolnshire Knee Clinic" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-xs font-bold text-white truncate">Practice Intelligence</span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close navigation"
                className="w-7 h-7 shrink-0 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <SidebarNavList
              navGroups={navGroups}
              activeTab={activeTab}
              collapsed={false}
              onNavTabClick={(tabId) => {
                onNavTabClick(tabId);
                onMobileClose();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
