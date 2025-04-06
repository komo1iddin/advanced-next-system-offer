import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  provinceId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      index: true,
      validate: {
        validator: function(value: string) {
          return value.length >= 2;
        },
        message: 'City name must be at least 2 characters long'
      }
    },
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Province',
      required: true,
      index: true,
      validate: {
        validator: async function(value: mongoose.Schema.Types.ObjectId) {
          const Province = mongoose.model('Province');
          const province = await Province.findById(value);
          return !!province;
        },
        message: 'Invalid province ID'
      }
    }
  },
  {
    timestamps: true,
    collection: 'cities'
  }
);

// Add compound index for common queries
CitySchema.index({ name: 1, provinceId: 1 }, { unique: true });

// Add validation middleware
CitySchema.pre('save', function(this: ICity, next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

// Add cascade delete middleware
CitySchema.pre('deleteOne', { document: true, query: false }, async function(this: ICity) {
  // Remove all study offers associated with this city
  const StudyOffer = mongoose.model('StudyOffer');
  await StudyOffer.deleteMany({ cityId: this._id });
});

export default mongoose.models.City || mongoose.model<ICity>('City', CitySchema); 