import { useState, useRef, useCallback, useEffect } from 'react';
import { Uav, UavStatus, Vector2D, Scenario } from '../types';

const UAV_SPEED = 1.5;
const SAFE_RADIUS = 40; // Radius where avoidance maneuvers are triggered
const AWARENESS_RADIUS = 80; // Radius to check for potential threats
const WAYPOINT_THRESHOLD = 5;
const HISTORY_LENGTH = 50;

const COLORS = [
  '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff',
  '#ff9f40', '#8cff66', '#ff66c3', '#66c3ff', '#c366ff'
];

// Helper vector functions
const subtract = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x - v2.x, y: v1.y - v2.y });
const magnitude = (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y);
const normalize = (v: Vector2D): Vector2D => {
  const mag = magnitude(v);
  return mag > 0 ? { x: v.x / mag, y: v.y / mag } : { x: 0, y: 0 };
};
const scale = (v: Vector2D, s: number): Vector2D => ({ x: v.x * s, y: v.y * s });
const add = (v1: Vector2D, v2: Vector2D): Vector2D => ({ x: v1.x + v2.x, y: v1.y + v2.y });
const distance = (p1: Vector2D, p2: Vector2D): number => magnitude(subtract(p1, p2));

const useUavSimulation = (initialScenario: Scenario) => {
  const [uavs, setUavs] = useState<Uav[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  // FIX: Explicitly initialize useRef with null to avoid ambiguity with overloads.
  const animationFrameId = useRef<number | null>(null);
  const simulationTimeRef = useRef<number>(0);

  const createInitialUavs = useCallback((scenario: Scenario) => {
    simulationTimeRef.current = 0;
    return scenario.uavs.map((uavConfig, index) => {
        const direction = normalize(subtract(uavConfig.presetPath.end, uavConfig.presetPath.start));
        return {
            id: index,
            position: { ...uavConfig.presetPath.start },
            velocity: scale(direction, UAV_SPEED),
            presetPath: uavConfig.presetPath,
            status: UavStatus.OnPath,
            color: COLORS[index % COLORS.length],
            history: [{...uavConfig.presetPath.start}],
        };
    });
  }, []);
  
  useEffect(() => {
    setUavs(createInitialUavs(initialScenario));
  }, [initialScenario, createInitialUavs]);

  const updateSimulation = useCallback(() => {
    setUavs(currentUavs => {
      if (currentUavs.every(u => u.status === UavStatus.Finished)) {
        setIsRunning(false);
        return currentUavs;
      }
      
      const nextUavs = currentUavs.map(uav => ({ ...uav, history: [...uav.history]}));

      // 1. Determine new status and calculate target velocities
      const targetVelocities = nextUavs.map((uav, i) => {
        if (uav.status === UavStatus.Finished) {
          return uav.velocity;
        }

        // Check for threats
        let threatFound = false;
        let avoidanceVector = { x: 0, y: 0 };

        for (let j = 0; j < nextUavs.length; j++) {
          if (i === j) continue;
          const otherUav = nextUavs[j];
          if(otherUav.status === UavStatus.Finished) continue;

          const dist = distance(uav.position, otherUav.position);
          
          if (dist < AWARENESS_RADIUS) {
            const toOther = subtract(otherUav.position, uav.position);
            const relativeVel = subtract(otherUav.velocity, uav.velocity);
            
            // Simple time-to-closest-approach check
            const dotProduct = toOther.x * relativeVel.x + toOther.y * relativeVel.y;
            if (dotProduct < 0 && dist < SAFE_RADIUS) { // Heading towards each other and within safe radius
                threatFound = true;
                // Steer perpendicular to the threat (always to its "right")
                const perp = { x: -toOther.y, y: toOther.x };
                avoidanceVector = add(avoidanceVector, normalize(perp));
            }
          }
        }
        
        // Update status based on threats
        uav.status = threatFound ? UavStatus.Avoiding : UavStatus.OnPath;
        
        // Determine target velocity based on status
        if (uav.status === UavStatus.Avoiding) {
            return scale(normalize(avoidanceVector), UAV_SPEED);
        } else {
            // Path following
             const distToEnd = distance(uav.position, uav.presetPath.end);
             if (distToEnd < WAYPOINT_THRESHOLD) {
                 uav.status = UavStatus.Finished;
                 return { x: 0, y: 0 }; // Stop
             }
            const toEnd = subtract(uav.presetPath.end, uav.position);
            return scale(normalize(toEnd), UAV_SPEED);
        }
      });
      
      // 2. Update velocities and positions
      return nextUavs.map((uav, i) => {
          if (uav.status === UavStatus.Finished) {
              return uav;
          }
        
          // Smoothly interpolate to target velocity (simple lerp)
          const newVelocity = {
              x: uav.velocity.x * 0.95 + targetVelocities[i].x * 0.05,
              y: uav.velocity.y * 0.95 + targetVelocities[i].y * 0.05,
          };
          uav.velocity = scale(normalize(newVelocity), UAV_SPEED);
          
          uav.position = add(uav.position, uav.velocity);

          // Update history
          if (simulationTimeRef.current % 5 === 0) { // Add point every 5 frames
            if(uav.history.length > HISTORY_LENGTH) {
              uav.history.shift();
            }
            uav.history.push({...uav.position});
          }

          return uav;
      });
    });

    simulationTimeRef.current++;
    animationFrameId.current = requestAnimationFrame(updateSimulation);
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    animationFrameId.current = requestAnimationFrame(updateSimulation);
  }, [isRunning, updateSimulation]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    setIsRunning(false);
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, [isRunning]);

  const reset = useCallback((scenario: Scenario) => {
    stop();
    setUavs(createInitialUavs(scenario));
  }, [stop, createInitialUavs]);

  return { uavs, isRunning, start, stop, reset };
};

export default useUavSimulation;