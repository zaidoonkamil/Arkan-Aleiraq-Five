const express = require("express");
const { User, Product, UserTask } = require("../models");
const router = express.Router();
const Sequelize = require("sequelize");
const { Op } = Sequelize;

// Helper to check if task is from exactly today
const isCreatedToday = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
};

router.get("/tasks/daily", async (req, res) => {
  try {
    // Assuming user id is sent via middleware or body for now. 
    // Usually it's req.user.id from auth middleware. For testing, taking from query.
    const userId = req.query.userId || req.body.userId; 
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user already has a task for today
    const recentTasks = await UserTask.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 1,
      include: [{ model: Product, as: 'product' }]
    });

    const lastTask = recentTasks.length > 0 ? recentTasks[0] : null;

    if (lastTask && isCreatedToday(lastTask.createdAt)) {
      return res.json({ task: lastTask });
    }

    // Need to assign a new task
    let seenProducts = user.seenProducts || [];
    
    let unseenProducts = await Product.findAll({
      where: {
        id: { [Op.notIn]: seenProducts }
      }
    });

    // If user has seen all products or there was no products ever seen, reset list
    if (unseenProducts.length === 0) {
      seenProducts = []; // Reset unseen
      unseenProducts = await Product.findAll();
    }

    if (unseenProducts.length === 0) {
      return res.status(404).json({ error: "No products available to assign." });
    }

    // Pick random product
    const randomProduct = unseenProducts[Math.floor(Math.random() * unseenProducts.length)];
    
    // Create new task
    const newTask = await UserTask.create({
      userId: user.id,
      productId: randomProduct.id,
      downloadedMedia: [],
      isCompleted: false
    });

    // Update user seen products
    user.seenProducts = [...seenProducts, randomProduct.id];
    await user.save();

    const taskWithProduct = await UserTask.findByPk(newTask.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.status(201).json({ task: taskWithProduct });

  } catch (err) {
    console.error("❌ Error fetching/generating daily task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/tasks/download", async (req, res) => {
  try {
    const { taskId, mediaUrl } = req.body;

    if (!taskId || !mediaUrl) {
      return res.status(400).json({ error: "taskId and mediaUrl are required" });
    }

    const task = await UserTask.findByPk(taskId, {
      include: [{ model: Product, as: 'product' }]
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    let downloadedMedia = task.downloadedMedia || [];

    if (!downloadedMedia.includes(mediaUrl)) {
      downloadedMedia = [...downloadedMedia, mediaUrl]; 
      task.downloadedMedia = downloadedMedia;
      task.changed('downloadedMedia', true);
    }

    const product = task.product;
    
    await task.save();


    const requiredImages = product.attachedImages || [];
    const requiredVideos = product.attachedVideos || [];
    
    const allRequiredMedia = [...requiredImages, ...requiredVideos];

    const isCompleted = allRequiredMedia.every(media => downloadedMedia.includes(media));
    
    task.isCompleted = isCompleted;
    await task.save();

    res.status(200).json({ 
      message: "Media download registered", 
      task: {
          id: task.id,
          isCompleted: task.isCompleted,
          downloadedMedia: task.downloadedMedia
      },
      product 
    });

  } catch (err) {
    console.error("❌ Error recording media download:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/status", async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "user" },
      include: [{ 
        model: UserTask, 
        as: "tasks",
        include: [{ model: Product, as: "product" }] 
      }],
      order: [["createdAt", "DESC"]]
    });

    const userStatuses = users.map(user => {
      const tasks = user.tasks || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.isCompleted).length;

      const hasCompletedAll = totalTasks > 0 && totalTasks === completedTasks;

      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        totalTasks,
        completedTasks,
        hasCompletedAll,
        tasks
      };
    });

    res.status(200).json({ users: userStatuses });
  } catch (err) {
    console.error("❌ Error fetching user task statuses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
