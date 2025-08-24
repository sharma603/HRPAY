import SystemSettings from '../../../models/systemSettings.model.js';
import CompanyInfo from '../../../models/CompanyInfo.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse 
} from '../../../utils/apiResponse.js';

// Get system settings
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SystemSettings({
        companyInfo: {
          companyName: 'HRPAY System',
          brandName: 'HRPAY',
          email: 'admin@hrpay.com',
          phone: '+974 1234 5678',
          website: 'https://hrpay.com',
          address: 'Doha, Qatar',
          city: 'Doha',
          country: 'Qatar'
        },
        systemConfig: {
          systemName: 'HRPAY',
          version: '1.0.0',
          timezone: 'Asia/Dubai',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24',
          language: 'English',
          currency: 'USD'
        }
      });
      await settings.save();
    }

    return successResponse(res, settings, "System settings retrieved successfully");
  } catch (error) {
    console.error('Error getting system settings:', error);
    return errorResponse(res, 'Failed to get system settings', 'SETTINGS_ERROR');
  }
};

// Update system settings
export const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings();
    }

    // Update settings with request data
    Object.assign(settings, req.body);
    settings.updatedBy = req.user.id;

    await settings.save();

    return successResponse(res, settings, "System settings updated successfully");
  } catch (error) {
    console.error('Error updating system settings:', error);
    return errorResponse(res, 'Failed to update system settings', 'SETTINGS_UPDATE_ERROR');
  }
};

// Get company information
export const getCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne().sort({ createdAt: -1 });
    
    if (!companyInfo) {
      return notFoundResponse(res, "Company information");
    }

    return successResponse(res, companyInfo, "Company information retrieved successfully");
  } catch (error) {
    console.error('Error fetching company info:', error);
    return errorResponse(res, 'Failed to get company information', 'COMPANY_INFO_ERROR');
  }
};

// Update company information
export const updateCompanyInfo = async (req, res) => {
  try {
    let companyInfo = await CompanyInfo.findOne();
    
    if (!companyInfo) {
      companyInfo = new CompanyInfo();
    }

    // Update company info with request data
    Object.assign(companyInfo, req.body);

    await companyInfo.save();

    return successResponse(res, companyInfo, "Company information updated successfully");
  } catch (error) {
    console.error('Error updating company info:', error);
    return errorResponse(res, 'Failed to update company information', 'COMPANY_INFO_UPDATE_ERROR');
  }
}; 