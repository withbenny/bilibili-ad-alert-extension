const UIManager = {
    showNotification(hasAd, keywords) {
        this.removeNotification();
        const anchorContainer = document.querySelector(BiliHelperConfig.SELECTORS.ANCHOR);
        if (!anchorContainer) {
            console.error(`${BiliHelperConfig.LOG_PREFIX} Cannot find UI injection point.`);
            return;
        }

        const notificationElement = this.createNotificationElement(hasAd, keywords);
        anchorContainer.prepend(notificationElement);

        this.injectStyles();
    },
    
    createNotificationElement(hasAd, keywords) {
        const message = hasAd ? '视频可能包含广告' : '视频未检测到广告';
        const typeClass = hasAd ? BiliHelperConfig.UI.WARNING_CLASS : BiliHelperConfig.UI.INFO_CLASS;
        
        const container = document.createElement('div');
        container.id = BiliHelperConfig.UI.ITEM_ID;
        container.className = 'video-argue item';
        if (hasAd) {
            container.title = '可疑关键词：' + [...keywords].join(', ');
        }

        const innerDiv = document.createElement('div');
        innerDiv.className = `video-argue-inner pure-text general ${typeClass}`;

        const iconSvg = this.createIconSvg(hasAd);
        innerDiv.appendChild(iconSvg);

        const textDiv = document.createElement('div');
        textDiv.className = 'argue-text';
        textDiv.textContent = message;
        innerDiv.appendChild(textDiv);
        
        container.appendChild(innerDiv);
        
        return container;
    },
    
    createIconSvg(hasAd) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'remark-icon');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        
        if (hasAd) {
            svg.setAttribute('viewBox', '0 0 24 24');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M9.83496 3.5C10.7972 1.83333 13.20285 1.83334 14.16505 3.5L21.7428 16.625C22.705 18.29165 21.5022 20.375 19.5777 20.375L4.42228 20.375C2.49778 20.375 1.29496 18.29165 2.25722 16.625L9.83496 3.5zM12 8.125C11.5858 8.125 11.25 8.46079 11.25 8.875L11.25 13.5C11.25 13.9142 11.5858 14.25 12 14.25C12.4142 14.25 12.75 13.9142 12.75 13.5L12.75 8.875C12.75 8.46079 12.4142 8.125 12 8.125zM12.75 16.125C12.75 15.7108 12.4142 15.375 12 15.375C11.5858 15.375 11.25 15.7108 11.25 16.125L11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5L12.75 16.125z');
            path.setAttribute('fill', 'currentColor');
            svg.appendChild(path);
        } else {
            svg.setAttribute('viewBox', '0 0 96 96');
            
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M58.3945,32.1563,42.9961,50.625l-5.3906-6.4629a5.995,5.995,0,1,0-9.211,7.6758l9.9961,12a5.9914,5.9914,0,0,0,9.211.0059l20.0039-24a5.9988,5.9988,0,1,0-9.211-7.6875Z');
            path1.setAttribute('fill', 'currentColor');
            
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M48,0A48,48,0,1,0,96,48,48.0512,48.0512,0,0,0,48,0Zm0,84A36,36,0,1,1,84,48,36.0393,36.0393,0,0,1,48,84Z');
            path2.setAttribute('fill', 'currentColor');
            
            svg.appendChild(path1);
            svg.appendChild(path2);
        }
        
        return svg;
    },
    
    removeNotification() {
        const existingItem = document.getElementById(BiliHelperConfig.UI.ITEM_ID);
        if (existingItem) {
            existingItem.remove();
        }
    },
    
    injectStyles() {
        if (document.getElementById(BiliHelperConfig.UI.STYLE_ID)) {
            return;
        }
        
        const styleSheet = document.createElement('style');
        styleSheet.id = BiliHelperConfig.UI.STYLE_ID;
        styleSheet.innerHTML = `
            #${BiliHelperConfig.UI.ITEM_ID} {
                display: inline-flex;
                align-items: center;
                border-right: 1px solid #E3E5E7;
                margin-right: 12px;
                padding-right: 12px;
            }
            #${BiliHelperConfig.UI.ITEM_ID} .video-argue-inner.general {
                display: inline-flex;
                align-items: center;
                background-color: #f1f2f3;
                border-radius: 6px;
                padding: 2px 6px;
                height: 24px;
                box-sizing: border-box;
            }
            #${BiliHelperConfig.UI.ITEM_ID} .remark-icon {
                flex-shrink: 0;
                margin-right: 4px;
                width: 16px !important;
                height: 16px !important;
            }
            #${BiliHelperConfig.UI.ITEM_ID} .argue-text {
                font-size: 13px;
                line-height: 1;
            }
            #${BiliHelperConfig.UI.ITEM_ID} .video-argue-inner.${BiliHelperConfig.UI.WARNING_CLASS} { 
                color: #FF9300 !important; 
            }
            #${BiliHelperConfig.UI.ITEM_ID} .video-argue-inner.${BiliHelperConfig.UI.INFO_CLASS} { 
                color: #45b97c !important; 
            }
        `;
        
        document.head.appendChild(styleSheet);
    },

    logDetails(bv, hasAd, foundKeywords, videoDescription, response) {
        console.groupCollapsed(`${BiliHelperConfig.LOG_PREFIX} Click to expand detailed log (BV: ${bv})`);
        
        const adMessage = hasAd 
            ? `This video may contain advertising (Keywords: ${[...foundKeywords].join(', ')})` 
            : 'No advertising detected.';
        console.log(`[BilibiliAdAlert] ${adMessage}`);
        console.log('---');
        console.log('Video description:', videoDescription);
        console.log('Pinned comments:', response.data || 'NONE');
        
        if (response.fromCache) {
            console.log('Data source: Cache');
        } else {
            console.log('Data source: API Request');
        }
        
        console.groupEnd();
    }
};