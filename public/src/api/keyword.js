import request from './fetch'
let url = "http://localhost:5000"

export default {
    // 文件上传
    uploadFile(data) {
        return request.post(`${url}/uploadFile`, data)
    },
    // 识别接口
    search(keyword, fileHash) {
        return request.get(`${url}/search`, {
            keyword,
            fileHash
        })
    }
}