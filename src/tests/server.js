import { setupServer } from 'msw/node';
import { industryVerticals } from 'src/tests/industryVerticals/handler';
import { scoutingAPIHandlers } from 'src/tests/sales/scouting/handler';
import { salesUserDetailHandlers } from 'src/tests/sales/users/userDetails/handler';
import { settingsHandlers } from 'src/tests/settings/handler';
import { userHandlers } from 'src/tests/users/handler';

import { attendanceHandlers } from './attendance/handler';
import { handlers as franchiseHandler } from './franchise/handler/postHandler';
import { reportsHandler } from './reports/handler';
import { runsheetHandler } from './runsheets/handler';
import { dutyHandler } from './schedules/duty/handler';
import { sitesHandlers } from './sites/handler';
import { templatesHandler } from './template/handler';
import { vehicleHandlers } from './vehicles/handlers';
import { handlers } from './zones/zoneForm/postHandler';

export const mswServer = setupServer(
  ...handlers,
  ...templatesHandler,
  ...franchiseHandler,
  ...runsheetHandler,
  ...dutyHandler,
  ...reportsHandler,
  ...vehicleHandlers,
  ...sitesHandlers,
  ...userHandlers,
  ...attendanceHandlers,
  ...settingsHandlers,
  ...scoutingAPIHandlers,
  ...salesUserDetailHandlers,
  ...industryVerticals,
);
