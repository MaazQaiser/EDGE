export const ROOT = '/';
export const APP = '/app';

/**
 * OPEN ROUTES
 */
export const LOGIN = '/';
export const FORGOT_PASSWORD = '/forgot-password';
export const RESET_PASSWORD = '/reset-password/:token';
export const SALES_WEB_FAQS = `/faqs`;
export const SALES_MOBILE_FAQS = `/mobile/faqs`;

export const OBX_WEB_FAQS = `/obx/web/faqs`;
export const OBX_MOBILE_FAQS = `/obx/mobile/faqs`;

export const HO_WEB_FAQS = `/ho/web/faqs`;
export const HO_MOBILE_FAQS = `/ho/mobile/faqs`;

export const LOGOUT = '/logout';
export const NO_SERVER = `/noserver`;
export const NO_INTERNET = `/nointernet`;

export const PROBLEMS_REPORTED = '/report-a-problem';
export const PROBLEMS_REPORTED_DETAILS = `${PROBLEMS_REPORTED}/detail`;
export const PROBLEMS_REPORTED_DETAILS_ROUTE = `${PROBLEMS_REPORTED}/detail/:id`;
// DASHBOARD OBX
export const OBX = '/obx';

export const OBX_DASHBOARD = `${APP}${OBX}/dashboard`;
export const OBX_GEOFANCING = `${APP}${OBX}/geoFancing`;

export const COMMON_SETTING = `${APP}/settings`;
export const DESIGN_SYSTEM = `${APP}/design-system`;
export const OBX_NEW_USER_GROUP = `${APP}/settings/addNewUserGroup`;

const scheduleModule = 'schedules';
export const OBX_SCHEDULES = `${APP}${OBX}/${scheduleModule}`;
export const OBX_SCHEDULES_CREATE_EXTRA_DUTY = `${APP}${OBX}/${scheduleModule}/createExtraDuty`;

// OBX RunSheet routes
export const OBX_RUNSHEET = `${APP}${OBX}/runsheet`;
export const OBX_RUNSHEET_CREATE = `${OBX_RUNSHEET}/createRunsheet`;
export const OBX_ASSIGN_HITS = `${OBX_RUNSHEET}/assignHits`;
export const OBX_HITS_DETAILS = `${OBX_RUNSHEET}/details/:id`;
export const OBX_EDIT_RUNSHEET = `${OBX_RUNSHEET}/details/:id/editRunsheet`;

export const OBX_RUNSHEET_SPLIT = `${OBX_RUNSHEET}/:id/splitRunSheet`;

// OBX Dispatch routes
export const OBX_DISPATCH = `${APP}${OBX}/dispatch`;
export const OBX_DISPATCH_DETAILS = `${OBX_DISPATCH}/details`;
export const OBX_REPORT = `${APP}${OBX}`;
export const OBX_TOURE_REPORT_DISPATCH = `${OBX_REPORT}/create-report/:id`;
export const OBX_DISPATCH_DETAILS_ROUTE = `${OBX_DISPATCH}/details/:id`;
export const OBX_DISPATCH_ASSIGN_ROUTE = `${OBX_DISPATCH_DETAILS_ROUTE}/assign-officer`;
export const OBX_DISPATCH_RUNSHEET = `${OBX_DISPATCH}/runsheet`;
export const OBX_CREATE_DISPATCH = `${OBX_DISPATCH}/create-dispatch`;
// export const OBX_DISPATCH_ASSIGN_OFFICER = `${OBX_DISPATCH}/assign-officer`;

// OBX Reports routes
export const OBX_REPORTS = `${APP}${OBX}/reports`;
export const OBX_REPORTS_DETAILS = `${APP}${OBX}/reports/:id`;

