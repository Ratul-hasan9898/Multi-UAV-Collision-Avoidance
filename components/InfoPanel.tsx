
import React from 'react';
import { Uav, UavStatus } from '../types';

interface InfoPanelProps {
  uavs: Uav[];
}

const statusConfig = {
    [UavStatus.OnPath]: { text: 'On Path', color: 'bg-blue-500' },
    [UavStatus.Avoiding]: { text: 'Avoiding', color: 'bg-yellow-500' },
    [UavStatus.Finished]: { text: 'Finished', color: 'bg-green-500' },
};

const InfoPanel: React.FC<InfoPanelProps> = ({ uavs }) => {
  const statusCounts = uavs.reduce((acc, uav) => {
    acc[uav.status] = (acc[uav.status] || 0) + 1;
    return acc;
  }, {} as Record<UavStatus, number>);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-gray-200 border-b border-gray-700 pb-2">Simulation Info</h3>
      <div className="space-y-3">
        <div>
          <span className="font-semibold text-gray-400">Total UAVs:</span>
          <span className="float-right font-mono text-gray-100">{uavs.length}</span>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => (
           <div key={status}>
              <span className="font-semibold text-gray-400">{statusConfig[status as UavStatus].text}:</span>
              <span className="float-right font-mono text-gray-100">{count}</span>
           </div>
        ))}
      </div>

       <div className="mt-4 pt-4 border-t border-gray-700 flex-grow overflow-y-auto">
         <h4 className="text-md font-bold mb-2 text-gray-300">UAV Status</h4>
         <div className="space-y-2 text-sm">
            {uavs.map(uav => (
                <div key={uav.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: uav.color }}></span>
                        <span className="font-mono">UAV #{uav.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full text-white ${statusConfig[uav.status].color}`}>
                        {statusConfig[uav.status].text}
                    </span>
                </div>
            ))}
         </div>
       </div>
    </div>
  );
};

export default InfoPanel;
