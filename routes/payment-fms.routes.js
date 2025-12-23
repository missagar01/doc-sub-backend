import express from "express";
import {
    create,
    getAll,
    getById,
    update,
    remove,
    generateUniqueNo,
    // Stage 1: Approval
    approvalPending,
    approvalHistory,
    approvalProcess,
    // Stage 2: Make Payment
    makePaymentPending,
    makePaymentHistory,
    makePaymentProcess,
    // Stage 3: Tally Entry
    tallyEntryPending,
    tallyEntryHistory,
    tallyEntryProcess
} from "../controllers/payment-fms-controller.js";

const router = express.Router();

// General routes
router.post("/create", create);
router.get("/all", getAll);
router.get("/generate-unique-no", generateUniqueNo);

// Stage 1: Approval routes
router.get("/approval/pending", approvalPending);
router.get("/approval/history", approvalHistory);
router.patch("/approval/:id/process", approvalProcess);

// Stage 2: Make Payment routes
router.get("/make-payment/pending", makePaymentPending);
router.get("/make-payment/history", makePaymentHistory);
router.patch("/make-payment/:id/process", makePaymentProcess);

// Stage 3: Tally Entry routes
router.get("/tally-entry/pending", tallyEntryPending);
router.get("/tally-entry/history", tallyEntryHistory);
router.post("/tally-entry/process", tallyEntryProcess); // POST for bulk IDs

// General routes (by ID)
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
