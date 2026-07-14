import { rest } from 'msw';

import { dutyServiceEndPoint, templateServiceEndPoint } from '../../../services/duty.services';
import stubbedData from '../../../stubbedData';

const franchiseServiceEndPoint = process.env.REACT_APP_FRANCHISE;

export const createExtraDutyMsw = rest.post(
  `${dutyServiceEndPoint}/job/extraJob`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.createExtraDuty.success.status),
      ctx.json({
        statusCode: stubbedData.createExtraDuty.success.status,
        message: stubbedData.createExtraDuty.success.message,
      }),
    );
  },
);

export const createExtraDutyErrorMsw = rest.post(
  `${dutyServiceEndPoint}/job/extraJob`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.createExtraDuty.failure.status),
      ctx.json({
        statusCode: stubbedData.createExtraDuty.failure.status,
        message: stubbedData.createExtraDuty.failure.message,
      }),
    );
  },
);

export const deleteExtraDutyMsw = rest.delete(
  `${dutyServiceEndPoint}/job/delete/:id`,
  async (req, res, ctx) => {
    if (!req?.params?.id) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const deleteExtraDutyErrorMsw = rest.delete(
  `${dutyServiceEndPoint}/job/delete/:id`,
  async (req, res, ctx) => {
    if (!req?.params?.id) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
        }),
      );
    }

    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const getAllofficersMsw = rest.get(
  `${dutyServiceEndPoint}/shift/availableOfficers`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.officersStubbedData.list.success.status_code),
      ctx.json({
        statusCode: stubbedData.officersStubbedData.list.success.status_code,
      }),
    );
  },
);

export const getAllofficersErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shift/availableOfficers`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.officersStubbedData.list.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.officersStubbedData.list.failure.statusCode,
      }),
    );
  },
);

export const getAllReportTemplatesMsw = rest.get(
  `${templateServiceEndPoint}/templates/list`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.reportsStubbedData.status),
      ctx.json({
        statusCode: stubbedData.reportsStubbedData.status,
      }),
    );
  },
);

export const getAllReportTemplatesErrorMsw = rest.get(
  `${templateServiceEndPoint}/templates/list`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.reportsErrorRes.status),
      ctx.json({
        statusCode: stubbedData.reportsErrorRes.status,
      }),
    );
  },
);

export const getCheckpointsBySiteIdMsw = rest.get(
  `${franchiseServiceEndPoint}/sites/8/checkpoints/checkpoint_options`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.checkpointsStubbedData.status),
      ctx.json({
        statusCode: stubbedData.checkpointsStubbedData.status,
      }),
    );
  },
);

export const getCheckpointsBySiteIdErrorMsw = rest.get(
  `${franchiseServiceEndPoint}/sites/8/checkpoints/checkpoint_options`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.checkpointsErrorRes.status),
      ctx.json({
        statusCode: stubbedData.checkpointsErrorRes.status,
      }),
    );
  },
);

export const getDutiesForCalenderMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/summary`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getDutiesForCalenderErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/summary`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const getDutiesForCalenderListViewMsw = rest.get(
  `${dutyServiceEndPoint}/shift/summaryList`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getDutiesForCalenderListViewErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shift/summaryList`,
  (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
      }),
    );
  },
);

export const getMonthDutiesForCalenderMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/aggregate`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.dutyMonthStubbedData.status),
      ctx.json({
        statusCode: stubbedData.dutyMonthStubbedData.status,
      }),
    );
  },
);

export const getMonthDutiesForCalenderErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/aggregate`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.dutyErrorRes.status),
      ctx.json({
        statusCode: stubbedData.dutyErrorRes.status,
      }),
    );
  },
);

export const getDutyDetailMsw = rest.get(
  `${dutyServiceEndPoint}/job/1/shift/11`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getDutyDetailErrorMsw = rest.get(
  `${dutyServiceEndPoint}/job/1/shift/11`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.dutyErrorRes.status),
      ctx.json({
        statusCode: stubbedData.dutyErrorRes.status,
      }),
    );
  },
);

