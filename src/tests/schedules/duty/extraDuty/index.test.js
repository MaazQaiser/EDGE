/* eslint-disable no-undef */
import Axios from 'axios';

import { dutyServiceEndPoint } from '../../../../services/duty.services';
import stubbedData from '../../../../stubbedData';
import { mswServer } from '../../../server';
import {
  createExtraDutyErrorMsw,
  deleteExtraDutyErrorMsw,
  editExtraDutyErrorMsw,
} from '../handler';

describe('deleteExtraDuty', () => {
  test('Delete Extra Duty', async () => {
    const shiftId = 123;
    const response = await Axios.delete(`${dutyServiceEndPoint}/job/delete/${shiftId}`);

    expect(response.data.statusCode).toBe(200);
  });

  test('Delete Extra Duty without shift id', async () => {
    const shiftId = null;
    try {
      await Axios.delete(`${dutyServiceEndPoint}/job/delete/${shiftId}`);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });

  test('Delete Extra Duty error', async () => {
    try {
      mswServer.use(deleteExtraDutyErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('createExtraDuty', () => {
  test('Create Extra Duty', async () => {
    const postData = {
      site: 1,
      startsAt: '2023-09-18T22:15:00.000Z',
      endsAt: '2023-09-18T23:20:00.000Z',
      officersAssigned: [
        {
          id: '12',
          hourlyRate: '21',
        },
      ],
      reportId: '23',
      instructions: '<p>Here is extra duty instructions</p>',
    };

    const response = await Axios.post(`${dutyServiceEndPoint}/job/extraJob`, postData);

    expect(response.data.statusCode).toBe(200);
  });

  test('Create Extra Duty error', async () => {
    try {
      mswServer.use(createExtraDutyErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData.createExtraDuty.failure.status);
      expect(error.response.data.message).toBe('Internal Server Error');
    }
  });
});

describe('editExtraDuty', () => {
  test('Edit Extra Duty', async () => {
    const payload = {
      id: '1',
      hourlyRate: 13,
      assignedOfficer: [
        {
          id: '12',
          name: 'Officer Name',
          imageUrl: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
        },
      ],
    };

    const shiftId = 1;
    const response = await Axios.patch(
      `${dutyServiceEndPoint}/shift/updateExtra/${shiftId}`,
      payload,
    );
    expect(response.data.statusCode).toBe(200);
  });

  test('Edit Extra Duty error', async () => {
    try {
      mswServer.use(editExtraDutyErrorMsw);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});
