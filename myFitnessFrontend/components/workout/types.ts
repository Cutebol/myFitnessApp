export type SetEntry = {
  id: string;
  weight: string;
  reps: string;
};

export type Exercise = {
  id: string;
  name: string;
  expanded: boolean;
  sets: SetEntry[];
};

export type Day = {
  id: string;
  name: string;
  expanded: boolean;
  exerciseNameInput: string;
  exercises: Exercise[];
};