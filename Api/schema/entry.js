module.exports = {
  createEntry: {
    $id: 'createEntry',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'integer', minimum: 1 },
      description: { type: 'string', maxLength: 500 },
      category: { type: 'string', maxLength: 100 },
      date: { type: 'string', format: 'date-time' }
    },
    required: ['type', 'amount'],
    additionalProperties: false
  },
  updateEntry: {
    $id: 'updateEntry',
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['expense', 'income'] },
      amount: { type: 'integer', minimum: 1 },
      description: { type: 'string', maxLength: 500 },
      category: { type: 'string', maxLength: 100 },
      date: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
  }
};
