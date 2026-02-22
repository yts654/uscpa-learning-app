export type ExamSection = "FAR" | "AUD" | "REG" | "BEC" | "TCP" | "ISC"

// ── Recall & Goals Types ────────────────────────────────────────────
export type RecallRating = 0 | 1 | 2 | 3

export interface RecallRecord {
  chapterId: string
  date: string
  rating: RecallRating
  predictedRetention: number
}

export interface SectionGoal {
  examDate: string | null
  targetScore: number
}

export interface StudyGoals {
  sections: Record<ExamSection, SectionGoal>
  dailyStudyHours: number
  questionsPerSession: number
}

export const DEFAULT_STUDY_GOALS: StudyGoals = {
  sections: {
    FAR: { examDate: null, targetScore: 75 },
    AUD: { examDate: null, targetScore: 75 },
    REG: { examDate: null, targetScore: 75 },
    BEC: { examDate: null, targetScore: 75 },
    TCP: { examDate: null, targetScore: 75 },
    ISC: { examDate: null, targetScore: 75 },
  },
  dailyStudyHours: 3,
  questionsPerSession: 25,
}

export interface Chapter {
  id: string
  section: ExamSection
  number: number
  title: string
  totalQuestions: number
  correctAnswers: number
  studyHours: number
  lastStudied: string
  status: "not-started" | "in-progress" | "completed"
  essenceNotes: string[]
}

export type InsightType = "concept" | "framework" | "trap" | "rule"

export interface Insight {
  type: InsightType
  title: string
  body: string
  example?: string
}

export interface EssenceNote {
  id: string
  chapterId: string
  imageUrls: string[]
  contentType: "textbook" | "mcq" | "tbs" | "other"
  insights: Insight[]
  rawText?: string
  createdAt: string
}

export interface StudyLog {
  id: string
  date: string
  section: ExamSection
  chapterId: string
  chapterTitle: string
  studyHours: number
  mcQuestions: number
  mcCorrect: number
  tbsQuestions: number
  tbsCorrect: number
  questionsAnswered: number
  correctAnswers: number
  memo: string
  recallRating?: RecallRating
}

export interface StudyProgress {
  section: ExamSection
  questionsAnswered: number
  correctAnswers: number
  totalQuestions: number
  studyHours: number
  lastStudied: string
  streak: number
}

export const SECTION_INFO: Record<ExamSection, { name: string; fullName: string; color: string; topics: string[] }> = {
  FAR: {
    name: "FAR",
    fullName: "Financial Accounting & Reporting",
    color: "hsl(225 50% 22%)",
    topics: ["Conceptual Framework", "Financial Statements", "Revenue Recognition", "Leases", "Inventory", "Fixed Assets", "Intangible Assets", "Government Accounting", "Not-for-Profit Accounting"],
  },
  AUD: {
    name: "AUD",
    fullName: "Auditing & Attestation",
    color: "hsl(175 45% 28%)",
    topics: ["Audit Planning", "Internal Controls", "Audit Evidence", "Audit Reports", "Professional Responsibilities", "Sampling", "IT Auditing", "Review Engagements"],
  },
  REG: {
    name: "REG",
    fullName: "Regulation",
    color: "hsl(25 55% 35%)",
    topics: ["Individual Taxation", "Corporate Taxation", "Partnership Taxation", "Property Transactions", "Business Law", "Ethics & Responsibilities", "Federal Tax Procedures"],
  },
  BEC: {
    name: "BEC",
    fullName: "Business Analysis & Reporting",
    color: "hsl(345 40% 32%)",
    topics: ["Cost Accounting", "Financial Management", "Economics", "Advanced Accounting", "Government Accounting", "Business Combinations", "Derivatives"],
  },
  TCP: {
    name: "TCP",
    fullName: "Tax Compliance & Planning",
    color: "hsl(265 40% 35%)",
    topics: ["Individual Tax Compliance", "Entity Tax Compliance", "Property Transactions", "Tax Planning", "Federal Tax Procedures", "Ethics & Responsibilities"],
  },
  ISC: {
    name: "ISC",
    fullName: "Information Systems & Controls",
    color: "hsl(195 50% 30%)",
    topics: ["Information Systems", "IT Governance", "Internal Control", "Risk Management", "Business Continuity", "Information Security", "Trust Services Criteria", "SOC Reports"],
  },
}

