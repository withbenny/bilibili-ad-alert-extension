const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
];

function getMixinKey(orig) {
    let temp_str = '';
    mixinKeyEncTab.forEach((i) => {
        temp_str += orig[i];
    });
    return temp_str.slice(0, 32);
}

function encWbi(params, img_key, sub_key) {
    const mixin_key = getMixinKey(img_key + sub_key);
    const curr_time = Math.round(Date.now() / 1000);
    
    params.wts = curr_time;
    const sorted_params = {};
    Object.keys(params).sort().forEach(key => {
        sorted_params[key] = params[key];
    });

    const query_parts = [];
    for (const key in sorted_params) {
        let value = sorted_params[key].toString();
        value = value.replace(/[!'()*]/g, '');
        query_parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    const query = query_parts.join('&');

    const wbi_sign = CryptoJS.MD5(query + mixin_key).toString();
    
    sorted_params.w_rid = wbi_sign;
    
    return sorted_params;
}

async function getWbiKeys() {
    try {
        const response = await fetch("https://api.bilibili.com/x/web-interface/nav");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json_content = await response.json();
        
        const img_url = json_content.data.wbi_img.img_url;
        const sub_url = json_content.data.wbi_img.sub_url;

        const img_key = img_url.substring(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.'));
        const sub_key = sub_url.substring(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.'));
        
        return { img_key, sub_key };
    } catch (error) {
        console.error("Failed to get WBI keys:", error);
        return null;
    }
}

async function getVideoAid(bv) {
    const bvUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bv}`;
    try {
        const response = await fetch(bvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.code === 0) {
            return data.data.aid.toString();
        } else {
            throw new Error(data.message || "Failed to get video aid");
        }
    } catch (error) {
        console.error("Failed to get video aid:", error);
        return null;
    }
}

async function getPinnedComment(bv, cookie_str) {
    const oid = await getVideoAid(bv);
    if (!oid) return { success: false, message: "Failed to get video aid." };

    const keys = await getWbiKeys();
    if (!keys) return { success: false, message: "Failed to get WBI keys." };

    const params = {
        "next": "0",
        "type": "1",
        "oid": oid,
        "mode": "2",
    };
    
    const signed_params = encWbi(params, keys.img_key, keys.sub_key);
    
    const url = "https://api.bilibili.com/x/v2/reply/main?" + (new URLSearchParams(signed_params)).toString();
    
    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': cookie_str,
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json_data = await response.json();

        if (json_data.code !== 0 || !json_data.data || !json_data.data.top_replies || json_data.data.top_replies.length === 0) {
            return { success: true, data: [], message: "No pinned comments found." };
        }

        const pinned_comments = json_data.data.top_replies;
        const pinned_data = pinned_comments.map(comment => ({
            bv_id: bv,
            username: comment.member.uname,
            comment: comment.content.message,
            likes: comment.like,
            uid: comment.member.mid.toString(),
            crawled_time: new Date().toLocaleString()
        }));

        return { success: true, data: pinned_data };
    } catch (error) {
        console.error("Failed to fetch pinned comments:", error);
        return { success: false, message: `Failed to fetch pinned comments: ${error.message}` };
    }
}
