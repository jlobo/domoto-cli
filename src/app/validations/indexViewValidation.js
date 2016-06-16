const Validation = require('./validation');

module.exports = class IndexViewValidation extends Validation {
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
          required: 'La extensión es requerida',
          regx: 'La extensión contiene caracteres inválidos',
        },
      },
    });
  }
};
