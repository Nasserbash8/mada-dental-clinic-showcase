/**
 * Patient portal - "My account" page (server component, abridged sample).
 *
 * Access rules enforced on the server, before anything is rendered:
 *   1. no session            -> redirect to the login page
 *   2. session of ANOTHER id -> redirect to the patient's own profile
 */
import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/utils/authOptions";
import { getPatientById } from "@/utils/patientData";
import Container from "@/components/layout/viewsLayout/Container";

const PatientTabs = dynamic(() => import("@/components/ui/user-profile/PatientTabs"));

export default async function MyAccount({ params }: { params: Promise<{ patientId: string }> }) {
  const session = await getServerSession(authOptions);
  const { patientId } = await params;

  if (!session) redirect("/login");
  if (session.user.id !== patientId) redirect(`/profile/${session.user.id}`); // never show someone else's file

  const patient = await getPatientById(patientId);
  if (!patient) redirect("/signOut");

  return (
    <Container>
      <PatientTabs patient={patient} />
    </Container>
  );
}
