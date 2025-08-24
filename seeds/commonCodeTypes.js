import mongoose from 'mongoose';
import { CodeType, CommonCode } from '../models/commonCode.model.js';

// Comprehensive list of HR Code Types with descriptions
const codeTypesData = [
  {
    name: "Gender",
    code: "GENDER",
    description: "Employee gender classifications",
    codes: [
      { code: "M", description: "Male", erpCode: "01" },
      { code: "F", description: "Female", erpCode: "02" },
      { code: "O", description: "Other", erpCode: "03" }
    ]
  },
  {
    name: "HRM Division",
    code: "HRM_DIVISION",
    description: "Human Resources Management divisions within the organization",
    codes: [
      { code: "CORP", description: "Corporate Division", erpCode: "DIV001" },
      { code: "OPS", description: "Operations Division", erpCode: "DIV002" },
      { code: "FIN", description: "Finance Division", erpCode: "DIV003" },
      { code: "IT", description: "Information Technology Division", erpCode: "DIV004" },
      { code: "HR", description: "Human Resources Division", erpCode: "DIV005" }
    ]
  },
  {
    name: "HRM Company",
    code: "HRM_COMPANY",
    description: "Company entities within the organization",
    codes: [
      { code: "MAIN", description: "Main Company", erpCode: "COMP001" },
      { code: "SUB1", description: "Subsidiary Company 1", erpCode: "COMP002" },
      { code: "SUB2", description: "Subsidiary Company 2", erpCode: "COMP003" }
    ]
  },
  {
    name: "Company Documents",
    code: "COMPANY_DOCS",
    description: "Types of company documents",
    codes: [
      { code: "TL", description: "Trade License", erpCode: "DOC001" },
      { code: "CR", description: "Commercial Registration", erpCode: "DOC002" },
      { code: "TAX", description: "Tax Registration", erpCode: "DOC003" },
      { code: "BANK", description: "Bank Documents", erpCode: "DOC004" }
    ]
  },
  {
    name: "HRM Payment Type",
    code: "HRM_PAYMENT_TYPE",
    description: "Types of payment methods used in payroll",
    codes: [
      { code: "BANK", description: "Bank Transfer", erpCode: "PAY001" },
      { code: "CASH", description: "Cash Payment", erpCode: "PAY002" },
      { code: "CHEQUE", description: "Cheque Payment", erpCode: "PAY003" },
      { code: "WPS", description: "Wages Protection System", erpCode: "PAY004" }
    ]
  },
  {
    name: "HRM Location",
    code: "HRM_LOCATION",
    description: "Work locations and branches",
    codes: [
      { code: "HO", description: "Head Office", erpCode: "LOC001" },
      { code: "BR1", description: "Branch 1", erpCode: "LOC002" },
      { code: "BR2", description: "Branch 2", erpCode: "LOC003" },
      { code: "WH", description: "Warehouse", erpCode: "LOC004" }
    ]
  },
  {
    name: "HRM Department",
    code: "HRM_DEPARTMENT",
    description: "Organizational departments",
    codes: [
      { code: "HR", description: "Human Resources", erpCode: "DEPT001" },
      { code: "FIN", description: "Finance", erpCode: "DEPT002" },
      { code: "IT", description: "Information Technology", erpCode: "DEPT003" },
      { code: "OPS", description: "Operations", erpCode: "DEPT004" },
      { code: "MKT", description: "Marketing", erpCode: "DEPT005" },
      { code: "SAL", description: "Sales", erpCode: "DEPT006" }
    ]
  },
  {
    name: "HRM Designation",
    code: "HRM_DESIGNATION",
    description: "Employee job designations and titles",
    codes: [
      { code: "CEO", description: "Chief Executive Officer", erpCode: "DES001" },
      { code: "MGR", description: "Manager", erpCode: "DES002" },
      { code: "ASMGR", description: "Assistant Manager", erpCode: "DES003" },
      { code: "SR", description: "Senior Officer", erpCode: "DES004" },
      { code: "JR", description: "Junior Officer", erpCode: "DES005" },
      { code: "EXE", description: "Executive", erpCode: "DES006" },
      { code: "ASST", description: "Assistant", erpCode: "DES007" }
    ]
  },
  {
    name: "HRM Country",
    code: "HRM_COUNTRY",
    description: "Countries for nationality and location purposes",
    codes: [
      { code: "QA", description: "Qatar", erpCode: "QAT" },
      { code: "UAE", description: "United Arab Emirates", erpCode: "ARE" },
      { code: "SA", description: "Saudi Arabia", erpCode: "SAU" },
      { code: "KW", description: "Kuwait", erpCode: "KWT" },
      { code: "BH", description: "Bahrain", erpCode: "BHR" },
      { code: "OM", description: "Oman", erpCode: "OMN" },
      { code: "IN", description: "India", erpCode: "IND" },
      { code: "PK", description: "Pakistan", erpCode: "PAK" },
      { code: "BD", description: "Bangladesh", erpCode: "BGD" },
      { code: "PH", description: "Philippines", erpCode: "PHL" }
    ]
  },
  {
    name: "HRM Religion",
    code: "HRM_RELIGION",
    description: "Religious affiliations for employee records",
    codes: [
      { code: "ISLAM", description: "Islam", erpCode: "REL001" },
      { code: "CHRISTIAN", description: "Christianity", erpCode: "REL002" },
      { code: "HINDU", description: "Hinduism", erpCode: "REL003" },
      { code: "BUDDHIST", description: "Buddhism", erpCode: "REL004" },
      { code: "OTHER", description: "Other", erpCode: "REL999" }
    ]
  },
  {
    name: "Employee Document Type",
    code: "EMP_DOC_TYPE",
    description: "Types of employee documents",
    codes: [
      { code: "PASSPORT", description: "Passport", erpCode: "EDOC001" },
      { code: "VISA", description: "Visa", erpCode: "EDOC002" },
      { code: "EMIRATES_ID", description: "Emirates ID", erpCode: "EDOC003" },
      { code: "QATAR_ID", description: "Qatar ID", erpCode: "EDOC004" },
      { code: "DRIVING_LICENSE", description: "Driving License", erpCode: "EDOC005" },
      { code: "EDUCATION_CERT", description: "Education Certificate", erpCode: "EDOC006" },
      { code: "EXPERIENCE_CERT", description: "Experience Certificate", erpCode: "EDOC007" },
      { code: "MEDICAL_CERT", description: "Medical Certificate", erpCode: "EDOC008" }
    ]
  },
  {
    name: "Training Description",
    code: "TRAINING_DESC",
    description: "Types and categories of training programs",
    codes: [
      { code: "ORIENT", description: "Orientation Training", erpCode: "TRN001" },
      { code: "SAFETY", description: "Safety Training", erpCode: "TRN002" },
      { code: "TECH", description: "Technical Training", erpCode: "TRN003" },
      { code: "SOFT", description: "Soft Skills Training", erpCode: "TRN004" },
      { code: "LEAD", description: "Leadership Training", erpCode: "TRN005" },
      { code: "COMP", description: "Compliance Training", erpCode: "TRN006" }
    ]
  },
  {
    name: "Qualification Type",
    code: "QUAL_TYPE",
    description: "Educational qualification types",
    codes: [
      { code: "HIGH_SCHOOL", description: "High School", erpCode: "QUAL001" },
      { code: "DIPLOMA", description: "Diploma", erpCode: "QUAL002" },
      { code: "BACHELOR", description: "Bachelor's Degree", erpCode: "QUAL003" },
      { code: "MASTER", description: "Master's Degree", erpCode: "QUAL004" },
      { code: "PHD", description: "PhD", erpCode: "QUAL005" },
      { code: "CERT", description: "Professional Certificate", erpCode: "QUAL006" }
    ]
  },
  {
    name: "HRM Sub Division",
    code: "HRM_SUB_DIVISION",
    description: "Sub-divisions within main divisions",
    codes: [
      { code: "CORP_ADMIN", description: "Corporate Administration", erpCode: "SUBDIV001" },
      { code: "CORP_STRAT", description: "Corporate Strategy", erpCode: "SUBDIV002" },
      { code: "OPS_PROD", description: "Operations Production", erpCode: "SUBDIV003" },
      { code: "OPS_QC", description: "Operations Quality Control", erpCode: "SUBDIV004" }
    ]
  },
  {
    name: "HRM Section",
    code: "HRM_SECTION",
    description: "Sections within departments",
    codes: [
      { code: "HR_RECRUIT", description: "HR Recruitment", erpCode: "SEC001" },
      { code: "HR_PAYROLL", description: "HR Payroll", erpCode: "SEC002" },
      { code: "FIN_ACCT", description: "Finance Accounting", erpCode: "SEC003" },
      { code: "FIN_AUDIT", description: "Finance Audit", erpCode: "SEC004" },
      { code: "IT_DEV", description: "IT Development", erpCode: "SEC005" },
      { code: "IT_SUPPORT", description: "IT Support", erpCode: "SEC006" }
    ]
  },
  {
    name: "HRM Sub Department",
    code: "HRM_SUB_DEPT",
    description: "Sub-departments within main departments",
    codes: [
      { code: "HR_ADMIN", description: "HR Administration", erpCode: "SUBDEPT001" },
      { code: "HR_DEV", description: "HR Development", erpCode: "SUBDEPT002" },
      { code: "FIN_MGMT", description: "Financial Management", erpCode: "SUBDEPT003" },
      { code: "FIN_CTRL", description: "Financial Control", erpCode: "SUBDEPT004" }
    ]
  },
  {
    name: "Reason for Separation",
    code: "SEPARATION_REASON",
    description: "Reasons for employee separation/termination",
    codes: [
      { code: "RESIGN", description: "Resignation", erpCode: "SEP001" },
      { code: "TERMINATE", description: "Termination", erpCode: "SEP002" },
      { code: "RETIRE", description: "Retirement", erpCode: "SEP003" },
      { code: "CONTRACT_END", description: "Contract End", erpCode: "SEP004" },
      { code: "TRANSFER", description: "Transfer", erpCode: "SEP005" },
      { code: "DEATH", description: "Death", erpCode: "SEP006" }
    ]
  },
  {
    name: "Insurance Company",
    code: "INSURANCE_COMPANY",
    description: "Insurance service providers",
    codes: [
      { code: "QIC", description: "Qatar Insurance Company", erpCode: "INS001" },
      { code: "ADNIC", description: "Abu Dhabi National Insurance", erpCode: "INS002" },
      { code: "TAKAFUL", description: "Qatar Islamic Insurance", erpCode: "INS003" },
      { code: "ALLIANZ", description: "Allianz Insurance", erpCode: "INS004" }
    ]
  },
  {
    name: "Insurance Category",
    code: "INSURANCE_CATEGORY",
    description: "Categories of insurance coverage",
    codes: [
      { code: "HEALTH", description: "Health Insurance", erpCode: "INSCAT001" },
      { code: "LIFE", description: "Life Insurance", erpCode: "INSCAT002" },
      { code: "ACCIDENT", description: "Accident Insurance", erpCode: "INSCAT003" },
      { code: "FAMILY", description: "Family Insurance", erpCode: "INSCAT004" }
    ]
  },
  {
    name: "HRM Employer",
    code: "HRM_EMPLOYER",
    description: "Employer entities for sponsorship purposes",
    codes: [
      { code: "MAIN_EMP", description: "Main Employer", erpCode: "EMP001" },
      { code: "SUB_EMP1", description: "Sub Employer 1", erpCode: "EMP002" },
      { code: "SUB_EMP2", description: "Sub Employer 2", erpCode: "EMP003" }
    ]
  },
  {
    name: "HRM Qualification",
    code: "HRM_QUALIFICATION",
    description: "Professional qualifications and certifications",
    codes: [
      { code: "PMP", description: "Project Management Professional", erpCode: "HRMQUAL001" },
      { code: "CPA", description: "Certified Public Accountant", erpCode: "HRMQUAL002" },
      { code: "CISSP", description: "Certified Information Systems Security Professional", erpCode: "HRMQUAL003" },
      { code: "SHRM", description: "Society for Human Resource Management", erpCode: "HRMQUAL004" }
    ]
  },
  {
    name: "HRM Qualification Area",
    code: "HRM_QUAL_AREA",
    description: "Areas of qualification and expertise",
    codes: [
      { code: "MGMT", description: "Management", erpCode: "QUALAREA001" },
      { code: "ACCT", description: "Accounting", erpCode: "QUALAREA002" },
      { code: "ENG", description: "Engineering", erpCode: "QUALAREA003" },
      { code: "IT", description: "Information Technology", erpCode: "QUALAREA004" },
      { code: "HR", description: "Human Resources", erpCode: "QUALAREA005" },
      { code: "MKT", description: "Marketing", erpCode: "QUALAREA006" }
    ]
  },
  {
    name: "HRM Holiday",
    code: "HRM_HOLIDAY",
    description: "Types of holidays and leave days",
    codes: [
      { code: "NATIONAL", description: "National Holiday", erpCode: "HOL001" },
      { code: "RELIGIOUS", description: "Religious Holiday", erpCode: "HOL002" },
      { code: "COMPANY", description: "Company Holiday", erpCode: "HOL003" },
      { code: "SPECIAL", description: "Special Occasion", erpCode: "HOL004" }
    ]
  },
  {
    name: "Insurance TOB Network",
    code: "INSURANCE_TOB_NETWORK",
    description: "Insurance network providers and coverage areas",
    codes: [
      { code: "NETWORK_A", description: "Network A - Premium Coverage", erpCode: "TOBNET001" },
      { code: "NETWORK_B", description: "Network B - Standard Coverage", erpCode: "TOBNET002" },
      { code: "NETWORK_C", description: "Network C - Basic Coverage", erpCode: "TOBNET003" }
    ]
  },
  {
    name: "HRM Loan",
    code: "HRM_LOAN",
    description: "Types of employee loans and advances",
    codes: [
      { code: "SALARY_ADV", description: "Salary Advance", erpCode: "LOAN001" },
      { code: "PERSONAL", description: "Personal Loan", erpCode: "LOAN002" },
      { code: "MEDICAL", description: "Medical Loan", erpCode: "LOAN003" },
      { code: "EDUCATION", description: "Education Loan", erpCode: "LOAN004" },
      { code: "EMERGENCY", description: "Emergency Loan", erpCode: "LOAN005" }
    ]
  },
  {
    name: "HRM Bank",
    code: "HRM_BANK",
    description: "Banking institutions for payroll and financial transactions",
    codes: [
      { code: "QNB", description: "Qatar National Bank", erpCode: "BANK001" },
      { code: "CBQ", description: "Commercial Bank of Qatar", erpCode: "BANK002" },
      { code: "ADCB", description: "Abu Dhabi Commercial Bank", erpCode: "BANK003" },
      { code: "ENBD", description: "Emirates NBD", erpCode: "BANK004" },
      { code: "FAB", description: "First Abu Dhabi Bank", erpCode: "BANK005" }
    ]
  },
  {
    name: "Blood Group",
    code: "BLOOD_GROUP",
    description: "Blood group classifications for medical records",
    codes: [
      { code: "A+", description: "A Positive", erpCode: "BLOOD001" },
      { code: "A-", description: "A Negative", erpCode: "BLOOD002" },
      { code: "B+", description: "B Positive", erpCode: "BLOOD003" },
      { code: "B-", description: "B Negative", erpCode: "BLOOD004" },
      { code: "AB+", description: "AB Positive", erpCode: "BLOOD005" },
      { code: "AB-", description: "AB Negative", erpCode: "BLOOD006" },
      { code: "O+", description: "O Positive", erpCode: "BLOOD007" },
      { code: "O-", description: "O Negative", erpCode: "BLOOD008" }
    ]
  },
  {
    name: "Type of Activity",
    code: "ACTIVITY_TYPE",
    description: "Types of activities and tasks in the system",
    codes: [
      { code: "MEETING", description: "Meeting", erpCode: "ACT001" },
      { code: "TRAINING", description: "Training Session", erpCode: "ACT002" },
      { code: "REVIEW", description: "Performance Review", erpCode: "ACT003" },
      { code: "INTERVIEW", description: "Interview", erpCode: "ACT004" },
      { code: "PROJECT", description: "Project Work", erpCode: "ACT005" }
    ]
  },
  {
    name: "Leave Reason",
    code: "LEAVE_REASON",
    description: "Reasons for leave applications",
    codes: [
      { code: "ANNUAL", description: "Annual Leave", erpCode: "LV001" },
      { code: "SICK", description: "Sick Leave", erpCode: "LV002" },
      { code: "EMERGENCY", description: "Emergency Leave", erpCode: "LV003" },
      { code: "MATERNITY", description: "Maternity Leave", erpCode: "LV004" },
      { code: "PATERNITY", description: "Paternity Leave", erpCode: "LV005" },
      { code: "BEREAVEMENT", description: "Bereavement Leave", erpCode: "LV006" },
      { code: "STUDY", description: "Study Leave", erpCode: "LV007" }
    ]
  },
  {
    name: "Asset Status",
    code: "ASSET_STATUS",
    description: "Status of company assets",
    codes: [
      { code: "AVAILABLE", description: "Available", erpCode: "ASTATUS001" },
      { code: "ASSIGNED", description: "Assigned", erpCode: "ASTATUS002" },
      { code: "MAINTENANCE", description: "Under Maintenance", erpCode: "ASTATUS003" },
      { code: "DAMAGED", description: "Damaged", erpCode: "ASTATUS004" },
      { code: "DISPOSED", description: "Disposed", erpCode: "ASTATUS005" }
    ]
  },
  {
    name: "Asset Category",
    code: "ASSET_CATEGORY",
    description: "Categories of company assets",
    codes: [
      { code: "IT_EQUIP", description: "IT Equipment", erpCode: "ACAT001" },
      { code: "FURNITURE", description: "Furniture", erpCode: "ACAT002" },
      { code: "VEHICLE", description: "Vehicle", erpCode: "ACAT003" },
      { code: "OFFICE_EQUIP", description: "Office Equipment", erpCode: "ACAT004" },
      { code: "SAFETY_EQUIP", description: "Safety Equipment", erpCode: "ACAT005" }
    ]
  },
  {
    name: "Type of Severity Level",
    code: "SEVERITY_LEVEL",
    description: "Severity levels for incidents and issues",
    codes: [
      { code: "LOW", description: "Low Severity", erpCode: "SEV001" },
      { code: "MEDIUM", description: "Medium Severity", erpCode: "SEV002" },
      { code: "HIGH", description: "High Severity", erpCode: "SEV003" },
      { code: "CRITICAL", description: "Critical Severity", erpCode: "SEV004" }
    ]
  },
  {
    name: "Action Type",
    code: "ACTION_TYPE",
    description: "Types of actions that can be taken",
    codes: [
      { code: "WARNING", description: "Warning", erpCode: "ACTION001" },
      { code: "COUNSELING", description: "Counseling", erpCode: "ACTION002" },
      { code: "SUSPENSION", description: "Suspension", erpCode: "ACTION003" },
      { code: "TERMINATION", description: "Termination", erpCode: "ACTION004" },
      { code: "TRAINING", description: "Additional Training", erpCode: "ACTION005" }
    ]
  },
  {
    name: "Visa Renewal Recommendation Task",
    code: "VISA_RENEWAL_TASK",
    description: "Tasks related to visa renewal recommendations",
    codes: [
      { code: "DOCUMENT_CHECK", description: "Document Verification", erpCode: "VRTASK001" },
      { code: "MEDICAL_CHECK", description: "Medical Examination", erpCode: "VRTASK002" },
      { code: "SPONSOR_APPROVAL", description: "Sponsor Approval", erpCode: "VRTASK003" },
      { code: "GOVT_SUBMISSION", description: "Government Submission", erpCode: "VRTASK004" }
    ]
  },
  {
    name: "Visa Renewal Recommendation Activity",
    code: "VISA_RENEWAL_ACTIVITY",
    description: "Activities in visa renewal process",
    codes: [
      { code: "INITIATE", description: "Initiate Renewal", erpCode: "VRACT001" },
      { code: "REVIEW", description: "Review Application", erpCode: "VRACT002" },
      { code: "APPROVE", description: "Approve Renewal", erpCode: "VRACT003" },
      { code: "REJECT", description: "Reject Application", erpCode: "VRACT004" },
      { code: "COMPLETE", description: "Complete Process", erpCode: "VRACT005" }
    ]
  },
  {
    name: "Movement Type",
    code: "MOVEMENT_TYPE",
    description: "Types of employee movements and transfers",
    codes: [
      { code: "PROMOTION", description: "Promotion", erpCode: "MOV001" },
      { code: "TRANSFER", description: "Transfer", erpCode: "MOV002" },
      { code: "DEMOTION", description: "Demotion", erpCode: "MOV003" },
      { code: "DEPT_CHANGE", description: "Department Change", erpCode: "MOV004" },
      { code: "LOC_CHANGE", description: "Location Change", erpCode: "MOV005" }
    ]
  },
  {
    name: "Company Bank",
    code: "COMPANY_BANK",
    description: "Company banking relationships",
    codes: [
      { code: "PRIMARY", description: "Primary Bank Account", erpCode: "COMPBANK001" },
      { code: "SECONDARY", description: "Secondary Bank Account", erpCode: "COMPBANK002" },
      { code: "PAYROLL", description: "Payroll Bank Account", erpCode: "COMPBANK003" },
      { code: "PETTY_CASH", description: "Petty Cash Account", erpCode: "COMPBANK004" }
    ]
  },
  {
    name: "Asset Type",
    code: "ASSET_TYPE",
    description: "Types of assets by nature",
    codes: [
      { code: "TANGIBLE", description: "Tangible Asset", erpCode: "ATYPE001" },
      { code: "INTANGIBLE", description: "Intangible Asset", erpCode: "ATYPE002" },
      { code: "FIXED", description: "Fixed Asset", erpCode: "ATYPE003" },
      { code: "CURRENT", description: "Current Asset", erpCode: "ATYPE004" }
    ]
  },
  {
    name: "Asset Supplier",
    code: "ASSET_SUPPLIER",
    description: "Suppliers of company assets",
    codes: [
      { code: "DELL", description: "Dell Technologies", erpCode: "SUPP001" },
      { code: "HP", description: "HP Inc.", erpCode: "SUPP002" },
      { code: "LENOVO", description: "Lenovo Group", erpCode: "SUPP003" },
      { code: "OFFICE_DEPOT", description: "Office Depot", erpCode: "SUPP004" },
      { code: "LOCAL_VENDOR", description: "Local Vendor", erpCode: "SUPP005" }
    ]
  },
  {
    name: "Type of Infraction",
    code: "INFRACTION_TYPE",
    description: "Types of employee infractions and violations",
    codes: [
      { code: "TARDINESS", description: "Tardiness", erpCode: "INF001" },
      { code: "ABSENCE", description: "Unauthorized Absence", erpCode: "INF002" },
      { code: "MISCONDUCT", description: "Misconduct", erpCode: "INF003" },
      { code: "SAFETY_VIOLATION", description: "Safety Violation", erpCode: "INF004" },
      { code: "POLICY_VIOLATION", description: "Policy Violation", erpCode: "INF005" },
      { code: "INSUBORDINATION", description: "Insubordination", erpCode: "INF006" }
    ]
  }
];

