import mongoose, { Schema, Document } from 'mongoose';

export interface IProvince extends Document {
  name: string;
  country: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProvinceSchema: Schema = new Schema(
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
        message: 'Province name must be at least 2 characters long'
      }
    },
    country: { 
      type: String, 
      required: true, 
      trim: true,
      enum: ['Canada', 'USA', 'UK', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Japan', 'South Korea', 'China', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'India', 'UAE', 'Qatar', 'Saudi Arabia', 'Turkey', 'Russia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Cyprus', 'Malta', 'Croatia', 'Slovenia', 'Slovakia', 'Estonia', 'Latvia', 'Lithuania', 'Iceland', 'Luxembourg', 'Monaco', 'Liechtenstein', 'Andorra', 'San Marino', 'Vatican City', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'Jamaica', 'Bahamas', 'Trinidad and Tobago', 'Barbados', 'Guyana', 'Suriname', 'Belize', 'South Africa', 'Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya', 'Sudan', 'Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Ghana', 'Nigeria', 'Senegal', 'Ivory Coast', 'Cameroon', 'Gabon', 'Congo', 'DRC', 'Angola', 'Mozambique', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Lesotho', 'Swaziland', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Cape Verde', 'Sao Tome and Principe', 'Equatorial Guinea', 'Guinea-Bissau', 'Liberia', 'Sierra Leone', 'Guinea', 'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Central African Republic', 'South Sudan', 'Eritrea', 'Djibouti', 'Somalia', 'Burundi', 'Malawi']
    },
    code: { 
      type: String, 
      required: true, 
      trim: true, 
      uppercase: true,
      index: true,
      validate: {
        validator: function(value: string) {
          return /^[A-Z]{2,4}$/.test(value);
        },
        message: 'Province code must be 2-4 uppercase letters'
      }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'provinces'
  }
);

// Add compound index for unique province codes per country
ProvinceSchema.index({ code: 1, country: 1 }, { unique: true });

// Add validation middleware
ProvinceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  if (this.isModified('code')) {
    this.code = this.code.trim().toUpperCase();
  }
  next();
});

// Add cascade delete middleware
ProvinceSchema.pre('remove', async function(next) {
  // Remove all cities associated with this province
  const City = mongoose.model('City');
  await City.deleteMany({ provinceId: this._id });
  
  // Remove all study offers associated with this province
  const StudyOffer = mongoose.model('StudyOffer');
  await StudyOffer.deleteMany({ provinceId: this._id });
  next();
});

export default mongoose.models.Province || mongoose.model<IProvince>('Province', ProvinceSchema); 