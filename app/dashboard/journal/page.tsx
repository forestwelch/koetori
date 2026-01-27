import { useJournalItems } from "../../hooks/useEnrichmentData";
import { JournalBoard } from "../../components/enrichment/JournalBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function JournalDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useJournalItems}
      BoardComponent={JournalBoard}
      dataPropName="items"
    />
  );
}
