import { useTarotItems } from "../../hooks/useEnrichmentData";
import { TarotBoard } from "../../components/enrichment/TarotBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function TarotDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useTarotItems}
      BoardComponent={TarotBoard}
      dataPropName="items"
    />
  );
}
