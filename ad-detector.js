const AdDetector = {
    adKeywordsRegex: null,

    init() {
        if (typeof adKeywords !== 'undefined' && Array.isArray(adKeywords)) {
            const processedKeywords = adKeywords.map(keyword => {
                let processed = keyword.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
                processed = processed.replace(/\*/g, '.*');
                return processed;
            });
            
            this.adKeywordsRegex = new RegExp(processedKeywords.join('|'), 'i');
        } else {
            console.error(`${BiliHelperConfig.LOG_PREFIX} ad-keywords undefined`);
            this.adKeywordsRegex = /(?!)/;
        }
    },

    detectKeyword(text) {
        if (!text || !this.adKeywordsRegex) {
            return null;
        }
        
        const match = text.match(this.adKeywordsRegex);
        return match ? match[0] : null;
    },

    detectInDescription() {
        const descElement = document.querySelector(BiliHelperConfig.SELECTORS.DESC);
        const videoDescription = descElement ? descElement.textContent.trim() : '';
        
        const foundKeywords = new Set();
        const keyword = this.detectKeyword(videoDescription);
        
        if (keyword) {
            foundKeywords.add(keyword);
        }
        
        return {
            hasAd: foundKeywords.size > 0,
            keywords: foundKeywords,
            description: videoDescription || 'Cannot find description in this video.'
        };
    },
    
    detectInComments(comments) {
        const foundKeywords = new Set();
        
        if (!Array.isArray(comments)) {
            return { hasAd: false, keywords: foundKeywords };
        }
        
        for (const comment of comments) {
            if (!comment || !comment.comment) {
                continue;
            }
            
            const keyword = this.detectKeyword(comment.comment);
            if (keyword) {
                foundKeywords.add(keyword);
            }
        }
        
        return {
            hasAd: foundKeywords.size > 0,
            keywords: foundKeywords
        };
    },

    detectAll(comments) {
        const descResult = this.detectInDescription();

        const commentResult = this.detectInComments(comments);

        const allKeywords = new Set([...descResult.keywords, ...commentResult.keywords]);
        
        return {
            hasAd: allKeywords.size > 0,
            keywords: allKeywords,
            description: descResult.description
        };
    }
};