export const assignDedicatedDutyMsw = rest.post(
  `${dutyServiceEndPoint}/shift/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.createDutiesStubbedData.status),
      ctx.json({
        statusCode: stubbedData.createDutiesStubbedData.status,
      }),
    );
  },
);

export const assignDedicatedDutyErrorMsw = rest.post(
  `${dutyServiceEndPoint}/shift/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.createDutiesErrorRes.status),
      ctx.json({
        statusCode: stubbedData.createDutiesErrorRes.status,
      }),
    );
  },
);

export const editDedicatedDutyMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/update/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.editDutyStubbedData.success.status),
      ctx.json({
        statusCode: stubbedData.editDutyStubbedData.success.status,
      }),
    );
  },
);

export const editDedicatedDutyErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/update/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.editDutyStubbedData.error.status),
      ctx.json({
        statusCode: stubbedData.editDutyStubbedData.error.status,
      }),
    );
  },
);

export const editExtraDutyMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/updateExtra/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const editExtraDutyErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/updateExtra/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const getAllSitesByOfficerIdMsw = rest.get(
  `${dutyServiceEndPoint}/shiftassignment/officerSites/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getAllTypeOfSites = rest.get(
  `${franchiseServiceEndPoint}/sites/functional_non_functionals`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getAllSitesByOfficerIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftassignment/officerSites/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const getDefaultHourlyRateOfFranchiseMsw = rest.get(
  `${franchiseServiceEndPoint}/preferences/extra_job`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const getDefaultHourlyRateOfFranchiseErrorMsw = rest.get(
  `${franchiseServiceEndPoint}/preferences/extra_job`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchJobsAndShiftsListBySiteIdMsw = rest.get(
  `${franchiseServiceEndPoint}/job/getJobsAndJobShifts`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);

export const fetchJobsAndShiftsListBySiteIdErrorMsw = rest.get(
  `${franchiseServiceEndPoint}/job/getJobsAndJobShifts`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchTourTemplatesBySiteIdMsw = rest.get(
  `${franchiseServiceEndPoint}/sites/1/tour_templates/list`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchTourTemplatesBySiteIdErrorMsw = rest.get(
  `${franchiseServiceEndPoint}/sites/1/tour_templates/list`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchTourTemplateByIdMsw = rest.get(
  `${franchiseServiceEndPoint}/tour_templates/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchTourTemplateByIdErrorMsw = rest.get(
  `${franchiseServiceEndPoint}/tour_templates/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchShiftDetailForAssignmentByIdMsw = rest.get(
  `${dutyServiceEndPoint}/shift/details/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchShiftDetailForAssignmentByIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shift/details/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchShiftDetailForSplittingByIdMsw = rest.get(
  `${dutyServiceEndPoint}/shift/split/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchShiftDetailForSplittingByIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shift/split/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchShiftDetailByIdMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchShiftDetailByIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchShiftActivitiesByIdMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/activities/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchShiftActivitiesByIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/activities/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const fetchShiftLogsByIdMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/logs/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const fetchShiftLogsByIdErrorMsw = rest.get(
  `${dutyServiceEndPoint}/shiftActivityLog/logs/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const addNotesToShiftMsw = rest.patch(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const addNotesToShiftErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const editNotesOfShiftMsw = rest.patch(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1/2`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const editNotesOfShiftErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1/2`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const deleteNotesOfShiftMsw = rest.delete(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1/2`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const deleteNotesOfShiftErrorMsw = rest.delete(
  `${dutyServiceEndPoint}/shiftActivityLog/note/1/2`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const deleteShiftByIdMsw = rest.delete(
  `${dutyServiceEndPoint}/shift/1?windowStart=2024-07-12T05:00:00.000Z&endWindow=2024-07-12T05:00:00.000Z`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const deleteShiftByIdErrorMsw = rest.delete(
  `${dutyServiceEndPoint}/shift/1?windowStart=2024-07-12T05:00:00.000Z&endWindow=2024-07-12T05:00:00.000Z`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const createTourTemplateMsw = rest.post(
  `${franchiseServiceEndPoint}/sites/1/tour_templates`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const createTourTemplateErrorMsw = rest.post(
  `${franchiseServiceEndPoint}/sites/1/tour_templates`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const assignShiftMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/assign/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const assignShiftErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/assign/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const reassignShiftMsw = rest.put(
  `${dutyServiceEndPoint}/shift/reassign/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const reassignShiftErrorMsw = rest.put(
  `${dutyServiceEndPoint}/shift/reassign/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const splitShiftMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/split/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const splitShiftErrorMsw = rest.patch(
  `${dutyServiceEndPoint}/shift/split/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const deleteTourTemplateMsw = rest.delete(
  `${franchiseServiceEndPoint}/tour_templates/1`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
      }),
    );
  },
);
export const deleteTourTemplateErrorMsw = rest.delete(
  `${franchiseServiceEndPoint}/tour_templates/1`,
  (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
      }),
    );
  },
);

