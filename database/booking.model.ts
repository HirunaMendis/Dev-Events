import { model, models, Schema, type Types } from "mongoose";

export interface IBooking {
  eventId: Types.ObjectId;
  name: string;
  email: string;
  ticketCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    ticketCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

bookingSchema.pre("save", function normalizeBooking(next) {
  this.email = this.email.trim().toLowerCase();
  this.name = this.name.replace(/\s+/g, " ").trim();
  next();
});

export const Booking = models.Booking || model<IBooking>("Booking", bookingSchema);
