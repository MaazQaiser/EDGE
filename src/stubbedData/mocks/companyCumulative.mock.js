const cumulativeStats = {
  data: {
    companyStats: {
      totalCount: 1000,
      active: 899,
      inactive: 101,
    },
    verticalStats: {
      totalCount: 899,
      verticals: [
        {
          name: 'Electrical Electronic Manufacturing',
          percentage: 3,
        },
        {
          name: 'Arts And Crafts',
          percentage: 2,
        },
        {
          name: 'Internet',
          percentage: 2,
        },
        {
          name: 'E Learning',
          percentage: 2,
        },
        {
          name: 'Others',
          percentage: 90,
        },
      ],
    },
  },
  message: 'success',
  statusCode: 200,
};
export default cumulativeStats;
