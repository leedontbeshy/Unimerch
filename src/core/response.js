class ResponseHelper {
    static json(res, data, statusCode = 200) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(data));
    }
    
    static status(res, statusCode) {
        res.statusCode = statusCode;
        return {
            json: (data) => ResponseHelper.json(res, data, statusCode)
        };
    }
    
    static success(res, data, message = 'Success', statusCode = 200) {
        return ResponseHelper.json(res, {
            success: true,
            message,
            data
        }, statusCode);
    }
    
    static error(res, message = 'Error', statusCode = 400, errors = null) {
        return ResponseHelper.json(res, {
            success: false,
            message,
            errors
        }, statusCode);
    }
    
    static handleCORS(res) {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
    }
}

module.exports = ResponseHelper;


