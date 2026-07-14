import argentinaFlag from 'assets/flags/argentina.svg';
import australiaFlag from 'assets/flags/australia.svg';
import germanyFlag from 'assets/flags/germany.svg';
import ukFlag from 'assets/flags/uk.svg';
import usaFlag from 'assets/flags/usa.png';

import {
  HO_FRANCHISE_LISTING,
  OBX_DASHBOARD,
  OBX_DISPATCH,
  OBX_ZONES,
  SALES_DASHBOARD,
} from '../../app/router/constant/ROUTE';

export const paginationOptions = {
  perPageOptions: [10, 20, 30, 40, 50, 100],
  perPageRows: 10,
  defaultPerPage: 1,
};
export const localStorageKeys = {
  franchiseId: 'franchiseId',
};

export const geoFencingPolygonTypeKeys = {
  zones: 'zoneArea',
  sites: 'siteArea',
  franchise: 'franchiseArea',
  siteLocation: 'siteLocation',
  franchiseLocation: 'franchiseLocation',
  zoneLocation: 'zoneLocation',
};

export const geofenceName = {
  franchiseName: 'franchiseName',
};

export const polygonNameOptions = [geofenceName.franchiseName];
export const polygonlocationTypes = [
  geoFencingPolygonTypeKeys.zoneLocation,
  geoFencingPolygonTypeKeys.franchiseLocation,
  geoFencingPolygonTypeKeys.siteLocation,
];

export const polygonCoordinatesKey = [
  geoFencingPolygonTypeKeys.zones,
  geoFencingPolygonTypeKeys.sites,
  geoFencingPolygonTypeKeys.franchise,
];

export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
};

export const dashboardOptions = {
  ops: 'OPS',
  sale: 'SALES',
};
export const organizationLevels = [
  { label: 'Franchise Level', value: 'Franchise' },
  { label: 'Home Office Level', value: 'HomeOfficer' },
];

export const organizationLevelsObject = { franchise: 'Franchise', HO: 'Home Office' };

export const supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png'];
export const supportedFileFormats = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/mpeg',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'application/pdf',
];
export const SUPPORT_TICKETS_URL = 'https://support.teamsignal.com/tickets-view/new';

export const pdfFileFormats = ['application/pdf'];

export const videoFileFormats = [
  'video/mp4',
  'video/mpeg',
  'video/avi',
  'video/mov',
  'video/quicktime',
];

export const allowedFileExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.mp4',
  '.avi',
  '.mov',
  '.pdf',
];
export const allowedImageExtensions = ['.png, .jpg, .jpeg, .svg'];

export const ckEditorDefaultToolbarConfigs = ['bold', 'italic', 'numberedList', 'bulletedList'];

export const maxFileSize = 25 * 1024 * 1024;

export const DEFAULT_TIMEZONE = 'America/New_York';

export const rolableTypeEnum = {
  home_officer: 'HomeOfficer',
  franchise: 'Franchise',
  advanced_officer: 'AdvancedOfficer',
};

export const rolesEnumWithName = {
  supervisor: {
    slug: 'supervisor',
    name: 'Supervisor',
  },
  home_officer: { slug: 'home_officer', name: 'Home Office' },
  ho_agent: { slug: 'ho_agent', name: 'Home Office Agent' },
  franchise_owner: { slug: 'franchise_owner', name: 'Franchise Owner' },
  sales_person: { slug: 'sales_person', name: 'Sales Person' },
  coordinator: { slug: 'coordinator', name: 'Coordinator' },
  director: { slug: 'director', name: 'Director' },
  officer: { slug: 'officer', name: 'Officer' },
  advanced_officer: { slug: 'advanced_officer', name: 'Advanced Officer' },
};

export const allowReportProblemToHO = [
  rolesEnumWithName.ho_agent.slug,
  rolesEnumWithName.home_officer.slug,
  rolesEnumWithName.sales_person.slug,
];
export const allowReportProblemToFO = [
  rolesEnumWithName.supervisor.slug,
  rolesEnumWithName.officer.slug,
  rolesEnumWithName.franchise_owner.slug,
  rolesEnumWithName.coordinator.slug,
  rolesEnumWithName.director.slug,
  rolesEnumWithName.advanced_officer.slug,
];

export const deviceTypeEnum = {
  nfc: 'NFC',
  beacon: 'Beacon',
  qr: 'QR Code',
  image: 'Image',
  gps: 'GPS',
  qrCode: 'qr',
};

export const TEMPLATE_TYPES = {
  'Equipment Inspection': 'equipmentInspection',
  'Vehicle Inspection': 'vehicleInspection',
  'Tour Reports': 'tourReports',
  'Shift Day End Report': 'shiftDayEndReport',
  'Incident Report': 'incidentReport',
  equipmentInspection: 'Equipment Inspection',
  vehicleInspection: 'Vehicle Inspection',
  tourReports: 'Tour Reports',
  shiftEndReport: 'Shift End Report',
  shiftDayEndReport: 'Shift Day End Report',
  incidentReport: 'Incident Report',
};

