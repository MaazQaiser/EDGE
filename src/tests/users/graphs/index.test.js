import Axios from 'axios';
import { REACT_APP_FRANCHISE_BASE_URL, REACT_APP_LOCATIONS_URL } from 'services/deal.service';
import { schedulingServiceEndPoint, usersServiceEndPoint } from 'src/services/user.services';
import { mswServer } from 'src/tests/server';

import {
  fetchJobsPerformedOverTheYearGraphDataError,
  fetchMissedJobsGraphDataError,
  fetchSalesDealsGraphDataError,
  fetchSalesUsersGraphDataError,
  fetchUsersRegisteredForSalesOverTheYearGraphDataError,
  fetchUserTypeGraphDataError,
} from '../handler';

describe('getUserTypeGraphData', () => {
  test('Fetch user type graph data successfully', async () => {
    const response = await Axios.get(`${usersServiceEndPoint}/users/user_type_graph`);
    expect(response.data.statusCode).toBe(200);
  });

  it('Failed fetching user type graph data', async () => {
    try {
      mswServer.use(fetchUserTypeGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});

describe('getMissedJobsGraphData', () => {
  test('Fetch missed jobs graph data successfully', async () => {
    const response = await Axios.get(`${schedulingServiceEndPoint}/shift/graph/missedJob`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.missRateGraphData).toBeInstanceOf(Object);
  });

  it('Failed fetching missed jobs graph data', async () => {
    try {
      mswServer.use(fetchMissedJobsGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});

describe('getJobPerformedOverTheYearGraphData', () => {
  test('Fetch job performed over the year graph data successfully', async () => {
    const response = await Axios.get(`${schedulingServiceEndPoint}/shift/graph/yearlyPerformedJob`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.dutiesPerformedOverTheYearGraphData).toBeInstanceOf(Object);
  });

  it('Failed fetching clients over the year graph data', async () => {
    try {
      mswServer.use(fetchJobsPerformedOverTheYearGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(404);
    }
  });
});

describe('getSalesUsersGraphData', () => {
  test('Fetch users deals graph data successfully', async () => {
    const response = await Axios.get(
      `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_graph`,
    );
    expect(response.data.statusCode).toBe(200);
  });

  it('Failed fetching user type graph data', async () => {
    try {
      mswServer.use(fetchSalesDealsGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('getUsersDealsGraphData', () => {
  test('Fetch missed jobs graph data successfully', async () => {
    const response = await Axios.get(`${REACT_APP_LOCATIONS_URL}/web/deals/cumulative_stats`);
    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.byOpenDeals).toBeInstanceOf(Object);
  });

  it('Failed fetching missed jobs graph data', async () => {
    try {
      mswServer.use(fetchSalesUsersGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});

describe('getUsersRegisterOverTheYearGraph', () => {
  test('Fetch job performed over the year graph data successfully', async () => {
    const response = await Axios.get(
      `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_over_last_tweleve_months_graph`,
    );

    expect(response.data.statusCode).toBe(200);
    expect(response?.data?.data?.clientsOverTheYear).toBeInstanceOf(Object);
  });

  it('Failed fetching clients over the year graph data', async () => {
    try {
      mswServer.use(fetchUsersRegisteredForSalesOverTheYearGraphDataError);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(500);
    }
  });
});
