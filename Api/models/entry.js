const mongoose = require('mongoose');
const softDelete = require('../helpers/softDelete');
const dbFields = require('../helpers/dbFields');
const mongooseHistory = require('../helpers/mongooseHistory');

const { Schema } = mongoose;

const schema = Schema(
  {
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    company: {
      _id: false,
      id: { type: Schema.Types.ObjectId, ref: 'Company', index: true, required: true },
      name: { type: String, maxlength: 128, trim: true }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

schema.plugin(softDelete);

schema.plugin(dbFields, {
  fields: {
    listing: ['_id', 'type', 'amount', 'description', 'category', 'date', 'createdBy', 'createdAt'],
    cp: ['_id', 'type', 'amount', 'description', 'category', 'company', 'date', 'createdBy', 'updatedAt', 'createdAt']
  }
});

schema.plugin(
  mongooseHistory({
    mongoose,
    modelName: 'entries_h',
    userCollection: 'User',
    accountCollection: 'Company',
    userFieldName: 'createdBy',
    accountFieldName: 'company',
    noDiffSaveOnMethods: []
  })
);

module.exports = mongoose.models.Entry || mongoose.model('Entry', schema);
