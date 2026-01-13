import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { KPICards } from '@/components/dashboard/KPICards';
import { TrafficChart } from '@/components/dashboard/TrafficChart';
import { CPUGaugeChart } from '@/components/dashboard/CPUGaugeChart';
import { DeviceTable } from '@/components/dashboard/DeviceTable';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-16">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* KPI Cards */}
          <KPICards />
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrafficChart />
            </div>
            <div>
              <CPUGaugeChart />
            </div>
          </div>
          
          {/* Device Table */}
          <DeviceTable />
        </main>
      </div>
    </div>
  );
};

export default Index;
