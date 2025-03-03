const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
shiftSchema.index({ employee: 1, startTime: 1, endTime: 1 });
shiftSchema.index({ status: 1 });

// Méthode pour vérifier les chevauchements
shiftSchema.methods.hasOverlap = async function () {
  const Shift = mongoose.model("Shift");
  const overlappingShift = await Shift.findOne({
    employee: this.employee,
    _id: { $ne: this._id },
    $or: [
      {
        startTime: { $lte: this.endTime },
        endTime: { $gte: this.startTime },
      },
    ],
  });
  return !!overlappingShift;
};

const Shift = mongoose.model("Shift", shiftSchema);

module.exports = Shift;
