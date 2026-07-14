export const Users = {
  colors: ['#146DFF', '#A9DEFF', '#F2F2F3', '#FFEED4'],
  data: [
    { value: 1048, name: 'Patrol Officers' },
    { value: 735, name: 'Dedicated Officers' },
    { value: 735, name: 'Key Users' },
    { value: 735, name: 'HO Staff' },
  ],
  stats: {
    increaseInSale: '1%',
    decreaseInSale: null,
    totalBusiness: '10 business',
    total: '$2.17M',
  },
};

export const UsersByPost = {
  colors: ['#A9DEFF', '#E6E6E7', '#146DFF'],
  data: [
    { value: 20, name: 'Executive' },
    { value: 10, name: 'Managers/Key Users' },
    { value: 50, name: 'Staff' },
  ],
  stats: {
    total: '1,200',
    totalDetail: 'total deals',
  },
};

export const UserOverYear = {
  dataLabels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  data: {
    Users: [0, 3, 5, 7, 9, 11, 20, 15, 20, 17, 14, 10, 11, 12],
  },
  stats: {
    Users: 2,
  },
  colors: {
    Users: ['#146DFF', '#A6C3F0'],
  },
};
