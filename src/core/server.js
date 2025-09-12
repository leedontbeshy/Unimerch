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
    
    // GET method với hỗ trợ multiple middlewares
    get(...args) {
        const path = args[0];
        const handlers = args.slice(1); // Tất cả handlers và middlewares
        
        if (handlers.length === 1) {
            // Chỉ có handler: server.get(path, handler)
            this.router.get(path, handlers[0]);
        } else {
            // Có middlewares: server.get(path, middleware1, middleware2, handler)
            const middlewares = handlers.slice(0, -1);
            const finalHandler = handlers[handlers.length - 1];
            
            const combinedHandler = async (req, res) => {
                let currentIndex = 0;
                
                const runNext = async () => {
                    if (currentIndex >= middlewares.length) {
                        // Tất cả middlewares đã chạy, chạy final handler
                        return await finalHandler(req, res);
                    }
                    
                    const middleware = middlewares[currentIndex++];
                    await middleware(req, res, runNext);
                };
                
                await runNext();
            };
            
            this.router.get(path, combinedHandler);
        }
    }
    
    // POST method với hỗ trợ multiple middlewares
    post(...args) {
        const path = args[0];
        const handlers = args.slice(1);
        
        if (handlers.length === 1) {
            // Chỉ có handler: server.post(path, handler)
            this.router.post(path, handlers[0]);
        } else {
            // Có middlewares: server.post(path, middleware1, middleware2, handler)
            const middlewares = handlers.slice(0, -1);
            const finalHandler = handlers[handlers.length - 1];
            
            const combinedHandler = async (req, res) => {
                let currentIndex = 0;
                
                const runNext = async () => {
                    if (currentIndex >= middlewares.length) {
                        return await finalHandler(req, res);
                    }
                    
                    const middleware = middlewares[currentIndex++];
                    await middleware(req, res, runNext);
                };
                
                await runNext();
            };
            
            this.router.post(path, combinedHandler);
        }
    }
    
    // PUT method với hỗ trợ multiple middlewares
    put(...args) {
        const path = args[0];
        const handlers = args.slice(1);
        
        if (handlers.length === 1) {
            this.router.put(path, handlers[0]);
        } else {
            const middlewares = handlers.slice(0, -1);
            const finalHandler = handlers[handlers.length - 1];
            
            const combinedHandler = async (req, res) => {
                let currentIndex = 0;
                
                const runNext = async () => {
                    if (currentIndex >= middlewares.length) {
                        return await finalHandler(req, res);
                    }
                    
                    const middleware = middlewares[currentIndex++];
                    await middleware(req, res, runNext);
                };
                
                await runNext();
            };
            
            this.router.put(path, combinedHandler);
        }
    }
    
    // DELETE method với hỗ trợ multiple middlewares
    delete(...args) {
        const path = args[0];
        const handlers = args.slice(1);
        
        if (handlers.length === 1) {
            this.router.delete(path, handlers[0]);
        } else {
            const middlewares = handlers.slice(0, -1);
            const finalHandler = handlers[handlers.length - 1];
            
            const combinedHandler = async (req, res) => {
                let currentIndex = 0;
                
                const runNext = async () => {
                    if (currentIndex >= middlewares.length) {
                        return await finalHandler(req, res);
                    }
                    
                    const middleware = middlewares[currentIndex++];
                    await middleware(req, res, runNext);
                };
                
                await runNext();
            };
            
            this.router.delete(path, combinedHandler);
        }
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
            
            // Execute global middlewares and route handler
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
