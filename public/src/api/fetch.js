export default {
    get(url, data) {
        let params = [];
        for (let attr in data) {
            params.push(`${attr}=${data[attr]}`);
        }
        // 不做特殊处理
        url += '?' + params.join('&');
        return fetch(url).then((response) => response.json())
    },

    post(url, body) {
        return fetch(url, {
            method: "POST",
            body
        }).then((response) => response.json())
    }
}