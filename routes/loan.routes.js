import express from "express";
import * as loanController from "../controllers/loanController.js";

const router = express.Router();

// ==================== ALL LOANS ====================
// Create loan
router.post("/", loanController.createLoan);

// Get all loans
router.get("/", loanController.getAllLoans);

// Get loans for foreclosure (end date <= today)
router.get("/foreclosure-eligible", loanController.getLoansForForeclosure);

// Get loan by ID
router.get("/:id", loanController.getLoanById);

// Update loan
router.put("/:id", loanController.updateLoan);

// Delete loan
router.delete("/:id", loanController.deleteLoan);

// ==================== REQUEST FORECLOSURE ====================
// Create foreclosure request
router.post("/foreclosure/request", loanController.createForeclosureRequest);

// Get foreclosure history
router.get("/foreclosure/history", loanController.getForeclosureHistory);

// Get foreclosure requests pending NOC
router.get("/foreclosure/pending-noc", loanController.getForeclosuresPendingNOC);

// ==================== COLLECT NOC ====================
// Create or update NOC
router.post("/noc", loanController.createOrUpdateNOC);

// Get pending NOC collections
router.get("/noc/pending", loanController.getPendingNOCCollections);

// Get NOC history
router.get("/noc/history", loanController.getNOCHistory);

// Get all NOC records
router.get("/noc/all", loanController.getAllNOCRecords);

export default router;
