
// this mock data bro for demonstration
export const mockLocations = [
  
];

export const mockFaculty = [
  
];

export const deansOfficeRoute = {
  from: { id: '101', name: 'Main Gate A', floor: 0 }, 
  to: { id: '100', name: "Dean's Office", floor: 1 }, 
  distance_m: 200,
  estimated_time_min: 8,
  steps: [
    {
      order: 1,
      text: 'From the main gate, go straight until you reach the fountain',
      type: 'walk',
    },
    {
      order: 2,
      text: 'From the fountain, turn right toward the Presidency logo and keep going straight.',
      type: 'turn',
    },
    {
      order: 3,
      text: 'Pass the Admission Office and Subway (on opposite sides).',
      type: 'walk',
      floor: 0,
    },
    {
      order: 4,
      text: 'Next to the steps, take the path beside them leading to the stationery shop.',
      type: 'walk',
      floor: 0,
    },
    {
      order: 5,
      text: 'From the stationery shop, turn left and walk about 30m until you reach a slope.',
      type: 'turn',
      floor: 0,
    },
    {
      order: 6,
      text: 'Take the upward slope to the 1st floor (L Block).',
      type: 'walk',
    },
    {
      order: 7,
      text: 'Once on the first floor, turn right and walk straight along the corridor. The Dean’s Office is located as the second room on the left-hand side.',
      type: 'walk',
      floor: 1,
    },
    {
      order: 8,
      text: 'You have now reached the Dean’s Office, L Block, First Floor.',
      type: 'walk',
      floor: 1,
    },
  ],
};

export const prayerHallRoute = {
  from: { id: '101', name: 'Main Gate A', floor: 0 }, 
  to: { id: '504', name: 'Prayer Hall', floor: 4 }, 
  distance_m: 300,
  estimated_time_min: 12,
  steps: [
    {
      order: 1,
      text: 'From the main gate, go straight until you reach the fountain',
      type: 'walk',
    },
    {
      order: 2,
      text: 'From the fountain, turn right toward the Presidency logo and keep going straight.',
      type: 'turn',
    },
    {
      order: 3,
      text: 'Pass the Admission Office and Subway (on opposite sides).',
      type: 'walk',
      floor: 0,
    },
    {
      order: 4,
      text: 'After passing the Subway outlet you will encounter a set of steps. Take the left path that runs beside these steps leading to the stationery shop.',
      type: 'walk',
      floor: 0,
    },
    {
      order: 5,
      text: 'From the stationery shop, continue walking for approximately 10 metres. You will observe E Block on your route.',
      type: 'walk',
      floor: 0,
    },
    {
      order: 6,
      text: 'At E Block, locate the staircase on the right side of the building and climb to the fourth floor.',
      type: 'stairs', 
    },
    {
      order: 7,
      text: 'On the fourth floor, the first room on the left is the men’s prayer hall. The room on the right adjacent to it is the women’s prayer room.',
      type: 'walk',
      floor: 4,
    },
  ],
};

export const internationalOfficeRoute = {
  from: { id: '101', name: 'Main Gate A', floor: 0 }, 
  to: { id: '004', name: 'International Affairs Office', floor: -1 }, 
  distance_m: 200,
  estimated_time_min: 5,
  steps: [
    {
      order: 1,
      text: 'From the main gate, go straight until you reach the fountain',
      type: 'walk',
    },
    {
      order: 2,
      text: 'From the fountain, proceed straight toward the side under the canopy and remain on this line of travel.',
      type: 'walk',
    },
    {
      order: 3,
      text: 'Continue to the staircase area located beneath the canopy. You will observe two directions of stairs on the left side of canopy one set leading upwards and another leading downwards.',
      type: 'walk',
      floor: 0,
    },
    {
      order: 4,
      text: 'Take the downward stairs to the basement level.',
      type: 'stairs', 
      floor: -1,
    },
    {
      order: 5,
      text: 'From the bottom of the stairs, walk forward for approximately 5 metres.',
      type: 'walk',
      floor: -1,
    },
    {
      order: 6,
      text: 'After the short walk, turn right onto the adjoining path.',
      type: 'turn', 
    },
    {
      order: 7,
      text: 'Proceed along this right-side path; the International Office of Affairs will be located on this route.',
      type: 'walk',
      floor: -1,
    },
  ],
};


// Our Generic Route Generator this will handle all other from to s for now
export const getGenericRoute = (
  from: { id: string, label: string }, 
  to: { id: string, label: string }
) => {
  const distance = (from.label.length + to.label.length) * 5;
  const time = Math.max(1, Math.round(distance / 60));

  return {
    from: { id: from.id, name: from.label, floor: 0 }, 
    to: { id: to.id, name: to.label, floor: 1 }, 
    distance_m: distance,
    estimated_time_min: time,
    steps: [
      {
        order: 1,
        text: `Start from ${from.label} and head towards the main concourse.`,
        type: 'walk',
      },
      {
        order: 2,
        text: 'Follow the main signage towards the block complexes.',
        type: 'walk',
      },
      {
        order: 3,
        text: 'Look for signs pointing towards ${to.label}.',
        type: 'turn',
      },
      {
        order: 4,
        text: `You have arrived at ${to.label}.`,
        type: 'walk',
      },
    ],
  };
};