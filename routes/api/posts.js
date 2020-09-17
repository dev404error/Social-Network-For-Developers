const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');

// /api/posts
// post
// private
router.post('/', [ auth, [ check('text').not().isEmpty() ] ], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		const user = await User.findById(req.user.id).select('-password');

		const newPost = new Post({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		});

		const post = await newPost.save();

		res.json(post);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

// api/posts/
// get
// private
router.get('/', auth, async (req, res) => {
	try {
		const post = await Post.find().sort({ date: -1 });

		if (!post) {
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		res.json(post);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

// api/posts/:id
// get
// private
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		res.json(post);
	} catch (error) {
		console.log(error);
		if (error.kind === 'ObjectId' || error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		res.status(500).send('Server Error');
	}
});

// api/posts/:id
// delete
// private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ msg: 'Post Not Found' });
		}

		if (post.user.toString() !== req.user.id) {
			res.status(401).json({ msg: 'User not Authorized' });
		}

		await post.remove();

		res.json({ msg: 'Post Removed' });
	} catch (error) {
		console.log(error);
		if (error.kind === 'ObjectId' || error.name === 'CastError') {
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		console.log(error);
		res.status(500).send('Server Error');
	}
});

//put
//api/posts/like/:id
// private
router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//check if the post is already liked
		if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (error) {
		console.log(error);
		res.status(500).send('Server Error');
	}
});

//put
//api/posts/unlike/:id
// private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		//check if the post is already liked
		if (post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
			return res.status(400).json({ msg: 'Post is not yet liked' });
		}

		const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (error) {
		console.log(error);
		res.status(500).send('Server Error');
	}
});

// /api/posts/comment/:id
// post
// private
router.post('/comment/:id', [ auth, [ check('text').not().isEmpty() ] ], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
		}
		const user = await User.findById(req.user.id).select('-password');
		const post = await Post.findById(req.params.id);

		const newComment = {
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		};

		post.comments.unshift(newComment);

		await post.save();

		res.json(post.comments);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

// api/posts/comment/:id/:comment_id
//  delete
// private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		//getting the post
		const post = await Post.findById(req.params.id);

		//findng the comment to be deleted
		const comment = post.comments.find((comment) => comment.id === req.params.comment_id);

		//checking if the comment exists
		if (!comment) {
			res.status(404).json({ msg: 'Comment not found' });
		}

		if (comment.user.toString() !== req.user.id) {
			res.status(401).json({ msg: 'User not Authorized' });
		}

		//getting the index of the comment to be deleted
		const removeIndex = post.comments.map((comment) => comment.user.toString()).indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
