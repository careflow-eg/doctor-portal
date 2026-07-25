import { AssistantClient } from "./AssistantClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssistantClient id={id} />;
}
