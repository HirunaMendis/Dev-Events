import { model, models, Schema } from "mongoose";

export interface IEvent {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  description: string;
  agenda: string[];
  about: string;
  tags: string[];
  mode: string;
  audience: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 4000,
    },
    agenda: {
      type: [String],
      default: [],
    },
    about: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000,
    },
    tags: {
      type: [String],
      default: [],
    },
    mode: {
      type: String,
      default: "In-person",
      trim: true,
    },
    audience: {
      type: String,
      default: "Developers and technology professionals",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

eventSchema.index({ date: 1, time: 1 });

eventSchema.pre("save", function normalizeEvent(next) {
  this.slug = createSlug(this.slug || this.title);
  this.date = this.date.replace(/\s*[-–]\s*/g, "-").trim();
  this.time = this.time.replace(/\s+/g, " ").trim().toUpperCase();
  next();
});

export const Event = models.Event || model<IEvent>("Event", eventSchema);
