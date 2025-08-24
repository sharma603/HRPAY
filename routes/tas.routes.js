import express from 'express';
import {
  createShift, listShifts, updateShift, deleteShift,
  listLinks, createLink, updateLink, deleteLink,
  listRamadan, createRamadan, updateRamadan, deleteRamadan,
  listAttendanceSettings, createAttendanceSettings, updateAttendanceSettings, deleteAttendanceSettings,
  listWeeklyRosters, createWeeklyRoster, updateWeeklyRoster, deleteWeeklyRoster,
  listAreas, createArea, updateArea, deleteArea
} from '../controllers/tas.controller.js';

const router = express.Router();

router.get('/shifts', listShifts);
router.post('/shifts', createShift);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

router.get('/links', listLinks);
router.post('/links', createLink);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deleteLink);

router.get('/ramadan', listRamadan);
router.post('/ramadan', createRamadan);
router.put('/ramadan/:id', updateRamadan);
router.delete('/ramadan/:id', deleteRamadan);

router.get('/attendance-settings', listAttendanceSettings);
router.post('/attendance-settings', createAttendanceSettings);
router.put('/attendance-settings/:id', updateAttendanceSettings);
router.delete('/attendance-settings/:id', deleteAttendanceSettings);

router.get('/weekly-rosters', listWeeklyRosters);
router.post('/weekly-rosters', createWeeklyRoster);
router.put('/weekly-rosters/:id', updateWeeklyRoster);
router.delete('/weekly-rosters/:id', deleteWeeklyRoster);

router.get('/areas', listAreas);
router.post('/areas', createArea);
router.put('/areas/:id', updateArea);
router.delete('/areas/:id', deleteArea);

export default router;


