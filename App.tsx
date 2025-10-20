
import React, { useState, useCallback } from 'react';
import useUavSimulation from './hooks/useUavSimulation';
import SimulationCanvas from './components/SimulationCanvas';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import GeminiScenarioGenerator from './components/GeminiScenarioGenerator';
import { Scenario } from './types';

const PRESET_SCENARIOS: Scenario[] = [
  {
    name: "Circle (8 UAVs)",
    uavs: Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * 2 * Math.PI;
      const radius = 300;
      return {
        presetPath: {
          start: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
          end: { x: Math.cos(angle + Math.PI) * radius, y: Math.sin(angle + Math.PI) * radius },
        }
      };
    })
  },
  {
    name: "Crossing (10 UAVs)",
    uavs: [
      ...Array.from({ length: 5 }).map((_, i) => ({
        presetPath: {
          start: { x: -400, y: -200 + i * 100 },
          end: { x: 400, y: -200 + i * 100 },
        }
      })),
      ...Array.from({ length: 5 }).map((_, i) => ({
        presetPath: {
          start: { x: -200 + i * 100, y: -400 },
          end: { x: -200 + i * 100, y: 400 },
        }
      })),
    ]
  },
  {
      name: "Random (12 UAVs)",
      uavs: Array.from({length: 12}).map(() => {
          const edge1 = Math.floor(Math.random() * 4);
          const edge2 = (edge1 + 2) % 4; // opposite edge
          const start = {x:0, y:0};
          const end = {x:0, y:0};
          const offset = Math.random() * 800 - 400;
          if(edge1 === 0) { start.x = -450; start.y = offset; }
          if(edge1 === 1) { start.x = offset; start.y = -450; }
          if(edge1 === 2) { start.x = 450; start.y = offset; }
          if(edge1 === 3) { start.x = offset; start.y = 450; }

          const endOffset = Math.random() * 800 - 400;
          if(edge2 === 0) { end.x = -450; end.y = endOffset; }
          if(edge2 === 1) { end.x = endOffset; end.y = -450; }
          if(edge2 === 2) { end.x = 450; end.y = endOffset; }
          if(edge2 === 3) { end.x = endOffset; end.y = 450; }
          
          return { presetPath: { start, end } };
      })
  }
];

const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>(PRESET_SCENARIOS);
  const [currentScenario, setCurrentScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
  const { uavs, isRunning, start, stop, reset } = useUavSimulation(currentScenario);
  const [isLoading, setIsLoading] = useState(false);

  const handleScenarioChange = useCallback((scenario: Scenario) => {
    setCurrentScenario(scenario);
    reset(scenario);
  }, [reset]);

  const handleScenarioGenerated = useCallback((newScenario: Scenario) => {
    setScenarios(prev => [newScenario, ...prev]);
    setCurrentScenario(newScenario);
    reset(newScenario);
  }, [reset]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 lg:p-8 flex flex-col">
      <header className="mb-4 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Multi-UAV Collision Avoidance Simulator</h1>
        <p className="text-gray-400 mt-1">A DRL-inspired simulation for dense, speed-constrained UAVs.</p>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
        <div className="lg:col-span-3 flex items-center justify-center">
          <SimulationCanvas uavs={uavs} width={1000} height={1000} />
        </div>
        <aside className="lg:col-span-1 flex flex-col space-y-4">
          <Controls
            isRunning={isRunning}
            onStart={start}
            onStop={stop}
            onReset={() => reset(currentScenario)}
            scenarios={scenarios}
            selectedScenario={currentScenario}
            onScenarioChange={handleScenarioChange}
          />
          <GeminiScenarioGenerator 
            onScenarioGenerated={handleScenarioGenerated}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
          <div className="flex-grow">
             <InfoPanel uavs={uavs} />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
