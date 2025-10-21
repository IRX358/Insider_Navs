// Mock data for demonstration
export const mockLocations = [
  
];

export const mockFaculty = [
  
];

export const mockRoute = {
  from: { id: 201, name: 'A-101', floor: 1 },
  to: { id: 331, name: 'C-305', floor: 3 },
  distance_m: 213,
  estimated_time_min: 4,
  steps: [
    {
      order: 1,
      text: 'Exit A-101 and walk 18m along the corridor toward the staircase',
      type: 'walk',
    },
    {
      order: 2,
      text: 'Turn slightly right and continue to the staircase entrance',
      type: 'turn',
    },
    {
      order: 3,
      text: 'Take the stairs from floor 1 to floor 3',
      type: 'stairs',
      floor: 3,
    },
    {
      order: 4,
      text: 'On floor 3, turn right and walk 40m along the main corridor',
      type: 'walk',
      floor: 3,
    },
    {
      order: 5,
      text: 'C-305 will be on your left. You have arrived at your destination.',
      type: 'walk',
      floor: 3,
    },
  ],
};