// OBX USER routes
const userModule = 'users';
export const OBX_USER = `${APP}${OBX}/${userModule}`;
export const OBX_USER_DETAIL = `${APP}${OBX}/${userModule}/userDetails`;
export const OBX_USER_DETAIL_ROUTE = `${APP}${OBX}/${userModule}/userDetails/:userId`;
export const OBX_USERS_CREATE_EXTRA_DUTY = `${APP}${OBX}/${userModule}/createExtraDuty`;
export const OBX_USERS_FORM_INFORMATION = `${APP}${OBX}/${userModule}/updateUserInformation`;
export const OBX_USERS_UPDATE_INFORMATION = `${APP}${OBX}/${userModule}/updateUserInformation/:id`;

export const OBX_ADD_HOLYDAY_GROUPS = `${APP}${OBX}/addHolidayGroup`;
export const OBX_HOLYDAY_GROUP = `${APP}${OBX}/holidayGroup/:id`;
export const OBX_VIEW_HOLIDAY_GROUP = `${APP}${OBX}/holidayGroup`;

// OBX ANALYTICS routes
export const OBX_ANALYTICS = `${APP}${OBX}/analytics`;

// OBX LeaderBoard routes
export const OBX_LEADERBOARD = `${APP}${OBX}/leaderboard`;

// OBX Devices routes
export const OBX_DEVICES = `${APP}${OBX}/devices`;

// MAP
export const OBX_FRANCHISE_MAP = `${APP}${OBX}/franchiseMap`;

// OBX SITES routes
const sitesModule = 'sites';
export const OBX_SITES = `${APP}${OBX}/${sitesModule}`;
export const OBX_SITES_DETAIL = `${APP}${OBX}/${sitesModule}/sitesDetail`;
export const OBX_SITES_DETAIL_ROUTE = `${OBX_SITES_DETAIL}/:id`;
export const OBX_SITES_CREATE_EXTRA_DUTY = `${APP}${OBX}/${sitesModule}/createExtraDuty`;

// OBX ZONES routes
const zonesModule = 'zones';
export const OBX_ZONES = `${APP}${OBX}/${zonesModule}`;
export const OBX_FRANCHISE_ZONE = `${APP}${OBX}/${zonesModule}/zoneUpdate`;
export const OBX_FRANCHISE_ZONE_UPDATE = `${APP}${OBX}/${zonesModule}/zoneUpdate/:id`;
export const OBX_ZONES_DETAIL = `${APP}${OBX}/${zonesModule}/zonesDetail`;
export const OBX_ZONES_DETAIL_ROUTE = `${OBX_ZONES_DETAIL}/:id`;
export const OBX_FRANCHISE_ZONE_CREATE = `${APP}${OBX}/${zonesModule}/zoneCreate`;

/**
 * OBX sites routes
 */
export const OBX_ZONE_SITE = `${APP}${OBX}/${sitesModule}/siteUpdate`;
export const OBX_ZONE_SITE_UPDATE = `${APP}${OBX}/${sitesModule}/siteUpdate/:id`;
export const OBX_ZONE_SITE_CREATE = `${APP}${OBX}/${sitesModule}/siteCreate`;

/**
 * OBX attendance routes
 */
const attendanceModule = 'leaveRequests';
export const OBX_ATTENDANCE = `${APP}${OBX}/${attendanceModule}`;
export const OBX_ATTENDANCE_DETAIL = `${APP}${OBX}/${attendanceModule}/detail`;
export const OBX_ATTENDANCE_DETAIL_ROUTE = `${OBX_ATTENDANCE_DETAIL}/:id`;

// OBX Vehicles routes
const vehicleModule = 'vehicles';
export const OBX_VEHICLES = `${APP}${OBX}/${vehicleModule}`;
export const OBX_VEHICLE_FORM = `${APP}${OBX}/${vehicleModule}/vehicle`;
export const OBX_VEHICLE_DETAIL = `${APP}${OBX}/${vehicleModule}/vehicleDetail`;
export const OBX_VEHICLE_DETAIL_ROUTE = `${OBX_VEHICLE_DETAIL}/:id`;
export const OBX_SETTINGS = `${APP}${OBX}/settings`;
export const OBX_INVOICES = `${APP}${OBX}/invoices`;
export const HO_INVOICES = `${APP}/ho/invoices`;

export const COMMON_SETTING_PREFERENCES = `${COMMON_SETTING}?activeTab=preferences`;

