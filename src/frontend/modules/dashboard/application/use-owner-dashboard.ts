'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCurrentUser,
  getBusinessProfile,
  getBusinessWorkers,
  getBusinessClients,
} from '../infrastructure/dashboard.api';
import { DashboardMetrics } from '../domain/dashboard.types';

export function useOwnerDashboard() {
  // 1. Fetch current authenticated user
  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const businessId = userQuery.data?.businessId;
  const isOwner = userQuery.data?.role === 'BUSINESS_OWNER' || userQuery.data?.userType === 'BUSINESS';

  // 2. Fetch business profile
  const businessQuery = useQuery({
    queryKey: ['businessProfile', businessId],
    queryFn: () => getBusinessProfile(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch workers of the spa
  const workersQuery = useQuery({
    queryKey: ['businessWorkers', businessId],
    queryFn: () => getBusinessWorkers(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // 4. Fetch clients of the spa
  const clientsQuery = useQuery({
    queryKey: ['businessClients', businessId],
    queryFn: () => getBusinessClients(businessId!),
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2,
  });

  // 5. Compute derived metrics
  const workers = workersQuery.data || [];
  const clients = clientsQuery.data || [];

  const metrics: DashboardMetrics = {
    totalWorkers: workers.length,
    activeWorkers: workers.filter((w) => w.isActive).length,
    inactiveWorkers: workers.filter((w) => !w.isActive).length,
    averageCommission:
      workers.length > 0
        ? Math.round(
            (workers.reduce((acc, w) => acc + (Number(w.commissionPercentage) || 0), 0) /
              workers.length) *
              10
          ) / 10
        : 0,
    specialtiesCount: new Set(
      workers.map((w) => w.specialty?.trim().toLowerCase()).filter(Boolean)
    ).size,
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.isActive).length,
  };

  const isLoading =
    userQuery.isLoading ||
    (!!businessId && (businessQuery.isLoading || workersQuery.isLoading || clientsQuery.isLoading));

  const isError =
    userQuery.isError || businessQuery.isError || workersQuery.isError || clientsQuery.isError;

  const refetchAll = () => {
    userQuery.refetch();
    if (businessId) {
      businessQuery.refetch();
      workersQuery.refetch();
      clientsQuery.refetch();
    }
  };

  return {
    currentUser: userQuery.data,
    isOwner,
    business: businessQuery.data,
    workers,
    clients,
    metrics,
    isLoading,
    isError,
    errorMessage:
      userQuery.error?.message ||
      businessQuery.error?.message ||
      workersQuery.error?.message ||
      clientsQuery.error?.message,
    refetchAll,
  };
}
