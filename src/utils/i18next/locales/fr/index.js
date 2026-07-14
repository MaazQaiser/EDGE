import common from './common.json';
import ho from './ho.json';
import obx from './obx.json';
import sales from './sales.json';
const fr = {
  sideNavBar: {
    linkText: { dashboard: 'Dashboard_fr', Setting: 'Setting' },
  },
  form: {
    input: {
      textField: {
        name: {
          label: 'Name',
          placeHolder: 'Enter Name',
        },
        firstName: {
          label: 'First Name',
          placeHolder: 'Enter your First Name',
        },
        lastName: {
          label: 'Last Name',
          placeHolder: 'Enter your Last Name',
        },
        phoneNumber: {
          label: 'Phone',
          placeHolder: 'e.g +00 856 3369',
        },
        email: {
          label: 'Email',
          placeHolder: 'Enter your Email',
        },
        owner: {
          label: "Owner's",
          info: 'Info & Contact',
        },
        country: {
          header: 'Country Region',
          label: 'Country',
        },

        address: {
          header: 'Address',
          label: 'Address',
          placeHolder: 'Enter your Address',
        },
        address2: {
          header: 'Address Line 2',
          label: 'Address Line 2',
          placeHolder: 'Enter Address Line 2',
        },
        state: {
          header: 'State/Province',
          label: 'State/Province',
          placeHolder: 'Enter your State/Province',
        },
        zipCode: {
          label: 'Zip/Postal Code',
          placeHolder: 'Enter your Zip/Postal Code',
        },
        city: {
          label: 'City',
          placeHolder: 'Enter your City',
        },
        emergencyContacts: {
          header: 'Emergency Contacts',
        },
        contact: {
          label: 'Phone',
          placeHolder: 'Enter Phone Number',
        },
        selectOption: {
          label: 'Select Option',
          placeholder: 'Select Option',
        },
        selectOptions: {
          label: 'Select Options',
          placeHolder: 'Select Options',
        },
        search: {
          label: 'Search',
          placeHolder: 'Search...',
        },
        geoFencing: {
          header: 'Geo-Fencing',
        },
        vehicle: {
          info: 'Vehicle Info',
        },
        vehicleMakeInput: {
          label: 'Make/Model/Year',
          placeHolder: 'Enter car make, model and year',
        },
        vehicleRegistrationNumber: {
          label: 'Registration Number',
          placeHolder: 'Registration Number',
        },
        vehicleCreatedAt: {
          label: 'Created at',
          placeHolder: 'Created at date',
        },
        vehicleLastMaintenance: {
          label: 'Last Maintenance',
          placeHolder: 'Last Maintenance date',
        },
        password: {
          label: 'Password',
          placeHolder: 'Enter your password',
        },
      },
    },
  },
  buttons: {
    addVehicle: 'Add Vehicle',
  },
  ho_franchise: {
    detail: {
      franchise_information: {
        title: 'Franchise Information',
        info: 'Add Info',
        name: 'Franchise Name',
        owner: "Owner's Name",
        email: 'Email',
        number: 'Number',
        address: 'Address',
        country: 'Country',
        city: 'City',
        region: 'Region/State',
        generalInformation: 'General Information',
        Id: 'Franchise ID',
        joined: 'Joined',
        monthlyRevenue: 'Monthly Revenue',
        noOfCustomers: 'No. of Customers',
        serviceZips: 'Zip/Postal Code',
        noOfEmployees: 'No. of Employees',
        labourEfficiency: 'Labour Efficiency',
        hubSpotFranchiseId: 'Hubspot Franchise No.',
        customerRelation: 'Customer Retention',
        companyCode: 'Company Code',
      },
    },
  },
  commonText: {
    table: {
      noRecordFound: 'No Record Found',
    },
    image: {
      alt: "{{name}}'s image",
    },
  },
  errors: {
    'any.required': '{{#label}} is required.',
    'any.max': '{{#label}} must be at most 20 characters long',
    'any.min': '{{#label}} must be at least 3 characters long',
    'any.empty': '{{#label}} is required',
    'string.required': '{{#label}} is required',
    'number.base': '{{#label}} must be a number.',
    'number.required': '{{#label}} is required',
    'number.empty': '{{#label}} is required',
    'array.min': 'The {{#label}} must have at least {{#limit}} items.',
    'array.base': 'The {{#label}} field must be an array.',
    'string.pattern.base': 'Invalid {{#label}} format',
    'any.email': 'Invalid {{#label}] format',
    'string.email': 'Please enter a valid {{#label}}',
    'string.empty': '{{#label}} is required',
  },
  obx,
  ho,
  sales,
  common,
};

export default fr;