export const handleAuthRedirection = (userSlug) => {
  switch (userSlug) {
    case rolesEnumWithName.sales_person.slug:
      return SALES_DASHBOARD;

    case rolesEnumWithName.home_officer.slug:
      return HO_FRANCHISE_LISTING;

    case rolesEnumWithName.franchise_owner.slug:
      return OBX_DASHBOARD;

    case rolesEnumWithName.coordinator.slug:
      return OBX_DASHBOARD;

    case rolesEnumWithName.director.slug:
      return OBX_DASHBOARD;

    case rolesEnumWithName.supervisor.slug:
      return OBX_ZONES;

    case rolesEnumWithName.officer.slug:
      return OBX_ZONES;

    case rolesEnumWithName.advanced_officer.slug:
      return OBX_ZONES;

    case rolesEnumWithName.ho_agent.slug:
      return OBX_DISPATCH;

    // Add more cases as needed for other user roles

    default:
      // Handle the default case if userSlug doesn't match any of the specified cases
      return '/';
  }
};

/**
 * Stepper Stages status
 */
export const stageStatus = {
  COMPLETED: 'completed',
  CURRENT: 'current',
  PENDING: 'pending',
};

/**
 * Toast message settings
 */
export const toastSettings = {
  AUTO_CLOSE: 3000,
};

/**
 * default avatar
 */

export const defaultImage = `https://signalassets.blob.core.windows.net/signal/assets/Avatar.svg`;
export const defaultVehicleImage = `https://signalassets.blob.core.windows.net/signal/assets/vehicle-default.svg`;
export const defaultMapZoom = 10;
export const mapZoomedInValue = 15;

export const leadsMapCreateLocationMarker =
  'https://signalassets.blob.core.windows.net/signal/assets/add_location_alt_FILL1_wght400_GRAD0_op.svg';
export const leadsMapLocationsIcons = {
  old: 'https://signalassets.blob.core.windows.net/signal/Flags/greencircle.svg',
  lost: 'https://signalassets.blob.core.windows.net/signal/Flags/redcirlce.svg',
  existing: 'https://signalassets.blob.core.windows.net/signal/Flags/cirlceIcon.svg',
  new: 'https://signalassets.blob.core.windows.net/signal/Flags/blackCircleIcon.svg',
};

export const runSheetIcons = {
  runsheetDispatchIcon: 'https://signalassets.blob.core.windows.net/signal/assets/dispatch_hit.svg',
  existingHitBlueIcon:
    'https://signalassets.blob.core.windows.net/signal/assets/ExistingHitIcon.svg',
  runSheetPatrolGreenIcon: 'https://signalassets.blob.core.windows.net/signal/assets/greenPIN.png',
  addedHitGreenicon: 'https://signalassets.blob.core.windows.net/signal/assets/AddedHitIcon.svg',
  deletedHitRedIcon: 'https://signalassets.blob.core.windows.net/signal/assets/deletedHitIcon.svg',
  runsheetWaveIcon: 'https://signalassets.blob.core.windows.net/signal/assets/RunsheetIcon.svg',
  startEndLocationIconBlack:
    'https://signalassets.blob.core.windows.net/signal/assets/Group_1000003081.svg',
  runsheetMapBluePointerIconForDirectionsServiceRes:
    'https://signalassets.blob.core.windows.net/signal/assets/Union.svg',
  runsheetMissedHitsIcon: 'https://signalassets.blob.core.windows.net/signal/assets/mapicons.svg',
  runsheetCarIcon: 'https://signalassets.blob.core.windows.net/signal/assets/Signal_Car.png',
  runsheetSitePinIcon: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
  sitePlaceholder: 'https://signalassets.blob.core.windows.net/signal/assets/Site-Placeholder.png',
  hitGreyIcon: 'https://signalassets.blob.core.windows.net/signal/assets/map_icons.svg',
  runSheetDedicatedOfficer:
    'https://signalassets.blob.core.windows.net/signal/assets/Dedicated_Officer.png',
  runsheetFranchiseIcon:
    'https://signalassets.blob.core.windows.net/signal/assets/FranchisesPin.svg',
  franchiseIcon:
    'https://signalassets.blob.core.windows.net/signal/assets/liveTrackingFranchiseIcon.svg',
  liveTrackingCarIcon:
    'https://signalassets.blob.core.windows.net/signal/assets/liveTrackingCarIcon.svg',
};

export const runsheetDefaultPolyline = { strokeColor: '#146eff', strokeWeight: 3.5 };
export const visitedPolyline = { strokeColor: '#31a150', strokeWeight: 3.5 };

