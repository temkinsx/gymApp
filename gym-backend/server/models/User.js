const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Раздельные поля для имени
  name: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  patronymic: {
    type: String,
    trim: true
  },
  // Виртуальное поле для полного имени (для совместимости)
  fullName: {
    type: String,
    trim: true
  },
  birthYear: Number,
  birthDate: Date,
  passport: {
    number: String,
    issuedBy: String,
    issueDate: Date
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true
  },
  subscription: {
    plan: String,
    duration: String,
    startDate: Date,
    endDate: Date
  },
  passportPhotoUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Виртуальное поле для получения полного имени
userSchema.virtual('fullNameVirtual').get(function() {
  return [this.surname, this.name, this.patronymic].filter(Boolean).join(' ').trim();
});

// Middleware для автоматического обновления fullName при сохранении
userSchema.pre('save', function(next) {
  if (this.name || this.surname || this.patronymic) {
    this.fullName = [this.surname, this.name, this.patronymic].filter(Boolean).join(' ').trim();
  }
  next();
});

// Включаем виртуальные поля в JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