export const dutyHandler = [
  createExtraDutyMsw,
  createExtraDutyErrorMsw,
  deleteExtraDutyMsw,
  deleteExtraDutyErrorMsw,
  getAllofficersMsw,
  getAllofficersErrorMsw,
  getAllReportTemplatesMsw,
  getAllReportTemplatesErrorMsw,
  getCheckpointsBySiteIdMsw,
  getCheckpointsBySiteIdErrorMsw,
  getDutiesForCalenderMsw,
  getDutiesForCalenderErrorMsw,
  getDutiesForCalenderListViewMsw,
  getDutiesForCalenderListViewErrorMsw,
  getMonthDutiesForCalenderMsw,
  getMonthDutiesForCalenderErrorMsw,
  getDutyDetailMsw,
  getDutyDetailErrorMsw,
  assignDedicatedDutyMsw,
  assignDedicatedDutyErrorMsw,
  editDedicatedDutyMsw,
  editDedicatedDutyErrorMsw,
  editExtraDutyMsw,
  editExtraDutyErrorMsw,
  getAllSitesByOfficerIdMsw,
  getAllSitesByOfficerIdErrorMsw,
  getDefaultHourlyRateOfFranchiseMsw,
  getDefaultHourlyRateOfFranchiseErrorMsw,
  fetchJobsAndShiftsListBySiteIdMsw,
  fetchJobsAndShiftsListBySiteIdErrorMsw,
  fetchTourTemplatesBySiteIdMsw,
  fetchTourTemplatesBySiteIdErrorMsw,
  fetchTourTemplateByIdMsw,
  fetchTourTemplateByIdErrorMsw,
  fetchShiftDetailForAssignmentByIdMsw,
  fetchShiftDetailForAssignmentByIdErrorMsw,
  fetchShiftDetailForSplittingByIdMsw,
  fetchShiftDetailForSplittingByIdErrorMsw,
  fetchShiftDetailByIdMsw,
  fetchShiftDetailByIdErrorMsw,
  fetchShiftActivitiesByIdMsw,
  fetchShiftActivitiesByIdErrorMsw,
  fetchShiftLogsByIdMsw,
  fetchShiftLogsByIdErrorMsw,
  addNotesToShiftMsw,
  addNotesToShiftErrorMsw,
  editNotesOfShiftMsw,
  editNotesOfShiftErrorMsw,
  deleteNotesOfShiftMsw,
  deleteNotesOfShiftErrorMsw,
  deleteShiftByIdMsw,
  deleteShiftByIdErrorMsw,
  createTourTemplateMsw,
  createTourTemplateErrorMsw,
  assignShiftMsw,
  assignShiftErrorMsw,
  splitShiftMsw,
  splitShiftErrorMsw,
  deleteTourTemplateMsw,
  deleteTourTemplateErrorMsw,
  reassignShiftMsw,
  reassignShiftErrorMsw,
  getAllTypeOfSites,
];
