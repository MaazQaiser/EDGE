import Joi from 'joi';
import { ActiveStepsKeys as ContractFormKeys } from 'src/helper/contract';
import store from 'src/redux/store/index';

import { LANGUAGES_ERROR_MESSAGES } from '../i18next/locales/errorMessages';

const getCurrentLanguageFromRedux = () => {
  const state = store.getState();
  return state?.auth?.currentLanguage?.code || 'en';
};

const currentLanguage = getCurrentLanguageFromRedux();

const getErrorMessage = (key, fallback) =>
  LANGUAGES_ERROR_MESSAGES?.[key]?.[currentLanguage] || fallback;

//if form attributes have camelCase keys

const errorMessages = {
  sectionsAttributes: getErrorMessage('sectionsAttributes', 'Section'),
  questionStatement: getErrorMessage('questionStatement', 'Question Statement'),
  optionsAttributes: getErrorMessage('optionsAttributes', 'Question Option'),
  reportTitle: getErrorMessage('reportTitle', 'Report Name'),
  sectionTitle: getErrorMessage('sectionTitle', 'Section Name'),
  QuestionTitle: getErrorMessage('QuestionTitle', 'Question Name'),
  questionsAttributes: getErrorMessage('questionsAttributes', 'Question'),
  reqOfficers: getErrorMessage('reqOfficers', 'Number of Officers'),
  optionText: getErrorMessage('optionLabel', 'Option label'),
  questionsIndustryVerticalAttributes: getErrorMessage(
    'questionsIndustryVerticalAttributes',
    'Industry Verticals',
  ),
  associatedSites: getErrorMessage('associatedSites', 'Sites'),
  timeValue: getErrorMessage('value', 'Value'),
  rateValue: getErrorMessage('rate', 'Rate'),
  leaveReason: getErrorMessage('leaveReason', 'Reason'),
  pricePerHit: getErrorMessage('pricePerHit', 'Price'),
  zoneId: getErrorMessage('zoneId', 'Zone'),
  startsAt: getErrorMessage('startTime', 'Start Time'),
  endsAt: getErrorMessage('endTime', 'End Time'),
  dateRange: getErrorMessage('jobDuration', 'Job Duration'),
  addressLine1: getErrorMessage('billingAddress', 'Billing Address'),
  officerRate: getErrorMessage('officerRate', 'Site Rate'),
  endTimeBeforeStartTime: getErrorMessage('endTimeBeforeStart', 'End Time'),
};

//only for template
const enumTemplateResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  dropdown: 8,
};

const contactSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string()
          .min(1)
          .max(40)
          .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/),
      })
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),
    contact: phoneNumberValidator(t),
    _destroy: Joi.boolean().optional(),
  });
};
const usAndCanadaPhoneNumberRegex = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const internationalPhoneNumberRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

const phoneNumberValidator = (t) => {
  return Joi.string()
    .custom((value, helpers) => {
      if (!usAndCanadaPhoneNumberRegex.test(value) && !internationalPhoneNumberRegex.test(value)) {
        return helpers.message({
          custom: t('errors.string.pattern.base'),
        });
      }

      return value; // Return the value unchanged if it passes the regex test
    })
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case 'string.empty':
            err.message = t('errors.any.required');
            break;
          case 'string.base':
            err.message = t('errors.any.required');
            break;
          default:
            break;
        }
      });
      return errors;
    });
};

/**
 * Fuel surcharge when fuelSurchargeEnabled: percentage in (0, 100], max 1 decimal; fixed amount > 0.
 * Expects sibling keys `fuelSurchargeType` (`percentage` | `fixed_value`).
 */
const fuelSurchargeValueEnabledSchema = (t) =>
  Joi.when('fuelSurchargeType', {
    is: 'percentage',
    then: Joi.string()
      .trim()
      .min(1)
      .custom((value, helpers) => {
        const v = String(value).trim();
        if (!/^\d{1,3}(\.\d)?$/.test(v)) {
          return helpers.message({ custom: t('errors.any.required') });
        }
        const n = parseFloat(v);
        if (Number.isNaN(n) || n <= 0 || n > 100) {
          return helpers.message({ custom: t('errors.any.greaterThanZero') });
        }
        return value;
      }),
    otherwise: Joi.when('fuelSurchargeType', {
      is: 'fixed_value',
      then: Joi.string()
        .trim()
        .min(1)
        .custom((value, helpers) => {
          const n = parseFloat(String(value).trim());
          if (Number.isNaN(n) || n <= 0) {
            return helpers.message({ custom: t('errors.any.greaterThanZero') });
          }
          return value;
        }),
      otherwise: Joi.string()
        .trim()
        .min(1)
        .messages({
          'string.empty': t('errors.any.required'),
          'string.min': t('errors.any.required'),
        }),
    }),
  }).messages({
    'any.required': t('errors.any.required'),
    'string.base': t('errors.any.required'),
    'string.empty': t('errors.any.required'),
    'string.min': t('errors.any.required'),
  });