export const placesMap = {
  accounting: 'Accounting',
  airport: 'Airport',
  amusement_park: 'Amusement Park',
  aquarium: 'Aquarium',
  art_gallery: 'Art Gallery',
  atm: 'ATM',
  bakery: 'Bakery',
  bank: 'Bank',
  bar: 'Bar',
  beauty_salon: 'Beauty Salon',
  bicycle_store: 'Bicycle Store',
  book_store: 'Book Store',
  bowling_alley: 'Bowling Alley',
  bus_station: 'Bus Station',
  cafe: 'Cafe',
  campground: 'Campground',
  car_dealer: 'Car Dealer',
  car_rental: 'Car Rental',
  car_repair: 'Car Repair',
  car_wash: 'Car Wash',
  casino: 'Casino',
  cemetery: 'Cemetery',
  church: 'Church',
  city_hall: 'City Hall',
  clothing_store: 'Clothing Store',
  convenience_store: 'Convenience Store',
  courthouse: 'Courthouse',
  dentist: 'Dentist',
  department_store: 'Department Store',
  doctor: 'Doctor',
  drugstore: 'Drugstore',
  electrician: 'Electrician',
  electronics_store: 'Electronics Store',
  embassy: 'Embassy',
  fire_station: 'Fire Station',
  florist: 'Florist',
  funeral_home: 'Funeral Home',
  furniture_store: 'Furniture Store',
  gas_station: 'Gas Station',
  gym: 'Gym',
  hair_care: 'Hair Care',
  hardware_store: 'Hardware Store',
  hindu_temple: 'Hindu Temple',
  home_goods_store: 'Home Goods Store',
  hospital: 'Hospital',
  insurance_agency: 'Insurance Agency',
  jewelry_store: 'Jewelry Store',
  laundry: 'Laundry',
  lawyer: 'Lawyer',
  library: 'Library',
  light_rail_station: 'Light Rail Station',
  liquor_store: 'Liquor Store',
  local_government_office: 'Local Government Office',
  locksmith: 'Locksmith',
  lodging: 'Lodging',
  meal_delivery: 'Meal Delivery',
  meal_takeaway: 'Meal Takeaway',
  mosque: 'Mosque',
  movie_rental: 'Movie Rental',
  movie_theater: 'Movie Theater',
  moving_company: 'Moving Company',
  museum: 'Museum',
  night_club: 'Night Club',
  painter: 'Painter',
  park: 'Park',
  parking: 'Parking',
  pet_store: 'Pet Store',
  pharmacy: 'Pharmacy',
  physiotherapist: 'Physiotherapist',
  plumber: 'Plumber',
  police: 'Police',
  post_office: 'Post Office',
  primary_school: 'Primary School',
  real_estate_agency: 'Real Estate Agency',
  restaurant: 'Restaurant',
  roofing_contractor: 'Roofing Contractor',
  rv_park: 'RV Park',
  school: 'School',
  secondary_school: 'Secondary School',
  shoe_store: 'Shoe Store',
  shopping_mall: 'Shopping Mall',
  spa: 'Spa',
  stadium: 'Stadium',
  storage: 'Storage',
  store: 'Store',
  subway_station: 'Subway Station',
  supermarket: 'Supermarket',
  synagogue: 'Synagogue',
  taxi_stand: 'Taxi Stand',
  tourist_attraction: 'Tourist Attraction',
  train_station: 'Train Station',
  transit_station: 'Transit Station',
  travel_agency: 'Travel Agency',
  university: 'University',
  veterinary_care: 'Veterinary Care',
  zoo: 'Zoo',
};

export const colorCodesLocation = {
  new: {
    key: 'new',
    value: '#262527',
  },
  old: {
    key: 'old',
    value: '#31A150',
  },
  lost: {
    key: 'lost',
    value: '#E43F32',
  },
  existing: {
    key: 'existing',
    value: '#146DFF',
  },
};

export const CONST_CREATE_RUNSHEET = 'createRunsheet';
export const CONST_EDIT_RUNSHEET = 'editRunsheet';
export const CONST_SPLIT_RUNSHEET = 'splitRunSheet';
export const CONST_RE_ORDER_HITS = 'Re-Order Hits';
export const CONST_RUNSHEET_SELECT_HITS = 'Select Hits';
export const CONST_SPLIT_RUNSHEET_ASSIGN_OFFICER = 'Assign';

export const daysOfWeekWithVal = (t) => [
  { label: t('days.monday'), value: 1 },
  { label: t('days.tuesday'), value: 2 },
  { label: t('days.wednesday'), value: 3 },
  { label: t('days.thursday'), value: 4 },
  { label: t('days.friday'), value: 5 },
  { label: t('days.saturday'), value: 6 },
  { label: t('days.sunday'), value: 0 },
];

