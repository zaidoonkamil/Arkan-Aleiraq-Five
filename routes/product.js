const express = require("express");
const { Product } = require("../models");
const router = express.Router();
const upload = require("../middlewares/uploads");

router.post("/products", upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'attachedImages', maxCount: 20 }
]), async (req, res) => {
  try {
    const { videoLink, description, size, colors, attachedVideos } = req.body;
    
    // Parse attached videos if it's sent as a JSON string from client
    let parsedVideos = [];
    if (attachedVideos) {
      try {
        parsedVideos = typeof attachedVideos === 'string' ? JSON.parse(attachedVideos) : attachedVideos;
      } catch (e) {
        parsedVideos = [attachedVideos];
      }
    }

    const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
    const attachedImages = req.files['attachedImages'] ? req.files['attachedImages'].map(file => file.filename) : [];

    const product = await Product.create({
      images,
      videoLink,
      description,
      size,
      colors,
      attachedImages,
      attachedVideos: parsedVideos
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update product to add media later
router.put("/products/:id/media", upload.fields([
  { name: 'attachedImages', maxCount: 20 }
]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const newAttachedImages = req.files['attachedImages'] ? req.files['attachedImages'].map(file => file.filename) : [];
    
    let newAttachedVideos = [];
    if (req.body.attachedVideos) {
      try {
        newAttachedVideos = typeof req.body.attachedVideos === 'string' ? JSON.parse(req.body.attachedVideos) : req.body.attachedVideos;
      } catch (e) {
        newAttachedVideos = [req.body.attachedVideos];
      }
    }

    product.attachedImages = [...(product.attachedImages || []), ...newAttachedImages];
    product.attachedVideos = [...(product.attachedVideos || []), ...newAttachedVideos];

    await product.save();
    res.status(200).json({ message: "Product media updated successfully", product });

  } catch (err) {
    console.error("❌ Error updating product media:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
