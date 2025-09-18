/**
 * Utility class để xây dựng dynamic search queries
 */
class SearchQueryBuilder {
    constructor() {
        this.whereConditions = [];
        this.queryParams = [];
        this.paramIndex = 1;
    }

    /**
     * Reset builder để tái sử dụng
     */
    reset() {
        this.whereConditions = [];
        this.queryParams = [];
        this.paramIndex = 1;
        return this;
    }

    /**
     * Thêm điều kiện text search (ILIKE)
     * @param {string} value - Giá trị tìm kiếm
     * @param {Array<string>} fields - Danh sách field cần search
     * @returns {SearchQueryBuilder}
     */
    addTextSearch(value, fields) {
        if (value && value.trim() !== '') {
            const conditions = fields.map(field => `${field} ILIKE $${this.paramIndex}`);
            this.whereConditions.push(`(${conditions.join(' OR ')})`);
            this.queryParams.push(`%${value.trim()}%`);
            this.paramIndex++;
        }
        return this;
    }

    /**
     * Thêm điều kiện equals
     * @param {string} field - Tên field
     * @param {any} value - Giá trị
     * @returns {SearchQueryBuilder}
     */
    addEquals(field, value) {
        if (value !== undefined && value !== null && value !== '') {
            this.whereConditions.push(`${field} = $${this.paramIndex}`);
            this.queryParams.push(value);
            this.paramIndex++;
        }
        return this;
    }

    /**
     * Thêm điều kiện khoảng giá trị (range)
     * @param {string} field - Tên field
     * @param {any} min - Giá trị tối thiểu
     * @param {any} max - Giá trị tối đa
     * @returns {SearchQueryBuilder}
     */
    addRange(field, min, max) {
        if (min !== undefined && min !== null && min !== '') {
            this.whereConditions.push(`${field} >= $${this.paramIndex}`);
            this.queryParams.push(parseFloat(min));
            this.paramIndex++;
        }
        
        if (max !== undefined && max !== null && max !== '') {
            this.whereConditions.push(`${field} <= $${this.paramIndex}`);
            this.queryParams.push(parseFloat(max));
            this.paramIndex++;
        }
        
        return this;
    }

    /**
     * Thêm điều kiện date range
     * @param {string} field - Tên field
     * @param {string} fromDate - Ngày bắt đầu (YYYY-MM-DD)
     * @param {string} toDate - Ngày kết thúc (YYYY-MM-DD)
     * @returns {SearchQueryBuilder}
     */
    addDateRange(field, fromDate, toDate) {
        if (fromDate) {
            this.whereConditions.push(`DATE(${field}) >= $${this.paramIndex}`);
            this.queryParams.push(fromDate);
            this.paramIndex++;
        }
        
        if (toDate) {
            this.whereConditions.push(`DATE(${field}) <= $${this.paramIndex}`);
            this.queryParams.push(toDate);
            this.paramIndex++;
        }
        
        return this;
    }

    /**
     * Thêm điều kiện IN
     * @param {string} field - Tên field
     * @param {Array} values - Danh sách giá trị
     * @returns {SearchQueryBuilder}
     */
    addIn(field, values) {
        if (values && Array.isArray(values) && values.length > 0) {
            const placeholders = values.map(() => `$${this.paramIndex++}`).join(',');
            this.whereConditions.push(`${field} IN (${placeholders})`);
            this.queryParams.push(...values);
        }
        return this;
    }

    /**
     * Thêm điều kiện LIKE partial match
     * @param {string} field - Tên field
     * @param {string} value - Giá trị
     * @returns {SearchQueryBuilder}
     */
    addLike(field, value) {
        if (value && value.trim() !== '') {
            this.whereConditions.push(`${field} ILIKE $${this.paramIndex}`);
            this.queryParams.push(`%${value.trim()}%`);
            this.paramIndex++;
        }
        return this;
    }

    /**
     * Thêm điều kiện custom
     * @param {string} condition - Điều kiện SQL
     * @param {Array} params - Tham số
     * @returns {SearchQueryBuilder}
     */
    addCustomCondition(condition, params = []) {
        if (condition) {
            this.whereConditions.push(condition);
            this.queryParams.push(...params);
            this.paramIndex += params.length;
        }
        return this;
    }

    /**
     * Lấy WHERE clause
     * @param {string} defaultCondition - Điều kiện mặc định nếu không có condition nào
     * @returns {string}
     */
    getWhereClause(defaultCondition = 'TRUE') {
        if (this.whereConditions.length === 0) {
            return defaultCondition;
        }
        return this.whereConditions.join(' AND ');
    }

    /**
     * Lấy WHERE clause với prefix WHERE
     * @param {string} defaultCondition - Điều kiện mặc định
     * @returns {string}
     */
    getWhereClauseWithPrefix(defaultCondition = 'TRUE') {
        const whereClause = this.getWhereClause(defaultCondition);
        return whereClause === 'TRUE' ? '' : `WHERE ${whereClause}`;
    }

    /**
     * Lấy query parameters
     * @returns {Array}
     */
    getQueryParams() {
        return [...this.queryParams];
    }

    /**
     * Lấy param index hiện tại (để thêm LIMIT/OFFSET)
     * @returns {number}
     */
    getCurrentParamIndex() {
        return this.paramIndex;
    }

    /**
     * Xây dựng ORDER BY clause
     * @param {string} sortBy - Field để sắp xếp
     * @param {string} sortOrder - Thứ tự (asc/desc)
     * @param {Object} validSorts - Mapping của valid sort fields
     * @returns {string}
     */
    static buildOrderBy(sortBy = 'created_at', sortOrder = 'desc', validSorts = {}) {
        const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        
        if (validSorts[sortBy]) {
            return `${validSorts[sortBy]} ${order}`;
        }
        
        // Default fallback
        return `created_at ${order}`;
    }

    /**
     * Tính toán pagination
     * @param {number} page - Số trang
     * @param {number} limit - Số item per page
     * @returns {Object}
     */
    static calculatePagination(page = 1, limit = 20) {
        const currentPage = Math.max(1, parseInt(page));
        const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (currentPage - 1) * itemsPerPage;
        
        return {
            page: currentPage,
            limit: itemsPerPage,
            offset
        };
    }

    /**
     * Xây dựng response pagination
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Items per page
     * @param {number} total - Tổng số items
     * @returns {Object}
     */
    static buildPaginationResponse(page, limit, total) {
        const totalPages = Math.ceil(total / limit);
        
        return {
            current_page: parseInt(page),
            total_pages: totalPages,
            total_items: total,
            items_per_page: parseInt(limit),
            has_next: page < totalPages,
            has_prev: page > 1
        };
    }
}

module.exports = SearchQueryBuilder;
