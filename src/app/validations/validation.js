module.exports = class Validation {
  constructor(form) {
    this.form = $(form);
  }

  validate() {
    this.form.validate();
  }

  get isValid() {
    return this.form.valid && this.form.valid();
  }

  static setDefaults() {
    $.validator.setDefaults({
      errorClass: 'invalid',
      validClass: 'valid',
      errorPlacement: function errorPlacement(error, element) {
        element.next('label').attr('data-error', error.contents().text());
      },
    });
  }

  static setMethods() {
    $.validator.addMethod('regex', function regexValidation(value, element, regexp) {
      const re = new RegExp(regexp);
      return this.optional(element) || re.test(value);
    }, 'La entrada no es valida');
  }
};

module.exports.setDefaults();
module.exports.setMethods();
