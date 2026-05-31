const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const swaggerUI = require('swagger-ui-express');
const { createServer } = require('http');

const response = require('./middlewares/response');
const passport = require('./middlewares/passport');
const trimmer = require('./middlewares/trimmer');
const limiter = require('./middlewares/limiter');
const { validator } = require('./middlewares/validator');

const { SendData, NotFound } = require('./helpers/response');
const swaggerSpec = require('./helpers/swagger');
const checkCompany = require('./middlewares/checkCompany');
const { isAuth } = require('./middlewares/isAuth');

const routeAuth = require('./routes/auth');
const routeCompanies = require('./routes/companies');
const routeS3 = require('./routes/s3');
const routeUsers = require('./routes/users');
const routeCEntries = require('./routes/c_entries');
const routeCUsers = require('./routes/c_users');

const app = express();

const server = createServer(app);
const io = socketIo(server, { cors: { origin: process.env.CORS_ORIGIN } });

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ['content-type'],
    exposedHeaders: ['x-total-count', 'x-next-key']
  })
);
if (process.env.LIMITER === '1') app.use(limiter());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(trimmer());
app.use(passport());
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.get('/', (req, res, next) => next(SendData({ message: 'RestAPI is alive!' })));

const excludedPaths = [];

const routes = {
  auth: routeAuth,
  companies: routeCompanies,
  s3: routeS3,
  users: routeUsers,
  c_entries: routeCEntries,
  c_users: routeCUsers
};

Object.entries(routes).forEach(([f, router]) => {
  if (f.startsWith('c_'))
    app.use(
      `/companies/:companyId/${f.slice(2)}`,
      validator({ params: 'companyId' }),
      (req, res, next) => isAuth(req, res, next, { excludedPaths }),
      checkCompany({ excludedPaths }),
      router
    );
  else app.use(`/${f}`, router);
});

app.all('*', (_req, _res, next) => next(NotFound()));

app.use((toSend, _req, res, _next) => response(toSend, res));

module.exports = server;
