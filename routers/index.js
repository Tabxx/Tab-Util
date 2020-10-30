const router = require('koa-router')();
const DocumentKeyword = require('../controllers/DocumentKeyword')

router.post('/uploadFile', DocumentKeyword.uploadFile)
router.get('/search', DocumentKeyword.IdentifyKeywords)

module.exports = router; 