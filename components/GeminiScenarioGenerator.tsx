
import React, { useState } from 'react';
import { generateScenarioFromPrompt } from '../services/geminiService';
import { GeminiScenarioUAV, Scenario } from '../types';

interface GeminiScenarioGeneratorProps {
  onScenarioGenerated: (scenario: Scenario) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const GeminiScenarioGenerator: React.FC<GeminiScenarioGeneratorProps> = ({ onScenarioGenerated, setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState<string>('8 UAVs in a circle flying to the opposite side');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const uavConfigs: GeminiScenarioUAV[] = await generateScenarioFromPrompt(prompt);
      const newScenario: Scenario = {
        name: `Gemini: ${prompt.substring(0, 20)}...`,
        uavs: uavConfigs.map(uav => ({
          presetPath: {
            start: uav.start,
            end: uav.end,
          }
        })),
      };
      onScenarioGenerated(newScenario);
    } catch (e) {
        if(e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2 text-gray-200">Generate with AI</h3>
      <p className="text-sm text-gray-400 mb-3">Describe a scenario and let Gemini create it for you.</p>
      <div className="flex flex-col space-y-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Two groups of 5 UAVs flying towards each other"
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[60px]"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full px-4 py-2 rounded-md text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Generating...' : 'Generate Scenario'}
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default GeminiScenarioGenerator;
