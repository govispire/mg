import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => api.getPlans(),
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => api.getMySubscription(),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, amount }: { code: string; amount: number }) =>
      api.validateCoupon(code, amount),
  });
}

export function usePaymentHistory() {
  return useQuery({
    queryKey: ['paymentHistory'],
    queryFn: () => api.getPaymentHistory(),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { plan_id: string; billing_cycle: 'monthly' | 'yearly' }) =>
      api.createSubscription(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mySubscription'] }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mySubscription'] }),
  });
}
