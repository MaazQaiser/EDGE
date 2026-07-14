import * as Joi from 'joi';

export default async function joiValidate(form, t) {
  const schema = Joi.object({
    avatar: Joi.string().messages({
      'any.required': 'Avatar name is required',
    }),
    price: Joi.number().messages({
      'any.required': 'Price is required',
    }),
    terms: Joi.boolean().valid(true).messages({
      'any.required': 'The terms and conditions must be accepted.',
      'any.only': 'Terms must be accepted',
    }),
    firstName: Joi.string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-z ]*$/)
      .messages({
        'string.base': 'Please enter valid firstName',
        'string.min': 'firstName name must be at least 3 characters long',
        'string.max': 'firstName name must be at most 20 characters long',
        'any.required': t('errors.any.required'),
        'string.empty': t('errors.string.empty'),
      }),
    lastName: Joi.string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-z ]*$/)
      .messages({
        'string.base': 'Please enter valid lastName',
        'string.min': 'lastName name must be at least 3 characters long',
        'string.max': 'lastName name must be at most 20 characters long',
        'any.required': t('errors.any.required'),
        'string.empty': t('errors.string.empty'),
      }),
    gender: Joi.string().valid('male', 'female', 'other').messages({
      'any.only': 'Invalid gender value',
      'any.required': 'gender is required',
    }),
    country: Joi.string()
      .regex(/^[A-Za-z ]*$/)
      .messages({
        'string.base': 'Please enter valid country',
        'any.required': 'country is required',
      }),
    state: Joi.string()
      .regex(/^[A-Za-z ]*$/)
      .messages({
        'string.base': 'Please enter valid state',
        'any.required': 'state is required',
      }),
    username: Joi.string()
      .min(3)
      .max(20)
      .regex(/^[A-Za-z ]*$/)
      .messages({
        'string.base': 'Please enter valid userName',
        'string.min': 'userName name must be at least 3 characters long',
        'string.max': 'userName name must be at most 20 characters long',
      }),
    email: Joi.string()
      .email({ tlds: false })
      .messages({
        'string.email': t('errors.string.email'),
        'string.empty': t('errors.string.empty'),
        'any.required': t('errors.any.required'),
      }),
    password: Joi.string().messages({
      'string.base': t('errors.string.base'),
      'any.required': t('errors.any.required'),
    }),
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
      .messages({
        'string.base': t('errors.string.base'),
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be at most 20 characters long',
        'string.pattern.base':
          'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character',
        'any.required': t('errors.any.required'),
      }),
    passwordConfirmation: Joi.string().valid(Joi.ref('newPassword')).messages({
      'any.only': 'Passwords must match',
      'any.required': 'password Confirmation is required',
    }),
    currentPassword: Joi.string().messages({
      'any.required': 'currentPassword is required',
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
    };
    const { error } = await schema.validateAsync(form, options);

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const key = detail.context.key;
        const message = detail.message;
        errors[key] = message;
      });

      return errors;
    }

    return {}; // No errors
  } catch (err) {
    const errors = {};
    err.details.forEach((err) => {
      errors[err.path] = err.message;
    });
    return errors;
  }
}
