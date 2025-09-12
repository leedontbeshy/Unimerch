const { URL } = require('url');
const querystring = require('querystring');

class RequestProcessor {
    static async parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.setEncoding('utf8');
            
            req.on('data', chunk => {
                body += chunk;
            });
            
            req.on('end', () => {
                try {
                    // Try parse as JSON first
                    if (req.headers['content-type']?.includes('application/json')) {
                        resolve(JSON.parse(body));
                    } 
                    // Parse as form data
                    else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
                        resolve(querystring.parse(body));
                    }
                    // Return raw body
                    else {
                        resolve(body);
                    }
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            });
            
            req.on('error', reject);
        });
    }
    
    static parseUrl(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // Parse query parameters
        const query = {};
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });
        
        return {
            pathname: url.pathname,
            query: query,
            search: url.search
        };
    }
    
    static parseParams(pathname, pattern) {
        const params = {};
        const patternParts = pattern.split('/');
        const pathnameParts = pathname.split('/');
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = pathnameParts[i];
            }
        }
        
        return params;
    }
}

module.exports = RequestProcessor;
