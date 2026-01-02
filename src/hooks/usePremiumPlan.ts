import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumPlan {
  plan_name: string;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
}

const FREE_PLAN: PremiumPlan = {
  plan_name: 'Free',
  file_size_limit: 1 * 1024 * 1024 * 1024, // 1GB in bytes
  expiration_days: 7,
  features: []
};

export const usePremiumPlan = () => {
  const [plan, setPlan] = useState<PremiumPlan>(FREE_PLAN);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) {
        setPlan(FREE_PLAN);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_user_premium_plan', { p_user_id: user.id });

        if (error) {
          console.error('Error loading premium plan:', error);
          setPlan(FREE_PLAN);
        } else if (data && data.length > 0) {
          setPlan({
            ...data[0],
            features: Array.isArray(data[0].features) 
              ? data[0].features 
              : JSON.parse(data[0].features as string)
          });
        } else {
          setPlan(FREE_PLAN);
        }
      } catch (err) {
        console.error('Error loading premium plan:', err);
        setPlan(FREE_PLAN);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [user]);

  const isPremium = plan.plan_name !== 'Free';
  const maxFileSize = plan.file_size_limit;
  const maxFileSizeMB = Math.round(maxFileSize / (1024 * 1024));
  const maxFileSizeGB = Math.round(maxFileSize / (1024 * 1024 * 1024));

  return {
    plan,
    loading,
    isPremium,
    maxFileSize,
    maxFileSizeMB,
    maxFileSizeGB
  };
};
