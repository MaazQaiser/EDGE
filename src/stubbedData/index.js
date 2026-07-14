/* eslint-disable no-undef */
const franchises = require('./mocks/franchiseList.mock');
const zones = require('./mocks/zoneList.mock');
const vehicles = require('./mocks/vehicleList.mock');
const clients = require('./mocks/clientList.mock');
const employees = require('./mocks/employeeList.mock');
const devices = require('./mocks/deviceList.mock');
const types = require('./mocks/types.mock');
const dynamicFormListTypeMock = require('./mocks/dynamicFormListType.mock');
const sites = require('./mocks/sites.mock');
const siteVisitors = require('./mocks/siteVisitors.mock');
const siteLoads = require('./mocks/siteLoads.mock');
const users = require('./mocks/userList.mock');

const templates = require('./mocks/templateList.mock');
const template = require('./mocks/templateDetail.mock');
const {
  duties,
  dutiesMonth,
  shiftDetailMock,
  shiftActivitiesMock,
  shiftLogsMock,
} = require('./mocks/dutyList.mock');
const profileMock = require('./mocks/profile.mock');
const attendance = require('./mocks/attendance.mock');
const checkpoints = require('./mocks/checkpoints.mock');
const { officersListMock } = require('./mocks/officersList.mock');
const siteReportTemplatesMock = require('./mocks/siteReportTemplates.mock');
const siteContractsMock = require('./mocks/siteContracts.mock');
const exceptionsMock = require('./mocks/exceptions.mock');
const { locationsData } = require('./mocks/locations.mock');
const { runsheets, runsheetDetail } = require('./mocks/runsheetList.mock');
const usersAttendanceMock = require('./mocks/usersAttendance.mock');
const { default: franchiseAttendanceMock } = require('./mocks/franchiseOwnerAttendance.mock');
const { default: pendingAttendanceRequestMock } = require('./mocks/pendingAttendanceRequests.mock');
const { default: attendanceLogsMock } = require('./mocks/attendanceLogs.mock');
const usersAvailabilityMock = require('./mocks/usersAvailability.mock');
const { preferencesMock, preferencesConfig } = require('src/stubbedData/mocks/preferences.mock');

