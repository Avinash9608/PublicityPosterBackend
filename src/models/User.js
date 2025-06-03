// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const { ROLES, KYC_STATUS } = require("../config/constants");

// const UserSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 30,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     role: {
//       type: String,
//       enum: Object.values(ROLES),
//       default: ROLES.USER,
//     },
//     kycStatus: {
//       type: String,
//       enum: Object.values(KYC_STATUS),
//       default: KYC_STATUS.PENDING,
//     },
//     kycDocs: [String], // Array of file URLs
//   },
//   {
//     timestamps: true,
//   }
// );

// // Password hashing middleware
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     if (!this.password.startsWith("$2b$")) {
//       this.password = await bcrypt.hash(this.password, 12);
//     }
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, KYC_STATUS } = require("../config/constants");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    kycStatus: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.NOT_SUBMITTED,
    },

    // KYC Fields
    aadhaarNumber: String,
    dateOfBirth: Date,
    gender: String,
    mobileNumber: String,
    documentType: String,
    documentFront: String,
    documentBack: String,
    selfie: String,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    if (!this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", UserSchema);
