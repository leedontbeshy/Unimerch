const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message = 'Error', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

module.exports = {
    successResponse,
    errorResponse
};
