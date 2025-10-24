import { Schema, model } from "mongoose";

const problemSchema = new Schema(
  {
    problemSlug: {
      type: String,
      required: true,
      unique: true,
    },
    hints: {
      type: [String],
      required: true,
    },
    approach: {
      type: String,
      required: true,
    },
    solution1: {
      type: String,
      required: true,
    },
    solution2: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Problem = model("Problem", problemSchema);

export default Problem;
