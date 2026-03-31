import express from 'express';
import {
    getHistory,
    createHistory
} from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getHistory);
router.post('/', createHistory);

export default router;
