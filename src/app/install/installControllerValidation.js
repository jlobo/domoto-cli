const Validation = require('../validation');

module.exports = class InstallControllerValidation extends Validation {
  constructor(form) {
    super(form);
  }

  validate() {
    this.form.validate({
      rules: {
        package: { regex: /^[^\s"'~^\\\/]+$/ },
      },
      messages: {
        package: {
          required: 'Extension is required',
          regex: 'Extension contains invalid characters',
        },
      },
    });
  }
};
