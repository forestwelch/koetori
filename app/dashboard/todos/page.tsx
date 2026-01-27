import { useTodoItems } from "../../hooks/useEnrichmentData";
import { TodosBoard } from "../../components/enrichment/TodosBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function TodosDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useTodoItems}
      BoardComponent={TodosBoard}
      dataPropName="todos"
      boardProps={{ refetchTodos: undefined }} // Will be provided by refetch
    />
  );
}
