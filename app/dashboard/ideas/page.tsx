import { useIdeaItems } from "../../hooks/useEnrichmentData";
import { IdeasBoard } from "../../components/enrichment/IdeasBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function IdeasDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useIdeaItems}
      BoardComponent={IdeasBoard}
      dataPropName="items"
    />
  );
}