// OBX Setting
export const OBX_SETTING = `${APP}${OBX}/account-setting`;

// OBX Payroll
export const OBX_PAYROLL = `${APP}${OBX}/payroll`;
export const HO_PAYROLL = `${APP}/ho/payroll`;

// OBX Create
export const OBX_CREATE = `${APP}${OBX}/create`;

// OBX Release
export const OBX_RELEASE = `${APP}${OBX}/release`;
export const OBX_RELEASE_CONFIGURE = `${OBX_RELEASE}/configure`;
export const OBX_RELEASE_NOTES_DETAILS = `${OBX_RELEASE}/release-notes/:id`;
export const OBX_RELEASE_ADD = `${OBX_RELEASE}/add-release`;

// OBX create site
export const OBX_CREATE_SITE = `${OBX_SITES}/create-site`;

// OBX edit report
export const OBX_EDIT_REPORT = `${OBX_REPORTS}/edit/:reportId`;

// OBX tOUR REPORT
export const OBX_TOURE_REPORT = `${OBX_REPORTS}/edit/:reportId/:tourReportId?`;

export const PROFILE = `${APP}/settings/profile`;

export const NOTIFICATIONS = `${APP}/notifications`;

export const RELEASE_NOTIFICATIONS = `${NOTIFICATIONS}/release`;

// Sales Routes
export const SALES = '/sales';
export const SALES_DASHBOARD = `${APP}${SALES}/dashboard`;

const companiesModule = 'companies';
export const SALES_COMPANIES = `${APP}${SALES}/${companiesModule}`;
export const SALES_COMPANY = `${APP}${SALES}/${companiesModule}/company`;
export const SALES_COMPANY_DETAIL = `${SALES_COMPANY}/:id`;

export const SALES_LEADS_MAP = `${APP}${SALES}/leads-map`;

const locationsModule = 'locations';
export const SALES_LOCATIONS = `${APP}${SALES}/${locationsModule}`;
export const SALES_LOCATIONS_SETTINGS = `${APP}${SALES}/settings`;
export const SALES_LOCATION = `${APP}${SALES}/${locationsModule}/location`;
export const SALES_LOCATION_DETAIL = `${SALES_LOCATION}/:id`;

const dealsModule = 'deals';
export const SALES_DEALS = `${APP}${SALES}/${dealsModule}`;
export const SALES_DEAL = `${APP}${SALES}/${dealsModule}/deal`;
export const SALES_DEAL_DETAIL = `${SALES_DEAL}/:id`;

export const SALES_DEAL_DETAIL_CONTRACT_DETAIL = `${SALES_DEAL}/:id/contract/:franchiseId`;

export const SALES_INDUSTRY_VERTICALS = `${APP}${SALES}/industryVerticals`;
export const SALES_INDUSTRY_VERTICALS_DETAIL = `${APP}${SALES}/industryVerticals/:id/questions`;
export const SALES_QUESTION_BANK = `${SALES_INDUSTRY_VERTICALS}/:industryVerticalId/questionBank`;
export const SALES_QUESTION_BANK_CREATE = `${SALES_QUESTION_BANK}/create`;
export const SALES_QUESTION_BANK_EDIT = `${SALES_QUESTION_BANK}/edit/:id`;
export const SALES_QUESTION_BANK_EDIT_ROUTE = `${SALES_QUESTION_BANK}/edit`;

export const SALES_CONTRACT_CREATION = `${APP}${SALES}/contractCreation`;

const salesUserModule = 'users';
export const SALES_USERS = `${APP}${SALES}/${salesUserModule}`;
export const SALES_USER_DETAIL = `${APP}${SALES}/${salesUserModule}/detail`;
export const SALES_USER_DETAIL_ROUTE = `${SALES_USER_DETAIL}/:id`;

const contactsModule = 'contacts';
export const SALES_CONTACTS = `${APP}${SALES}/${contactsModule}`;
export const SALES_CONTACT_DETAILS = `${APP}${SALES}/${contactsModule}/detail`;

