export const APPLIANCES = [
  'Wall fan',
  'Electric fan',
  'Classroom TV',
];

export const LIGHT_BULBS = ['Light bulb 1', 'Light bulb 2', 'Light bulb 3', 'Light bulb 4'];

export const FLOORS = ['1st Floor', '2nd Floor', '3rd Floor'];

export const ROOMS_BY_FLOOR = {
  '1st Floor': ['Room 101', 'Room 102', 'Room 103'],
  '2nd Floor': ['Room 201', 'Room 202', 'Room 203'],
  '3rd Floor': ['Room 301', 'Room 302', 'Room 303'],
};

// Flattened list of every room - used by the dashboard, which shows all
// classrooms regardless of floor. Rename rooms above to match your actual
// building; this list updates automatically.
export const CLASSROOMS = Object.values(ROOMS_BY_FLOOR).flat();