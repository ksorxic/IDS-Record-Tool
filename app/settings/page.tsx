import AdminSettings from "@/app/components/admin-settings";
import { fetchDashboardData } from "@/lib/dashboard";

export default async function SettingsPage() {
  const dashboardData = await fetchDashboardData();

  return <AdminSettings initialData={dashboardData} />;
}
