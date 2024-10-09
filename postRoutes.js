const { Router } = require('express');
const {
  createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost,
  addComment, getComments
} = require('../controllers/postControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Comment routes
router.post('/:id/comments', addComment); // No auth required
router.get('/:id/comments', getComments); // Fetch comments for a post

// Post routes
router.post('/', authMiddleware, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.get('/categories/:category', getCatPosts);
router.get('/users/:id', getUserPosts);
router.patch('/:id', authMiddleware, editPost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;