export const SETTING = `${APP}/account-setting`;
export const SALES_SETTING = `${APP}/settings`;

export const COMMON_SETTING_MAPPING_PREFERENCE = `${COMMON_SETTING}?activeTab=mappingPreference`;

const ScoutingModule = 'scouting';
export const SALES_SCOUTING = `${APP}${SALES}/${ScoutingModule}`;

// DASHBOARD Home Office
export const HOME_OFFICE = '/ho';
export const GEO_FENCING = `${APP}/geo-fencing`;
export const HO_DASHBOARD = `${APP}${HOME_OFFICE}/dashboard`;
export const SALES_DASHBOARD_DETAILS = `${APP}${SALES}/dashboard/detail`;
export const SALES_DASHBOARD_DETAILS_ROUTE = `${SALES_DASHBOARD_DETAILS}/:id`;

export const SALES_DASHBOARD_PROPOSAL_WON = `${APP}${SALES}/dashboard/proposal-won`;

export const SALES_DASHBOARD_PROPOSAL_LOST = `${APP}${SALES}/dashboard/proposal-lost`;

export const SALES_DASHBOARD_SALES_PERSON_INSIGHTS = `${APP}${SALES}/dashboard/sales-person-insight`;

export const SALES_DASHBOARD_DECISION_MAKING = `${APP}${SALES}/dashboard/decision-making`;

const franchiseModule = 'franchises';
export const HO_FRANCHISE_LISTING = `${APP}${HOME_OFFICE}/${franchiseModule}`;
export const HO_FRANCHISE_UPDATE = `${APP}${HOME_OFFICE}/${franchiseModule}/franchiseUpdate`;
export const HO_FRANCHISE_UPDATE_ROUTE = `${HO_FRANCHISE_UPDATE}/:id`;
export const HO_FRANCHISE_DETAIL = `${APP}${HOME_OFFICE}/${franchiseModule}/franchiseDetail`;
export const HO_FRANCHISE_DETAIL_ROUTE = `${HO_FRANCHISE_DETAIL}/:id`;

export const HO_SETTINGS = `${APP}${HOME_OFFICE}/settings`;
export const HO_TEMPLATE_CREATE = `${APP}${HOME_OFFICE}/template/create`;
export const HO_TEMPLATE_UPDATE = `${APP}${HOME_OFFICE}/template/update`;
export const HO_TEMPLATE_UPDATE_ROUTE = `${HO_TEMPLATE_UPDATE}/:id`;
export const HO_TEMPLATE_PREVIEW = `${APP}${HOME_OFFICE}/template/preview`;
export const HO_TEMPLATE_PREVIEW_ROUTE = `${HO_TEMPLATE_PREVIEW}/:id`;

export const HO_COUNTRY_CONFIGURATION_CREATE = `${APP}${HOME_OFFICE}/countryConfiguration/create`;
export const HO_COUNTRY_CONFIGURATION_PREVIEW = `${APP}${HOME_OFFICE}/countryConfiguration/preview`;
export const HO_COUNTRY_CONFIGURATION_HO_COUNTRY_CONFIGURATION_PREVIEW_ROUTE = `${HO_COUNTRY_CONFIGURATION_PREVIEW}/:id`;
export const HO_COUNTRY_CONFIGURATION_UPDATE = `${APP}${HOME_OFFICE}/countryConfiguration/update`;
export const HO_COUNTRY_CONFIGURATION_UPDATE_ROUTE = `${HO_COUNTRY_CONFIGURATION_UPDATE}/:id`;

export const HO_SITES_DETAIL = `${APP}${HOME_OFFICE}/${sitesModule}/sitesDetail`;
export const HO_SITES_DETAIL_ROUTE = `${HO_SITES_DETAIL}/:id`;

export const HO_SITES_CREATE_EXTRA_DUTY = `${APP}${HOME_OFFICE}/${sitesModule}/createExtraDuty`;

// HO USER route
export const HO_USER = `${APP}${HOME_OFFICE}/users`;
export const HO_VIEW_SIGNAL_MAP = `${APP}${HOME_OFFICE}/franchiseMap`;
