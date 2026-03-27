const express = require("express");
const { Product } = require("../models");
const router = express.Router();
const upload = require("../middlewares/uploads");

router.post("/products", upload.any(), async (req, res) => {
  try {
    const { description, size, colors, attachedVideos } = req.body;

    const images = req.files
      .filter(f => f.fieldname === 'images')
      .map(f => f.filename);

    const attachedImages = req.files
      .filter(f => f.fieldname === 'attachedImages')
      .map(f => f.filename);

    let videoLinks = [];
    if (req.body.videoLinks) {
      try {
        videoLinks = typeof req.body.videoLinks === 'string'
          ? JSON.parse(req.body.videoLinks)
          : req.body.videoLinks;
        if (!Array.isArray(videoLinks)) videoLinks = [videoLinks];
      } catch (e) {
        videoLinks = [req.body.videoLinks];
      }
    }

    let parsedVideos = [];
    if (attachedVideos) {
      try {
        parsedVideos = typeof attachedVideos === 'string'
          ? JSON.parse(attachedVideos)
          : attachedVideos;
        if (!Array.isArray(parsedVideos)) parsedVideos = [parsedVideos];
      } catch (e) {
        parsedVideos = [attachedVideos];
      }
    }

    const product = await Product.create({
      images,
      videoLinks,
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

router.put("/products/:id", upload.any(), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { description, size, colors } = req.body;

    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files
        .filter(f => f.fieldname === "images")
        .map(f => f.filename);
    }

    product.description = description ?? product.description;
    product.size = size ?? product.size;
    product.colors = colors ?? product.colors;

    if (newImages.length > 0) {
      product.images = newImages;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
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

router.put("/products/:id/media", upload.any(), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let newVideoLinks = [];
    if (req.body.videoLinks) {
      try {
        newVideoLinks = typeof req.body.videoLinks === 'string'
          ? JSON.parse(req.body.videoLinks)
          : req.body.videoLinks;
        if (!Array.isArray(newVideoLinks)) newVideoLinks = [newVideoLinks];
      } catch (e) {
        newVideoLinks = [req.body.videoLinks];
      }
    }

    const newAttachedImages = req.files
      .filter(f => f.fieldname === 'attachedImages')
      .map(f => f.filename);

    let newAttachedVideos = [];
    if (req.body.attachedVideos) {
      try {
        newAttachedVideos = typeof req.body.attachedVideos === 'string'
          ? JSON.parse(req.body.attachedVideos)
          : req.body.attachedVideos;
        if (!Array.isArray(newAttachedVideos)) newAttachedVideos = [newAttachedVideos];
      } catch (e) {
        newAttachedVideos = [req.body.attachedVideos];
      }
    }

    product.videoLinks     = [...(product.videoLinks || []), ...newVideoLinks];
    product.attachedImages = [...(product.attachedImages || []), ...newAttachedImages];
    product.attachedVideos = [...(product.attachedVideos || []), ...newAttachedVideos];

    await product.save();
    res.status(200).json({ message: "Updated successfully", product });

  } catch (err) {
    console.error("❌ Error updating product media:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/products/:id/media", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ error: "type و value مطلوبان" });
    }

    const allowed = ["images", "attachedImages", "videoLinks", "attachedVideos"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ error: "type غير صالح" });
    }

    const current = product[type] || [];
    const updated = current.filter(item => item !== value);

    if (current.length === updated.length) {
      return res.status(404).json({ error: "العنصر غير موجود في القائمة" });
    }

    product[type] = updated;
    await product.save();

    res.status(200).json({
      message: "تم الحذف بنجاح",
      deleted: value,
      [type]: product[type]
    });

  } catch (err) {
    console.error("❌ Error deleting media:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
