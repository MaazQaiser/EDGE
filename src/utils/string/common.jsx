export const getNameInitials = (name) => {
  if (typeof name === 'string' && name.trim() !== '') {
    const nameParts = name.trim().split(' ');

    if (nameParts.length === 1) {
      // If there's only one name, return the first two letters in uppercase
      return nameParts[0].slice(0, 2).toUpperCase();
    } else if (nameParts.length >= 2) {
      // If there are both first and last names, return their initials in uppercase
      const firstNameInitial = nameParts[0][0].toUpperCase();
      const lastNameInitial = nameParts[1][0].toUpperCase();
      return `${firstNameInitial}${lastNameInitial}`;
    }
  }

  // Default value if the input is undefined or doesn't match the expected format
  return 'NA';
};

export const capitalizeFirstLetter = (string) => {
  if (!string || typeof string !== 'string') {
    return;
  }

  return string.length ? string.charAt(0).toUpperCase() + string.slice(1) : 'N/A';
};
