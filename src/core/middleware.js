class MiddlewareEngine {
    constructor() {
        this.middlewares = [];
    }
    
    use(middleware) {
        this.middlewares.push(middleware);
    }
    
    async execute(req, res, finalHandler) {
        let index = 0;
        
        const next = async (error) => {
            if (error) {
                return this.handleError(error, req, res);
            }
            
            if (index >= this.middlewares.length) {
                return finalHandler(req, res);
            }
            
            const middleware = this.middlewares[index++];
            try {
                await middleware(req, res, next);
            } catch (err) {
                next(err);
            }
        };
        
        await next();
    }
    
    handleError(error, req, res) {
        console.error('Middleware error:', error);
        const ResponseHelper = require('./response');
        return ResponseHelper.error(res, 'Internal Server Error', 500);
    }
}

module.exports = MiddlewareEngine;