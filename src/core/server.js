const http = require('http');
const Router = require('./router');
const RequestProcessor = require('./request');
const ResponseHelper = require('./response');
const MiddlewareEngine = require('./middleware');

class NodeServer {
    constructor() {
        this.router = new Router();
        this.middlewareEngine = new MiddlewareEngine();
        this.server = null;
    }
    
    use(middleware) {
        this.middlewareEngine.use(middleware);
    }
    
    get(path, handler) {
        this.router.get(path, handler);
    }
    
    post(path, handler) {
        this.router.post(path, handler);
    }
    
    put(path, handler) {
        this.router.put(path, handler);
    }
    
    delete(path, handler) {
        this.router.delete(path, handler);
    }
    
    useRouter(basePath, subRouter) {
        this.router.use(basePath, subRouter);
    }
    
    async handleRequest(req, res) {
        try {
            // Parse URL
            const urlInfo = RequestProcessor.parseUrl(req);
            req.query = urlInfo.query;
            req.pathname = urlInfo.pathname;
            
            // Handle CORS preflight
            if (req.method === 'OPTIONS') {
                return ResponseHelper.handleCORS(res);
            }
            
            // Parse body for POST/PUT requests
            if (['POST', 'PUT'].includes(req.method)) {
                req.body = await RequestProcessor.parseBody(req);
            }
            
            // Find matching route
            const routeMatch = this.router.match(req.method, req.pathname);
            
            if (!routeMatch) {
                return ResponseHelper.error(res, 'Route not found', 404);
            }
            
            req.params = routeMatch.params;
            
            // Execute middlewares and route handler
            await this.middlewareEngine.execute(req, res, routeMatch.handler);
            
        } catch (error) {
            console.error('Server error:', error);
            ResponseHelper.error(res, 'Internal Server Error', 500);
        }
    }
    
    listen(port, callback) {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        
        this.server.listen(port, callback);
        return this.server;
    }
}

module.exports = NodeServer;
