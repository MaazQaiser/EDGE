import { rest } from 'msw';

import { TEMPLATE_SERVICE } from '../../services/template.services';
export const templates = `${TEMPLATE_SERVICE}/templates`;

export const fetchAllTemplates = rest.get(templates, async (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      data: {
        templates: [
          {
            id: 58,
            title: 'testing 1212',
            description: 'This template has samples of all response types.',
            status: 'inactive',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/10/03',
            sectionsAttributes: [
              {
                id: 68,
                title: 'All Response Types Section',
                description: 'This section contains a question for each response type.',
                questionsAttributes: [
                  {
                    id: 149,
                    questionStatement: 'Describe your mood today. (Text Response)',
                    required: false,
                    instruction: 'Provide a brief description.',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                  {
                    id: 150,
                    questionStatement: 'How many hours did you sleep last night? (Number Response)',
                    required: false,
                    instruction: 'Provide a number value.',
                    responseType: 1,
                    optionsAttributes: [],
                  },
                  {
                    id: 151,
                    questionStatement: 'Select your favorite fruits. (MultiSelect Response)',
                    required: false,
                    instruction: 'You can choose multiple options.',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 110,
                        optionText: 'Apple',
                      },
                      {
                        id: 111,
                        optionText: 'Banana',
                      },
                    ],
                  },
                  {
                    id: 152,
                    questionStatement: 'When is your next appointment? (DateTime Response)',
                    required: false,
                    instruction: 'Provide the date and time.',
                    responseType: 3,
                    optionsAttributes: [],
                  },
                  {
                    id: 153,
                    questionStatement: 'Do you prefer cats or dogs? (Radio Response)',
                    required: false,
                    instruction: 'Select one option.',
                    responseType: 4,
                    optionsAttributes: [
                      {
                        id: 112,
                        optionText: 'Cats',
                      },
                      {
                        id: 113,
                        optionText: 'Dogs',
                      },
                    ],
                  },
                  {
                    id: 154,
                    questionStatement: 'When is your anniversary? (Date Response)',
                    required: false,
                    instruction: 'Provide just the date.',
                    responseType: 5,
                    optionsAttributes: [],
                  },
                  {
                    id: 155,
                    questionStatement: 'Upload a media file. (Image/Video Response)',
                    required: false,
                    instruction: 'Upload either an image or video.',
                    responseType: 6,
                    optionsAttributes: [],
                  },
                  {
                    id: 156,
                    questionStatement: 'What time do you usually wake up? (Time Response)',
                    required: false,
                    instruction: 'Provide just the time.',
                    responseType: 7,
                    optionsAttributes: [],
                  },
                ],
              },
            ],
          },
          {
            id: 57,
            title: 'testing 123',
            description: 'This template has samples of all response types.',
            status: 'inactive',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/10/03',
            sectionsAttributes: [
              {
                id: 67,
                title: 'All Response Types Section',
                description: 'This section contains a question for each response type.',
                questionsAttributes: [
                  {
                    id: 141,
                    questionStatement: 'Describe your mood today. (Text Response)',
                    required: false,
                    instruction: 'Provide a brief description.',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                  {
                    id: 142,
                    questionStatement: 'How many hours did you sleep last night? (Number Response)',
                    required: false,
                    instruction: 'Provide a number value.',
                    responseType: 1,
                    optionsAttributes: [],
                  },
                  {
                    id: 143,
                    questionStatement: 'Select your favorite fruits. (MultiSelect Response)',
                    required: false,
                    instruction: 'You can choose multiple options.',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 106,
                        optionText: 'Apple',
                      },
                      {
                        id: 107,
                        optionText: 'Banana',
                      },
                    ],
                  },
                  {
                    id: 144,
                    questionStatement: 'When is your next appointment? (DateTime Response)',
                    required: false,
                    instruction: 'Provide the date and time.',
                    responseType: 3,
                    optionsAttributes: [],
                  },
                  {
                    id: 145,
                    questionStatement: 'Do you prefer cats or dogs? (Radio Response)',
                    required: false,
                    instruction: 'Select one option.',
                    responseType: 4,
                    optionsAttributes: [
                      {
                        id: 108,
                        optionText: 'Cats',
                      },
                      {
                        id: 109,
                        optionText: 'Dogs',
                      },
                    ],
                  },
                  {
                    id: 146,
                    questionStatement: 'When is your anniversary? (Date Response)',
                    required: false,
                    instruction: 'Provide just the date.',
                    responseType: 5,
                    optionsAttributes: [],
                  },
                  {
                    id: 147,
                    questionStatement: 'Upload a media file. (Image/Video Response)',
                    required: false,
                    instruction: 'Upload either an image or video.',
                    responseType: 6,
                    optionsAttributes: [],
                  },
                  {
                    id: 148,
                    questionStatement: 'What time do you usually wake up? (Time Response)',
                    required: false,
                    instruction: 'Provide just the time.',
                    responseType: 7,
                    optionsAttributes: [],
                  },
                ],
              },
            ],
          },
          {
            id: 55,
            title: 'Rameden',
            description: 'This template has samples of all response types.',
            status: 'inactive',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/10/02',
            sectionsAttributes: [
              {
                id: 65,
                title: 'All Response Types Section',
                description: 'This section contains a question for each response type.',
                questionsAttributes: [
                  {
                    id: 125,
                    questionStatement: 'Describe your mood today. (Text Response)',
                    required: false,
                    instruction: 'Provide a brief description.',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                  {
                    id: 126,
                    questionStatement: 'How many hours did you sleep last night? (Number Response)',
                    required: false,
                    instruction: 'Provide a number value.',
                    responseType: 1,
                    optionsAttributes: [],
                  },
                  {
                    id: 127,
                    questionStatement: 'Select your favorite fruits. (MultiSelect Response)',
                    required: false,
                    instruction: 'You can choose multiple options.',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 98,
                        optionText: 'Apple',
                      },
                      {
                        id: 99,
                        optionText: 'Banana',
                      },
                    ],
                  },
                  {
                    id: 128,
                    questionStatement: 'When is your next appointment? (DateTime Response)',
                    required: false,
                    instruction: 'Provide the date and time.',
                    responseType: 3,
                    optionsAttributes: [],
                  },
                  {
                    id: 129,
                    questionStatement: 'Do you prefer cats or dogs? (Radio Response)',
                    required: false,
                    instruction: 'Select one option.',
                    responseType: 4,
                    optionsAttributes: [
                      {
                        id: 100,
                        optionText: 'Cats',
                      },
                      {
                        id: 101,
                        optionText: 'Dogs',
                      },
                    ],
                  },
                  {
                    id: 130,
                    questionStatement: 'When is your anniversary? (Date Response)',
                    required: false,
                    instruction: 'Provide just the date.',
                    responseType: 5,
                    optionsAttributes: [],
                  },
                  {
                    id: 131,
                    questionStatement: 'Upload a media file. (Image/Video Response)',
                    required: false,
                    instruction: 'Upload either an image or video.',
                    responseType: 6,
                    optionsAttributes: [],
                  },
                  {
                    id: 132,
                    questionStatement: 'What time do you usually wake up? (Time Response)',
                    required: false,
                    instruction: 'Provide just the time.',
                    responseType: 7,
                    optionsAttributes: [],
                  },
                ],
              },
            ],
          },
          {
            id: 54,
            title: 'Rameen',
            description: 'This template has samples of all response types.',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/10/02',
            sectionsAttributes: [
              {
                id: 64,
                title: 'All Response Types Section',
                description: 'This section contains a question for each response type.',
                questionsAttributes: [
                  {
                    id: 117,
                    questionStatement: 'Describe your mood today. (Text Response)',
                    required: false,
                    instruction: 'Provide a brief description.',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                  {
                    id: 118,
                    questionStatement: 'How many hours did you sleep last night? (Number Response)',
                    required: false,
                    instruction: 'Provide a number value.',
                    responseType: 1,
                    optionsAttributes: [],
                  },
                  {
                    id: 119,
                    questionStatement: 'Select your favorite fruits. (MultiSelect Response)',
                    required: false,
                    instruction: 'You can choose multiple options.',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 94,
                        optionText: 'Apple',
                      },
                      {
                        id: 95,
                        optionText: 'Banana',
                      },
                    ],
                  },
                  {
                    id: 120,
                    questionStatement: 'When is your next appointment? (DateTime Response)',
                    required: false,
                    instruction: 'Provide the date and time.',
                    responseType: 3,
                    optionsAttributes: [],
                  },
                  {
                    id: 121,
                    questionStatement: 'Do you prefer cats or dogs? (Radio Response)',
                    required: false,
                    instruction: 'Select one option.',
                    responseType: 4,
                    optionsAttributes: [
                      {
                        id: 96,
                        optionText: 'Cats',
                      },
                      {
                        id: 97,
                        optionText: 'Dogs',
                      },
                    ],
                  },
                  {
                    id: 122,
                    questionStatement: 'When is your anniversary? (Date Response)',
                    required: false,
                    instruction: 'Provide just the date.',
                    responseType: 5,
                    optionsAttributes: [],
                  },
                  {
                    id: 123,
                    questionStatement: 'Upload a media file. (Image/Video Response)',
                    required: false,
                    instruction: 'Upload either an image or video.',
                    responseType: 6,
                    optionsAttributes: [],
                  },
                  {
                    id: 124,
                    questionStatement: 'What time do you usually wake up? (Time Response)',
                    required: false,
                    instruction: 'Provide just the time.',
                    responseType: 7,
                    optionsAttributes: [],
                  },
                ],
              },
            ],
          },
          {
            id: 52,
            title: 'Template 52',
            description: 'This is a description of temp 52',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/28',
            sectionsAttributes: [
              {
                id: 61,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 106,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 1,
                    optionsAttributes: [
                      {
                        id: 83,
                        optionText: 'updated value',
                      },
                      {
                        id: 85,
                        optionText: 'new added',
                      },
                    ],
                  },
                  {
                    id: 107,
                    questionStatement: "What's your favorite color?",
                    required: false,
                    instruction: null,
                    responseType: 0,
                    optionsAttributes: [
                      {
                        id: 86,
                        optionText: 'new value',
                      },
                      {
                        id: 87,
                        optionText: 'new added',
                      },
                    ],
                  },
                ],
              },
              {
                id: 62,
                title: 'Section 2',
                description: 'This is a description for Section 2',
                questionsAttributes: [
                  {
                    id: 108,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: null,
                    responseType: 0,
                    optionsAttributes: [
                      {
                        id: 88,
                        optionText: 'updated value',
                      },
                      {
                        id: 89,
                        optionText: 'new added',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 51,
            title: 'Template 51',
            description: 'This is a description of temp 51',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/28',
            sectionsAttributes: [
              {
                id: 59,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 103,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 1,
                    optionsAttributes: [
                      {
                        id: 76,
                        optionText: 'updated value',
                      },
                      {
                        id: 78,
                        optionText: 'new added',
                      },
                    ],
                  },
                  {
                    id: 104,
                    questionStatement: "What's your favorite color?",
                    required: false,
                    instruction: null,
                    responseType: 0,
                    optionsAttributes: [
                      {
                        id: 79,
                        optionText: 'new value',
                      },
                      {
                        id: 80,
                        optionText: 'new added',
                      },
                    ],
                  },
                ],
              },
              {
                id: 60,
                title: 'Section 2',
                description: 'This is a description for Section 2',
                questionsAttributes: [
                  {
                    id: 105,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: null,
                    responseType: 0,
                    optionsAttributes: [
                      {
                        id: 81,
                        optionText: 'updated value',
                      },
                      {
                        id: 82,
                        optionText: 'new added',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 50,
            title: 'New Template 12',
            description: 'This is a description of 12',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/28',
            sectionsAttributes: [
              {
                id: 58,
                title: 'Section',
                description: 'This is a description for Section',
                questionsAttributes: [
                  {
                    id: 102,
                    questionStatement: "What's your favorite color? (Q1 in Section)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 1,
                    optionsAttributes: [
                      {
                        id: 74,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 75,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 49,
            title: 'New Template 49',
            description: 'This is a description of 10th temp',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/28',
            sectionsAttributes: [
              {
                id: 56,
                title: 'Section',
                description: 'This is a description for Section',
                questionsAttributes: [
                  {
                    id: 100,
                    questionStatement: "What's your favorite color? (Q1 in Section)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 1,
                    optionsAttributes: [
                      {
                        id: 70,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 71,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 57,
                title: 'Section',
                description: 'This is a description for Section',
                questionsAttributes: [
                  {
                    id: 101,
                    questionStatement: "What's your favorite color? (Q1 in Section)",
                    required: true,
                    instruction: 'instructiuons',
                    responseType: 7,
                    optionsAttributes: [
                      {
                        id: 72,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 73,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 10,
            title: 'New Template 10',
            description: 'This is a description of 10th temp',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/25',
            sectionsAttributes: [
              {
                id: 10,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 10,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                ],
              },
              {
                id: 55,
                title: 'Section',
                description: 'This is a description for Section',
                questionsAttributes: [
                  {
                    id: 99,
                    questionStatement: "What's your favorite color? (Q1 in Section)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 68,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 69,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 2,
            title: 'test-2',
            description: 'This is a description',
            status: 'active',
            createdBy: null,
            templateableType: 'Reports',
            templateableId: 2,
            createdAt: '2023/09/25',
            sectionsAttributes: [
              {
                id: 2,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 2,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 0,
                    optionsAttributes: [],
                  },
                ],
              },
              {
                id: 41,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 85,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 44,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 45,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 42,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 86,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 46,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 47,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 43,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 87,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 48,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 49,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 44,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 88,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 50,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 51,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 45,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 89,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 52,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 53,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 46,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 90,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 54,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 55,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 47,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 91,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 56,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 57,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 52,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 96,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 2,
                    optionsAttributes: [
                      {
                        id: 62,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 63,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 53,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 97,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 3,
                    optionsAttributes: [
                      {
                        id: 64,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 65,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
              {
                id: 54,
                title: 'Section 1',
                description: 'This is a description for Section 1',
                questionsAttributes: [
                  {
                    id: 98,
                    questionStatement: "What's your favorite color? (Q1 in Section 1)",
                    required: false,
                    instruction: 'instructiuons',
                    responseType: 3,
                    optionsAttributes: [
                      {
                        id: 66,
                        optionText: 'Option 1 of Q1',
                      },
                      {
                        id: 67,
                        optionText: 'Option 2 of Q1',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        pagination: {
          currentPage: 1,
          nextPage: 2,
          prevPage: null,
          totalPages: 5,
          totalCount: 44,
        },
      },
      statusCode: 200,
    }),
  );
});

export const fetchAllTemplatesError = rest.get(templates, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching templates.',
    }),
  );
});

export const fetchSingleTemplate = rest.get(`${templates}/:id`, async (req, res, ctx) => {
  if (req?.params?.id === 'undefined') {
    return res(
      ctx.status(404),
      ctx.json({
        statusCode: 404,
        message: 'Not Found!',
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      data: {
        template: {
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
        },
      },
      statusCode: 200,
    }),
  );
});

export const fetchSingleTemplateError = rest.get(templates, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching templates.',
    }),
  );
});

export const deleteSingleTemplate = rest.delete(`${templates}/:id`, async (req, res, ctx) => {
  if (!req?.params?.id === 'undefined') {
    return res(
      ctx.status(404),
      ctx.json({
        statusCode: 404,
        message: 'Not Found!',
      }),
    );
  }
  return res(
    ctx.status(200),
    ctx.json({
      message: 'Template deleted successfully',
      statusCode: 200,
    }),
  );
});

export const deleteSingleTemplateError = rest.get(templates, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching templates.',
    }),
  );
});

export const templatesHandler = [
  fetchAllTemplates,
  fetchAllTemplatesError,
  fetchSingleTemplate,
  fetchSingleTemplateError,
  deleteSingleTemplate,
  deleteSingleTemplateError,
];
