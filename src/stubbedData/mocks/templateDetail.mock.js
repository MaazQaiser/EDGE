const template = {
  id: 13,
  title: 'New Template',
  description: 'This is a description',
  status: 'active',
  createdBy: null,
  templateableType: null,
  templateableId: null,
  createdAt: '2023/09/15',
  sectionsAttributes: [
    {
      id: 13,
      title: 'Section 1',
      description: 'This is a description for Section 1',
      questionsAttributes: [
        {
          id: 22,
          questionStatement: "What's your favorite color?",
          required: false,
          instruction: 'instructions',
          responseType: 1,
          optionsAttributes: [],
        },
        {
          id: 23,
          questionStatement: 'What is your age?',
          required: true,
          instruction: 'instructions',
          responseType: 2,
          optionsAttributes: [
            {
              id: 41,
              optionText: 'Option 1',
            },
            {
              id: 42,
              optionText: 'Option 2',
            },
          ],
        },
      ],
    },
  ],
};

module.exports = template;
