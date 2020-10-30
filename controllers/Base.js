class BaseController {
  constructor() { }
  success(ctx, data = null, code = 0, msg = "") {
    ctx.body = {
      code,
      msg,
      data
    }
  }

  fail(ctx, code = -1, msg = "", data = null) {
    ctx.body = {
      code,
      msg,
      data
    }
  }
}

module.exports = BaseController