const CacheManager = {
    CACHE_PREFIX: 'bili_pinned_',
    
    getCacheKey(bv) {
        return this.CACHE_PREFIX + bv;
    },

    async get(bv) {
        try {
            const key = this.getCacheKey(bv);
            const result = await chrome.storage.local.get(key);
            
            if (!result[key]) {
                return null;
            }
            
            const cached = result[key];
            const now = Date.now();

            if (now - cached.timestamp > BiliHelperConfig.CACHE_EXPIRY) {
                await this.remove(bv);
                return null;
            }
            
            return cached.data;
        } catch (error) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Read cache failed:`, error);
            return null;
        }
    },
    
    async set(bv, data) {
        try {
            const key = this.getCacheKey(bv);
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            
            await chrome.storage.local.set({ [key]: cacheData });
            return true;
        } catch (error) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Write cache failed:`, error);
            return false;
        }
    },
    
    async remove(bv) {
        try {
            const key = this.getCacheKey(bv);
            await chrome.storage.local.remove(key);
            return true;
        } catch (error) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Remove cache failed:`, error);
            return false;
        }
    },

    async clear() {
        try {
            const allData = await chrome.storage.local.get(null);
            const keysToRemove = Object.keys(allData).filter(key => 
                key.startsWith(this.CACHE_PREFIX)
            );
            
            if (keysToRemove.length > 0) {
                await chrome.storage.local.remove(keysToRemove);
            }
            
            return true;
        } catch (error) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Clear cache failed:`, error);
            return false;
        }
    }
};
