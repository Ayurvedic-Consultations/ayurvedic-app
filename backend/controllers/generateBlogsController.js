// Webhook endpoint
exports.generateBlogs = async (req, res) => {
    try {
        console.log("Incoming blog:", req.body);

        const { title, content, author } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title & content are required" });
        }

        await Blog.create({ title, content, author });
        res.status(200).json({ message: "Blog saved!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};
