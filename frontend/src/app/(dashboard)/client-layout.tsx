'use client';

import { DeleteOperationProvider } from '@/contexts/DeleteOperationContext';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MaintenanceAlert } from '@/components/maintenance-alert';
import { StatusOverlay } from '@/components/ui/status-overlay';
import { FooterSection } from '@/components/home/sections/footer-section';
interface ClientLayoutProps {
  children: React.ReactNode;
  showMaintenanceAlert: boolean;
  onMaintenanceAlertChange: (open: boolean) => void;
}

export function ClientLayout({
  children,
  showMaintenanceAlert,
  onMaintenanceAlertChange,
}: ClientLayoutProps) {
  return (
    <DeleteOperationProvider>
      <SidebarProvider>
        <SidebarInset>
          <div className="bg-background h-screen flex flex-col">
            <div className="flex-1 min-h-0">{children}</div>
          </div>
        </SidebarInset>
        <MaintenanceAlert
          open={showMaintenanceAlert}
          onOpenChange={onMaintenanceAlertChange}
          closeable={true}
        />

        <StatusOverlay />
      </SidebarProvider>
    </DeleteOperationProvider>
  );
}
