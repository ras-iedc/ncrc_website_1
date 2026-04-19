import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost } from '../controllers/post.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPost);

// Admin only
router.use(auth, requireRole('ADMIN'));
router.post('/', validate(createPostSchema), createPost);
router.patch('/:id', validate(updatePostSchema), updatePost);
router.delete('/:id', deletePost);

export default router;
