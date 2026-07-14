import Axios from 'axios';
import { visitor_service } from 'services/settings.services';
import stubbedData from 'src/stubbedData';

describe('updateVisitorType', () => {
  test('Update VisitorType', async () => {
    const stubData = stubbedData?.typesStubbedData.update;
    const id = 1;
    const payload = {
      title: 'New TruckLoad 1',
      associatedSites: [
        {
          label: 'Site Tkxel Canal',
          key: 3,
          value: 3,
          id: 3,
        },
      ],
      category: 'truckLoad',
      createdBy: 12,
      sites: [3],
      settings: [
        {
          key: 'Driver Name',
          value: true,
          dataType: 'text',
          required: true,
          isChecked: true,
          isDisabled: true,
          id: 305,
        },
        {
          key: 'Checkout Time',
          value: true,
          dataType: 'date_time',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 306,
        },
        {
          key: 'Company Name',
          value: true,
          dataType: 'text',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 307,
        },
        {
          key: 'Profile Picture',
          value: true,
          dataType: 'image',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 308,
        },
        {
          key: 'Vehicle Identification Number',
          value: true,
          dataType: 'text',
          required: true,
          isChecked: true,
          isDisabled: true,
          id: 309,
        },
        {
          key: 'Visitor Badge',
          value: true,
          dataType: 'action',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 310,
        },
        {
          key: 'Visit Reason',
          value: true,
          dataType: 'text',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 311,
        },
        {
          key: 'Cargo Details',
          value: true,
          dataType: 'text',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 312,
        },
        {
          key: 'Load Weight',
          value: true,
          dataType: 'text',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 313,
        },
        {
          key: 'Load Temperature',
          value: true,
          dataType: 'text',
          required: false,
          isChecked: true,
          isDisabled: false,
          id: 314,
        },
      ],
    };
    const response = await Axios.put(`${visitor_service}/visitor_types/${id}`, payload);

    expect(response.data.statusCode).toBe(200);
    expect(response.data.message).toBe(stubData.success.message);
  });

  test('Update VisitorTypes error', async () => {
    try {
      const id = null;
      const payload = {};
      await Axios.put(`${visitor_service}/visitor_types/${id}`, payload);
    } catch (error) {
      const stubData = stubbedData?.typesStubbedData.update;
      expect(error.response.data.statusCode).toBe(stubData.failure.statusCode);
      expect(error.response.data.message).toBe(stubData.failure.message);
    }
  });
});
