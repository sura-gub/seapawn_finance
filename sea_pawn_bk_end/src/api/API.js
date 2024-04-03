// const API_BASE_URL = "https://seapawn.onrender.com/";
// const API_BASE_URL = "https://seapavanbackend.staffin.cloud/";
const API_BASE_URL = "http://localhost:5000/";

const API = {
  // login page
  login: `${API_BASE_URL}login`,
  getCompanyLogo: `${API_BASE_URL}company-logo`,
  getBranches: `${API_BASE_URL}getBranches`,

  // customers pages
  updateLoanData: `${API_BASE_URL}updateLoanData`,
  updateArtData: `${API_BASE_URL}updateArtData`,
  getLoans: `${API_BASE_URL}getLoans`,
  getLoanBySearchess: `${API_BASE_URL}getLoanBySearchess`,
  deleteLoan: `${API_BASE_URL}deleteLoan`,
  getCompanyDetails: `${API_BASE_URL}get-company-details`,
  getLoanBySearches: `${API_BASE_URL}getLoanBySearches`,
  updateLoan: `${API_BASE_URL}updateLoan`,
  getPayBySearch: `${API_BASE_URL}getPayBySearch`,
  getLoanById: `${API_BASE_URL}getLoanById`,
  getLoansss: `${API_BASE_URL}getLoansss`,
  getLoanss: `${API_BASE_URL}getLoanss`,
  deletePayment1: `${API_BASE_URL}deletePayment1`,

  // article page
  fetchArticles: `${API_BASE_URL}fetch-articles`,
  insertArticle: `${API_BASE_URL}insert-article`,
  fetchArticle: `${API_BASE_URL}fetch-article`,
  updateArticleName: `${API_BASE_URL}update-article-name`,
  deleteArticle: `${API_BASE_URL}delete-article`,

  // Branches page
  deleteBranch: `${API_BASE_URL}deleteBranch`,
  updateBranchStatus: `${API_BASE_URL}updateBranchStatus`,
  addBranch: `${API_BASE_URL}addBranch`,
  getBranch: `${API_BASE_URL}getBranch`,
  updateBranch: `${API_BASE_URL}updateBranch`,

  // Change password page
  updatePassword: `${API_BASE_URL}update-password`,

  // Company detail page
  uploadLogo: `${API_BASE_URL}upload-logo`,
  updateCompanyDetails: `${API_BASE_URL}update-company-details`,
  checkCompany: `${API_BASE_URL}check-company`,

  // Extra Amount page
  updateLoanAmount: `${API_BASE_URL}updateLoanAmount`,
  getLoanBySearch: `${API_BASE_URL}getLoanBySearch`,
  getSearchOptions: `${API_BASE_URL}get-search-options`,

  // header page
  companyLogo: `${API_BASE_URL}company-logo`,
  pawnSettings: `${API_BASE_URL}pawn-settings`,

  // Home page
  companyDetails: `${API_BASE_URL}company-details`,

  // income Expense page
  saveData: `${API_BASE_URL}saveData`,

  // interest setting page
  fetchPawnSettings: `${API_BASE_URL}fetch-pawn-settings`,
  updatePawnSettings: `${API_BASE_URL}update-pawn-settings`,

  // loan entry page
  getLastGlNo: `${API_BASE_URL}get-last-gl-no`,
  getLoan: `${API_BASE_URL}getLoan`,
  submitLoanApplication: `${API_BASE_URL}submit-loan-application`,
  getArticles: `${API_BASE_URL}getArticles`,
  uploadImage: `${API_BASE_URL}uploadImage`,
  custPic: `${API_BASE_URL}custPic`,
  updatePawnTicket: `${API_BASE_URL}updatePawnTicket`,

  // Opening Balance page
  getOpeningDetails: `${API_BASE_URL}getOpeningDetails`,
  updateOpeningDetail: `${API_BASE_URL}updateOpeningDetail`,
  getOpeningBalance: `${API_BASE_URL}getOpeningBalance`,
  insertOpeningBalance: `${API_BASE_URL}insertOpeningBalance`,
  deleteLoan1: `${API_BASE_URL}deleteLoan1`,

  // pay now page
  getLoanBySearchh: `${API_BASE_URL}getLoanBySearchh`,
  deletePayment: `${API_BASE_URL}deletePayment`,
  pay: `${API_BASE_URL}pay`,

  // payment Report page
  getRecord: `${API_BASE_URL}getRecord`,

  // Registration Page
  regis: `${API_BASE_URL}regis`,

  // Staff page
  updateStaff: `${API_BASE_URL}updateStaff`,
  deleteStaff: `${API_BASE_URL}deleteStaff`,
  updateStaffStatus: `${API_BASE_URL}updateStaffStatus`,
  addStaff: `${API_BASE_URL}addStaff`,
  getStaffs: `${API_BASE_URL}getStaffs`,

  // Voucher page
  getBillDetails: `${API_BASE_URL}getBillDetails`,
  getIncDetails: `${API_BASE_URL}getIncDetails`,
  saveClosingBalance: `${API_BASE_URL}saveClosingBalance`,
  getOB: `${API_BASE_URL}getOB`,
  getIE: `${API_BASE_URL}getIE`,
};

export default API;