export const CHAPTERS: Chapter[] = [
  // FAR Chapters
  { id: "far-ch1", section: "FAR", number: 1, title: "Basic Concepts of Financial Accounting and Financial Statements", totalQuestions: 25, correctAnswers: 21, studyHours: 4.5, lastStudied: "2026-02-04", status: "completed", essenceNotes: [] },
  { id: "far-ch2", section: "FAR", number: 2, title: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", totalQuestions: 22, correctAnswers: 17, studyHours: 4, lastStudied: "2026-02-05", status: "completed", essenceNotes: [] },
  { id: "far-ch3", section: "FAR", number: 3, title: "Current Assets (Cash, Accounts Receivable, Inventory)", totalQuestions: 30, correctAnswers: 22, studyHours: 5, lastStudied: "2026-02-07", status: "completed", essenceNotes: [] },
  { id: "far-ch4", section: "FAR", number: 4, title: "Current Liabilities and Contingencies", totalQuestions: 20, correctAnswers: 15, studyHours: 3.5, lastStudied: "2026-02-08", status: "completed", essenceNotes: [] },
  { id: "far-ch5", section: "FAR", number: 5, title: "Property, Plant, and Equipment", totalQuestions: 28, correctAnswers: 21, studyHours: 4.5, lastStudied: "2026-02-10", status: "completed", essenceNotes: [] },
  { id: "far-ch6", section: "FAR", number: 6, title: "Intangible Assets", totalQuestions: 18, correctAnswers: 14, studyHours: 3, lastStudied: "2026-02-11", status: "completed", essenceNotes: [] },
  { id: "far-ch7", section: "FAR", number: 7, title: "Time Value of Money", totalQuestions: 15, correctAnswers: 10, studyHours: 3.5, lastStudied: "2026-02-12", status: "completed", essenceNotes: [] },
  { id: "far-ch8", section: "FAR", number: 8, title: "Bonds", totalQuestions: 20, correctAnswers: 13, studyHours: 4, lastStudied: "2026-02-14", status: "completed", essenceNotes: [] },
  { id: "far-ch9", section: "FAR", number: 9, title: "Lease Accounting for Lessee", totalQuestions: 18, correctAnswers: 11, studyHours: 4, lastStudied: "2026-02-16", status: "in-progress", essenceNotes: [] },
  { id: "far-ch10", section: "FAR", number: 10, title: "Notes Receivable and Payable", totalQuestions: 12, correctAnswers: 8, studyHours: 2.5, lastStudied: "2026-02-18", status: "in-progress", essenceNotes: [] },
  { id: "far-ch11", section: "FAR", number: 11, title: "Revenue from Contracts with Customers", totalQuestions: 15, correctAnswers: 9, studyHours: 3, lastStudied: "2026-02-20", status: "in-progress", essenceNotes: [] },
  { id: "far-ch12", section: "FAR", number: 12, title: "Equity Transactions and Earnings Per Share", totalQuestions: 10, correctAnswers: 6, studyHours: 2, lastStudied: "2026-02-22", status: "in-progress", essenceNotes: [] },
  { id: "far-ch13", section: "FAR", number: 13, title: "Investments", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch14", section: "FAR", number: 14, title: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch15", section: "FAR", number: 15, title: "Deferred Taxes", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch16", section: "FAR", number: 16, title: "Statement of Cash Flows", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch17", section: "FAR", number: 17, title: "Accounting Changes and Error Corrections", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch18", section: "FAR", number: 18, title: "Miscellaneous Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch19", section: "FAR", number: 19, title: "Financial Statement Ratios and Performance Metrics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch20", section: "FAR", number: 20, title: "Nongovernmental Not-for-profit Organizations", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "far-ch21", section: "FAR", number: 21, title: "Governmental Accounting", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // AUD Chapters
  { id: "aud-ch1", section: "AUD", number: 1, title: "Overview of Financial Statements Audits", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch2", section: "AUD", number: 2, title: "Important Concepts in Financial Statements Audits", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch3", section: "AUD", number: 3, title: "Audit Reporting: Part I", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch4", section: "AUD", number: 4, title: "Audit Reporting: Part II", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch5", section: "AUD", number: 5, title: "Engagement Planning", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch6", section: "AUD", number: 6, title: "Internal Control: Part I", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch7", section: "AUD", number: 7, title: "Internal Control: Part II", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch8", section: "AUD", number: 8, title: "Substantive Tests: Part I", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch9", section: "AUD", number: 9, title: "Substantive Tests: Part II", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch10", section: "AUD", number: 10, title: "Audit of Internal Control over Financial Reporting", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch11", section: "AUD", number: 11, title: "Other Audit Procedures Required under the Standards", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch12", section: "AUD", number: 12, title: "Other Considerations in Audits", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch13", section: "AUD", number: 13, title: "Other Reports Related to Audits of Financial Statements", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch14", section: "AUD", number: 14, title: "Audit Procedures Case Studies", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch15", section: "AUD", number: 15, title: "Accounting and Review Services", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch16", section: "AUD", number: 16, title: "Attestation and Assurance Services", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch17", section: "AUD", number: 17, title: "Audits with Information Technology", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch18", section: "AUD", number: 18, title: "Audit Sampling", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch19", section: "AUD", number: 19, title: "Professional Responsibilities", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch20", section: "AUD", number: 20, title: "Audit Data Analytics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch21", section: "AUD", number: 21, title: "Economics Overview", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch22", section: "AUD", number: 22, title: "Microeconomic Concepts", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "aud-ch23", section: "AUD", number: 23, title: "Macroeconomic Concepts", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // REG Chapters — REG1: Business Law
  { id: "reg-ch1", section: "REG", number: 1, title: "Overview of the Business Law", totalQuestions: 20, correctAnswers: 16, studyHours: 3, lastStudied: "2026-02-06", status: "completed", essenceNotes: [] },
  { id: "reg-ch2", section: "REG", number: 2, title: "Contracts", totalQuestions: 25, correctAnswers: 18, studyHours: 4, lastStudied: "2026-02-08", status: "completed", essenceNotes: [] },
  { id: "reg-ch3", section: "REG", number: 3, title: "Sales", totalQuestions: 18, correctAnswers: 12, studyHours: 3, lastStudied: "2026-02-10", status: "completed", essenceNotes: [] },
  { id: "reg-ch4", section: "REG", number: 4, title: "Agency", totalQuestions: 15, correctAnswers: 11, studyHours: 2.5, lastStudied: "2026-02-12", status: "completed", essenceNotes: [] },
  { id: "reg-ch5", section: "REG", number: 5, title: "Real Property", totalQuestions: 16, correctAnswers: 10, studyHours: 3, lastStudied: "2026-02-14", status: "completed", essenceNotes: [] },
  { id: "reg-ch6", section: "REG", number: 6, title: "Suretyship", totalQuestions: 12, correctAnswers: 8, studyHours: 2, lastStudied: "2026-02-16", status: "completed", essenceNotes: [] },
  { id: "reg-ch7", section: "REG", number: 7, title: "Secured Transaction", totalQuestions: 10, correctAnswers: 6, studyHours: 2.5, lastStudied: "2026-02-19", status: "in-progress", essenceNotes: [] },
  { id: "reg-ch8", section: "REG", number: 8, title: "Bankruptcy", totalQuestions: 8, correctAnswers: 5, studyHours: 2, lastStudied: "2026-02-21", status: "in-progress", essenceNotes: [] },
  { id: "reg-ch9", section: "REG", number: 9, title: "Business Structure", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch10", section: "REG", number: 10, title: "Governmental Regulations and Professional Responsibilities", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch11", section: "REG", number: 11, title: "Federal Securities Act", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // REG Chapters — REG2: Taxation
  { id: "reg-ch12", section: "REG", number: 12, title: "Introduction to Taxation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch13", section: "REG", number: 13, title: "Individual Part 1: Overview and Gross Income", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch14", section: "REG", number: 14, title: "Individual Part 2: Business Income and Expenses", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch15", section: "REG", number: 15, title: "Individual Part 3: Deductions", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch16", section: "REG", number: 16, title: "Individual Part 4: Tax Computation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch17", section: "REG", number: 17, title: "Transaction in Property", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch18", section: "REG", number: 18, title: "Partnership Part 1", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch19", section: "REG", number: 19, title: "Partnership Part 2", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch20", section: "REG", number: 20, title: "Corporation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch21", section: "REG", number: 21, title: "S Corporation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch22", section: "REG", number: 22, title: "Other Taxation Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "reg-ch23", section: "REG", number: 23, title: "Tax Return Preparer's Responsibilities", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // BEC (BAR) Chapters
  { id: "bec-ch1", section: "BEC", number: 1, title: "Cost Accounting Fundamentals", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch2", section: "BEC", number: 2, title: "Product Costing", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch3", section: "BEC", number: 3, title: "Cost Information for Decision", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch4", section: "BEC", number: 4, title: "Planning, Budgeting, and Control", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch5", section: "BEC", number: 5, title: "Performance Measurement", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch6", section: "BEC", number: 6, title: "Introduction to Finance", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch7", section: "BEC", number: 7, title: "Working Capital Management", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch8", section: "BEC", number: 8, title: "Investment Decisions", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch9", section: "BEC", number: 9, title: "Risk, Return, and Cost of Capital", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch10", section: "BEC", number: 10, title: "Financing Decisions", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch11", section: "BEC", number: 11, title: "Enterprise Risk Management", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch12", section: "BEC", number: 12, title: "Economics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch13", section: "BEC", number: 13, title: "Advanced Accounting for Intangible Assets", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch14", section: "BEC", number: 14, title: "Share-Based Payments", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch15", section: "BEC", number: 15, title: "Business Combinations", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch16", section: "BEC", number: 16, title: "Translation of Foreign Currency Financial Statements", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch17", section: "BEC", number: 17, title: "Derivatives", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch18", section: "BEC", number: 18, title: "Advanced Accounting for Lease", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch19", section: "BEC", number: 19, title: "Public Company Reporting Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch20", section: "BEC", number: 20, title: "Pensions and Postretirement Benefits", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch21", section: "BEC", number: 21, title: "Other Advanced Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch22", section: "BEC", number: 22, title: "Government Financial Reporting", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch23", section: "BEC", number: 23, title: "Budgetary Accounting", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch24", section: "BEC", number: 24, title: "Governmental Activities — Recognizing Revenues", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch25", section: "BEC", number: 25, title: "Governmental Activities — Recognizing Expenditures and Expenses", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch26", section: "BEC", number: 26, title: "Governmental Activities — Accounting for Capital Projects and Debt Services", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch27", section: "BEC", number: 27, title: "Governmental Activities — Miscellaneous Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch28", section: "BEC", number: 28, title: "Business-Type Activities and Internal Services", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "bec-ch29", section: "BEC", number: 29, title: "Permanent Funds and Fiduciary Funds", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // TCP Chapters
  { id: "tcp-ch1", section: "TCP", number: 1, title: "Individual Part 1: Gross Income and Deductions", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch2", section: "TCP", number: 2, title: "Individual Part 2: Loss Limitations", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch3", section: "TCP", number: 3, title: "Individual Part 3: Gift and Estate Taxation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch4", section: "TCP", number: 4, title: "Individual Part 4: Financial Planning", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch5", section: "TCP", number: 5, title: "Partnership", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch6", section: "TCP", number: 6, title: "C Corporation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch7", section: "TCP", number: 7, title: "S Corporation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch8", section: "TCP", number: 8, title: "Entity Formation and Liquidation", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch9", section: "TCP", number: 9, title: "Trusts and Estates", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch10", section: "TCP", number: 10, title: "Other Taxation Topics", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "tcp-ch11", section: "TCP", number: 11, title: "Transaction in Property", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  // ISC Chapters
  { id: "isc-ch1", section: "ISC", number: 1, title: "Information Systems", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch2", section: "ISC", number: 2, title: "IT Governance", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch3", section: "ISC", number: 3, title: "Roles and Responsibilities of the Information Systems Department", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch4", section: "ISC", number: 4, title: "Internal Control", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch5", section: "ISC", number: 5, title: "Risk Management", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch6", section: "ISC", number: 6, title: "Business Continuity Plan", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch7", section: "ISC", number: 7, title: "Disaster Recovery Plan", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch8", section: "ISC", number: 8, title: "Information Security Legislation and Frameworks", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch9", section: "ISC", number: 9, title: "Information Security Management", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch10", section: "ISC", number: 10, title: "Threats and Attacks against Information Systems", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch11", section: "ISC", number: 11, title: "Trust Services Criteria", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
  { id: "isc-ch12", section: "ISC", number: 12, title: "SOC Reports", totalQuestions: 0, correctAnswers: 0, studyHours: 0, lastStudied: "", status: "not-started", essenceNotes: [] },
]

export const STUDY_LOGS: StudyLog[] = [
  // FAR study logs
  { id: "sl-1", date: "2026-02-04", section: "FAR", chapterId: "far-ch1", chapterTitle: "Basic Concepts of Financial Accounting and Financial Statements", studyHours: 4.5, mcQuestions: 25, mcCorrect: 21, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 25, correctAnswers: 21, memo: "Reviewed conceptual framework and GAAP hierarchy", recallRating: 3 },
  { id: "sl-2", date: "2026-02-05", section: "FAR", chapterId: "far-ch2", chapterTitle: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", studyHours: 4, mcQuestions: 22, mcCorrect: 17, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 22, correctAnswers: 17, memo: "Need to review fair value measurement", recallRating: 2 },
  { id: "sl-3", date: "2026-02-07", section: "FAR", chapterId: "far-ch3", chapterTitle: "Current Assets (Cash, Accounts Receivable, Inventory)", studyHours: 5, mcQuestions: 25, mcCorrect: 19, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 30, correctAnswers: 22, memo: "LIFO/FIFO and LCM tricky. TBS on bank reconciliation was good practice", recallRating: 2 },
  { id: "sl-4", date: "2026-02-08", section: "FAR", chapterId: "far-ch4", chapterTitle: "Current Liabilities and Contingencies", studyHours: 3.5, mcQuestions: 20, mcCorrect: 15, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 15, memo: "Contingent liabilities disclosure rules reviewed", recallRating: 2 },
  { id: "sl-5", date: "2026-02-10", section: "FAR", chapterId: "far-ch5", chapterTitle: "Property, Plant, and Equipment", studyHours: 4.5, mcQuestions: 23, mcCorrect: 18, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 28, correctAnswers: 21, memo: "Depreciation methods and asset impairment", recallRating: 3 },
  { id: "sl-6", date: "2026-02-11", section: "FAR", chapterId: "far-ch6", chapterTitle: "Intangible Assets", studyHours: 3, mcQuestions: 18, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 14, memo: "Goodwill impairment and R&D costs", recallRating: 2 },
  { id: "sl-7", date: "2026-02-12", section: "FAR", chapterId: "far-ch7", chapterTitle: "Time Value of Money", studyHours: 3.5, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 10, memo: "Annuity calculations need more practice", recallRating: 1 },
  { id: "sl-8", date: "2026-02-14", section: "FAR", chapterId: "far-ch8", chapterTitle: "Bonds", studyHours: 4, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 20, correctAnswers: 13, memo: "Bond premium/discount amortization with effective interest method", recallRating: 1 },
  { id: "sl-9", date: "2026-02-16", section: "FAR", chapterId: "far-ch9", chapterTitle: "Lease Accounting for Lessee", studyHours: 4, mcQuestions: 15, mcCorrect: 9, tbsQuestions: 3, tbsCorrect: 2, questionsAnswered: 18, correctAnswers: 11, memo: "ASC 842 right-of-use asset calculations still confusing", recallRating: 1 },
  { id: "sl-10", date: "2026-02-18", section: "FAR", chapterId: "far-ch10", chapterTitle: "Notes Receivable and Payable", studyHours: 2.5, mcQuestions: 12, mcCorrect: 8, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 12, correctAnswers: 8, memo: "Note discount and imputation of interest", recallRating: 2 },
  { id: "sl-11", date: "2026-02-20", section: "FAR", chapterId: "far-ch11", chapterTitle: "Revenue from Contracts with Customers", studyHours: 3, mcQuestions: 12, mcCorrect: 7, tbsQuestions: 3, tbsCorrect: 2, questionsAnswered: 15, correctAnswers: 9, memo: "5-step model for ASC 606. Variable consideration tricky", recallRating: 1 },
  { id: "sl-12", date: "2026-02-22", section: "FAR", chapterId: "far-ch12", chapterTitle: "Equity Transactions and Earnings Per Share", studyHours: 2, mcQuestions: 10, mcCorrect: 6, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 10, correctAnswers: 6, memo: "Started EPS calculations. Diluted EPS needs more work", recallRating: 1 },
  // REG study logs
  { id: "sl-13", date: "2026-02-06", section: "REG", chapterId: "reg-ch1", chapterTitle: "Overview of the Business Law", studyHours: 3, mcQuestions: 20, mcCorrect: 16, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 16, memo: "Sources of law, constitutional fundamentals", recallRating: 3 },
  { id: "sl-14", date: "2026-02-08", section: "REG", chapterId: "reg-ch2", chapterTitle: "Contracts", studyHours: 4, mcQuestions: 20, mcCorrect: 14, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 25, correctAnswers: 18, memo: "Offer/acceptance, consideration, Statute of Frauds. UCC vs Common Law distinctions", recallRating: 2 },
  { id: "sl-15", date: "2026-02-10", section: "REG", chapterId: "reg-ch3", chapterTitle: "Sales", studyHours: 3, mcQuestions: 18, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 12, memo: "UCC Article 2, risk of loss, warranties", recallRating: 2 },
  { id: "sl-16", date: "2026-02-12", section: "REG", chapterId: "reg-ch4", chapterTitle: "Agency", studyHours: 2.5, mcQuestions: 15, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 11, memo: "Agent authority types: actual, apparent, ratification", recallRating: 2 },
  { id: "sl-17", date: "2026-02-14", section: "REG", chapterId: "reg-ch5", chapterTitle: "Real Property", studyHours: 3, mcQuestions: 16, mcCorrect: 10, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 16, correctAnswers: 10, memo: "Types of deeds, mortgages, landlord-tenant relationships", recallRating: 1 },
  { id: "sl-18", date: "2026-02-16", section: "REG", chapterId: "reg-ch6", chapterTitle: "Suretyship", studyHours: 2, mcQuestions: 12, mcCorrect: 8, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 12, correctAnswers: 8, memo: "Surety vs guarantor, defenses available", recallRating: 2 },
  { id: "sl-19", date: "2026-02-19", section: "REG", chapterId: "reg-ch7", chapterTitle: "Secured Transaction", studyHours: 2.5, mcQuestions: 10, mcCorrect: 6, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 10, correctAnswers: 6, memo: "UCC Article 9. Attachment and perfection rules. Priority disputes complex", recallRating: 1 },
  { id: "sl-20", date: "2026-02-21", section: "REG", chapterId: "reg-ch8", chapterTitle: "Bankruptcy", studyHours: 2, mcQuestions: 8, mcCorrect: 5, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 8, correctAnswers: 5, memo: "Chapter 7 vs 11 vs 13. Priority of claims in liquidation", recallRating: 1 },
]

export interface MockExam {
  id: string
  date: string           // "YYYY-MM-DD"
  section: ExamSection
  source: string         // 予備校名・サイト名
  mcQuestions: number
  mcCorrect: number
  tbsQuestions: number
  tbsCorrect: number
  totalQuestions: number  // 自動計算
  totalCorrect: number    // 自動計算
  accuracy: number        // 自動計算 (%)
  memo: string
}

export const INITIAL_MOCK_EXAMS: MockExam[] = [
  { id: "me-1", date: "2026-02-15", section: "FAR", source: "Becker", mcQuestions: 33, mcCorrect: 22, tbsQuestions: 8, tbsCorrect: 5, totalQuestions: 41, totalCorrect: 27, accuracy: 65.9, memo: "First mini exam. Bonds and TVM weak" },
  { id: "me-2", date: "2026-02-22", section: "FAR", source: "Becker", mcQuestions: 36, mcCorrect: 26, tbsQuestions: 8, tbsCorrect: 6, totalQuestions: 44, totalCorrect: 32, accuracy: 72.7, memo: "Improved from last time. Revenue recognition still shaky" },
  { id: "me-3", date: "2026-02-20", section: "REG", source: "Wiley", mcQuestions: 30, mcCorrect: 19, tbsQuestions: 5, tbsCorrect: 3, totalQuestions: 35, totalCorrect: 22, accuracy: 62.9, memo: "Business law fundamentals. Secured transactions and bankruptcy need review" },
]

export const INITIAL_ESSENCE_NOTES: EssenceNote[] = []

export const INITIAL_PROGRESS: StudyProgress[] = [
  { section: "FAR", questionsAnswered: 233, correctAnswers: 167, totalQuestions: 400, studyHours: 43.5, lastStudied: "2026-02-22", streak: 3 },
  { section: "AUD", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 300, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "REG", questionsAnswered: 124, correctAnswers: 86, totalQuestions: 350, studyHours: 22, lastStudied: "2026-02-21", streak: 2 },
  { section: "BEC", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 250, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "TCP", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 200, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "ISC", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 250, studyHours: 0, lastStudied: "", streak: 0 },
]

