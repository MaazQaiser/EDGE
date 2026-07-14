import { rest } from 'msw';
import { TEMPLATE_SERVICE } from 'services/question.services';

import stubbedData from '../../stubbedData/index';

export const updateQuestionsOrder = rest.put(
  `${TEMPLATE_SERVICE}/questions/reordered`,
  async (req, res, ctx) => {
    if (!req?.body?.ordered_question_ids) {
      return res(
        ctx.status(stubbedData.questions.update.failure.statusCode),
        ctx.json({
          data: {
            message: stubbedData.questions.update.failure.message,
            statusCode: stubbedData.questions.update.failure.statusCode,
          },
        }),
      );
    }
    return res(
      ctx.status(stubbedData.questions.update.success.statusCode),
      ctx.json({
        data: {
          message: stubbedData.questions.update.success.message,
          statusCode: stubbedData.questions.update.success.statusCode,
        },
      }),
    );
  },
);

export const industryVerticals = [updateQuestionsOrder];
