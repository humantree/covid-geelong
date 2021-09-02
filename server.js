const Koa = require('koa');
const checkForCases = require('./check-for-cases');

const app = new Koa();
const port = process.env.PORT || 3000;

app.use(async (ctx) => {
  ctx.body = await checkForCases();
});

app.listen(port);
