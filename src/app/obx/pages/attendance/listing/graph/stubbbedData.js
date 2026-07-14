export const UserTypesData = (t) => ({
  total: 120,
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: [
    `<b>${t('obx.sitesAttendance.graph.petrol')}`,
    `<b>${t('obx.sitesAttendance.graph.dedicated')}`,
  ],
  series: [44, 55, 22],
  data: [
    { value: 44, name: `${t('obx.sitesAttendance.graph.petrol')}` },
    { value: 55, name: `${t('obx.sitesAttendance.graph.dedicated')}` },
  ],
  colors: ['#146DFF', '#A9DEFF'],
  stats: {
    increaseInSale: '1%',
    decreaseInSale: null,
    totalBusiness: '10 business',
    total: '$2.17M',
  },
  dataLabels: {
    enabled: false, // Disable data labels
    style: {
      fontSize: '10px', // Adjust the font size here
    },
  },
  legend: {
    position: 'left', // Change this to 'left' to position the legend on the left side
    offsetY: 30,
    offsetX: -10, // You can adjust the offset as needed
  },
  stroke: {
    show: true,
    colors: undefined,
    width: 6,
    dashArray: 0,
  },
  tooltip: {
    marker: {
      show: true,
    },
  },
});

export const ClientsData = (t) => ({
  total: 420,
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: [
    `<b>${t('obx.sitesAttendance.graph.petrolMissed')}`,
    `<b>${t('obx.sitesAttendance.graph.dedicatedMissed')}`,
  ],
  series: [50, 15, 10, 10, 20],
  colors: ['#146DFF', '#A9DEFF'],
  data: [
    { value: 50, name: `${t('obx.sitesAttendance.graph.petrolMissed')}` },
    { value: 30, name: `${t('obx.sitesAttendance.graph.dedicatedMissed')}` },
  ],
  stats: {
    total: '1,200',
    totalDetail: 'total deals',
  },
  dataLabels: [
    'Jan 23',
    'Feb 23',
    'Mar 23',
    'Apr 23',
    'May 23',
    'Jun 23',
    'Jul 23',
    'Aug 23',
    'Sep 23',
    'Oct 23',
    'Nov 23',
    'Dec 23',
  ],

  plotOptions: {
    bar: {
      borderRadius: 8,
      // borderRadiusApplication: 'end',
      // borderRadiusWhenStacked: 'last',
    },
  },

  legend: {
    position: 'left', // Change this to 'left' to position the legend on the left side
    offsetY: 'top',
    offsetX: -10, // You can adjust the offset as needed
  },

  stroke: {
    show: true,
    colors: undefined,
    width: 6,
    dashArray: 0,
  },
});

export const Request = {
  dataLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  data: {
    Dedicated: [12, 54, 25, 7, 29, 11, 69, 15, 27, 17, 34, 10],
    Request: [9, 3, 5, 73, 19, 11, 22, 15, 10, 17, 34, 6],
  },
  stats: {
    Dedicated: 2,
    Request: 1,
  },
  colors: {
    Dedicated: ['#146DFF', '#A6C3F0'],
    Request: ['#86868B', '#E0ECFF'],
  },
};
