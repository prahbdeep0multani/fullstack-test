const User = require('../../models/user');
const Company = require('../../models/company');
require('../connect');

module.exports.up = async () => {
  const company = await new Company({
    name: 'Meblabs',
    lang: 'IT',
    country: 'IT'
  }).save();

  return User.updateOne(
    { email: 'test@meblabs.com' },
    {
      $set: {
        'company.id': company._id,
        'company.name': company.name,
        'company.roles': ['admin']
      }
    }
  );
};

module.exports.down = async () => {
  const user = await User.findOne({ email: 'test@meblabs.com' });
  if (user && user.company && user.company.id) {
    await Company.deleteOne({ _id: user.company.id });
  }
  return User.updateOne({ email: 'test@meblabs.com' }, { $unset: { company: '' } });
};
