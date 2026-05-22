import AdminDashboard from "@/app/components/admin-dashboard";
import { fetchDashboardData } from "@/lib/dashboard";

export default async function Home() {
  const dashboardData = await fetchDashboardData();

  return <AdminDashboard initialData={dashboardData} />;
}
