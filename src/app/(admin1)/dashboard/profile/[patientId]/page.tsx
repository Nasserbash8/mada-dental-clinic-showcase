/**
 * Doctor dashboard - patient profile page (server component, abridged sample).
 * Loads one patient on the server and composes the profile cards.
 */
import dynamic from "next/dynamic";
import { getPatientById } from "@/utils/patientData";

// Client components are code-split so the server render stays light.
const PageBreadcrumb = dynamic(() => import("@/components/ui/common/PageBreadCrumb"));
const Treatments = dynamic(() => import("@/components/ui/user-profile/treatments"));
const UserInfoCard = dynamic(() => import("@/components/ui/user-profile/UserInfoCard"));
const UserMetaCard = dynamic(() => import("@/components/ui/user-profile/UserMetaCard"));
const UserImages = dynamic(() => import("@/components/ui/user-profile/UserImages"));

export default async function Profile({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const patient = await getPatientById(patientId); // plain JSON, safe to pass to client components

  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border p-5 lg:p-6 space-y-6">
        <UserMetaCard patient={patient} />
        <UserInfoCard patient={patient} />
        <UserImages patient={patient} />
        <Treatments patient={patient} />
      </div>
    </div>
  );
}