export const sortDaysOfWeek = (dayLabels, orderedWeekdays) => {
  const orderedLabels = (orderedWeekdays || []).map((day) =>
    (day?.label ?? day ?? '').toLowerCase(),
  );
  const getSortIndex = (dayLabel) => {
    const index = orderedLabels.indexOf((dayLabel || '').toLowerCase());
    return index === -1 ? orderedLabels.length : index;
  };
  return [...(dayLabels || [])].sort(
    (firstDay, secondDay) => getSortIndex(firstDay) - getSortIndex(secondDay),
  );
};

export const googleMapStyles = [
  {
    featureType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.country',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.locality',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road.highway',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'water',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.province',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
];

export const VisitorStatusEnum = {
  banned: 'Banned',
  allowed: 'Allowed',
};
export const BanUnban = {
  ban: 'ban',
  unBan: 'unBan',
};

export const LoaderBanUnban = {
  ban: 'ban',
  unBan: 'unBan',
};

export const LoaderStatusEnum = {
  banned: 'Banned',
  allowed: 'Allowed',
};

export const visitorLoadCategory = {
  visitor: 'visitor',
  truckLoad: 'truckLoad',
};

export const MAX_3_DIGIT_VALUE = 999;
export const MAX_4_DIGIT_VALUE = 9999;
export const MAX_5_DIGIT_VALUE = 99999;

export const enumStatusReport = {
  notSubmitted: 'notSubmitted',
  submitted: 'submitted',
  accepted: 'accepted',
  rejected: 'rejected',
};

export const officerUnavailabilityReason = {
  OFFLINE: 'offline',
  ASSIGNED: 'assigned',
  NOT_IN_ZONE: 'notInZone',
  ON_LEAVE: 'onLeave',
  AVAILABLE: 'available',
  TERMINATED: 'terminated',
};

export const resetAvailabilityData = [
  {
    id: 1,
    day: 'Monday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 2,
    day: 'Tuesday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 3,
    day: 'Wednesday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 4,
    day: 'Thursday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 5,
    day: 'Friday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 6,
    day: 'Saturday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
  {
    id: 7,
    day: 'Sunday',
    startTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
    endTime: {
      value: '12:00 AM',
      label: '12:00 AM',
    },
  },
];

export const contractStatusEnum = {
  ACTIVE: 'active',
  TERMINATED: 'terminated',
  EXPIRED: 'expired',
};

/**
 * Attachment settings
 */
export const attachmentSettings = {
  ACCEPT: '.pdf, .doc, .docx, jpg, .jpeg, .png, .gif, .mp4, .mov, .m4v',
  FILE_SIZE_LIMIT: 20, //mb
};

export const DUTY_TYPES = {
  dedicated: 'Dedicated',
  patrol: 'Patrol',
  hybrid: 'Hybrid',
  extra: 'Extra',
  dispatch: 'Dispatch',
};

export const _statusEnum = (t) => ({
  onTime: { title: t('dispatchStatus.onTime'), color: 'warning' },
  lateStarted: { title: t('dispatchStatus.lateStarted'), color: 'warning' },
  present: { title: t('dispatchStatus.present'), color: 'success', statusClass: 'callReceived' },
  inProgress: {
    title: t('dispatchStatus.inProgress'),
    color: 'primary',
    statusClass: 'callReceived',
  },
  available: { title: t('dispatchStatus.available'), color: 'warning', statusClass: 'available' },
  upcoming: { title: t('dispatchStatus.upComing'), color: 'warning', statusClass: 'onSite' },
  notStarted: { title: t('dispatchStatus.notStarted'), color: 'error', statusClass: 'notStarted' },
  clockedIn: {
    title: t('dispatchStatus.clockedIn'),
    color: 'error',
    statusClass: 'reportCompleted',
  },
  onLeave: { title: t('dispatchStatus.onLeave') },
  dedicated: t('dispatchStatus.dedicated'),
  earlyLeft: t('dispatchStatus.earlyLeft'),
  dispatch: t('dispatchStatus.dispatch'),
  completed: t('dispatchStatus.completed'),
  extra: t('dispatchStatus.extra'),
  escalated: t('dispatchStatus.escalated'),
  leaveApproved: t('dispatchStatus.leaveApproved'),
  missedCheckpoint: t('dispatchStatus.missedCheckpoint'),
  missedReport: t('dispatchStatus.missedReport'),
  overTime: t('dispatchStatus.overTime'),
  breakStarted: t('dispatchStatus.breakStarted'),
  breakEnded: t('dispatchStatus.breakEnded'),
  shiftStarted: t('dispatchStatus.shiftStarted'),
  shiftEnded: t('dispatchStatus.shiftEnded'),
  petrol: t('dispatchStatus.petrol'),
  leaveApplied: t('dispatchStatus.leaveApplied'),
});

export const enumResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  dropdown: 8,
  attachments: 9,
  webCam: 10,
  description: 11,
  phone: 12,
  signature: 13,
};

export const enumDynamicForm = {
  dynamicFormField: 'dynamicFormField',
};

export const dataReportCheckPointShiftSummary = {
  title: 'Checkpoint Summary Report',
  reportId: 'Data',
  jsonReturn: true,
};

export const dataReportShiftSummary = {
  title: 'Shift Summary Report',
  reportId: 'Data',
  jsonReturn: true,
};

export const siteReportSummary = {
  title: 'Site Summary Report',
  reportId: 'Data',
};

export const dataShiftTourReports = {
  title: 'Shift Tour Reports',
  reportId: 'Data',
};

export const runsheetDayEndReport = (label) => {
  return {
    title: `${label} Summary Report`,
    reportId: 'Data',
  };
};

export const enumUserRolesTokenApi = [
  'home_officer',
  'sales_person',
  'intern',
  'MarketsManager',
  'ho_agent',
];

export const franchiseIdUrlQueryParam = 'franchiseId';
export const franchiseTimeZone = 'tz';

export const timeZoneKeyUrlQueryParam = 'tz';

export const countries = [
  {
    country: { label: 'Germany', value: 'Germany', image: germanyFlag },
    code: 'DE',
    phoneCode: '+49',
  },
  {
    country: {
      label: 'United Kingdom',
      value: 'United Kingdom',
      image: ukFlag,
    },
    code: 'GB',
    phoneCode: '+44',
  },
  {
    country: {
      label: 'Australia',
      value: 'Australia',
      image: australiaFlag,
    },
    code: 'AU',
    phoneCode: '+61',
  },
  {
    country: {
      label: 'USA',
      value: 'USA',
      image: usaFlag,
    },
    code: 'US',
    phoneCode: '+1',
  },
  {
    country: {
      label: 'Argentina',
      value: 'Argentina',
      image: argentinaFlag,
    },
    code: 'AR',
    phoneCode: '+54',
  },
];

export const dateFormats = [
  {
    name: 'mm/dd/yyyy',
    id: 'mm/dd/yyyy',
  },
  {
    name: 'dd/mm/yyyy',
    id: 'dd/mm/yyyy',
  },
  {
    name: 'yyyy/dd/mm',
    id: 'yyyy/dd/mm',
  },
  {
    name: 'yyyy/mm/dd',
    id: 'yyyy/mm/dd',
  },
  {
    name: 'mm.dd.yyyy',
    id: 'mm.dd.yyyy',
  },
  {
    name: 'dd.mm.yyyy',
    id: 'dd.mm.yyyy',
  },
  {
    name: 'yyyy.dd.mm',
    id: 'yyyy.dd.mm',
  },
  {
    name: 'yyyy.mm.dd',
    id: 'yyyy.mm.dd',
  },
  {
    name: 'mm-dd-yyyy',
    id: 'mm-dd-yyyy',
  },
  {
    name: 'dd-mm-yyyy',
    id: 'dd-mm-yyyy',
  },
  {
    name: 'yyyy-dd-mm',
    id: 'yyyy-dd-mm',
  },
  {
    name: 'yyyy-mm-dd',
    id: 'yyyy-mm-dd',
  },
];

export const franchiseIdSource = {
  url: 'url',
  redux: 'redux',
};

export const PaymentTerms = (t) => [
  {
    value: 'Due upon receipt',
    label: t('obx.sites.createSite.dueUponReceipt'),
    dueDays: 0,
  },
  {
    value: 'NET07',
    label: 'NET07',
    dueDays: 7,
  },
  {
    value: 'NET10',
    label: 'NET10',
    dueDays: 10,
  },
  {
    value: 'NET14',
    label: 'NET14',
    dueDays: 14,
  },
  {
    value: 'NET15',
    label: 'NET15',
    dueDays: 15,
  },
  {
    value: 'NET30',
    label: 'NET30',
    dueDays: 30,
  },
  {
    value: 'NET45',
    label: 'NET45',
    dueDays: 45,
  },
  {
    value: 'NET60',
    label: 'NET60',
    dueDays: 60,
  },
  {
    value: 'NET90',
    label: 'NET90',
    dueDays: 90,
  },
];

export const billingFrequency = (t) => [
  { id: 1, label: t('obx.sites.createSite.frequency.monthly'), value: 'monthly' },
  { id: 2, label: t('obx.sites.createSite.frequency.biWeekly'), value: 'bi_weekly' },
  { id: 3, label: t('obx.sites.createSite.frequency.weekly'), value: 'weekly' },
  { id: 4, label: t('obx.sites.createSite.frequency.semiMonthly'), value: 'semi_monthly' },
  // { id: 5, label: t('obx.billing.frequency.event'), value: 'event' },
  // { id: 6, label: t('obx.billing.frequency.flat'), value: 'flat' },
];

export const billingFrequencyType = (t) => [
  { id: 1, label: t('obx.sites.createSite.billingTypeOptions.preBill'), value: 'pre_bill' },
  { id: 2, label: t('obx.sites.createSite.billingTypeOptions.postBill'), value: 'post_bill' },
];

export const contractTenureTypes = (t) => [
  { id: 1, label: t('obx.contracts.contractTenureTypes.temporary'), value: 'temporary' },
  { id: 2, label: t('obx.contracts.contractTenureTypes.ongoing'), value: 'ongoing' },
  { id: 3, label: t('obx.contracts.contractTenureTypes.eventBased'), value: 'event_based' },
];

export const directionServiceErrors = {
  invalidRequest: 'INVALID_REQUEST',
  zeroResults: 'ZERO_RESULTS',
};

export const regexValues = {
  price: /^\d*(\.\d{0,2})?$/,
};

export const accessControlList = {
  salesDashboard: {
    create: false,
    view: false,
    type: 'SET',
    update: false,
    delete: false,
  },
  franchises: {
    type: 'FO',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  obxDashboard: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  leaveRequest: {
    type: 'FO',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  hoDashboard: {
    create: false,
    view: false,
    update: false,
    delete: false,
    type: 'FO',
  },
  analytics: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  leaderBoard: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  franchiseMap: {
    create: false,
    view: false,
    type: 'FO',
    update: false,
    delete: false,
  },
  vehicles: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  devices: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  companies: {
    type: 'SET',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  locations: {
    type: 'SET',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  deals: {
    type: 'SET',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  zones: {
    type: 'FO',
    create: false,
    view: false,
    update: false,
    delete: false,
  },
  sites: {
    create: false,
    view: false,
    update: false,
    type: 'FO',
    delete: false,
    attendance: {
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    contracts: {
      create: false,
      view: false,
      type: 'FO',
      update: false,
      delete: false,
    },
    jobs: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    extraJobs: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    schedules: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    reportTemplates: {
      create: false,
      type: 'FO',
      view: false,
      update: false,
      delete: false,
    },
    siteInstructions: {
      create: false,
      type: 'FO',
      view: false,
      update: false,
      delete: false,
    },
    locations: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    devices: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    checkpoints: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    visitorLogs: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    visitorLoadLogs: {
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    visitorLoadTemplates: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
    officerVisitorLoadManagementAccess: {
      create: false,
      view: false,
      type: 'FO',
      update: false,
      delete: false,
    },
    billings: {
      type: 'FO',
      create: false,
      view: false,
      update: false,
      delete: false,
    },
  },
  schedules: {
    create: false,
    view: false,
    type: 'FO',
    update: false,
    delete: false,
  },
  scoutingRoutes: {
    create: false,
    view: false,
    type: 'SET',
    update: false,
    delete: false,
  },
  industryVerticals: {
    create: false,
    view: false,
    type: 'SET',
    update: false,
    delete: false,
  },
  shiftReports: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  users: {
    create: false,
    view: false,
    update: false,
    delete: false,
    type: 'FO',
    userInformation: {
      create: false,
      type: 'FO',
      view: false,
      update: false,
      delete: false,
      attendances: {
        type: 'FO',
        create: false,
        view: false,
        update: false,
        delete: false,
      },
      availability: {
        type: 'FO',
        create: false,
        view: false,
        update: false,
        delete: false,
      },
      permissions: {
        type: 'FO',
        create: false,
        view: false,
        update: false,
        delete: false,
      },
    },
    obxForm: {
      type: 'FO',
      create: false,
      view: false,
    },
  },
  timeOffRequests: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  leadsMap: {
    create: false,
    view: false,
    update: false,
    type: 'SET',
    delete: false,
  },
  contacts: {
    create: false,
    view: false,
    type: 'SET',
    update: false,
    delete: false,
  },
  runsheets: {
    create: false,
    view: false,
    update: false,
    delete: false,
    type: 'FO',
  },
  payrolls: {
    create: false,
    view: false,
    update: false,
    delete: false,
    type: 'FO',
  },
  invoices: {
    create: false,
    view: false,
    update: false,
    delete: false,
    type: 'FO',
  },
  settings: {
    type: 'FO',
    create: false,
    view: false,
    update: false,
    delete: false,
    preferences: {
      create: false,
      view: false,
      type: 'FO',
      update: false,
      delete: false,
      thresholdValues: {
        create: false,
        view: false,
        update: false,
        type: 'FO',
        delete: false,
      },
      notifications: {
        create: false,
        view: false,
        type: 'FO',
        update: false,
        delete: false,
      },
      breakRules: {
        create: false,
        view: false,
        update: false,
        type: 'FO',
        delete: false,
      },
      systemDefault: {
        create: false,
        view: false,
        type: 'FO',
        update: false,
        delete: false,
      },
      extraServicesCharges: {
        create: false,
        view: false,
        type: 'FO',
        update: false,
        delete: false,
      },
      runsheetSettings: {
        create: false,
        type: 'FO',
        view: false,
        update: false,
        delete: false,
      },
      invoiceSettings: {
        create: false,
        view: false,
        update: false,
        type: 'FO',
        delete: false,
      },
    },
    reportTemplates: {
      create: false,
      type: 'FO',
      view: false,
      update: false,
      delete: false,
    },
    mappingPreference: {
      create: false,
      view: false,
      update: false,
      type: 'FO',
      delete: false,
      locationsData: {
        create: false,
        view: false,
        update: false,
        type: 'FO',
        delete: false,
      },
      deals: {
        create: false,
        view: false,
        update: false,
        type: 'FO',
        delete: false,
      },
    },
    userGroups: {
      create: false,
      view: false,
      type: 'FO',
      update: false,
      delete: false,
    },
    rolesAndPermissions: {
      create: false,
      view: false,
      update: false,
      type: 'FO',
      delete: false,
    },
  },
  dispatch: {
    create: false,
    type: 'FO',
    view: false,
    update: false,
    delete: false,
  },
  others: {
    create: false,
    view: false,
    update: false,
    type: 'FO',
    delete: false,
    employeeRate: {
      create: false,
      view: false,
      update: false,
      type: 'FO',
      delete: false,
    },
    siteRate: {
      create: false,
      view: false,
      update: false,
      delete: false,
      type: 'FO',
    },
    contractRate: {
      create: false,
      view: false,
      update: false,
      delete: false,
      type: 'FO',
    },
  },
  mobileExperiences: {
    create: false,
    view: false,
    update: false,
    type: 'FO',
    delete: false,
    scheduling: {
      create: false,
      view: false,
      type: 'FO',
      update: false,
      delete: false,
    },
  },
  mobileApp: {
    view: false,
    type: 'FO',
    supervision: {
      view: false,
      type: 'FO',
    },
    jobExecution: {
      view: false,
      type: 'FO',
    },
  },
};

export const frequencyBillingEnum = {
  monthly: {
    label: 'Monthly',
    value: 'monthly',
    color: 'success',
    statusClass: 'monthly',
    icon: '',
  },
  semi_monthly: {
    statusClass: 'semi_monthly',
    label: 'Semi Monthly',
    value: 'semi_monthly',
    color: 'primary',
    icon: '',
  },
  bi_weekly: {
    label: 'Bi Weekly',
    value: 'bi_weekly',
    color: 'primary',
    icon: '',
    statusClass: 'bi_weekly',
  },
  weekly: {
    label: 'Weekly',
    value: 'weekly',
    color: 'primary',
    icon: '',
    statusClass: 'weekly',
  },
};

export const BREAK_DURATION = [
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1 hour 15 minutes', value: '75' },
  { label: '1 hour 30 minutes', value: '90' },
  { label: '1 hour 45 minutes', value: '105' },
  { label: '2 hours', value: '120' },
];

export const CONTRACT_TYPES = {
  FLAT_BILL: 'flat_bill',
};

export const HOLIDAY_RATE_TYPES = {
  MULTIPLIER_RATE: 'multiplier',
  FLAT_RATE: 'flat_rate',
};

export const HOLIDAY_RATE_FIELDS = {
  HOLIDAY_RATE: 'holidayRate',
  HOLIDAY_FLAT_RATE: 'holidayFlatRate',
  HOLIDAY_RATE_TYPE: 'holidayRateType',
  HOLIDAY_MULTIPLIER: 'holidayMultiplier',
};

export const canadianAreaCodes = [
  '368',
  '587',
  '403',
  '825',
  '780',
  '250',
  '672',
  '604',
  '778',
  '236',
  '431',
  '204',
  '584',
  '428',
  '506',
  '879',
  '709',
  '867',
  '782',
  '902',
  '867',
  '249',
  '647',
  '519',
  '343',
  '742',
  '382',
  '807',
  '548',
  '753',
  '683',
  '437',
  '365',
  '226',
  '613',
  '416',
  '289',
  '705',
  '905',
  '782',
  '902',
  '873',
  '468',
  '354',
  '819',
  '263',
  '579',
  '581',
  '438',
  '367',
  '514',
  '418',
  '450',
  '474',
  '639',
  '306',
  '867',
];

export const COUNTRY_CURRENCY_MAP = {
  DE: { currency: 'EUR', symbol: '€', countryName: 'Germany' },
  US: { currency: 'USD', symbol: '$', countryName: 'United States' },
  GB: { currency: 'GBP', symbol: '£', countryName: 'United Kingdom' },
};

export const enumRegionCode = {
  zipCode: 'Zip Code',
  postalCode: 'Postal Code',
};

export const dayjsFormatsEnum = {
  time: 'time',
  dateTime: 'dateTime',
  date: 'date',
  dateSlash: 'dateSlash',
  monDY: 'monDY',
  dayMonDY: 'dayMonDY',
};

export const COUNTRIES = {
  EU: 'EU',
  US: 'US',
};

export const distanceUnitEnums = {
  KILOMETERS: 'kilometers_meters',
  MILES: 'miles_foot',
};

export const enumTemplateTypes = {
  equipmentInspection: 'equipmentInspection',
  vehicleInspection: 'vehicleInspection',
  tourReports: 'tourReports',
  shiftEndReport: 'shiftEndReport',
  shiftDayEndReport: 'shiftDayEndReport',
  incidentReport: 'incidentReport',
  shiftSummaryReport: 'shiftSummaryReport',
};

export const enumTemplateableType = {
  equipmentInspection: 'Equipment Inspection',
  vehicleInspection: 'Vehicle Inspection',
  tourReports: 'Tour Reports',
  shiftDayEndReport: 'Shift Day End Report',
  incidentReport: 'Incident Report',
  dispatch: 'Dispatch',
  activityReport: 'Activity Report',
  obxOnboardingForm: 'OBX Onboarding Form',
  default: 'Default',
  shiftReport: 'Shift Report',
  tourReport: 'Tour Report',
  singleTourReport: 'Single Tour Report',
  siteReport: 'Site Report',
  checkpointReport: 'Checkpoint Report',
  visitor: 'Visitor',
  load: 'Load',
  siteHitReport: 'Site Hit Report',
};

// This enum is used to display the title of the accordion in the OBX data component
export const OBX_DATA_TITLE_ENUM = (t) => {
  return {
    DAY_1: t('obx.users.obxData.obxFormTitles.day1'),
    DAY_30: t('obx.users.obxData.obxFormTitles.day30'),
    DAY_90: t('obx.users.obxData.obxFormTitles.day90'),
    DAY_365: t('obx.users.obxData.obxFormTitles.day365'),
  };
};

// This enum is used to display the status of the accordion in the OBX data component
export const OBX_DATA_STATUS_ENUM = {
  COMPLETE: 'complete',
  PENDING: 'pending',
};

export const appInsightUserAgent = process.env.REACT_APP_USER_AGENT_NAME;

export function disabledCountryStateCity(userRole, isPrimary = undefined) {
  // If isPrimary parameter was not provided (old usage), use original behavior (disable for all non-HO users)
  if (arguments.length === 1) {
    return {
      city: userRole !== rolesEnumWithName.home_officer.slug,
      state: userRole !== rolesEnumWithName.home_officer.slug,
      country: userRole !== rolesEnumWithName.home_officer.slug,
    };
  }
  const shouldDisable = userRole !== rolesEnumWithName.home_officer.slug && isPrimary === true;
  return {
    city: shouldDisable,
    state: shouldDisable,
    country: shouldDisable,
  };
}

export const fileExtensions = {
  CSV: 'csv',
  XLSX: 'xlsx',
  PDF: 'pdf',
};

export const fallbackCenterOfMap = { lat: 41.216362, lng: -96.13607 };

export const edgeOptions = [
  { label: 'Edge', value: 'edge' },
  { label: 'CBX', value: '  cbx' },
  { label: 'SET', value: 'set' },
];

export const quarterOptions = [
  { label: 'Q1', value: 'Q1', id: 1 },
  { label: 'Q2', value: 'Q2', id: 2 },
  { label: 'Q3', value: 'Q3', id: 3 },
  { label: 'Q4', value: 'Q4', id: 4 },
];

/** Last month of each quarter (1-based): Q1→March(3), Q2→June(6), Q3→September(9), Q4→December(12) */
export const QUARTER_END_MONTH = {
  Q1: 3,
  Q2: 6,
  Q3: 9,
  Q4: 12,
};

export const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i;
  return { label: year.toString(), value: year };
});

export const RELEASE_TABS = {
  ROADMAP: 'roadmap',
  RELEASE_NOTES: 'releaseNotes',
};
export const enviromnentInstances = {
  eu: 'EU',
  usa: 'USA',
};

export const currentEnvironmentEnum = {
  development: 'development',
  production: 'production',
  staging: 'staging',
  localhost: 'localhost',
};

export const EXTRA_DUTY_TYPES = {
  EXTRA_JOB_DEDICATED: 'extraJobDedicated',
  EXTRA_HIT_PATROL: 'extraHitPatrol',
};

export const GOOGLE_MAPS_LIBRARIES = ['places', 'drawing', 'geometry'];
export const GOOGLE_MAPS_API_VERSION = process.env.REACT_APP_GOOGLE_MAPS_API_VERSION || '3.64';

export const PLATFORM_INTENT = {
  EDGE: 0,
  SET: 1,
  LEADS: 2,
  LOTS: 3,
};

export const ROADMAP_STATUS_ENUM = {
  PLANNED: 'planned',
  COMPLETED: 'completed',
  IN_PROGRESS: 'in_progress',
};

export const ROADMAP_STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In-Progress' },
  { value: 'completed', label: 'Completed' },
];

export const INVOICING_METHODS_ENUM = {
  SAGE: 'sage',
  QUICKBOOKS: 'quickbooks',
};
