/* eslint-disable no-undef */

import Axios from 'axios';
import { TEMPLATE_SERVICE } from 'services/question.services';
import stubbedData from 'src/stubbedData';

describe('updateQuestionsReorder', () => {
  test('Update questions reorder', async () => {
    const body = {
      ordered_question_ids: [574, 571, 338, 336, 335],
    };
    const response = await Axios.put(`${TEMPLATE_SERVICE}/questions/reordered`, body);

    expect(response?.data?.data?.statusCode).toBe(stubbedData.questions.update.success.statusCode);
    expect(response?.data?.data?.message).toBe(stubbedData.questions.update.success.message);
  });

  test('Update questions reorder failure', async () => {
    try {
      const body = {};
      await Axios.put(`${TEMPLATE_SERVICE}/questions/reordered`, body);
    } catch (error) {
      expect(error?.response?.data?.data?.statusCode).toBe(
        stubbedData.questions.update.failure.statusCode,
      );
      expect(error?.response?.data?.data?.message).toBe(
        stubbedData.questions.update.failure.message,
      );
    }
  });
});
