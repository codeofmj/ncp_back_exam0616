const express = require('express');
const upload = require('../middlewares/upload');
const diaryController = require('../controllers/diaryController');

const router = express.Router();

router.get('/', diaryController.list);
router.get('/:id', diaryController.detail);
router.post('/', upload.single('file'), diaryController.create);
router.put('/:id', upload.single('file'), diaryController.update);
router.delete('/:id', diaryController.remove);
router.get('/:id/download', diaryController.download);

module.exports = router;
