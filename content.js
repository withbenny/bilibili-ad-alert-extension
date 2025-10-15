if (window.self === window.top) {
    console.log(`${BiliHelperConfig.LOG_PREFIX} Content script loaded with cache support.`);

    AdDetector.init();
    
    const extractBvFromUrl = () => {
        const bvMatch = window.location.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/);
        return bvMatch ? bvMatch[1] : null;
    };

    const fetchPinnedCommentsWithCache = async (bv) => {
        const cachedData = await CacheManager.get(bv);
        
        if (cachedData) {
            console.log(`${BiliHelperConfig.LOG_PREFIX} Using cached data (BV: ${bv})`);
            return {
                success: true,
                data: cachedData,
                fromCache: true
            };
        }

        console.log(`${BiliHelperConfig.LOG_PREFIX} Fetching from API (BV: ${bv})`);
        
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                { type: 'fetchPinnedComments', bv: bv },
                async (response) => {
                    if (!response) {
                        resolve({ success: false, message: 'Unable to get response' });
                        return;
                    }

                    if (response.success && response.data) {
                        await CacheManager.set(bv, response.data);
                    }
                    
                    resolve({ ...response, fromCache: false });
                }
            );
        });
    };
    
    const runDetection = async () => {
        console.log(`${BiliHelperConfig.LOG_PREFIX} Running detection logic...`);

        const bv = extractBvFromUrl();
        if (!bv) {
            console.log(`${BiliHelperConfig.LOG_PREFIX} Cannot extract BV number from URL.`);
            return;
        }
        
        try {
            const response = await fetchPinnedCommentsWithCache(bv);
            
            const detectionResult = AdDetector.detectAll(response.data || []);
            UIManager.showNotification(detectionResult.hasAd, detectionResult.keywords);
            UIManager.logDetails(
                bv,
                detectionResult.hasAd,
                detectionResult.keywords,
                detectionResult.description,
                response
            );
            
        } catch (error) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Error occurred during detection:`, error);
        }
    };
    
    let debounceTimer = null;
    const debouncedDetection = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runDetection, BiliHelperConfig.DEBOUNCE_DELAY);
    };
    
    const setupTitleObserver = () => {
        const titleElement = document.querySelector(BiliHelperConfig.SELECTORS.TITLE);
        
        if (!titleElement) {
            console.warn(`${BiliHelperConfig.LOG_PREFIX} Cannot find title element, unable to observe changes`);
            return;
        }
        
        const observer = new MutationObserver(() => {
            debouncedDetection();
        });
        
        observer.observe(titleElement, { childList: true });
        
        console.log(`${BiliHelperConfig.LOG_PREFIX} Title observer setup complete`);
    };
    
    const init = () => {
        setupTitleObserver();
        setTimeout(runDetection, BiliHelperConfig.INITIAL_DELAY);
    };
    
    init();
}
