import StatCards from '../../components/dashboard/StatCards';
import TodaysJobsSummary from '../../components/dashboard/TodaysJobsSummary';
import TasksOverviewTable from '../../components/dashboard/TasksOverviewTable';

export default function DashboardOverview() {
  return (
    <div className="animate-fadeIn">
      {/* Two Column Layout matching exact ASZEN Dashboard Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5/12): Jobs Metric Cards Box + Tasks Overview Box */}
        <div className="lg:col-span-5 space-y-6">
          <StatCards />
          <TasksOverviewTable />
        </div>

        {/* Right Column (7/12): Today jobs Box */}
        <div className="lg:col-span-7">
          <TodaysJobsSummary />
        </div>
      </div>
    </div>
  );
}

