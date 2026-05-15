import { DraftRoom } from "@/components/draft/DraftRoom";

export default function DraftLeaguePage({
  params,
  searchParams,
}: {
  params: { leagueId: string };
  searchParams: { draftId?: string };
}) {
  return (
    <DraftRoom leagueId={params.leagueId} draftId={searchParams.draftId} />
  );
}
