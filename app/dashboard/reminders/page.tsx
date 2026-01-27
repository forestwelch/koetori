import { useReminders } from "../../hooks/useEnrichmentData";
import { RemindersBoard } from "../../components/enrichment/RemindersBoard";
import { DashboardPageWrapper } from "../../components/dashboard/DashboardPageWrapper";

export default function RemindersDashboardPage() {
  return (
    <DashboardPageWrapper
      useDataHook={useReminders}
      BoardComponent={RemindersBoard}
      dataPropName="reminders"
    />
  );
}
