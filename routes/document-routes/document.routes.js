import express from "express";
import * as documentController from "../../controllers/document-controller/documentController.js";

const router = express.Router();

// Create document
router.post("/create", documentController.createDocument);

// Create multiple documents
router.post("/create-multiple", documentController.createMultipleDocuments);

// Get all documents
router.get("/", documentController.getAllDocuments);

// Get document stats
router.get("/stats", documentController.getDocumentStats);

// Get documents needing renewal
router.get("/renewal", documentController.getDocumentsNeedingRenewal);

// Get documents by category
router.get("/category/:category", documentController.getDocumentsByCategory);

// Get document by ID
router.get("/:id", documentController.getDocumentById);

// Update document
router.put("/:id", documentController.updateDocument);

// Delete document (soft delete)
router.delete("/:id", documentController.deleteDocument);

export default router;
