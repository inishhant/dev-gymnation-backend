class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!!",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.message = message;
        this.success = false;

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

// const error = new ApiError(201,"Not Found",["Bad request",""]);
// console.log(error);

export { ApiError };