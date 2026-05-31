const supertest = require('supertest');

const app = require('../app');
const db = require('../db/connect-test');
const User = require('../models/user');
const Company = require('../models/company');
const { genereteAuthToken } = require('../helpers/auth');

const agent = supertest.agent(app);

let company1;
let admin;
let adminToken;
let user;
let userToken;

beforeAll(async () => await db.connect());
beforeEach(async () => {
  await db.clear();

  const Company1Creation = async () => {
    company1 = await new Company({
      name: 'Company1',
      lang: 'EN',
      country: 'IT'
    }).save();
  };

  const AdminCreation = async () => {
    admin = await new User({
      email: 'admin@company1.com',
      password: 'testtest',
      name: 'Admin',
      lastname: 'User',
      lang: 'EN',
      active: true,
      company: {
        id: company1.id,
        name: 'Company1',
        type: 'type1',
        roles: ['admin']
      }
    }).save();

    adminToken = genereteAuthToken(admin).token;
  };

  const UserCreation = async () => {
    user = await new User({
      email: 'user@company1.com',
      password: 'testtest',
      name: 'User',
      lastname: 'User',
      lang: 'EN',
      active: true,
      company: {
        id: company1.id,
        name: 'Company1',
        type: 'type1',
        roles: ['user']
      }
    }).save();

    userToken = genereteAuthToken(user).token;
  };

  return Company1Creation().then(() => Promise.all([AdminCreation(), UserCreation()]));
});
afterEach(() => jest.clearAllMocks());
afterAll(async () => await db.close());

describe('Unauthenticated', () => {
  test('GET /companies/:id/entries returns 401', () => agent.get(`/companies/${company1.id}/entries`).expect(401));

  test('POST /companies/:id/entries returns 401', () =>
    agent.post(`/companies/${company1.id}/entries`).send({ type: 'expense', amount: 1000 }).expect(401));
});

