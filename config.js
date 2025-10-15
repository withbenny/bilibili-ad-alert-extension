const BiliHelperConfig = {
    CACHE_EXPIRY: 60 * 60 * 1000,

    DEBOUNCE_DELAY: 500,

    INITIAL_DELAY: 1000,

    LOG_PREFIX: '[BilibiliAdAlert]',

    SELECTORS: {
        DESC: 'span.desc-info-text',
        ANCHOR: '.video-info-detail-list.video-info-detail-content',
        TITLE: 'title'
    },

    UI: {
        ITEM_ID: 'bilibili-ad-alert-item',
        STYLE_ID: 'bilibili-ad-alert-styles',
        WARNING_CLASS: 'warning',
        INFO_CLASS: 'info'
    }
};
