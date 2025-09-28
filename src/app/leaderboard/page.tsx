
import MainLayout from "@/components/main-layout";
import LeaderboardView from "@/components/leaderboard-view";

export default function LeaderboardPage() {
  return (
    <MainLayout>
      <div className="h-full">
        <LeaderboardView />
      </div>
    </MainLayout>
  );
}
