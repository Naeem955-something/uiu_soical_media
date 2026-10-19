const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema({
  reporterName: { type: String, required: true },
  reporterInitials: { type: String, required: true },
  reporterRole: { type: String, required: true },
  reportedContent: { type: String, required: true },
  locationContext: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Dismissed'], default: 'Pending' }
}, { timestamps: true });

const AdminReport = mongoose.model('AdminReport', adminReportSchema);
module.exports = AdminReport;
