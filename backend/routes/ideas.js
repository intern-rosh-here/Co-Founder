const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ideaController = require('../controllers/ideaController');

// Get all ideas
router.get('/', ideaController.getIdeas);

// Create idea
router.post('/create', auth, ideaController.createIdea);

// Get idea by ID
router.get('/:ideaId', auth, ideaController.getIdeaById);

// Update idea
router.put('/:ideaId', auth, ideaController.updateIdea);

// Add comment
router.post('/:ideaId/comment', auth, ideaController.addComment);

// Like idea
router.post('/:ideaId/like', auth, ideaController.likeIdea);

// Delete idea
router.delete('/:ideaId', auth, ideaController.deleteIdea);



module.exports = router;