export const usernameValidationRules = {
    required: "Username is required",
    minLength: {value: 3, message: "Username must be between 3 and 50 characters"},
    maxLength: {value: 50, message: "Username must be between 3 and 50 characters"},
    validate: (value: string) => value.trim().length > 0 || "Username is required",
};

export const emailValidationRules = {
    required: "Email is required",
    maxLength: {value: 254, message: "Email must be less than 254 characters"},
    validate: (value: string) => value.trim().length > 0 || "Email is required",
};

export const passwordValidationRules = {
    required: "Password is required",
    minLength: {value: 8, message: "Password must be between 8 and 128 characters"},
    maxLength: {value: 128, message: "Password must be between 8 and 128 characters"},
    pattern: {
        value: /^[\x21-\x7E]+$/,
        message: "Password contains invalid characters",
    },
};
