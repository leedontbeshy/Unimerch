class Router {
    constructor() {
        this.routes = {
            GET: new Map(),
            POST: new Map(),
            PUT: new Map(),
            DELETE: new Map(),
            OPTIONS: new Map()
        };
    }
    
    get(path, handler) {
        this.routes.GET.set(path, handler);
    }
    
    post(path, handler) {
        this.routes.POST.set(path, handler);
    }
    
    put(path, handler) {
        this.routes.PUT.set(path, handler);
    }
    
    delete(path, handler) {
        this.routes.DELETE.set(path, handler);
    }
    
    use(basePath, subRouter) {
        // Merge sub-router routes with base path
        for (const [method, routeMap] of Object.entries(subRouter.routes)) {
            for (const [path, handler] of routeMap) {
                const fullPath = basePath + path;
                this.routes[method].set(fullPath, handler);
            }
        }
    }
    
    match(method, pathname) {
        const routeMap = this.routes[method];
        if (!routeMap) return null;
        
        // Exact match first
        if (routeMap.has(pathname)) {
            return { handler: routeMap.get(pathname), params: {} };
        }
        
        // Pattern match with parameters
        for (const [pattern, handler] of routeMap) {
            const match = this.matchPattern(pathname, pattern);
            if (match) {
                return { handler, params: match.params };
            }
        }
        
        return null;
    }
    
    matchPattern(pathname, pattern) {
        const pathParts = pathname.split('/').filter(p => p);
        const patternParts = pattern.split('/').filter(p => p);
        
        if (pathParts.length !== patternParts.length) {
            return null;
        }
        
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            if (patternPart.startsWith(':')) {
                params[patternPart.slice(1)] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return { params };
    }
}

module.exports = Router;