import { EncounterDetailClient } from "./EncounterDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EncounterDetailClient id={id} />;
}
