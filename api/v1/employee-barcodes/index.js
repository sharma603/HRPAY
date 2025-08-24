import express from 'express';
import { 
  createEmployeeBarcode, 
  getEmployeeBarcodes, 
  getEmployeeBarcodeById, 
  updateEmployeeBarcode, 
  deleteEmployeeBarcode,
  getEmployeeBarcodeByEmployeeId
} from './controller.js';

const router = express.Router();

// Employee Barcode routes
router.post('/', createEmployeeBarcode);
router.get('/', getEmployeeBarcodes);
router.get('/employee/:employeeId', getEmployeeBarcodeByEmployeeId);
router.get('/:id', getEmployeeBarcodeById);
router.put('/:id', updateEmployeeBarcode);
router.delete('/:id', deleteEmployeeBarcode);

export default router;