describe('Role: Admin', () => {
  describe('POST /companies/:id/entries', () => {
    test('Create expense entry', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1500, description: 'Lunch', category: 'Food' })
        .expect(201)
        .then(res => {
          expect(res.body).toMatchObject({
            _id: expect.any(String),
            type: 'expense',
            amount: 1500,
            description: 'Lunch',
            category: 'Food',
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          });
        }));

    test('Create income entry', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'income', amount: 50000 })
        .expect(201)
        .then(res => {
          expect(res.body).toMatchObject({
            _id: expect.any(String),
            type: 'income',
            amount: 50000
          });
        }));

    test('Create entry with date', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 2000, date: '2024-01-15T00:00:00.000Z' })
        .expect(201)
        .then(res => {
          expect(res.body).toMatchObject({ type: 'expense', amount: 2000 });
        }));

    test('Missing required type returns 400', () =>
      agent.post(`/companies/${company1.id}/entries`).set('Cookie', `accessToken=${adminToken}`).send({ amount: 1000 }).expect(400));

    test('Missing required amount returns 400', () =>
      agent.post(`/companies/${company1.id}/entries`).set('Cookie', `accessToken=${adminToken}`).send({ type: 'expense' }).expect(400));

    test('Invalid type value returns 400', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'invalid', amount: 1000 })
        .expect(400));

    test('Additional properties returns 400', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000, extra: 'field' })
        .expect(400));
  });

  describe('GET /companies/:id/entries', () => {
    test('Get all entries in company', async () => {
      await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ type: 'income', amount: 2000 });

      return agent
        .get(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body.length).toBe(2);
        });
    });

    test('Filter with regex metacharacters returns 200 not 500', () =>
      agent
        .get(`/companies/${company1.id}/entries?filter=(((`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBe(true);
        }));

    test('Filter with invalid date returns 200 not 500', () =>
      agent
        .get(`/companies/${company1.id}/entries?dateFrom=not-a-date`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(Array.isArray(res.body)).toBe(true);
        }));
  });

  describe('GET /companies/:id/entries/:entryId', () => {
    test('Get entry by id', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000, description: 'Test' });

      const entryId = createRes.body._id;

      return agent
        .get(`/companies/${company1.id}/entries/${entryId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body).toMatchObject({
            _id: entryId,
            type: 'expense',
            amount: 1000,
            description: 'Test'
          });
        });
    });

    test('Get non-existent entry returns 404', () =>
      agent.get(`/companies/${company1.id}/entries/507f1f77bcf86cd799439011`).set('Cookie', `accessToken=${adminToken}`).expect(404));

    test('Get entry from another company returns 404', async () => {
      const otherCompany = await new Company({ name: 'Other', lang: 'EN' }).save();
      const otherAdmin = await new User({
        email: 'other@other.com',
        password: 'testtest',
        active: true,
        company: { id: otherCompany.id, name: 'Other', roles: ['admin'] }
      }).save();
      const otherToken = genereteAuthToken(otherAdmin).token;

      const createRes = await agent
        .post(`/companies/${otherCompany.id}/entries`)
        .set('Cookie', `accessToken=${otherToken}`)
        .send({ type: 'expense', amount: 500 });

      return agent.get(`/companies/${company1.id}/entries/${createRes.body._id}`).set('Cookie', `accessToken=${adminToken}`).expect(404);
    });
  });

  describe('PATCH /companies/:id/entries/:entryId', () => {
    test('Update entry', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      const entryId = createRes.body._id;

      return agent
        .patch(`/companies/${company1.id}/entries/${entryId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ amount: 2000, description: 'Updated' })
        .expect(200)
        .then(res => {
          expect(res.body).toMatchObject({
            _id: entryId,
            type: 'expense',
            amount: 2000,
            description: 'Updated'
          });
        });
    });

    test('Update with additional fields returns 400', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      return agent
        .patch(`/companies/${company1.id}/entries/${createRes.body._id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ amount: 2000, extra: 'field' })
        .expect(400);
    });

    test('Update non-existent entry returns 404', () =>
      agent
        .patch(`/companies/${company1.id}/entries/507f1f77bcf86cd799439011`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ amount: 2000 })
        .expect(404));
  });

  describe('DELETE /companies/:id/entries/:entryId', () => {
    test('Delete entry (soft)', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      const entryId = createRes.body._id;

      await agent
        .delete(`/companies/${company1.id}/entries/${entryId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .expect(200)
        .then(res => {
          expect(res.body.message).toBe('Entry deleted successfully');
        });

      return agent.get(`/companies/${company1.id}/entries/${entryId}`).set('Cookie', `accessToken=${adminToken}`).expect(404);
    });

    test('Delete non-existent entry returns 404', () =>
      agent.delete(`/companies/${company1.id}/entries/507f1f77bcf86cd799439011`).set('Cookie', `accessToken=${adminToken}`).expect(404));
  });
});

describe('Role: User', () => {
  describe('POST /companies/:id/entries', () => {
    test('Create own entry', () =>
      agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ type: 'income', amount: 30000 })
        .expect(201)
        .then(res => {
          expect(res.body).toMatchObject({ type: 'income', amount: 30000 });
        }));
  });

  describe('GET /companies/:id/entries', () => {
    test('User sees only own entries', async () => {
      await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ type: 'income', amount: 2000 });

      return agent
        .get(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .expect(200)
        .then(res => {
          expect(res.body.length).toBe(1);
          expect(res.body[0].amount).toBe(2000);
        });
    });
  });

  describe('PATCH /companies/:id/entries/:entryId', () => {
    test('User can update own entry', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ type: 'expense', amount: 500 });

      return agent
        .patch(`/companies/${company1.id}/entries/${createRes.body._id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ amount: 600 })
        .expect(200)
        .then(res => {
          expect(res.body.amount).toBe(600);
        });
    });

    test("User cannot update another user's entry", async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      return agent
        .patch(`/companies/${company1.id}/entries/${createRes.body._id}`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ amount: 999 })
        .expect(401);
    });
  });

  describe('DELETE /companies/:id/entries/:entryId', () => {
    test('User can delete own entry', async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${userToken}`)
        .send({ type: 'expense', amount: 500 });

      return agent.delete(`/companies/${company1.id}/entries/${createRes.body._id}`).set('Cookie', `accessToken=${userToken}`).expect(200);
    });

    test("User cannot delete another user's entry", async () => {
      const createRes = await agent
        .post(`/companies/${company1.id}/entries`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send({ type: 'expense', amount: 1000 });

      return agent.delete(`/companies/${company1.id}/entries/${createRes.body._id}`).set('Cookie', `accessToken=${userToken}`).expect(401);
    });
  });
});
