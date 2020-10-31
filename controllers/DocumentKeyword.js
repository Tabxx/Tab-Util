const Base = require('./Base')
const path = require('path');
const fs = require('fs')
const assetPath = '../static'
const _prefix = '$#tab#$'

class DocumentKeywordController extends Base {

  /**
   * 上传文件
   * @param {*} ctx 
   */
  async uploadFile(ctx) {
    // 上传单个文件
    const file = ctx.request.files.file; // 获取上传文件
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    let hz = file.name.split('.')[1];
    let name = +new Date();

    let filePath = path.join(__dirname, assetPath) + `/${file.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
    return ctx.body = {
      code: 0,
      data: file.name
    };
  }

  /**
   * 关键字识别
   * @param {*} ctx 
   */
  async IdentifyKeywords(ctx) {
    let {
      keyword,
      fileHash
    } = ctx.query
    if (!fileHash) {
      super.fail(ctx, -1, 'Please upload the file first')
      return
    }
    // 文件绝对路径
    let filePath = path.join(__dirname, assetPath, fileHash)

    try {
      let data = fs.readFileSync(filePath, 'utf8')
      // 关键词校验，并兼容多关键字
      let keywordArray = keyword.split(_prefix);
      if (!keywordArray || !keywordArray.length) super.fail(ctx, -1, 'Please enter the keywords！')
      //正则匹配
      let keywordRegExp = new RegExp(keywordArray.join('|'), 'ig')
      let result = keywordRegExp.test(data) ? true : false

      super.success(ctx, result, data)
    } catch (error) {
      // 读取文件错误
      super.fail(ctx, -1, error.message)
    }
  }


}

module.exports = new DocumentKeywordController();