export const calculatePoints = (selectedOptions) => {
  // Use reduce to sum up the 'points' property of each selected option
  const sum = selectedOptions.reduce((acc, option) => acc + option.points, 0);

  return sum;
};
