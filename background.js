importScripts('crypto-js.min.js', 'utils.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'fetchPinnedComments') {
        const bv = request.bv;

        (async () => {
            try {
                const cookies = await chrome.cookies.getAll({ domain: "bilibili.com" });
                
                if (cookies.length === 0) {
                    throw new Error("Cannot find cookies for 'bilibili.com', please make sure you are logged in.");
                }

                const cookie_str = cookies.map(c => `${c.name}=${c.value}`).join('; ');
                
                const result = await getPinnedComment(bv, cookie_str);

                sendResponse(result);

            } catch (error) {
                console.error('[BilibiliAdAlert] Error fetching pinned comments:', error);
                sendResponse({ 
                    success: false, 
                    message: error.message 
                });
            }
        })();

        return true;
    }
});