const contactsWithEmergencySchema = (t) => {
  return Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string(),
      }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    name: Joi.string()
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string()
          .min(1)
          .max(40)
          .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/),
      })
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),
    contact: Joi.string().when('_destroy', {
      is: true,
      then: Joi.string().optional().allow('', null),
      otherwise: phoneNumberValidator(t),
    }),
    _destroy: Joi.boolean().optional(),
    isEmergencyContact: Joi.boolean().optional(),
  });
};

const tourSchema = (t) => {
  return Joi.object({
    tourName: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    tourCheckpoints: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),
    tourReport: Joi.object().min(1).message(t('errors.any.required')),
    startTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    endTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
  });
};

const shiftsOfficersSchema = (t, field = {}) => {
  return Joi.object({
    assignedOfficer: Joi.object()
      .min(field?.officersRequired ? 1 : 0)
      .message(t('errors.any.required')),
    hourlyRate: Joi.object({
      checked: Joi.boolean().optional(),
      amount: Joi.number().when('checked', {
        is: true,
        then: Joi.number()
          .min(field?.amount ?? 1)
          .required(),
      }),
    }),
  });
};
const locationNameSchema = Joi.object({
  locationName: Joi.string().exist().messages({
    'string.empty': ' is required',
  }),
});

const tourTemplateSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    startTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    duration: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    report: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    checkpoints: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),
    occurances: Joi.object({
      repeatTour: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
      repeatAfterTime: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
    })
      .allow(null)
      .optional(),
  });
};
const tourTemplatePatrolSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    report: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    serviceTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
  });
};

const timezoneSchema = (t) => {
  return Joi.string().messages({
    'any.required': t('errors.any.required'),
    'string.base': t('errors.any.required'),
    'string.empty': t('errors.any.required'),
  });
};

const valueSchemaForDynamicForm = (t) => {
  return Joi.alternatives().try(
    Joi.string()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'string.base': t('errors.dynamic.required'),
        'string.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
      }), // Allow strings
    Joi.array()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'array.base': t('errors.dynamic.required'),
        'array.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
        'array.min': t('errors.dynamic.required'),
      }),
    Joi.object()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'array.base': t('errors.dynamic.required'),
        'array.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
        'array.min': t('errors.dynamic.required'),
      }),
  );
};

