import { HistoryClient } from "./HistoryClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HistoryClient id={id} />;
}
