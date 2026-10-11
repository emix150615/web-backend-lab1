use("blog_db");

db.posts.insertMany([
  {
    title: "Getting Started with Node.js",
    category: "Tech",
    views: 150,
    author: { name: "Alice Johnson", email: "alice@example.com" },
    tags: ["nodejs", "express", "backend"],
    comments: [
      {
        user: "Bob",
        content: "Bài viết rất hay!",
        created_at: new Date("2026-10-01T10:00:00Z"),
      },
    ],
  },
  {
    title: "MongoDB Schema Design Best Practices",
    category: "Tech",
    views: 85,
    author: { name: "Charlie Brown", email: "charlie@example.com" },
    tags: ["mongodb", "database", "nosql"],
    comments: [
      {
        user: "David",
        content: "Cảm ơn tác giả.",
        created_at: new Date("2026-10-05T14:30:00Z"),
      },
    ],
  },
  {
    title: "10 Tips for Healthy Cooking",
    category: "Lifestyle",
    views: 200,
    author: { name: "Eva Green", email: "eva@example.com" },
    tags: ["cooking", "food", "health"],
    comments: [],
  },
]);

db.posts.find({ category: "Tech", views: { $gte: 100 } });

db.posts.find({ tags: "nodejs" });

db.posts.updateOne(
  { title: "Getting Started with Node.js" },
  {
    $push: {
      comments: {
        user: "Frank",
        content: "Bai viet chi tiet!",
        created_at: new Date(),
      },
    },
    $inc: { views: 1 },
  },
);

db.posts.aggregate([
  {
    $group: {
      _id: "$category",
      totalViews: { $sum: "$views" },
      totalPosts: { $sum: 1 },
    },
  },
]);