export default async function joiValidate(form, t, field = {}, shouldNotAttachLabel = false) {
  //templates schemas
  const questionOptionSchema = Joi.object({
    optionText: Joi.string()
      .exist()
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    points: Joi.number().messages({
      'number.empty': t('errors.any.empty'),
    }),
  });

  const visitorLoadProfile = Joi.object({
    identifier: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    name: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    image: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
  });

  const billingDetailsSchema = Joi.object({
    firstName: Joi.string()
      .max(100)
      .optional()
      .allow('', null)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyAlphabets'),
        'string.max': t('errors.alphabetsCharacterLength'),
      }),

    lastName: Joi.string()
      .max(100)
      .optional()
      .allow('', null)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyAlphabets'),
        'string.max': t('errors.alphabetsCharacterLength'),
      }),
    email: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.email': t('errors.string.email'),
      }),

    phoneNumber: phoneNumberValidator(t),

    recepientEmails: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
        }),
    ),
    addressLine1: Joi.string()
      .max(200)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),

    city: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    state: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    country: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    postalCode: Joi.string()
      .max(50)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.postalCodeCharacters'),
      }),
  });

  const billingContactsCreationSchema = Joi.object({
    firstName: Joi.string()
      .max(100) // Maximum length of 100 characters
      .optional() // Optional field
      .allow('') // Allow empty strings
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyAlphabets'),
        'string.max': t('errors.alphabetsCharacterLength'),
      }),

    lastName: Joi.string()
      .max(100) // Maximum length of 100 characters
      .optional() // Optional field
      .allow('') // Allow empty strings
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyAlphabets'),
        'string.max': t('errors.alphabetsCharacterLength'),
      }),
    companyName: Joi.string()
      .max(100) // Maximum length of 100 characters
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyAlphabets'),
        'string.max': t('errors.alphabetsCharacterLength'),
      }),
    primaryEmail: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.email': t('errors.string.email'),
      }),

    phoneNumber: phoneNumberValidator(t),
    //  Joi.string()
    //   .pattern(/^\+?[0-9]+$/)
    //   .required()
    //   .messages({
    //     'string.base': t('errors.any.required'),
    //     'string.empty': t('errors.any.required'),
    //     'any.required': t('City is required.'),
    //   }),

    recepientEmails: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
        }),
    ),

    addressLine1: Joi.string()
      .max(200)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),

    city: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    state: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    country: Joi.string().messages({
      'any.required': t('City is required.'),
    }),

    postalCode: Joi.string()
      .max(50)
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.postalCodeCharacters'),
      }),

    addressLine2: Joi.string()
      .max(200)
      .optional()
      .allow('', null)
      .messages({
        'string.base': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),
  });

  const userDetailsSchema = Joi.object({
    firstName: Joi.string().messages({
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
      'string.pattern.base': t('errors.onlyAlphabets'),
    }),

    lastName: Joi.string().messages({
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
      'string.pattern.base': t('errors.onlyAlphabets'),
    }),

    email: Joi.string()
      .email({ tlds: false })
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.email': t('errors.string.email'),
      }),

    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]+$/)
      .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyPositiveIntegers'),
      }),

    fileNumber: Joi.string()
      // .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    assignedFranchises: Joi.array()
      .min(1)
      // .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    employeeType: Joi.string()
      // .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    perHourRate: Joi.number().messages({
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
  });

  const questionSchema = Joi.object({
    questionStatement: Joi.string()
      .exist()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),
    required: Joi.bool().allow(false).optional(),
    responseType: Joi.number().exist(),
    _destroy: Joi.boolean().optional(),
    optionsAttributes: Joi.array()
      .items(questionOptionSchema)
      .when('_destroy', {
        is: true,
        then: Joi.array().items().allow().optional(),
        otherwise: Joi.array()
          .items()
          .when('responseType', {
            is: Joi.number().valid(
              enumTemplateResponseType.multiselect,
              enumTemplateResponseType.radio,
              enumTemplateResponseType.dropdown,
            ),
            then: Joi.array()
              .items()
              .min(2)
              .messages({
                'array.min': t('errors.array.minTwo'),
              })
              .custom((value, helpers) => {
                const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
                if (nonDestroyedObjects.length < 2) {
                  return helpers.error('array.min', { message: t('errors.array.minTwo') });
                }
                return value;
              }),
            otherwise: Joi.array().items().allow().optional(),
          }),
      }),
    questionsIndustryVerticalAttributes: Joi.array()
      .items(
        Joi.object({
          industryVerticalId: Joi.number().exist(),
          industryVerticalTitle: Joi.string().exist(),
        }),
      )
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
  });

  const sectionSchema = Joi.object({
    title: Joi.string()
      .exist()
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    _destroy: Joi.boolean().optional(),
    questionsAttributes: Joi.array()
      .items(questionSchema)
      .when('_destroy', {
        is: true,
        then: Joi.array().items().allow().optional(),
        otherwise: Joi.array()
          .items()
          .min(1)
          .messages({
            'array.min': t('errors.array.min'),
          })
          .custom((value, helpers) => {
            const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
            if (nonDestroyedObjects.length < 1) {
              return helpers.error('array.min', { message: t('errors.array.min') });
            }
            return value;
          }),
      }),
  });
  // Line Items
  const lineItemsSchema = Joi.object({
    sageItem: Joi.object()
      .required() // Ensures 'sageItem' is required
      .messages({
        'any.required': t('errors.any.required'), // Message when 'sageItem' is missing
        'object.base': t('errors.any.required'), // Message when 'sageItem' is not an object
      }),
    _destroy: Joi.boolean().optional(),
    quantity: Joi.number()
      .precision(4)
      // .min(0)
      .max(9999999999)
      .messages({
        'any.required': t('errors.any.required'),
        'number.base': t('errors.any.required'),
        'number.max': t('errors.number.maxQuantity'),
        'number.unsafe': t('errors.number.maxQuantity'),
        'number.min': t('errors.number.min'),
        'number.integer': t('errors.number.integer'),
      }),
    price: Joi.number()
      .precision(4)
      .max(999999999999999)
      .custom((value, helpers) => {
        const ancestors = helpers?.state?.ancestors ?? [];
        const formRoot = ancestors.find(
          (a) => a && typeof a === 'object' && Object.hasOwn(a || {}, 'isRefund'),
        );
        const isRefund = Boolean(formRoot?.isRefund);
        if (!isRefund && value < 0) {
          return helpers.error('number.min');
        }
        return value;
      })
      .messages({
        'any.required': t('errors.any.required'),
        'number.base': t('errors.any.required'),
        'number.max': t('errors.number.maxPrice'),
        'number.unsafe': t('errors.number.maxPrice'),
        'number.min': t('errors.number.min'),
        'number.precision': t('errors.number.precision'),
      }),
  });

  const schema = Joi.object({
    avatarRequired: Joi.boolean(),
    avatar: Joi.string().when('avatarRequired', {
      is: Joi.exist(),
      then: Joi.string().exist().messages({
        'any.required': 'Avatar name is required',
      }),
    }),
    dynamicValue1: Joi.string(),
    dynamicValue2: Joi.string(),
    contract: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),

    glGroup: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    countryName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    countryShortCode: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    phoneNumberCode: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    currency: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    dateFormat: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    parmanentSalary: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    parmanentHourly: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    contractor: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    lineItem: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    site: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    roleableType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    officer: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    punchInTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    punchOutTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),

    template: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    shiftStartTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    shiftEndTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    shiftStartDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    extraDuties: Joi.array()
      .items(
        Joi.object({
          _destroy: Joi.boolean().optional(),
          dutyType: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.string(),
          }),
          dateRange: Joi.when('_destroy', {
            is: true,
            then: Joi.array().optional().allow('', null),
            otherwise: Joi.array()
              .min(1)
              .messages({
                'any.required': t('errors.any.required'),
                'array.base': t('errors.any.required'),
                'array.min': t('errors.any.required'),
              }),
          }),
          startsAt: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.date()
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'date.base': t('errors.any.required'),
              }),
          }),

          endsAt: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.date()
              .required()
              // .min(Joi.ref('startsAt'))
              .messages({
                'any.required': t('errors.any.required'),
                'date.base': t('errors.any.required'),
              }),
          }),
          officerCount: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.number()
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
              }),
          }),
          officerType: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.object()
              .custom((value, helpers) => {
                if (Object.keys(value).length === 0) {
                  return helpers.error('object.empty');
                }
                return value;
              })
              .messages({
                'object.empty': t('errors.any.required'),
              }),
          }),
          hourlyRate: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.number()
              .precision(2)
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
              }),
          }),
          loadManagement: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.boolean().optional(),
          }),

          visitManagement: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.boolean().optional(),
          }),
          dutyDays: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.array()
              .items(Joi.number().integer().min(0).max(6))
              .min(1)
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'array.base': t('errors.any.required'),
                'array.min': t('errors.any.required'),
              }),
          }),
          fuelSurchargeEnabled: Joi.when('_destroy', {
            is: true,
            then: Joi.boolean().optional(),
            otherwise: Joi.boolean().optional(),
          }),
          fuelSurchargeType: Joi.when('_destroy', {
            is: true,
            then: Joi.any().optional().allow('', null),
            otherwise: Joi.when('fuelSurchargeEnabled', {
              is: Joi.boolean().valid(true),
              then: Joi.string()
                .valid('percentage', 'fixed_value')
                .messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                  'any.only': t('errors.any.required'),
                }),
              otherwise: Joi.any().optional().allow('', null),
            }),
          }),
          fuelSurchargeValue: Joi.when('_destroy', {
            is: true,
            then: Joi.any().optional().allow('', null),
            otherwise: Joi.when('fuelSurchargeEnabled', {
              is: Joi.boolean().valid(true),
              then: fuelSurchargeValueEnabledSchema(t),
              otherwise: Joi.any().optional().allow('', null),
            }),
          }),
        }), // Ensure at least one non-destroyed extrDuty object
      )
      .min(1),
    extraHitServices: Joi.array()
      .items(
        Joi.object({
          pricePerVisit: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
          }),
          visitDays: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.array()
              .items(Joi.number().integer().min(0).max(6))
              .min(1)
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'array.base': t('errors.any.required'),
                'array.min': t('errors.any.required'),
              }),
          }),
          dateRange: Joi.array()
            .items(Joi.string())
            .min(1)
            .messages({
              'array.base': t('errors.any.required'),
              'array.min': t('errors.any.required'),
            })
            .optional()
            .custom((value) => (!value || value.length === 0 ? undefined : value)),
          visits: Joi.array()
            .items(
              Joi.object({
                visitType: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitsPerDay: Joi.number()
                  .integer()
                  .min(1)
                  .messages({
                    'any.required': t('errors.any.required'),
                    'string.base': t('errors.any.required'),
                    'string.empty': t('errors.any.required'),
                  }),
                startTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                endTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
              }),
            )
            .min(1)
            .messages({
              'array.min': t('errors.array.min'),
            }),
          fuelSurchargeEnabled: Joi.boolean().optional(),
          fuelSurchargeType: Joi.when('fuelSurchargeEnabled', {
            is: Joi.boolean().valid(true),
            then: Joi.string()
              .valid('percentage', 'fixed_value')
              .messages({
                'any.required': t('errors.any.required'),
                'string.base': t('errors.any.required'),
                'string.empty': t('errors.any.required'),
                'any.only': t('errors.any.required'),
              }),
            otherwise: Joi.any().optional().allow('', null),
          }),
          fuelSurchargeValue: Joi.when('fuelSurchargeEnabled', {
            is: Joi.boolean().valid(true),
            then: fuelSurchargeValueEnabledSchema(t),
            otherwise: Joi.any().optional().allow('', null),
          }),
        }),
      )
      .min(1),
    countryCode: Joi.string().empty(''),
    address: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    siteName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    customerId: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),

    industryVertical: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    sageItem: Joi.object().messages({
      'any.required': t('errors.any.required'),
      'object.base': t('errors.any.required'),
    }),

    fuelSurchargeType: Joi.when('fuelSurchargeEnabled', {
      is: Joi.boolean().valid(true),
      then: Joi.string()
        .valid('percentage', 'fixed_value')
        .messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
          'any.only': t('errors.any.required'),
        }),
      otherwise: Joi.any().optional().allow('', null),
    }),
    fuelSurchargeValue: Joi.when('fuelSurchargeEnabled', {
      is: Joi.boolean().valid(true),
      then: fuelSurchargeValueEnabledSchema(t),
      otherwise: Joi.any().optional().allow('', null),
    }),
    siteType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    pricePerVisit: Joi.string()
      .min(1)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    // siteLocations: Joi.array()
    //   .min(1)
    //   .items(Joi.string())
    //   .messages({
    //     'any.required': t('errors.any.required'),
    //     'string.base': t('errors.any.required'),
    //     'string.empty': t('errors.any.required'),
    //   }),
    siteServices: Joi.array()
      .items(
        Joi.object({
          serviceName: Joi.string()
            // .exist()
            .optional()
            .messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.string.base'),
              'string.empty': t('errors.string.empty'),
            }),
          serviceType: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          sageItem: Joi.object()
            // .min(1)
            .messages({
              'any.required': t('errors.any.required'), // Message when 'sageItem' is missing
              'object.base': t('errors.any.required'), // Message when 'sageItem' is not an object
              'object.min': t('errors.any.required'),
            }),
          officersRequired: Joi.number()
            .min(1)
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
          hourlyRate: Joi.number()
            .min(1)
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),

          startTime: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          endTime: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          weekDays: Joi.array().items(Joi.number()).min(1),
          // designation: Joi.string().messages({
          //   'any.required': t('errors.any.required'),
          //   'string.base': t('errors.any.required'),
          //   'string.empty': t('errors.any.required'),
          // }),

          fuelSurchargeType: Joi.when('fuelSurchargeEnabled', {
            is: Joi.boolean().valid(true),
            then: Joi.string()
              // .required()
              .valid('percentage', 'fixed_value')
              .messages({
                'any.required': t('errors.any.required'),
                'string.base': t('errors.any.required'),
                'string.empty': t('errors.any.required'),
                'any.only': t('errors.any.required'),
              }),
            otherwise: Joi.any().optional().allow('', null),
          }),
          fuelSurchargeValue: Joi.when('fuelSurchargeEnabled', {
            is: Joi.boolean().valid(true),
            then: fuelSurchargeValueEnabledSchema(t),
            otherwise: Joi.any().optional().allow('', null),
          }),
          officerType: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          pricePerVisit: Joi.string()
            .min(1)
            .optional()
            .messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
          dispatchBillingInfo: Joi.object({
            billingType: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            billingRate: Joi.number().messages({
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
          }),
          visits: Joi.array()
            .items(
              Joi.object({
                visitDays: Joi.array().items(Joi.number()).min(1),
                startTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                endTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitType: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitsPerDay: Joi.number()
                  .integer()
                  .min(1)
                  .messages({
                    'any.required': t('errors.any.required'),
                    'string.base': t('errors.any.required'),
                    'string.empty': t('errors.any.required'),
                  }),
                visitTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
              }),
            )
            .min(1)
            .messages({
              'array.min': t('errors.array.min'),
            }),
        }),
      )
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    cycleRefDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    flatRate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    holidayMultiplier: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    holidayRate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    holidayGroup: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    billingStartDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    contractName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    companyCode: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    name: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    image: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    attachments: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'array.base': t('errors.any.required'),
      'array.min': t('errors.any.required'),
    }),
    zipCode: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    userGroupsAttributes: Joi.array()
      .items()
      .min(1)
      .messages({
        'any.required': t('errors.any.required'),
        'array.base': t('errors.array.base'),
        'array.min': t('errors.array.min'),
      }),
    postalCode: Joi.string().messages({
      'string.base': t('errors.number.base'),
      'any.required': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    sameAsFranchise: Joi.boolean(),
    siteLocation: Joi.object({
      lat: Joi.number().exist(),
      lng: Joi.number().exist(),
    }),
    billingFrequency: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    contractTenureType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    paymentTerm: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    billingType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    franchiseLocation: Joi.object({
      lat: Joi.number().exist(),
      lng: Joi.number().exist(),
    }),
    zoneArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    siteArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    franchiseArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    zones: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.any.required'),
        'array.base': t('errors.array.base'),
        'array.min': t('errors.array.min'),
      }),
    sites: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.any.required'),
        'array.base': t('errors.array.base'),
        'array.min': t('errors.array.min'),
      }),
    emergencyContacts: Joi.array()
      .items(contactSchema(t))
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    contacts: Joi.array()
      .items(contactsWithEmergencySchema(t))
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),

    shiftsOfficers: Joi.array()
      .items(shiftsOfficersSchema(t, field))
      // .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    shiftsTours: Joi.array().items(
      Joi.object({
        tours: Joi.array()
          .items(tourSchema(t))
          .messages({
            'array.min': t('errors.array.min'),
          }),
      }),
    ),
    reassignment: Joi.object({
      officer: Joi.object().min(1).message(t('errors.any.required')),
      startTime: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
    }),
    tourTemplate: tourTemplateSchema(t),
    tourTemplatePatrol: tourTemplatePatrolSchema(t),
    tours: Joi.array()
      .items(tourTemplateSchema(t))
      .messages({
        'array.min': t('errors.array.min'),
      }),
    publishServices: Joi.array().items(
      Joi.object({
        startDate: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
        endDate: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      }),
    ),
    timezone: Joi.object()
      .empty('')
      .messages({
        'any.required': t('errors.annualRateIncrease'),
      }),
    [ContractFormKeys.SERVICES]: Joi.array().items(
      Joi.object({
        officerType: Joi.object()
          .empty('')
          .messages({
            'any.required': t('errors.stage'),
          }),
        visits: Joi.array().items(
          Joi.object({
            startTime: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            endTime: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            reqOfficers: Joi.number()
              .min(1)
              .messages({
                'number.min': t('errors.any.greaterThanZero'),
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
                'number.empty': t('errors.any.required'),
              }),
            numberOfVisits: Joi.number()
              .min(1)
              .messages({
                'number.min': t('errors.any.greaterThanZero'),
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
                'number.empty': t('errors.any.required'),
              }),
            dutyDays: Joi.array()
              .items(Joi.number())
              .min(1)
              .messages({
                'array.min': t('errors.array.min'),
              }),
          }),
        ),
        pricePerHit: Joi.number()
          .min(1)
          .messages({
            'number.min': t('errors.any.greaterThanZero'),
            'any.required': t('errors.any.required'),
            'number.base': t('errors.any.required'),
            'number.empty': t('errors.any.required'),
          }),
        hourlyRate: Joi.number()
          .min(1)
          .optional()
          .messages({
            'number.min': t('errors.any.greaterThanZero'),
            'any.required': t('errors.any.required'),
            'number.base': t('errors.any.required'),
            'number.empty': t('errors.any.required'),
          }),
      }),
    ),
    createExtraDuty: Joi.object({
      dutyDate: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      startTime: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      endTime: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      // site: Joi.object().min(1).message(t('errors.any.required')),
      officersCount: Joi.number()
        .min(1)
        .messages({
          'any.min': t('errors.any.required'),
          'number.min': t('errors.any.required'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      selectedReport: Joi.string()
        .min(1)
        .messages({
          'any.min': t('errors.any.required'),
          'array.min': t('errors.any.required'),
          'array.base': t('errors.any.required'),
          'number.min': t('errors.any.required'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      officersAssigned: Joi.array().items(
        Joi.object({
          checked: Joi.boolean(),
          amount: Joi.number().when('checked', {
            is: true,
            then: Joi.number()
              .min(field?.amount ?? 1)
              .required(),
            // otherwise: Joi.forbidden(),
          }),
          officer: Joi.object().min(1).required(),
        }),
      ),
    }),

    locations: Joi.array()
      .items(locationNameSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    phoneNumber: phoneNumberValidator(t),
    fax: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    licenseNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    priceRequired: Joi.boolean(),
    price: Joi.number().when('priceRequired', {
      is: Joi.exist(),
      then: Joi.number().exist().messages({
        'any.required': 'Price is required',
      }),
    }),
    quantity: Joi.number().when('priceRequired', {
      is: Joi.exist(),
      then: Joi.number().exist().messages({
        'any.required': 'Price is required',
      }),
    }),
    occurrence: Joi.object().min(1).message(t('errors.any.required')),
    supervisor: Joi.number()
      .allow('', null)
      .messages({
        'number.base': t('errors.dropdown.base'),
      }),
    termsRequired: Joi.boolean(),
    terms: Joi.boolean().when('termsRequired', {
      is: Joi.exist(),
      then: Joi.boolean().exist().valid(true).messages({
        'any.required': 'The terms and conditions must be accepted.',
        'any.only': 'Terms must be accepted',
      }),
    }),
    firstName: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
      'string.pattern.base': t('errors.notAString'),
    }),
    lastName: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
      'string.pattern.base': t('errors.notAString'),
    }),
    designation: Joi.string()
      .min(1)
      .max(40)
      .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),

    city: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    genderRequired: Joi.boolean(),
    gender: Joi.string().when('genderRequired', {
      is: Joi.exist(),
      then: Joi.string().valid('male', 'female', 'other').exist().messages({
        'any.only': 'Invalid gender value',
        'any.required': 'gender is required',
      }),
    }),
    country: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    stateRequired: Joi.boolean(),
    state: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    userNameRequired: Joi.boolean(),
    userName: Joi.string().when('userNameRequired', {
      is: Joi.exist(),
      then: Joi.string()
        .min(3)
        .max(20)
        .regex(/^[A-Za-z ]*$/)
        .exist()
        .messages({
          'string.base': 'Please enter valid userName',
          'string.min': 'userName name must be at least 3 characters long',
          'string.max': 'userName name must be at most 20 characters long',
          'any.required': 'userName is required',
        }),
    }),
    email: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    primaryEmail: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    passwordRequired: Joi.boolean(),
    password: Joi.string().when('passwordRequired', {
      is: Joi.exist(),
      then: Joi.string().required().messages({
        'string.base': 'Please enter valid password',
        'any.required': 'password is required',
      }),
    }),
    timeZone: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    passwordConfirmationRequired: Joi.boolean(),
    // passwordConfirmation: Joi.string().when('passwordConfirmationRequired', {
    //   is: Joi.exist(),
    //   then: Joi.string().valid(Joi.ref('password')).exist().messages({
    //     'any.only': 'Passwords must match',
    //     'any.required': 'passwordConfirmation is required',
    //   }),
    // }),
    currentPasswordRequired: Joi.boolean(),
    // currentPassword: Joi.string().when('currentPasswordRequired', {
    //   is: Joi.exist(),
    //   then: Joi.string().exist().messages({
    //     'any.required': 'currentPassword is required',
    //   }),
    // }),
    vehicleIdentificationNumber: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    makeModelYear: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    registrationNumber: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    lastMaintenance: Joi.string()
      // .max(DateTime.now().toFormat('MM/dd/yyyy'))
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    createdAt: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    description: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    startTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    // site: Joi.object().min(1).message(t('errors.any.required')),
    associatedSites: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    billingDetails: billingDetailsSchema,
    contactDetails: billingContactsCreationSchema,
    userDetails: userDetailsSchema,
    title: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    message: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    scheduledAt: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    // addressLine1: Joi.string().messages({
    //   'any.required': t('errors.any.required'),
    //   'string.base': t('errors.any.required'),
    //   'string.empty': t('errors.any.required'),
    // }),
    sectionsAttributes: Joi.array()
      .items(sectionSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
      .messages({
        'string.base': t('errors.string.base'),
        'string.min': t('errors.password.string.min'),
        'string.max': t('errors.password.string.min'),
        'string.pattern.base': t('errors.password.string.pattern.base'),
        'any.required': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    passwordConfirmation: Joi.string()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.only': t('errors.passwordConfirmation.string.only'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    currentPassword: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    questionSchema,
    instructions: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    content: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    startDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    location: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    device: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    checkpointType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    company: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    propertyName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    locationSource: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    associatedFranchise: Joi.object()
      .empty('')
      .messages({
        'any.required': t('errors.associatedFranchise'),
      }),
    salesPerson: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    stage: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    HubspotMap: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    property: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    pipeline: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    dealOwner: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    companyDomain: Joi.string()
      .pattern(/^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/, { name: 'domain' })
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': '{{#label}} fails to match the domain pattern.', // Custom message for pattern failure
      }),
    companyName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    companyIndustry: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    companyOwner: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    numberOfEmployees: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    revenue: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    googleAddress: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    reason: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    checkNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    leaveReason: Joi.string()
      .max(250)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    followUpDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    dealName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    intern: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    templateableType: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    availability: Joi.array()
      .items(
        Joi.object({
          startTime: Joi.string().required(),
          endTime: Joi.string().when('startTime', {
            is: 'none',
            then: Joi.forbidden(),
            otherwise: Joi.string().required(),
          }),
        }),
      )
      .messages({
        'any.min': t('errors.any.required'),
        'array.min': t('errors.any.required'),
        'array.base': t('errors.any.required'),
        'number.min': t('errors.any.required'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    thresholds: Joi.array()
      .items(
        Joi.object({
          slug: Joi.string(),
          timeValue: Joi.when('slug', {
            is: 'early_clock_in',
            then: Joi.number().required().min(0).max(60),
            otherwise: Joi.number().required().min(1).max(9999),
          }),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    officerAttendanceNotifications: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(0).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    autoClockOut: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(0).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    overtimeHoursLimit: Joi.array()
      .items(
        Joi.object({
          value: Joi.number().required().empty('').min(0).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    visitConfigurations: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),

    breakRules: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    runSheetDurations: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    shiftHits: Joi.array()
      .items(
        Joi.object({
          value: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    operationalServices: Joi.array()
      .items(
        Joi.object({
          minRate: Joi.number().required().min(0).max(9999),
          maxRate: Joi.number().required().min(1).max(9999).greater(Joi.ref('minRate')),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'number.greater': t('errors.number.greater'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    extraServices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    fuelSurcharge: Joi.object({
      enabled: Joi.boolean().optional().allow(null),

      type: Joi.when('enabled', {
        is: true,
        then: Joi.string()
          .required()
          .valid('percentage', 'fixed_value')
          .messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
            'any.only': t('errors.any.required'),
          }),
        otherwise: Joi.any().optional().allow('', null),
      }),

      value: Joi.when('enabled', {
        is: true,
        then: Joi.number()
          .required()
          .messages({
            'any.required': t('errors.any.required'),
            'number.base': t('errors.any.required'),
          }),
        otherwise: Joi.any().optional().allow('', null),
      }),
    }).optional(),
    additionalClientServices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    devices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    geofence: Joi.array()
      .items(
        Joi.object({
          active: Joi.boolean().messages({
            'boolean.base': t('errors.boolean.invalid'),
            'any.required': t('errors.any.required'),
          }),
          value: Joi.number()
            .min(0)
            .unsafe()
            .messages({
              'number.base': t('errors.any.required'),
              'number.min': t('errors.any.min'),
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
        }),
      )
      .messages({
        'array.base': t('errors.array.invalid'),
      }),
    zoneId: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    recaptchaToken: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    numberOfUnits: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    occupancyRate: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    averageRent: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    releaseVersion: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    publishDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    managementCompany: Joi.string()
      .empty('')
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
      }),
    startsAt: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endsAt: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    runsheetName: Joi.string()
      .min(1)
      .max(60)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    lineItems: Joi.array()
      .items(lineItemsSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    isRefund: Joi.boolean().optional(),
    originalInvoiceNumber: Joi.when('isRefund', {
      is: true,
      then: Joi.string()
        .trim()
        .required()
        .messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      otherwise: Joi.string().allow('', null).optional(),
    }),
    originalInvoiceCreateDate: Joi.when('isRefund', {
      is: true,
      then: Joi.string()
        .required()
        .messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      otherwise: Joi.string().allow('', null).optional(),
    }),
    invoiceDate: timezoneSchema(t),
    dueDate: timezoneSchema(t),
    periodEnd: timezoneSchema(t),
    periodStart: timezoneSchema(t),
    invoiceMemo: Joi.string()
      .max(4000)
      .allow('', null) // allow empty or null
      .messages({
        'string.max': t('errors.any.invoiceMemoMax'),
      }),
    dynamicFormField: Joi.object().pattern(/.*/, valueSchemaForDynamicForm(t)),

    dailySiteSummaryReceivers: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    incidentReportReceivers: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    dispatchReportReceivers: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    customerPortalInvitedEmails: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    visitor_load_profile: visitorLoadProfile,
    dispatchType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerAddress: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerPhoneNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    buildingNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    apartmentNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    dispatchDescription: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerRequestOfficerCallBack: Joi.boolean(),
    callFromMonitoringServiceType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    duration: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    breakRule: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    breakStartsOffset: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    breakEndsOffset: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    preBreakAlert: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    breakType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    groupName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    jobWage: Joi.string()
      .pattern(
        /^(?:0?7\.(?:2[5-9]|[3-9]\d?)|0?[89](?:\.\d{1,2})?|0?[1-9]\d(?:\.\d{1,2})?|0?1[0-6]\d(?:\.\d{1,2})?|0?17[0-4](?:\.\d{1,2})?|0?175(?:\.0{1,2})?)$/,
      )
      // .min(0.01)
      // .max(99.99)
      .messages({
        'string.pattern.base': t('errors.invalid_format_wage'),
        'string.base': t('errors.any.required'),
        // 'number.min': t('errors.any.min.wage', { min: '0.01' }),
        // 'number.max': t('errors.any.max.wage', { max: '99.99' }),
        'any.required': t('errors.any.required'),
      }),

    officerRate: Joi.string()
      .pattern(
        /^(?:0?7\.(?:2[5-9]|[3-9]\d?)|0?[89](?:\.\d{1,2})?|0?[1-9]\d(?:\.\d{1,2})?|0?1[0-6]\d(?:\.\d{1,2})?|0?17[0-4](?:\.\d{1,2})?|0?175(?:\.0{1,2})?)$/,
      )
      // .min(0.01)
      // .max(99.99)
      .messages({
        'string.pattern.base': t('errors.invalid_format_wage'),
        'string.base': t('errors.any.required'),
        // 'number.min': t('errors.any.min.wage', { min: '0.01' }),
        // 'number.max': t('errors.any.max.wage', { max: '99.99' }),
        'any.required': t('errors.any.required'),
      }),
    payable: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    addendumContracts: Joi.array()
      .items(
        Joi.object({
          serviceId: Joi.string(),
          shiftIds: Joi.array().items(Joi.string()).min(1),
        }),
      )
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    additionalDetails: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    lastWorkingDay: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
  });

  try {
    const options = {
      errors: {
        wrap: {
          label: '',
        },
      },
      abortEarly: false,
      allowUnknown: true,
    };
    const { error } = await schema.validateAsync(form, options);
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const message = t(detail.message);
        const key = detail.context.key;
        const firstLetterCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
        let messageArray = message.split(' ');
        messageArray[0] = errorMessages[key] ? errorMessages[key] : firstLetterCapitalized;
        messageArray = messageArray.join(' ');
        errors[detail.path] = t(messageArray);
      });

      return errors;
    }

    return {}; // No errors
  } catch (err) {
    const errors = {};
    err.details.forEach((detail) => {
      const message = t(detail.message);
      if (!shouldNotAttachLabel) {
        let key =
          LANGUAGES_ERROR_MESSAGES?.[detail?.context?.key]?.[currentLanguage] ||
          detail.context.key?.toString();
        if (typeof key !== 'string' && detail?.path?.[1]) {
          key = detail?.path?.[1];
        } else {
          key = key.replace(/([A-Z])/g, ' $1');
        }
        const firstLetterCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
        let messageArray = message.split(' ');
        messageArray[0] = errorMessages[detail.context.key]
          ? errorMessages[detail.context.key]
          : firstLetterCapitalized;
        messageArray = messageArray.join(' ');
        errors[detail.path] = t(messageArray);
      } else {
        errors[detail.path] = message;
      }
    });
    return errors;
  }
}

export const joiValidateErrors = async ({ data, t, field }) => {
  const errors = await joiValidate(data, t, field); // e.g; { tours } or { shifts }

  if (errors && Object.keys(errors).length) {
    return errors;
  }

  return null;
};
