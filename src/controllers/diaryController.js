const diaryService = require('../services/diaryService');

async function list(req, res, next) {
  try {
    const page = req.query.page ?? 0;
    const size = req.query.size ?? 10;
    res.json(await diaryService.getDiaries(page, size));
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const diary = await diaryService.getDiaryById(req.params.id);
    if (!diary) return res.status(404).json({ message: '다이어리를 찾을 수 없습니다.' });
    res.json(diary);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const diary = await diaryService.createDiary(req.body, req.file);
    res.status(201).json(diary);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const diary = await diaryService.updateDiary(req.params.id, req.body, req.file);
    if (!diary) return res.status(404).json({ message: '다이어리를 찾을 수 없습니다.' });
    res.json(diary);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const ok = await diaryService.deleteDiary(req.params.id);
    if (!ok) return res.status(404).json({ message: '다이어리를 찾을 수 없습니다.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const info = await diaryService.getDownloadInfo(req.params.id);
    if (!info) return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });
    res.download(info.filePath, info.originalFileName);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, detail, create, update, remove, download };
