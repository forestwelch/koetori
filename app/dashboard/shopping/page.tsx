import { useShoppingList } from "../../hooks/useEnrichmentData";
import { ShoppingListBoard } from "../../components/enrichment/ShoppingListBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function ShoppingDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useShoppingList}
      BoardComponent={ShoppingListBoard}
      dataPropName="items"
    />
  );
}
