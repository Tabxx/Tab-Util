const Koa = require('koa');
const static = require('koa-static')
const cors = require('koa2-cors')
const path = require('path')
const koaBody = require('koa-body');
const app = new Koa();
const router = require('./routers')


// 静态资源访问
app.use(static(path.join(__dirname, './public/dist')))

app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024    // 设置上传文件大小最大限制，默认2M
  }
}));

app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(5000, () => {
  console.log('server starting at loaclhost:5000')
})