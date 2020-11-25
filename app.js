const Koa = require('koa');
const static = require('koa-static')
const cors = require('koa2-cors')
const path = require('path')
const koaBody = require('koa-body');
const app = new Koa();
const router = require('./routers')
app.use(cors())
app.use(async (ctx, next) => {
  await sleep(2000)
  await next();
})

async function sleep(timer) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timer)
  })
}

// 静态资源访问
app.use(static(path.join(__dirname, './public/dist')))

app.use(koaBody({
  multipart: true,
}));


app.use(router.routes())
app.use(router.allowedMethods())

app.listen(5000, () => {
  console.log('server starting at loaclhost:5000')
})