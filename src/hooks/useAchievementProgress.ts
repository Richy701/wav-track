import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface AchievementProgress {
  achievementsUnlocked: number;
  totalAchievements: number;
  production: {
    count: number;
    target: number;
    progress: number;
  };
  tiers: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  categories: {
    production: {
      unlocked: number;
      total: number;
      progress: number;
    };
    streak: {
      unlocked: number;
      total: number;
      progress: number;
    };
    time: {
      unlocked: number;
      total: number;
      progress: number;
    };
    goals: {
      unlocked: number;
      total: number;
      progress: number;
    };
  };
}

export const useAchievementProgress = () => {
  const { user } = useAuth();

  return useQuery(
    ["achievementProgress", user?.id],
    async (): Promise<AchievementProgress> => {
      if (!user) throw new Error("No user found");

      // Fetch all achievements to get total counts
      const { data: allAchievements, error: allAchievementsError } = await supabase
        .from("achievements")
        .select("*");

      if (allAchievementsError) throw allAchievementsError;

      // Fetch user's achievements and progress
      const { data: userAchievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement:achievements (
            id,
            category,
            tier,
            requirement
          )
        `)
        .eq("user_id", user.id);

      if (achievementsError) throw achievementsError;

      // Fetch active projects for production achievements
      const { data: activeProjects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_deleted", false);

      if (projectsError) throw projectsError;

      // Calculate total beats from active projects
      const totalBeats = activeProjects?.length || 0;

      // Calculate total achievements by category
      const categoryTotals = allAchievements.reduce((acc, achievement) => {
        acc[achievement.category] = (acc[achievement.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Initialize categories with actual totals
      const categories = {
        production: { unlocked: 0, total: categoryTotals.production || 0 },
        streak: { unlocked: 0, total: categoryTotals.streak || 0 },
        time: { unlocked: 0, total: categoryTotals.time || 0 },
        goals: { unlocked: 0, total: categoryTotals.goals || 0 },
      };

      const tiers = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      };

      let totalUnlocked = 0;

      // Calculate unlocked achievements
      userAchievements?.forEach((ua) => {
        if (ua.unlocked_at) {
          totalUnlocked++;
          categories[ua.achievement.category as keyof typeof categories].unlocked++;
          tiers[ua.achievement.tier as keyof typeof tiers]++;
        }
      });

      // Calculate category progress percentages
      const categoryProgress = Object.entries(categories).reduce(
        (acc, [category, { unlocked, total }]) => ({
          ...acc,
          [category]: {
            unlocked,
            total,
            progress: total > 0 ? Math.round((unlocked / total) * 100) : 0,
          },
        }),
        {} as AchievementProgress["categories"]
      );

      // Find the production achievement with the highest requirement
      const productionAchievement = allAchievements
        .filter(a => a.category === 'production')
        .reduce((max, current) => {
          const maxReq = parseInt(max.requirement) || 0;
          const currentReq = parseInt(current.requirement) || 0;
          return currentReq > maxReq ? current : max;
        });

      const productionTarget = parseInt(productionAchievement?.requirement || "100");
      const productionProgress = Math.min((totalBeats / productionTarget) * 100, 100);

      return {
        achievementsUnlocked: totalUnlocked,
        totalAchievements: allAchievements.length,
        production: {
          count: totalBeats,
          target: productionTarget,
          progress: productionProgress,
        },
        tiers,
        categories: categoryProgress,
      };
    },
    {
      enabled: !!user,
      staleTime: 0, // Always fetch fresh data
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    }
  );
}; 