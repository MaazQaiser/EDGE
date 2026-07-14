export const UserTypes = {
  colors: ['#146DFF', '#A9DEFF', '#F7DDDC', '#FFD9A8'],
  data: [
    { value: 1048, name: 'Patrol ' },
    { value: 735, name: 'Dedicated' },
    { value: 735, name: 'Hybrid' },
    { value: 735, name: 'Supervisors' },
  ],
  stats: {
    increaseInSale: '1%',
    decreaseInSale: null,
    totalBusiness: '10 business',
    total: '$2.17M',
  },
};

export const MissRate = {
  colors: ['#146DFF', '#A9DEFF', '#F7DDDC', '#FFD9A8'],
  data: [
    { value: 50, name: 'Patrol Completed' },
    { value: 30, name: 'Dedicated Completed' },
    { value: 30, name: 'Patrol Visits Missed' },
    { value: 30, name: 'Dedicated Missed' },
  ],
  stats: {
    total: '5',
    totalDetail: 'total deals',
  },
};

export const DutiesPerformed = {
  dataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: {
    Dedicated: [12, 54, 25, 7, 29, 11, 69, 15, 27, 17, 34, 10],
    Patrol: [9, 3, 5, 73, 19, 11, 22, 15, 10, 17, 34, 6],
  },
  stats: {
    Patrol: 2,
    Dedicated: 3,
  },
  colors: {
    Patrol: ['#146DFF', '#A6C3F0'],
    Dedicated: ['#86868B', '#E0ECFF'],
  },
};
