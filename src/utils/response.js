// src/utils/response.js
class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }

    static unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, message, 401);
    }

    static forbidden(res, message = 'Access forbidden') {
        return this.error(res, message, 403);
    }

    static badRequest(res, message = 'Bad request', errors = null) {
        return this.error(res, message, 400, errors);
    }

    static validationError(res, errors) {
        return this.error(res, 'Validation failed', 422, errors);
    }

    static paginated(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                currentPage: pagination.page,
                totalPages: pagination.totalPages,
                totalItems: pagination.total,
                itemsPerPage: pagination.limit,
                hasNextPage: pagination.page < pagination.totalPages,
                hasPrevPage: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = ApiResponse;