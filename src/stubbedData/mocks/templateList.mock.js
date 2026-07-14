const templates = [
  {
    id: 31,
    title: 'Tour Submission',
    description: 'This is a description of 12',
    status: 'active',
    updatedBy: null,
    createdBy: {
      name: 'John Agar',
      image:
        'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
    },
    templateableType: 'Report',
    templateableId: 2,
    createdAt: '2023/10/17',
    updatedAt: '2023/10/17',
    sectionsAttributes: [
      {
        id: 7,
        title: 'Section',
        description: 'This is a description for Section',
        questionsAttributes: [
          {
            id: 7,
            questionStatement: "What's your favorite color? (Q1 in Section)",
            required: false,
            instruction: 'instructiuons',
            responseType: 1,
            optionsAttributes: [],
          },
        ],
      },
    ],
  },
];

module.exports = templates;
