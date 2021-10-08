const Koa = require('koa');
const Pug = require('koa-pug');
const checkForCases = require('./check-for-cases');

const app = new Koa();
const port = process.env.PORT || 3000;

// eslint-disable-next-line no-new
new Pug({ app, viewPath: './views' });

app.use(async (ctx) => {
  const allActive = ctx.request.path === '/active';
  const rawNumber = ctx.request.path === '/raw-number';
  const skipTimeCheck = ctx.request.query.skipTimeCheck
    ? ctx.request.query.skipTimeCheck.toLowerCase() === 'true'
    : false;

  const content = await checkForCases({ skipTimeCheck, allActive, rawNumber });

  if (rawNumber) ctx.body = { count: content };
  else await ctx.render('index', { content });
});

app.listen(port);
