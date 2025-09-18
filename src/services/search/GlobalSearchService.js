const ProductSearchService = require('./ProductSearchService');
const CategorySearchService = require('./CategorySearchService');
const ReviewSearchService = require('./ReviewSearchService');

/**
 * Service xử lý tìm kiếm toàn cục - tìm kiếm trên nhiều domain
 */
class GlobalSearchService {
    /**
     * Tìm kiếm toàn cục
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Object} - Kết quả tìm kiếm từ nhiều nguồn
     */
    static async globalSearch(searchParams) {
        const {
            q,
            types = ['products', 'categories'],
            limit = 5
        } = searchParams;

        const results = {};
        const searchTypes = Array.isArray(types) ? types : types.split(',').map(t => t.trim());

        try {
            const searchPromises = [];

            // Tìm kiếm sản phẩm
            if (searchTypes.includes('products')) {
                searchPromises.push(
                    ProductSearchService.searchProducts({
                        q,
                        limit,
                        status: 'available'
                    }).then(productResults => {
                        results.products = {
                            items: productResults.products.slice(0, limit),
                            total: productResults.pagination.total_items
                        };
                    }).catch(error => {
                        console.warn('Product search failed in global search:', error);
                        results.products = { items: [], total: 0 };
                    })
                );
            }

            // Tìm kiếm danh mục
            if (searchTypes.includes('categories')) {
                searchPromises.push(
                    CategorySearchService.searchCategories({
                        q,
                        limit
                    }).then(categoryResults => {
                        results.categories = {
                            items: categoryResults.categories.slice(0, limit),
                            total: categoryResults.pagination.total_items
                        };
                    }).catch(error => {
                        console.warn('Category search failed in global search:', error);
                        results.categories = { items: [], total: 0 };
                    })
                );
            }

            // Tìm kiếm đánh giá
            if (searchTypes.includes('reviews')) {
                searchPromises.push(
                    ReviewSearchService.searchReviews({
                        q,
                        limit
                    }).then(reviewResults => {
                        results.reviews = {
                            items: reviewResults.reviews.slice(0, limit),
                            total: reviewResults.pagination.total_items
                        };
                    }).catch(error => {
                        console.warn('Review search failed in global search:', error);
                        results.reviews = { items: [], total: 0 };
                    })
                );
            }

            // Đợi tất cả search hoàn thành
            await Promise.all(searchPromises);

            return {
                query: q,
                searched_types: searchTypes,
                results
            };
        } catch (error) {
            console.error('Global search error:', error);
            throw new Error('Lỗi khi tìm kiếm toàn cục');
        }
    }

    /**
     * Tìm kiếm nhanh - chỉ lấy kết quả cơ bản
     * @param {string} query - Từ khóa tìm kiếm
     * @param {number} limit - Số lượng kết quả mỗi loại
     * @returns {Object} - Kết quả tìm kiếm nhanh
     */
    static async quickSearch(query, limit = 3) {
        if (!query || query.trim().length < 2) {
            return {
                query,
                results: {
                    products: { items: [], total: 0 },
                    categories: { items: [], total: 0 }
                }
            };
        }

        return await this.globalSearch({
            q: query,
            types: ['products', 'categories'],
            limit
        });
    }

    /**
     * Tìm kiếm với aggregation - tổng hợp kết quả từ nhiều nguồn
     * @param {string} query - Từ khóa tìm kiếm
     * @returns {Object} - Kết quả aggregated
     */
    static async aggregatedSearch(query) {
        if (!query || query.trim().length < 2) {
            return {
                query,
                total_results: 0,
                breakdown: {},
                suggestions: []
            };
        }

        try {
            const searchResults = await this.globalSearch({
                q: query,
                types: ['products', 'categories', 'reviews'],
                limit: 10
            });

            // Tính tổng số kết quả
            let totalResults = 0;
            const breakdown = {};

            Object.keys(searchResults.results).forEach(type => {
                const typeTotal = searchResults.results[type].total;
                totalResults += typeTotal;
                breakdown[type] = typeTotal;
            });

            return {
                query,
                total_results: totalResults,
                breakdown,
                results: searchResults.results
            };
        } catch (error) {
            console.error('Aggregated search error:', error);
            throw new Error('Lỗi khi thực hiện aggregated search');
        }
    }

    /**
     * Tìm kiếm với trend analysis
     * @param {string} query - Từ khóa tìm kiếm
     * @returns {Object} - Kết quả với trend analysis
     */
    static async trendSearch(query) {
        try {
            const searchResults = await this.aggregatedSearch(query);

            // Tạm thời trả về mock trend data
            // Có thể implement real trend analysis sau này
            const trendData = {
                ...searchResults,
                trend_score: Math.random() * 100, // Mock score
                related_keywords: [
                    `${query} sale`,
                    `${query} new`,
                    `${query} cheap`,
                    `best ${query}`
                ].slice(0, 3),
                search_frequency: 'medium' // low, medium, high
            };

            return trendData;
        } catch (error) {
            console.error('Trend search error:', error);
            throw new Error('Lỗi khi thực hiện trend search');
        }
    }
}

module.exports = GlobalSearchService;
