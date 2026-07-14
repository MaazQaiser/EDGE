export const config = {
  success: {
    statusCode: 200,
    message: 'Config fetched successfully!',
    data: {
      countries: [
        {
          id: 1,
          name: 'Pakistan',
          countryCode: 'PK',
          states: [],
        },
        {
          id: 2,
          name: 'United States of America',
          countryCode: 'US',
          states: [],
        },
      ],
    },
  },
  failure: {
    statusCode: 500,
    message: 'Unable to fetch configurations.',
  },
};