const stubbedData = {
  franchiseMapWithTracking: {
    success: {
      data: {
        visitors: [
          {
            id: 999999,
            image_url: 'https://dummyimage.com/300',
            location: {
              lat: 29.1713334,
              lng: -81.03924380000001,
            },
          },
          {
            id: 12,
            image_url: 'https://dummyimage.com/300',
            location: {
              lat: 29.1703561,
              lng: -81.0379707,
            },
          },
        ],
      },
      statusCode: 200,
      message: 'GeoLocation fetched successfully!',
    },
    failure: {
      message: 'Could Not Fetch GeoLocation.',
      status: 500,
    },
  },
  invoices: {
    success: {
      statusCode: 200,
      data: [
        {
          id: 123,
          name: 'Bilal Malik',
          amount: 12312,
          companyName: 'ABC Company',
          dueDate: '1-24-2024',
          invoiceDate: '1-12-2024',
          startDate: '1-12-2024',
          endDate: '1-22-2024',
        },
      ],
      message: 'invoices fetched succesfully',
      pagination: {
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
        totalCount: 2,
      },
    },
    failure: {
      statusCode: 500,
      message: 'Unable to fetch invoices',
    },
  },
  downloadCSV: [['firstname', 'lastname', 'email']],
  deleteZone: {
    success: {
      statusCode: 200,
      message: 'Zone has been destroyed successfully!',
    },
    failure: {
      message: 'Could Not Delete Zone.',
      status: 500,
    },
  },
  getZoneGeoLocationData: {
    success: {
      data: {
        parentId: 94,
        franchises: [
          {
            id: 94,
            // parentZoneId: 2,
            franchiseLocation: {
              lat: 52.777509565361,
              lng: 12.962785286903,
            },
            franchiseName: 'Franchise 1', // acting as label for google maps
            coordinates: [],
            franchiseArea: [],
          },
        ],
        zones: [],

        sites: [],
      },
      statusCode: 200,
      message: 'GeoLocation fetched successfully!',
    },
    failure: {
      message: 'Could Not Fetch GeoLocation.',
      status: 500,
    },
  },
  getGeoLocationData: {
    success: {
      data: {
        parentId: 1,
        franchises: [
          {
            id: 1,
            // parentZoneId: 2,
            franchiseLocation: {
              lat: 31.5081373656981,
              lng: 74.31162458073251,
            },
            franchiseName: 'Franchise 1', // acting as label for google maps
            coordinates: [],
            franchiseArea: [],
          },
        ],
        zones: [],
        sites: [],
      },
      statusCode: 200,
      message: 'GeoLocation fetched successfully!',
    },
    failure: {
      message: 'Could Not Fetch GeoLocation.',
      status: 500,
    },
  },
  getFranchiseDDData: {
    success: {
      data: [
        { id: 1, name: 'FRFDSDE' },
        { id: 2, name: 'dfgesdfewrew' },
        { id: 3, name: 'FRFDSDE2312' },
      ],
      statusCode: 200,
    },
    failure: {
      statusCode: 500,
      message: 'could not fetch details',
    },
  },
  getFranchiseGeoLocationData: {
    success: {
      data: {
        parentId: null,
        franchises: [],
        zones: [],
        sites: [],
      },
      statusCode: 200,
      message: 'GeoLocation fetched successfully!',
    },
    failure: {
      message: 'Could Not Fetch GeoLocation.',
      status: 500,
    },
  },
  getLeadsMapData: {
    success: {
      data: {
        new: [
          {
            name: 'Example Location',
            phoneNumber: '+1234567890',
            industryType: 'Retail',
            address: '123 Main St, City, Country',
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
        ],
        old: [
          {
            name: 'Example Location',
            phoneNumber: '+1234567890',
            industryType: 'Retail',
            address: '123 Main St, City, Country',
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
        ],
        existing: [
          {
            name: 'Example Location',
            phoneNumber: '+1234567890',
            industryType: 'Retail',
            address: '123 Main St, City, Country',
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
        ],
        lost: [
          {
            name: 'Example Location',
            phoneNumber: '+1234567890',
            industryType: 'Retail',
            address: '123 Main St, City, Country',
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
        ],
        franchises: [
          {
            name: 'Example Franchise',
            peopleCount: 10,
            monthlyRevenue: 50000,
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
          {
            name: 'Example Franchise',
            peopleCount: 10,
            monthlyRevenue: 50000,
            coordinates: {
              lat: 12321,
              lng: 123123,
            },
          },
        ],
      },
      statusCode: 200,
      message: 'Leads Map Data fetched successfully!',
    },
    failure: {
      message: 'Could Not Fetch Leads Map Data.',
      status: 500,
    },
  },
  getFranchiseData: {
    success: {
      data: {
        franchise: {
          franchiseArea: [],
          coordinates: [],
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1 (123) 456-7890',
          address: '123 Main Street',
          address2: 'Apt 4B',
          state: { id: 1, name: 'Punjab' },
          country: { id: 1, name: 'Pakistan', countryCode: 'PK' },
          city: {
            id: 3,
            name: 'Gujranwala',
            timezone: 'UTC+4',
            stateId: 1,
          },
          zipCode: '90001',
          franchiseLocation: {
            lat: 31.514851,
            lng: 74.3538862,
          },
          countryCode: 'PK',
          emergencyContacts: [{ id: 1, name: 'Jane Doe', contact: '+1 (987) 654-3210' }],
          image: 'https://picsum.photos/id/237/200/300',
        },
      },
      status: 200,
      message: 'Franchise Data Fetched Successfully.',
    },
    failure: {
      message: 'Could not get franchise details.',
      status: 500,
    },
  },
  getSiteDetails: {
    success: {
      data: {
        status: 200,
        message: 'Data Fetched Successfully',
        data: {
          id: 9,
          name: 'site  434',
          siteLocation: {
            lat: 31.50306062047608,
            lng: 74.30983286511056,
          },
          zoneArea: [],
          supervisor: [],
          siteArea: [],
          coordinates: [],

          state: { id: 1, name: 'Punjab' },
          country: { id: 1, name: 'Pakistan', countryCode: 'PK' },
          city: {
            id: 3,
            name: 'Gujranwala',
            timezone: 'UTC+4',
            stateId: 1,
          },
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1 (123) 456-7890',
          // country: [{ id: 1, name: 'Pakistan' }],
          address: '123 Main Street',
          address2: 'Apt 4B',
          // state: [{ id: 1, name: 'California' }],
          // city: [
          //   {
          //     id: 1,
          //     name: 'Los Angeles',
          //   },
          // ],
          zipCode: '90001',
          countryCode: 'PK',
          emergencyContacts: [{ id: 1, name: 'Jane Doe', contact: '+1 (987) 654-3210' }],
          locations: [
            { id: 1, locationName: 'Front Gate' },
            { id: 2, locationName: 'Parking Area' },
            { id: 3, locationName: '5th Floor' },
            { id: 4, locationName: 'South Gate' },
          ],
          image: [
            { id: 1, url: 'https://picsum.photos/id/237/200/300' },
            { id: 223, url: 'https://picsum.photos/id/237/200/300' },
          ],
        },
      },
    },
    failure: {
      message: 'Could not get site details.',
      status: 500,
    },
  },
  getZoneDetails: {
    success: {
      statusCode: 200,
      message: 'Zone has been found successfully!',
      data: {
        zone: {
          id: 1,
          name: 'Connecticut',
          countryCode: null,
          country: null,
          state: null,
          city: null,
          address: null,
          email: null,
          dutyType: 'Hybrid',
          phoneNumber: '+123322222',
          supervisor: null,
          postalCode: null,
          sameAsFranchise: false,
          zoneArea: [],
          coordinates: [],
        },
      },
    },
    failure: {
      message: 'Could not get zone page details.',
      status: 500,
    },
  },
  getSupervisors: {
    success: {
      status: 200,
      message: 'Data Fetched Successfully',
      data: [
        {
          id: 1,
          name: 'Supervisor of zone 1',
        },
      ],
    },
    failure: {
      status: 500,
      message: 'Supervisors Could Not Be Fetched!',
    },
  },
  getFranchiseDetails: {
    success: {
      status: 200,
      message: 'Data Fetched Successfully',
      data: {
        id: 1,
        parentZoneId: 2,
        franchiseLocation: {
          lat: 31.5081373656981,
          lng: 74.31162458073251,
        },
        franchiseName: 'Franchise 1', // acting as label for google maps
        coordinates: [],
        franchiseArea: [],
      },
    },
    failure: {
      status: 500,
      message: 'Franchise Area Could Not Be Fetched!',
    },
  },
  loginStubbedData: {
    status: 200,
    message: ' Success Message',
    data: {
      token:
        'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwMzIzOTA1MywiaWF0IjoxNjkyNjk4MjUzfQ.Q5F7cPTjbIRPT-jyIL5IwJ9qIqpUehpxoWgH_g4xgxw',
      role: 'Admin',
      accessList: [
        'obx-view-shedule',
        'obx-view-dashboard',
        'obx-view-geofencing',
        'ho-view-franchise-update',
        'obx-create-vehicle',
        'sales-view-companies',
        'ho-view-franchise-zone-create',
        'ho-view-dashboard',
        'ho-view-franchise-detail',
        'obx-view-zones',
        'obx-view-vehicles',
        'obx-view-zone-site-update',
        'obx-view-zone-site-create',
        'obx-view-franchise-zone-update',
        'obx-view-franchise-zone-create',
        'obx-view-dashboard',
        'obx-view-franchise-map',
        'obx-view-schedule',
        'obx-view-runsheets',
        'obx-view-dispatch',
        'obx-view-reports',
        'obx-view-users',
        'obx-view-analytics',
        'obx-view-leaderboard',
        'obx-view-devices',
        'obx-view-sites',
        'obx-view-settings',
        'obx-view-geofencing',
        'obx-view-zone-update',
        'obx-view-zone-create',
        'ho-view-franchise-zone-update',
        'ho-view-franchise-zone-create',
        'ho-view-dashboard',
        'obx-view-zones',
        'obx-view-franchise-zone-update',
        'obx-view-franchise-zone-create',
        'sales-view-companies',
        'ho-view-franchise-detail',
        'ho-view-franchise-update',
        'obx-view-vehicles',
        'obx-create-vehicle',
        'sales-view-company-details',
        'ho-view-franchises',
        'sales-view-locations',
        'sales-view-location-details',
        'sales-view-industry-verticals',
        'ho-view-settings',
        'sales-question-edit',
        'obx-view-reports-details',
      ],
      userData: { name: '', designation: ' ', imagePath: ' ' },
      currentLanguage: 'english',
    },
  },
  loginErrorRes: {
    status: 401,
    message: 'Invalid Credentials',
  },
  forgetPasswordStubbedData: {
    success: {
      statusCode: 200,
      message: 'Email sent successfully',
    },
    error: {
      statusCode: 400,
      message: 'Email does not exist',
    },
  },
  updatePasswordStubbedData: {
    success: {
      statusCode: 200,
      message: 'Password updated successfully',
    },
    error: {
      statusCode: 400,
      message: 'Something went wrong',
    },
  },
  dutyStubbedData: {
    status: 200,
    message: 'Success Message',
    data: duties,
  },
  dutyMonthStubbedData: {
    status: 200,
    message: 'Success Message',
    data: dutiesMonth,
  },

  createExtraDuty: {
    success: {
      status: 200,
      message: 'Extra Duty created successfully',
    },
    failure: {
      status: 400,
      message: 'Cannot create extra duty',
    },
  },
  dutyExtraDelete: {
    success: {
      status: 200,
      message: 'Extra duty deleted successfully',
    },
    failure: {
      status: 400,
      message: 'Cannot delete Extra duty',
    },
  },
  dutyErrorRes: {
    status: 401,
    message: 'Invalid Duty Data',
  },
  checkpointsStubbedData: {
    status: 200,
    message: 'Fetched successfully',
    data: {
      checkpoints: [
        {
          id: 11,
          deviceName: 'NFC #120',
          installLocation: '4th Floor, Event Complex Hall',
        },
      ],
    },
  },
  checkpointsErrorRes: {
    status: 400,
    message: 'Error in fetching checkpoints',
  },
  reportsStubbedData: {
    status: 200,
    message: 'Fetched successfully',
    data: {
      reports: [
        {
          id: 1,
          title: 'Front door report',
          description: 'Find the front door and check if it is open or closed. Submit Picture',
        },
      ],
    },
  },
  dedicatedDutyDetail: {
    detail: {
      success: { status: 200, message: 'Fetched successfully', data: shiftDetailMock },
      error: {
        status: 400,
        message: 'Error in fetching',
      },
    },
    activities: {
      success: { status: 200, message: 'Fetched successfully', data: shiftActivitiesMock },
      error: {
        status: 400,
        message: 'Error in fetching',
      },
    },
    logs: {
      success: { status: 200, message: 'Fetched successfully', data: shiftLogsMock },
      error: {
        status: 400,
        message: 'Error in fetching',
      },
    },
  },
  reportsErrorRes: {
    status: 400,
    message: 'Error in fetching reports',
  },
  createDutiesStubbedData: {
    status: 200,
    message: 'Shifts Created Successfully',
  },
  createDutiesErrorRes: {
    status: 400,
    message: 'Shit creation error',
  },
  editDutyStubbedData: {
    success: {
      status: 200,
      message: 'Shift Edited Successfully',
    },
    error: {
      status: 400,
      message: 'Shit edition error',
    },
  },
  runsheetStubbedData: {
    success: {
      status: 200,
      message: 'Success Message',
      data: runsheets,
    },
    error: {
      status: 500,
      message: 'Failed to fetch',
    },
  },
  runsheetDetailStubbedData: {
    success: {
      status: 200,
      message: 'Success Message',
      data: runsheetDetail,
    },
    error: {
      status: 500,
      message: 'Failed to fetch',
    },
  },
  runsheetVehiclesStubbedData: {
    success: {
      status: 200,
      message: 'Success Message',
      data: [
        {
          id: 4,
          name: '34HZH77',
          image:
            'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
        },
      ],
    },
    error: {
      status: 400,
      message: 'Failed to fetch',
    },
  },
  deleteSiteOfRunsheetStubbedData: {
    success: {
      status: 200,
      message: 'Deleted Successfully',
    },
    error: {
      status: 400,
      message: 'Failed to delete',
    },
  },
  runsheetOfficerssStubbedData: {
    success: {
      status: 200,
      message: 'Success Message',
      data: [
        {
          id: 4,
          name: 'John Doe',
          image:
            'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
        },
      ],
    },
    error: {
      status: 400,
      message: 'Failed to fetch',
    },
  },
  runsheetAssginmentStubbedData: {
    success: {
      status: 200,
      message: 'Updates successfully',
      data: {},
    },
    error: {
      status: 400,
      message: 'Failed to update',
    },
  },
  franchisesStubbedData: {
    statusCode: 200,
    message: ' Success Message',
    data: {
      franchises: franchises,
      pagination: {
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        totalPages: 1,
        totalCount: 1,
      },
    },
  },
  updateFranchise: {
    success: {
      status: 200,
      message: 'Franchise Updated Successfully!',
    },
    failure: {
      status: 500,
      message: 'Franchise Could Not Be Updated',
    },
  },
  updateSite: {
    success: {
      status: 200,
      message: 'Site Updated Successfully',
    },
    failure: {
      status: 500,
      message: 'Site Could Not Be Updated',
    },
  },
  getFranchise: {
    success: {
      status: 200,
      message: 'Franchise Retrieved Successfully',
    },
    failure: {
      status: 500,
      message: 'Something went wrong try again later!',
    },
  },
  deleteFranchise: {
    success: {
      message: 'Marked non-functional successfully',
      statusCode: 200,
    },
    failure: {
      status: 500,
      message: 'Something went wrong try again later!',
    },
  },
  inviteFranchise: {
    success: {
      message: 'Owner reinvited successfully',
      statusCode: 200,
    },
    failure: {
      status: 500,
      message: 'Something went wrong try again later!',
    },
  },
  changeFranchiseOwner: {
    success: {
      data: {
        franchise: {
          id: 1,
          franchiseName: 'Lesotho Alaska',
          status: 'nonFunctional',
          referenceNumber: 5641,
          launchDate: '2023-10-02',
          joinedOn: '2023-10-05',
          firstName: 'asd',
          lastName: 'asd',
          email: 'a@a.com',
          phoneNumber: null,
          contactId: null,
          address: '6417 Clair Shore, North Craigland, SC 19940-5464',
          address2: '38424 Volkman Common, Raubury, PA 50039-3312',
          zipCode: '20599',
          countryCode: 'MQ',
          country: {
            id: 25,
            name: 'Christmas Island',
            countryCode: 'MQ',
          },
          state: {
            id: 19,
            name: 'Michigan',
          },
          city: {
            id: 8,
            name: 'North Melodie',
            timezone: 'UTC+2',
          },
          emergencyContacts: [
            {
              id: 2,
              name: 'asda',
              contact: 'adw',
            },
          ],
          franchiseArea: [],
          coordinates: [],
          franchiseLocation: {
            lat: 31.514851,
            lng: 74.3538862,
          },
          image: 'https://picsum.photos/200',
          noOfServiceZips: 99438,
          monthlyRevenue: 331640,
          noOfCustomer: 99,
          noOfEmployee: 23,
          customerRetentionPercent: 42,
          laborEfficiencyPercent: 35,
          awards: ['2.5M Club', 'Promise KPI'],
        },
      },
      message: 'Owner changed successfully',
      statusCode: 200,
    },
    failure: {
      message: "Validation failed: Email can't be blank, Email is invalid",
      statusCode: 400,
      errorObj: {
        email: ["can't be blank", 'is invalid'],
      },
    },
  },
  makeFranchiseFunctional: {
    success: {
      message: 'Marked functional successfully',
      statusCode: 200,
    },
    failure: {
      status: 500,
      message: 'Something went wrong try again later!',
    },
  },
  zonesStubbedData: {
    statusCode: 200,
    message: 'Zones have been fetched successfully!',
    data: {
      zones: zones,
      totalRecords: 10,
      pagination: {
        currentPage: 1,
        nextPage: 2,
        prevPage: null,
        totalPages: 2,
        totalCount: 12,
      },
    },
  },
  vehiclesStubbedData: {
    deleteVehicle: {
      success: {
        data: {
          vehicle: {
            id: 2,
            registrationNumber: 'LT-0034',
            makeModelYear: '2020',
            lastMaintenance: '05/05/2021',
            createdAt: '10/02/2023',
          },
        },
        statusCode: 200,
        message: 'Deleted Successfully',
      },
      failure: {
        status: 500,
        message: 'Could not remove vehicle.',
      },
    },
    getOne: {
      success: {
        data: {
          vehicle: {
            id: 2,
            registrationNumber: 'LT-0034',
            makeModelYear: '2020',
            lastMaintenance: '05/05/2021',
            createdAt: '10/02/2023',
          },
        },
        statusCode: 200,
        message: 'Fetched Successfully',
      },
      failure: {
        statusCode: 404,
        message: 'Vehicle not found',
      },
    },
    list: {
      success: {
        data: {
          vehicles: vehicles,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 8,
          },
        },
        statusCode: 200,
        message: 'Listed Successfully',
      },
    },
    create: {
      success: {
        data: {
          vehicle: {
            id: 12,
            registrationNumber: 'sadsad',
            makeModelYear: 'asdsa',
            lastMaintenance: '08/10/2023',
            createdAt: '10/09/2023',
          },
        },
        statusCode: 200,
        message: 'Created Successfully',
      },
      failure: {
        statusCode: 400,
        message: 'Cannot create vehicle',
      },
    },
    update: {
      success: {
        data: {
          vehicle: {
            id: 4,
            registrationNumber: 'LT-0034',
            makeModelYear: '2020 asd',
            lastMaintenance: '05/05/2021',
            createdAt: '10/02/2023',
          },
        },
        statusCode: 200,
        message: 'Updated Successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update vehicle',
      },
    },
    delete: {
      success: {
        statusCode: 200,
        message: 'Vehicle deleted successfully',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong',
      },
    },
  },
  clientStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          client: clients[0],
        },
      },
      failure: {
        status: 404,
        message: 'Client not found',
      },
    },
    list: {
      success: {
        status_code: 200,
        message: 'Success Message',
        data: {
          clients: clients,
        },
      },
    },
    create: {
      success: {
        status_code: 200,
        message: 'Client created successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot create client',
      },
    },
    update: {
      success: {
        status_code: 200,
        message: 'Client updated successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update client',
      },
    },
  },
  employeeStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          employee: employees[0],
        },
      },
      failure: {
        status: 404,
        message: 'Employee not found',
      },
    },
    list: {
      success: {
        status_code: 200,
        message: 'Success Message',
        data: {
          employees: employees,
        },
      },
    },
    create: {
      success: {
        status_code: 200,
        message: 'Employee created successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot create employee',
      },
    },
    update: {
      success: {
        status_code: 200,
        message: 'Employee updated successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update employee',
      },
    },
  },
  officersStubbedData: {
    list: {
      success: {
        status_code: 200,
        message: 'Success Message',
        data: officersListMock,
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  usersStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          user: users[0],
        },
      },
      failure: {
        status: 404,
        message: 'Employee not found',
      },
    },
    list: {
      success: {
        data: {
          users: users,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 3,
          },
        },
        message: 'Fetched Successfully',
        statusCode: 200,
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    create: {
      success: {
        status_code: 200,
        message: 'User created successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot create user',
      },
    },
    update: {
      success: {
        status_code: 200,
        message: 'User updated successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update user',
      },
    },
    activeFranchises: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          activeFranchises: [
            {
              id: 23,
              name: 'Rehman',
            },
            {
              id: 9,
              name: 'Rehman 2',
            },
            {
              id: 8,
              name: 'Rehman 3',
            },
            {
              id: 4,
              name: 'Rehman 4',
            },
            {
              id: 1,
              name: 'Rehman',
            },
          ],
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    setActiveFranchises: {
      success: {
        statusCode: 200,
        message: 'Active Franchise Updated Successfully!',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  usersAttendance: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Meesage',
        data: {
          attendance: usersAttendanceMock,
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  franchiseOwnerAttendance: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          attendances: franchiseAttendanceMock,
          pagination: {
            currentPage: 1,
            nextPage: 2,
            prevPage: null,
            totalPages: 34,
            totalCount: franchiseAttendanceMock.length,
          },
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          attendance: franchiseAttendanceMock[0],
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  pendingAttendanceRequest: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          pendingRequests: pendingAttendanceRequestMock,
          pagination: {
            currentPage: 1,
            nextPage: 2,
            prevPage: null,
            totalPages: 34,
            totalCount: pendingAttendanceRequestMock.length,
          },
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  attendanceLogs: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          attendanceLogs: attendanceLogsMock,
          pagination: {
            currentPage: 1,
            nextPage: 2,
            prevPage: null,
            totalPages: 34,
            totalCount: attendanceLogsMock.length,
          },
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  usersAvailability: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Meesage',
        data: {
          usersAvailability: usersAvailabilityMock,
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    update: {
      success: {
        statusCode: 200,
        message: 'Success Updated.',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  profileStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          profile: profileMock,
        },
      },
      failure: {
        status: 404,
        message: 'Profile not found',
      },
    },
    update: {
      success: {
        status: 200,
        message: 'Profile updated successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update profile',
      },
    },
  },
  deviceStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          device: devices[0],
        },
      },
      failure: {
        status: 404,
        message: 'Devise not found',
      },
    },
    list: {
      success: {
        status_code: 200,
        message: 'Success Message',
        data: {
          devices: devices,
        },
      },
    },
    create: {
      success: {
        status_code: 200,
        message: 'Devise created successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot create devise',
      },
    },
    update: {
      success: {
        status_code: 200,
        message: 'Devise updated successfully',
      },
      failure: {
        status: 400,
        message: 'Cannot update devise',
      },
    },
  },
  updateZone: {
    success: {
      status: 200,
      message: 'Zone updated successfully',
    },
    failure: {
      status: 400,
      message: 'Could not update zone.',
    },
  },
  createZone: {
    success: {
      status: 200,
      message: 'Zone created successfully!',
    },
    failure: {
      status: 400,
      message: 'Could not create zone.',
    },
  },
  typesStubbedData: {
    getOne: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitorType: {
            id: 32,
            title: 'New TruckLoad 1',
            category: 'truck_load',
            createdOn: '27-12-2023',
            settings: [
              {
                id: 305,
                key: 'Driver Name',
                value: true,
                dataType: 'text',
                required: true,
              },
            ],
            sites: [],
          },
        },
      },
      failure: {
        statusCode: 404,
        message: 'Type not found',
      },
    },
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitorTypes: types,
        },
      },
      failure: {
        statusCode: 400,
        message: 'Types not found',
      },
    },
    create: {
      success: {
        statusCode: 200,
        message: 'Type created successfully',
      },
      failure: {
        statusCode: 400,
        message: 'Cannot create Type',
      },
    },
    update: {
      success: {
        statusCode: 200,
        message: 'Type updated successfully',
      },
      failure: {
        statusCode: 400,
        message: 'Cannot update Type',
      },
    },
  },
  formSettingsListByType: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          dynamicFormListTypeMock: dynamicFormListTypeMock,
        },
      },
      failure: {
        statusCode: 400,
        message: 'An error occurred',
      },
    },
  },
  sites: {
    list: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          sites: sites,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        statusCode: 400,
        message: 'Sites not found',
      },
    },
    getOne: {
      success: {
        status: 200,
        message: 'Success Message',
        data: {
          id: 1,
          name: 'site 1',
          siteLocation: {
            lat: 31.506381117462936,
            lng: 74.31218248020761,
          },
          siteArea: [],
          firstName: 'John',
          lastName: 'Doe',
          address: '3080 S. 154th St Omaha, NE ',
          dutyType: 'Hybrid',
          supervisor: {
            id: 1,
            name: 'Mike Ross',
            number: '4203325400',
          },
          status: 'Required Action',
          email: 'john.doe@example.com',
          phoneNumber: '+1 (123) 456-7890',
          country: [{ id: 1, name: 'Pakistan' }],
          address2: 'Apt 4B',
          state: [{ id: 1, name: 'California' }],
          city: [
            {
              id: 1,
              name: 'Los Angeles',
            },
          ],
          zipCode: '90001',
          countryCode: 'PK',
          emergencyContacts: [
            {
              name: 'Jane Doe',
              contact: '+1 (987) 654-3210',
            },
          ],
          locations: [{ locationName: 'Front Gate' }],
          image: 'https://picsum.photos/id/237/200/300',
        },
      },
      failure: {
        status: 404,
        message: 'Site not found',
      },
    },
    siteVisitors: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitors: siteVisitors,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        message: 'Could not get Visitors',
        statusCode: 400,
      },
    },
    siteVisitorDetail: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitorDetail: {
            id: 1,
            name: 'Wiatt',
            type: 'jcb',
            lastVisit: '12-12-2022',
            lastCheckin: '05-12-AM',
            lastCheckout: '05-12-AM',
            phoneNumber: '43454-43543',
            totalVisits: '12',
            image: 'Image URL',
          },
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteVisitorVisits: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visits: {
            columns: [
              {
                id: 'image',
                label: 'Image',
                sortable: true,
              },
              {
                id: 'ssn',
                label: 'SSN',
                sortable: false,
              },
              {
                id: 'visitorType',
                label: 'Visitor Type',
                sortable: false,
              },
              {
                id: 'meetingWith',
                label: 'Meeting With',
                sortable: false,
              },
              {
                id: 'reason',
                label: 'Reason',
                sortable: false,
              },
              {
                id: 'Date',
                label: 'Date',
                sortable: false,
              },
              {
                id: 'checkInTime',
                label: 'Check-in Time',
                sortable: false,
              },
              {
                id: 'checkOutTime',
                label: 'Check-out Time',
                sortable: false,
              },
            ],
            data: [
              {
                image: 'http://imageUrl',
                ssn: '123213123',
                visitorType: 'Food Truck',
                meetingWith: 'Fewell',
                reason: 'Unload Items',
                date: '12-12-2021',
                checkInTime: '12:00 AM',
                checkOutTime: '12:00 PM',
              },
            ],
            pagination: {
              currentPage: 1,
              nextPage: 2,
              prevPage: null,
              totalPages: 34,
              totalCount: 338,
            },
          },
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteVisitorTypes: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitorTypes: [
            {
              id: 1,
              name: 'All Visitors',
            },
            {
              id: 2,
              name: 'Walk-In',
            },
            {
              id: 3,
              name: 'Tenant',
            },
            {
              id: 4,
              name: 'Contractor',
            },
            {
              id: 5,
              name: 'Registered',
            },
          ],
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteLoadDetails: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          loadDetail: {
            id: 1,
            name: 'Wiatt',
            type: 'jcb',
            lastVisit: '12-12-2022',
            timeSpent: '2 Hours',
            loadLicensePlate: 'NXW 220',
            totalVisits: '12',
          },
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteLoadTypes: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          vehicleTypes: [
            {
              id: 1,
              name: 'All Vehicle',
            },
            {
              id: 2,
              name: 'Food Container',
            },
            {
              id: 3,
              name: 'Water Bottle Truck',
            },
          ],
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteLoadVisits: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visits: {
            columns: [
              {
                id: 'image',
                label: 'Image',
                sortable: true,
              },
              {
                id: 'ssn',
                label: 'SSN',
                sortable: false,
              },
              {
                id: 'loadType',
                label: 'Load Type',
                sortable: false,
              },
              {
                id: 'reason',
                label: 'Reason',
                sortable: false,
              },
              {
                id: 'date',
                label: 'Date',
                sortable: false,
              },
              {
                id: 'inboundTime',
                label: 'Inbound Time',
                sortable: false,
              },
              {
                id: 'outboundTime',
                label: 'Outbound Time',
                sortable: false,
              },
              {
                id: 'loadWeight',
                label: 'Load Weight',
                sortable: false,
              },
            ],
            data: [
              {
                image: 'http://imageUrl',
                ssn: '123213123',
                loadType: 'Food Truck',
                reason: 'Unload Items',
                date: '12-12-2021',
                inboundTime: '12:00 AM',
                outboundTime: '12:00 PM',
                loadWeight: '12 Ton',
              },
            ],
            pagination: {
              currentPage: 1,
              nextPage: 2,
              prevPage: null,
              totalPages: 34,
              totalCount: 338,
            },
          },
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteCheckpointTypes: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          checkpointTypes: [
            {
              name: 'Picture/Video',
              slug: 'pictureVideo',
              isDevice: false,
            },
            {
              name: 'NFC',
              slug: 'nfc',
              isDevice: true,
            },
            {
              name: 'Beacon',
              slug: 'beacon',
              isDevice: true,
            },
            {
              name: 'QR Code',
              slug: 'qrCode',
              isDevice: true,
            },
            {
              name: 'GPS',
              slug: 'gps',
              isDevice: false,
            },
          ],
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteCheckpointDevices: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          devices: [
            {
              id: 1,
              name: 'NFC 01',
            },
            {
              id: 2,
              name: 'NFC 02',
            },
          ],
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteCheckpointLocations: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          locations: [
            {
              id: 1,
              name: 'parking',
            },
          ],
        },
      },
      failure: {
        message: 'Could not get Visitors',
        status: 500,
      },
    },
    siteAttendance: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          logs: attendance,
          pagination: {
            page: '1',
            perPage: '10',
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        message: 'Could not get Attendance',
        statusCode: 400,
      },
    },
    siteDevices: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          devices: devices,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        message: 'Could not get Devices',
        statusCode: 400,
      },
    },
    siteLocations: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          locations: locationsData?.listing?.data?.locations,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        message: 'Could not get Locations',
        statusCode: 400,
      },
      create: {
        success: {
          statusCode: 200,
          message: 'Location created Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot create Location',
        },
      },
      update: {
        success: {
          statusCode: 200,
          message: 'Location update Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot update Location',
        },
      },
      getOne: {
        success: {
          statusCode: 200,
          message: 'Location fetched Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot get Location',
        },
      },
      delete: {
        success: {
          statusCode: 200,
          message: 'Location deleted Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot delete Location',
        },
      },
    },
    siteCheckpoints: {
      create: {
        success: {
          statusCode: 200,
          message: 'Checkpoint created Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot create Checkpoint',
        },
      },
      update: {
        success: {
          statusCode: 200,
          message: 'Location update Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot update Location',
        },
      },
      delete: {
        success: {
          statusCode: 200,
          message: 'Checkpoint deleted Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot delete Checkpoint',
        },
      },
      list: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          data: {
            checkpoints: checkpoints,
            pagination: {
              page: 1,
              perPage: 10,
              totalPages: 1,
              totalCount: 1,
            },
          },
        },
        failure: {
          message: 'Could not get Checkpoints',
          statusCode: 400,
        },
      },
      getOne: {
        success: {
          data: {
            checkpoint: {
              id: 149,
              checkpointType: 'pictureVideo',
              siteLocation: {
                id: 33,
                name: 'Front Gate',
              },
              isDevice: false,
              device: null,
            },
          },
          statusCode: 200,
          message: 'The record has been fetched successfully!',
        },
        failure: {
          statusCode: 404,
          message: 'Checkpoint not found',
        },
      },
    },
    siteInstructions: {
      create: {
        success: {
          statusCode: 200,
          message: 'Instructions created Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot create Instructions',
        },
      },
      getOne: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          instructions: {
            id: 1,
            content: 'THis si eecefeeere <p>exception</p>',
            weekDays: ['monday', 'tuesday'],
            exceptions: [
              {
                id: 2,
                content: 'THis si eecefeeere <p>exception</p>',
                startDate: '2023-11-09T00:00:00.000Z',
                endDate: '2023-11-09T00:00:00.000Z',
                weekDays: ['monday', 'tuesday'],
              },
              {
                id: 3,
                content: 'THis si eecefeeere <p>exception</p>',
                startDate: '2023-11-09T00:00:00.000Z',
                endDate: '2023-11-09T00:00:00.000Z',
                weekDays: ['monday', 'tuesday'],
              },
            ],
          },
        },
        failure: {
          statusCode: 404,
          message: 'Instruction not found',
        },
      },
      update: {
        success: {
          statusCode: 200,
          message: 'Instructions updated Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot update Instructions',
        },
      },
    },
    siteExceptionInstructions: {
      create: {
        success: {
          statusCode: 200,
          message: 'Exception created Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot create Exception',
        },
      },
      getOne: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          exception: {
            id: 1,
            content:
              '<ol><li><i>This is it what to do now?</i></li><li><strong>This is what i want</strong></li><li><i>But this is not what you will <strong>get</strong></i></li></ol>',
            startDate: '2023-10-17T10:58:37.000Z',
            endDate: '2023-10-25T10:58:43.000Z',
            weekDays: ['tuesday'],
          },
        },
        failure: {
          statusCode: 404,
          message: 'Exception not found',
        },
      },
      list: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          exceptions: exceptionsMock,
        },
        failure: {
          statusCode: 404,
          message: 'Exception not found',
        },
      },
      update: {
        success: {
          statusCode: 200,
          message: 'Exception updated Successfully',
        },
        failure: {
          statusCode: 400,
          message: 'Cannot update Exception',
        },
      },
    },
    siteReportTemplates: {
      list: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          data: {
            templates: siteReportTemplatesMock,
          },
        },
        failure: {
          message: 'Could not get Loads',
          status: 500,
        },
      },
    },
    siteContracts: {
      list: {
        success: {
          statusCode: 200,
          message: 'Success Message',
          data: {
            contracts: siteContractsMock,
          },
        },
        failure: {
          message: 'Could not get contracts',
          status: 500,
        },
      },
    },
    siteLoads: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          visitors: siteLoads,
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
      failure: {
        message: 'Could not get Loads',
        statusCode: 400,
      },
    },
  },
  templatesStubbedData: {
    statusCode: 200,
    message: 'Success Message',
    data: {
      templates,
      pagination: {
        totalCount: templates.length,
      },
    },
  },
  deleteTemplateStubbedData: {
    statusCode: 200,
    message: ' Success Message',
  },
  deleteTemplateErrorStubbed: {
    statusCode: 401,
    message: ' Error Message',
  },
  templateDetailStubbedData: {
    statusCode: 200,
    message: ' Success Message',
    data: {
      template: template,
    },
  },
  templateCreateStubbedDate: {
    success: {
      statusCode: 200,
      message: 'Template has been Created.',
    },
    failure: {
      statusCode: 400,
      message: 'Could not create template.',
    },
  },
  templateUpdateStubbedDate: {
    success: {
      statusCode: 200,
      message: 'Template has been update.',
    },
    failure: {
      statusCode: 400,
      message: 'Could not update template.',
    },
  },
  templateCloneStubbedDate: {
    success: {
      statusCode: 200,
      message: 'Template has been update.',
      data: template,
    },
    failure: {
      statusCode: 400,
      message: 'Could not update template.',
    },
  },
  settingsPreferences: {
    get: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: {
          preferences: preferencesMock,
        },
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    update: {
      success: {
        statusCode: 200,
        message: 'Success Updated.',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  settingsPreferencesConfig: {
    get: {
      success: {
        statusCode: 200,
        message: 'Success Message',
        data: preferencesConfig,
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
    update: {
      success: {
        statusCode: 200,
        message: 'Success Updated.',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
  questions: {
    update: {
      success: {
        statusCode: 200,
        message: 'The records have been reordered successfully!',
      },
      failure: {
        statusCode: 400,
        message: 'Something went wrong.',
      },
    },
  },
};

module.exports = stubbedData;
