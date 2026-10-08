/**
 * Dashboard home (server component, abridged sample).
 * Loads the patient list once on the server and passes it to the summary widgets.
 */
import nextDynamic from "next/dynamic";
import { EcommerceMetrics } from "@/components/ui/ecommerce/EcommerceMetrics";
import { listPatients } from "@/utils/patientData";

export const dynamic = "force-dynamic"; // always fresh numbers, never a cached page

const MonthlyTarget = nextDynamic(() => import("@/components/ui/ecommerce/MonthlyTarget"));
const MonthlySalesChart = nextDynamic(() => import("@/components/ui/ecommerce/MonthlySalesChart"));
const StatisticsChart = nextDynamic(() => import("@/components/ui/ecommerce/StatisticsChart"));
const RecentOrders = nextDynamic(() => import("@/components/ui/ecommerce/RecentOrders"));

export default async function DashboardHome() {
  // A failed load must not break the whole dashboard: fall back to an empty list.
  const patients = await listPatients().catch(() => []);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics patients={patients} totalPatients={patients.length} />
        <MonthlySalesChart />
      </div>
      <div className="col-span-12 xl:col-span-5"><MonthlyTarget /></div>
      <div className="col-span-12"><StatisticsChart /></div>
      <div className="col-span-12"><RecentOrders patients={patients} /></div>
    </div>
  );
}
