import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSupply,
  updateSupply,
  deleteSupply,
  registerSupplyMovement,
} from '../infrastructure/supplies.api';
import {
  CreateSupplyPayload,
  UpdateSupplyPayload,
  RegisterMovementPayload,
} from '../domain/supplies.types';

export function useSupplyMutations(businessId?: string) {
  const queryClient = useQueryClient();

  const invalidateSupplies = () => {
    queryClient.invalidateQueries({ queryKey: ['supplies', businessId] });
    queryClient.invalidateQueries({ queryKey: ['suppliesSummary', businessId] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplyPayload) => createSupply(payload),
    onSuccess: () => {
      invalidateSupplies();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplyPayload }) =>
      updateSupply(id, payload),
    onSuccess: () => {
      invalidateSupplies();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupply(id),
    onSuccess: () => {
      invalidateSupplies();
    },
  });

  const registerMovementMutation = useMutation({
    mutationFn: ({ supplyId, payload }: { supplyId: string; payload: RegisterMovementPayload }) =>
      registerSupplyMovement(supplyId, payload),
    onSuccess: () => {
      invalidateSupplies();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    registerMovementMutation,
  };
}
