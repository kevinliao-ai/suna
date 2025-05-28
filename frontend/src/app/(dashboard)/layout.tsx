'use client';

import { useEffect, useState } from 'react';
import { useAccounts } from '@/hooks/use-accounts';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { checkApiHealth } from '@/lib/api';
import { MaintenancePage } from '@/components/maintenance/maintenance-page';
import { ClientLayout } from './client-layout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(false);
  const [isApiHealthy, setIsApiHealthy] = useState(true);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);
  const { data: accounts } = useAccounts();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setShowMaintenanceAlert(false);
  }, []);

  // Check API health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkApiHealth();
        setIsApiHealthy(health.status === 'ok');
      } catch (error) {
        console.error('API health check failed:', error);
        setIsApiHealthy(false);
      } finally {
        setIsCheckingHealth(false);
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth or health
  if (isLoading || isCheckingHealth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // Show maintenance page if API is not healthy
  if (!isApiHealthy) {
    return <MaintenancePage />;
  }

  return (
    <ClientLayout 
      showMaintenanceAlert={showMaintenanceAlert}
      onMaintenanceAlertChange={setShowMaintenanceAlert}
    >
      {children}
    </ClientLayout>
  );
}
