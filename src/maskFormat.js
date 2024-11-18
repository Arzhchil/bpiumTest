/**
 * Allowed chars to be used in masked input
 */
export const formatCharacters = {
  "*": {
    validate(char) {
      return /[A-Za-z0-9а-яА-Я0-9]/.test(char);
    },
  },
  1: {
    validate(char) {
      return /[0-9]/.test(char);
    },
  },
  a: {
    validate(char) {
      return /[a-zа-я]/.test(char);
    },
  },
  A: {
    validate(char) {
      return /[A-ZА-Я]/.test(char);
    },
  },
};

export const formatCharsInput = {
  "*": "[A-Za-z0-9а-яА-Я0-9]",
  1: "[0-9]",
  a: "[a-zа-я]",
  A: "[A-ZА-Я]",
  "#": "[A-Z0-9]",
};
