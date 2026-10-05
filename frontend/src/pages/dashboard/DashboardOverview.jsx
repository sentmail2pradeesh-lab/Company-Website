import TasksOverviewTable from '../../components/dashboard/TasksOverviewTable';
import MyActivitySection from '../../components/dashboard/MyActivitySection';
import TodaysJobsSummary from '../../components/dashboard/TodaysJobsSummary';
import StatCards from '../../components/dashboard/StatCards';
import CreateJobModal from '../../components/dashboard/CreateJobModal';

export default function DashboardOverview() {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Two Column Layout matching exact user screenshot with My Activity included */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5/12): Jobs Metric Cards Box + Tasks Overview Box */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          <StatCards />
          <TasksOverviewTable />
        </div>

        {/* Right Column (7/12): Today jobs Box + My Activity Box */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          <TodaysJobsSummary />
          <MyActivitySection />
        </div>
      </div>

      {/* Modal for creating a new job */}
      <CreateJobModal />
    </div>
  );
}

