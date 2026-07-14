export const Employees = {
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: [
    '<b>50%  </b> Hyperstores',
    '<b>15% </b> Education',
    '<b>10% </b> Healthcare',
    '<b>10% </b> Residential',
    '<b>20% </b> Others',
  ],
  series: [50, 15, 10, 10, 20],
  colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
  dataLabels: {
    enabled: false, // Disable data labels
    style: {
      fontSize: '10px', // Adjust the font size here
    },
  },
  legend: {
    position: 'left', // Change this to 'left' to position the legend on the left side
    offsetY: 30,
    offsetX: -0, // You can adjust the offset as needed
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
};

export const Clients = {
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: [
    '<b>50%  </b> Hyperstores',
    '<b>15% </b> Education',
    '<b>10% </b> Healthcare',
    '<b>10% </b> Residential',
    '<b>20% </b> Others',
  ],
  series: [50, 15, 10, 10, 20],
  colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
  dataLabels: {
    enabled: false, // Disable data labels
    style: {
      fontSize: '10px', // Adjust the font size here
    },
  },

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
};
export const areaGraphOptions = {
  options: {
    chart: {
      type: 'area',
      height: 350,
      width: '100%',
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },

    plotOptions: {
      area: {
        dataLabels: {
          enabled: false,
        },
      },
    },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },

    yaxis: {
      min: 0,
      max: 600,
      tickAmount: 3, // Number of ticks you want (0, 200, 400, 600)
    },
  },
  series: [
    {
      name: 'Clients',
      data: [0, 600, 1200], // Corresponding to 0, 200, 400, 600
      markers: {
        show: true, // Hide data points on the graph curves
      },
    },
  ],
};

export const Sites = {
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: ['<b>Patrol </b> Officers', '<b>Dedicated</b> Officers'],
  series: [44, 55],
  colors: ['#146DFF', '#A9DEFF'],
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
};

export const SitesData = (t) => ({
  total: 120,
  chart: {
    type: 'donut',
    width: '70%',
  },
  labels: [
    `<b>${t('obx.sites.graph.functional')}`,
    `<b>${t('obx.sites.graph.upcoming')}`,
    `<b>${t('obx.sites.graph.nonFunctional')}`,
  ],
  series: [44, 55, 22],
  data: [
    { value: 44, name: `${t('obx.sites.graph.functional')}` },
    { value: 55, name: `${t('obx.sites.graph.upcoming')}` },
    { value: 22, name: `${t('obx.sites.graph.nonFunctional')}` },
  ],
  colors: ['#146DFF', '#A9DEFF', '#E6E6E7'],
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
    `<b>${t('obx.sites.graph.hyperstores')}`,
    `<b>${t('obx.sites.graph.education')}`,
    `<b>${t('obx.sites.graph.healthCare')}`,
    `<b>${t('obx.sites.graph.residential')}`,
    `<b>${t('obx.sites.graph.others')}`,
  ],
  series: [50, 15, 10, 10, 20],
  colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
  data: [
    { value: 50, name: `${t('obx.sites.graph.hyperstores')}` },
    { value: 10, name: `${t('obx.sites.graph.education')}` },
    { value: 5, name: `${t('obx.sites.graph.healthCare')}` },
    { value: 15, name: `${t('obx.sites.graph.residential')}` },
    { value: 20, name: `${t('obx.sites.graph.others')}` },
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
