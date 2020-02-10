import { required, confirmed, email, min, min_value } from 'vee-validate/dist/rules';
import { extend } from 'vee-validate';

extend('required', {
  ...required,
  message: 'This {_field_} is required'
});

extend('email', {
  ...email,
  message: 'This {_field_} must be a valid email'
});

extend('confirmed', {
  ...confirmed,
  message: 'This {_field_} confirmation does not match'
});

extend('min', {
  ...min,
  message: 'This {_field_} must be 6 characters long'
});

extend('min_value', {
  ...min_value,
  message: 'This {_field_} must have a value greater than or equal to {min}'
});
