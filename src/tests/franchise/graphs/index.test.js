import Axios from 'axios';
import { FRANCHISE_SERVICE, SALES_SERVICE } from 'src/services/franchise.services';
import { mswServer } from 'src/tests/server';

import {
  fetchClientGraphDataError,
  fetchClientsOverTheYearGraphDataError,
  fetchOfficerGraphDataError,
} from '../handler/postHandler';

describe('getOfficerGraphData', () => {
  test('Fetch officers graph data successfully', async () => {
    const response = await Axios.get(`${FRANCHISE_SERVICE}/users/officers_graph`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.employeesGraphData).toBeInstanceOf(Object);
  });

  it('Failed fetching officers graph data', async () => {
    try {
      mswServer.use(fetchOfficerGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});

describe('getClientGraphData', () => {
  test('Fetch clients graph data successfully', async () => {
    const response = await Axios.get(
      `${SALES_SERVICE}/web/external_stats/ho_clients_vertical_stats`,
    );
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.clientsGraphData).toBeInstanceOf(Object);
  });

  it('Failed fetching clients graph data', async () => {
    try {
      mswServer.use(fetchClientGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});

describe('getClientOverTheYearGraphData', () => {
  test('Fetch clients over the year graph data successfully', async () => {
    const response = await Axios.get(`${SALES_SERVICE}/web/external_stats/ho_clients_yearly_stats`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.clientsOverTheYear).toBeInstanceOf(Object);
  });

  it('Failed fetching clients over the year graph data', async () => {
    try {
      mswServer.use(fetchClientsOverTheYearGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});
