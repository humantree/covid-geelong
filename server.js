const Koa = require('koa');
const checkForCases = require('./check-for-cases');

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(async (ctx) => {
  const skipTimeCheck = ctx.request.query.skipTimeCheck
    ? ctx.request.query.skipTimeCheck.toLowerCase() === 'true'
    : false;

  ctx.body = await checkForCases(skipTimeCheck);
});

app.listen(port);
