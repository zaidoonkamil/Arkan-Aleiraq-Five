const express = require("express");
const { Details } = require("../models");
const router = express.Router();

// Add details
router.post("/details", async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "content is required" });
        }

        const details = await Details.create({ content });

        res.status(201).json({ message: "Details created successfully", details });
    } catch (err) {
        console.error("❌ Error creating details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update details
router.put("/details/:id", async (req, res) => {
    try {
        const details = await Details.findByPk(req.params.id);
        if (!details) {
            return res.status(404).json({ error: "Details not found" });
        }

        const { content } = req.body;

        details.content = content ?? details.content;

        await details.save();

        res.status(200).json({ message: "Details updated successfully", details });
    } catch (err) {
        console.error("❌ Error updating details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/details/:id", async (req, res) => {
    try {
        const details = await Details.findByPk(req.params.id);

        if (!details) {
            return res.status(404).json({ error: "Details not found" });
        }
        res.status(200).json(details);
    } catch (err) {
        console.error("❌ Error fetching details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
