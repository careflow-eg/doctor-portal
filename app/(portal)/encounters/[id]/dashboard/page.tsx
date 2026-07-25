import { ClinicalDashboardClient } from "./ClinicalDashboardClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClinicalDashboardClient id={id} />;
}
