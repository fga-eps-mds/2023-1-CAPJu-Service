import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FlowSchema = new Schema(
  {
    name: String,
    stages: Array,
    sequences: Array,
    deleted: Boolean,
    unity: String,
    users: Array,
  },
  {
    timestamps: true,
  }
);

export default model("Flow", FlowSchema);
