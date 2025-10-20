
import React from 'react';
import { Scenario } from '../types';

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  scenarios: Scenario[];
  selectedScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}

const Button: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => (
  <button
    className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
    {...props}
  >
    {children}
  </button>
);

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStart,
  onStop,
  onReset,
  scenarios,
  selectedScenario,
  onScenarioChange,
}) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md flex flex-col space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Button onClick={onStart} disabled={isRunning} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
          Start
        </Button>
        <Button onClick={onStop} disabled={!isRunning} className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500">
          Stop
        </Button>
        <Button onClick={onReset} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
          Reset
        </Button>
      </div>
      <div>
        <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-300 mb-1">
          Scenario
        </label>
        <select
          id="scenario-select"
          value={selectedScenario.name}
          onChange={(e) => {
            const newScenario = scenarios.find(s => s.name === e.target.value);
            if (newScenario) onScenarioChange(newScenario);
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {scenarios.map(scenario => (
            <option key={scenario.name} value={scenario.name}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Controls;
