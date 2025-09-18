const ProductSearchModel = require('../../models/search/ProductSearchModel');
const SearchQueryBuilder = require('../../utils/SearchQueryBuilder');

/**
 * Service xử lý tìm kiếm sản phẩm
 */
class ProductSearchService {
    /**
     * Tìm kiếm sản phẩm nâng cao
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm
     */
    static async searchProducts(searchParams) {
        const {
            q = '',
            page = 1,
            limit = 20,
            category_id,
            min_price,
            max_price,
            color,
            size,
            seller_id,
            status = 'available',
            sort_by = 'created_at',
            sort_order = 'desc'
        } = searchParams;

        try {
            // Tính toán pagination
            const pagination = SearchQueryBuilder.calculatePagination(page, limit);

            // Xây dựng query conditions
            const queryBuilder = new SearchQueryBuilder();
            
            queryBuilder
                .addTextSearch(q, ['p.name', 'p.description'])
                .addEquals('p.category_id', category_id)
                .addRange('p.price', min_price, max_price)
                .addLike('p.color', color)
                .addLike('p.size', size)
                .addEquals('p.seller_id', seller_id)
                .addEquals('p.status', status);

            // Xây dựng ORDER BY
            const validSorts = {
                'created_at': 'p.created_at',
                'price': 'p.price',
                'name': 'p.name',
                'rating': 'COALESCE(AVG(r.rating), 0)'
            };
            const orderBy = SearchQueryBuilder.buildOrderBy(sort_by, sort_order, validSorts);

            // Lấy dữ liệu
            const whereClause = queryBuilder.getWhereClause();
            const queryParams = queryBuilder.getQueryParams();

            const [products, total] = await Promise.all([
                ProductSearchModel.searchProducts(
                    { whereClause, queryParams },
                    { 
                        orderBy, 
                        limit: pagination.limit, 
                        offset: pagination.offset,
                        whereClause,
                        queryParams
                    }
                ),
                ProductSearchModel.countProducts(whereClause, queryParams)
            ]);

            // Xây dựng response
            const paginationResponse = SearchQueryBuilder.buildPaginationResponse(
                pagination.page, 
                pagination.limit, 
                total
            );

            return {
                products,
                pagination: paginationResponse,
                filters: {
                    search_query: q,
                    category_id: category_id ? parseInt(category_id) : null,
                    price_range: {
                        min: min_price ? parseFloat(min_price) : null,
                        max: max_price ? parseFloat(max_price) : null
                    },
                    color,
                    size,
                    seller_id: seller_id ? parseInt(seller_id) : null,
                    status
                }
            };
        } catch (error) {
            console.error('Product search error:', error);
            throw new Error('Lỗi khi tìm kiếm sản phẩm');
        }
    }

    /**
     * Lấy gợi ý tên sản phẩm
     * @param {string} query - Từ khóa
     * @param {number} limit - Số lượng gợi ý
     * @returns {Array} - Danh sách gợi ý
     */
    static async getProductSuggestions(query, limit = 5) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        try {
            const searchTerm = `%${query.trim()}%`;
            return await ProductSearchModel.getProductSuggestions(searchTerm, limit);
        } catch (error) {
            console.error('Get product suggestions error:', error);
            return [];
        }
    }

    /**
     * Lấy filters có sẵn cho sản phẩm
     * @returns {Object} - Danh sách filters
     */
    static async getProductFilters() {
        try {
            const [colors, sizes, priceRange] = await Promise.all([
                ProductSearchModel.getAvailableColors(),
                ProductSearchModel.getAvailableSizes(),
                ProductSearchModel.getPriceRange()
            ]);

            return {
                colors,
                sizes,
                price_range: {
                    min: priceRange.min,
                    max: priceRange.max,
                    step: 50000
                },
                sort_options: [
                    { key: 'created_at', label: 'Mới nhất', order: 'desc' },
                    { key: 'created_at', label: 'Cũ nhất', order: 'asc' },
                    { key: 'price', label: 'Giá thấp đến cao', order: 'asc' },
                    { key: 'price', label: 'Giá cao đến thấp', order: 'desc' },
                    { key: 'name', label: 'Tên A-Z', order: 'asc' },
                    { key: 'name', label: 'Tên Z-A', order: 'desc' },
                    { key: 'rating', label: 'Đánh giá cao nhất', order: 'desc' }
                ],
                statuses: [
                    { key: 'available', label: 'Còn hàng' },
                    { key: 'out_of_stock', label: 'Hết hàng' },
                    { key: 'discontinued', label: 'Ngừng kinh doanh' }
                ]
            };
        } catch (error) {
            console.error('Get product filters error:', error);
            throw new Error('Lỗi khi lấy danh sách filter sản phẩm');
        }
    }
}

module.exports = ProductSearchService;
