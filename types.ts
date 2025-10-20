
export interface Vector2D {
  x: number;
  y: number;
}

export enum UavStatus {
  OnPath = 'ON_PATH',
  Avoiding = 'AVOIDING',
  Finished = 'FINISHED',
}

export interface Uav {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  presetPath: {
    start: Vector2D;
    end: Vector2D;
  };
  status: UavStatus;
  color: string;
  history: Vector2D[];
}

export interface Scenario {
  name: string;
  uavs: Pick<Uav, 'presetPath'>[];
}

export interface GeminiScenarioUAV {
  start: { x: number; y: number };
  end: { x: number; y: number };
}
