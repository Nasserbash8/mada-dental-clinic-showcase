/**
 * Appointment model - intentionally redacted in this public sample.
 *
 * The real project defines the document structure here. It is omitted on
 * purpose so the repository shows the application structure (routes, hooks,
 * components) without exposing the data model. The loose definition below
 * only keeps the imports in this sample resolvable.
 */
import mongoose from "mongoose";

const schema = new mongoose.Schema({}, { strict: false });

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", schema);

export default Appointment;
