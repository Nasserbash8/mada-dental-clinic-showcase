/** Dashboard - patients list (server component, abridged sample). */
import nextDynamic from "next/dynamic";
import { listPatients } from "@/utils/patientData";

const PageBreadcrumb = nextDynamic(() => import("@/components/ui/common/PageBreadCrumb"));
const BasicTableOne = nextDynamic(() => import("@/components/ui/tables/BasicTableOne"));

export const dynamic = "force-dynamic";

export default async function Patients() {
  try {
    const patients = await listPatients();
    return (
      <div>
        <PageBreadcrumb pageTitle="Patients" />
        <div className="space-y-6">
          <BasicTableOne tabledata={patients} />
        </div>
      </div>
    );
  } catch {
    return <div>Could not load patients</div>; // show a message instead of a crashed page
  }
}