// Function to seed code types
export const seedCodeTypes = async () => {
  try {
    console.log('Starting to seed code types...');

    // Get a default user ID (you may need to create a system user first)
    const systemUserId = new mongoose.Types.ObjectId(); // This should be a real user ID in production

    let createdTypes = 0;
    let createdCodes = 0;
    let skippedTypes = 0;

    for (const typeData of codeTypesData) {
      // Check if code type already exists
      const existingType = await CodeType.findOne({ code: typeData.code });
      
      if (existingType) {
        console.log(`Code type ${typeData.code} already exists, skipping...`);
        skippedTypes++;
        continue;
      }

      // Create code type
      const codeType = new CodeType({
        name: typeData.name,
        code: typeData.code,
        description: typeData.description,
        createdBy: systemUserId
      });

      const savedType = await codeType.save();
      createdTypes++;
      console.log(`Created code type: ${typeData.name} (${typeData.code})`);

      // Create codes for this type
      if (typeData.codes && typeData.codes.length > 0) {
        for (const codeData of typeData.codes) {
          const commonCode = new CommonCode({
            typeId: savedType._id,
            code: codeData.code,
            description: codeData.description,
            erpCode: codeData.erpCode,
            createdBy: systemUserId
          });

          await commonCode.save();
          createdCodes++;
        }
        console.log(`  - Created ${typeData.codes.length} codes for ${typeData.name}`);
      }
    }

    console.log('\n=== Seeding Complete ===');
    console.log(`Created ${createdTypes} new code types`);
    console.log(`Created ${createdCodes} new codes`);
    console.log(`Skipped ${skippedTypes} existing code types`);

    return {
      success: true,
      createdTypes,
      createdCodes,
      skippedTypes
    };

  } catch (error) {
    console.error('Error seeding code types:', error);
    throw error;
  }
};

// Function to clear all code types (use with caution!)
export const clearCodeTypes = async () => {
  try {
    await CommonCode.deleteMany({});
    await CodeType.deleteMany({});
    console.log('All code types and codes have been cleared');
  } catch (error) {
    console.error('Error clearing code types:', error);
    throw error;
  }
};

export default { seedCodeTypes, clearCodeTypes, codeTypesData };