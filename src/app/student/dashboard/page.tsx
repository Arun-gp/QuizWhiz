import Dashboard from "@/components/dashboard";
import MainLayout from "@/components/main-layout";

export default function StudentDashboardPage() {
  return (
    <MainLayout userType="student">
      <Dashboard />
    </MainLayout>
  );
}
