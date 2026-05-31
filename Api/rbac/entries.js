const Entry = require('../models/entry');
const { intersection } = require('../helpers/utils');

const entryRbac = async (caller, resourceId, { authorizedRoles = [] }) => {
  const entry = await Entry.findById(resourceId);
  if (!entry) return null;

  const { id: callerId, company, roles: globalRoles } = caller;
  const { roles: companyRoles = [] } = company;
  const roles = Array.from(new Set([...companyRoles, ...globalRoles]));

  if (roles.includes('superuser')) return entry;

  if (company?.id?.toString() !== entry?.company?.id?.toString()) return null;

  if (intersection(authorizedRoles, roles).length) return entry;

  if (entry.createdBy?.toString() === callerId?.toString()) return entry;

  return false;
};

module.exports.canGetEntry = (caller, resourceId) => entryRbac(caller, resourceId, { authorizedRoles: ['superuser'] });

module.exports.canUpdateEntry = (caller, resourceId) => entryRbac(caller, resourceId, { authorizedRoles: ['superuser'] });

module.exports.canDeleteEntry = (caller, resourceId) => entryRbac(caller, resourceId, { authorizedRoles: ['superuser'] });
