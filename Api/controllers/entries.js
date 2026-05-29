const Entry = require('../models/entry');
const { SendData, ServerError, NotFound, Unauthorized } = require('../helpers/response');
const { canGetEntry, canUpdateEntry, canDeleteEntry } = require('../rbac/entries');
const getter = require('../helpers/getter');

const entryQuery = ({ type, dateFrom, dateTo, filter }) => {
  const query = {};

  if (type) query.type = type;

  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  if (filter) {
    const regex = new RegExp(filter, 'i');
    query.$or = [{ description: regex }, { category: regex }];
  }

  return query;
};

module.exports.get = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { user } = res.locals;
    const { roles: companyRoles = [] } = user.company;
    const { roles: globalRoles = [] } = user;
    const roles = Array.from(new Set([...companyRoles, ...globalRoles]));

    const query = entryQuery(req.query);
    query['company.id'] = companyId;

    if (!roles.includes('admin') && !roles.includes('superuser')) {
      query.createdBy = user.id;
    }

    const data = await getter(Entry, query, req, res);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.create = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { user } = res.locals;

    const entry = await new Entry({
      ...req.body,
      company: { id: companyId, name: user.company.name },
      createdBy: user.id
    }).save();

    return next(SendData(entry.response('cp'), 201));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.getById = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const entry = await canGetEntry(user, id);
    if (entry === null) return next(NotFound());
    if (!entry) return next(Unauthorized());

    return next(SendData(entry.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const entry = await canUpdateEntry(user, id);
    if (entry === null) return next(NotFound());
    if (!entry) return next(Unauthorized());

    const data = Object.assign(entry, body);

    data.__history = {
      event: 'update',
      method: 'patch',
      user: user.id,
      company: user.company.id
    };

    await data.save();

    return next(SendData(entry.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const entry = await canDeleteEntry(user, id);
    if (entry === null) return next(NotFound());
    if (!entry) return next(Unauthorized());

    entry.__history = {
      event: 'delete',
      method: 'delete',
      user: user.id,
      company: user.company.id
    };

    await entry.softDelete();

    return next(SendData({ message: 'Entry deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};
