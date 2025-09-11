const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    const ResponseHelper = require('../core/response');
    return ResponseHelper.success(res, data, message, statusCode);
};

const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
    const ResponseHelper = require('../core/response');
    return ResponseHelper.error(res, message, statusCode, errors);
};

module.exports = {
    successResponse,
    errorResponse
};
