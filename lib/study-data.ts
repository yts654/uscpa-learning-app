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
    FAR: { examDate: "2026-03-05", targetScore: 80 },
    AUD: { examDate: null, targetScore: 75 },
    REG: { examDate: "2026-05-15", targetScore: 75 },
    BEC: { examDate: null, targetScore: 75 },
    TCP: { examDate: null, targetScore: 75 },
    ISC: { examDate: null, targetScore: 75 },
  },
  dailyStudyHours: 4,
  questionsPerSession: 30,
}

// Demo recall records for Retention Calibration
export const INITIAL_RECALL_RECORDS: RecallRecord[] = [
  { chapterId: "far-ch1", date: "2026-02-17", rating: 3, predictedRetention: 85 },
  { chapterId: "far-ch2", date: "2026-02-17", rating: 2, predictedRetention: 72 },
  { chapterId: "far-ch3", date: "2026-02-19", rating: 3, predictedRetention: 68 },
  { chapterId: "far-ch4", date: "2026-02-10", rating: 3, predictedRetention: 80 },
  { chapterId: "far-ch5", date: "2026-02-11", rating: 3, predictedRetention: 78 },
  { chapterId: "far-ch6", date: "2026-02-11", rating: 2, predictedRetention: 65 },
  { chapterId: "far-ch7", date: "2026-02-20", rating: 2, predictedRetention: 50 },
  { chapterId: "far-ch8", date: "2026-02-20", rating: 2, predictedRetention: 45 },
  { chapterId: "far-ch9", date: "2026-02-21", rating: 1, predictedRetention: 42 },
  { chapterId: "far-ch10", date: "2026-02-12", rating: 2, predictedRetention: 60 },
  { chapterId: "far-ch11", date: "2026-02-21", rating: 2, predictedRetention: 48 },
  { chapterId: "far-ch12", date: "2026-02-19", rating: 1, predictedRetention: 40 },
  { chapterId: "far-ch13", date: "2026-02-15", rating: 2, predictedRetention: 55 },
  { chapterId: "far-ch14", date: "2026-02-22", rating: 1, predictedRetention: 35 },
  { chapterId: "far-ch15", date: "2026-02-22", rating: 1, predictedRetention: 38 },
  { chapterId: "far-ch16", date: "2026-02-18", rating: 3, predictedRetention: 75 },
  { chapterId: "far-ch17", date: "2026-02-18", rating: 2, predictedRetention: 58 },
  { chapterId: "far-ch18", date: "2026-02-14", rating: 2, predictedRetention: 55 },
  { chapterId: "far-ch19", date: "2026-02-15", rating: 2, predictedRetention: 50 },
  { chapterId: "far-ch20", date: "2026-02-16", rating: 1, predictedRetention: 38 },
  { chapterId: "far-ch21", date: "2026-02-17", rating: 1, predictedRetention: 32 },
  { chapterId: "reg-ch1", date: "2026-02-10", rating: 3, predictedRetention: 70 },
  { chapterId: "reg-ch2", date: "2026-02-10", rating: 2, predictedRetention: 58 },
  { chapterId: "reg-ch5", date: "2026-02-14", rating: 1, predictedRetention: 42 },
  { chapterId: "reg-ch7", date: "2026-02-15", rating: 1, predictedRetention: 35 },
  { chapterId: "reg-ch9", date: "2026-02-16", rating: 2, predictedRetention: 50 },
  { chapterId: "reg-ch12", date: "2026-02-20", rating: 3, predictedRetention: 65 },
]

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
  // FAR Chapters — 21/21 completed, multiple review rounds, scattered retention
  { id: "far-ch1", section: "FAR", number: 1, title: "Basic Concepts of Financial Accounting and Financial Statements", totalQuestions: 55, correctAnswers: 48, studyHours: 7, lastStudied: "2026-02-17", status: "completed", essenceNotes: [] },
  { id: "far-ch2", section: "FAR", number: 2, title: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", totalQuestions: 50, correctAnswers: 40, studyHours: 7, lastStudied: "2026-02-17", status: "completed", essenceNotes: [] },
  { id: "far-ch3", section: "FAR", number: 3, title: "Current Assets (Cash, Accounts Receivable, Inventory)", totalQuestions: 65, correctAnswers: 50, studyHours: 10, lastStudied: "2026-02-19", status: "completed", essenceNotes: [] },
  { id: "far-ch4", section: "FAR", number: 4, title: "Current Liabilities and Contingencies", totalQuestions: 45, correctAnswers: 38, studyHours: 6, lastStudied: "2026-02-10", status: "completed", essenceNotes: [] },
  { id: "far-ch5", section: "FAR", number: 5, title: "Property, Plant, and Equipment", totalQuestions: 55, correctAnswers: 46, studyHours: 8, lastStudied: "2026-02-11", status: "completed", essenceNotes: [] },
  { id: "far-ch6", section: "FAR", number: 6, title: "Intangible Assets", totalQuestions: 40, correctAnswers: 32, studyHours: 5.5, lastStudied: "2026-02-11", status: "completed", essenceNotes: [] },
  { id: "far-ch7", section: "FAR", number: 7, title: "Time Value of Money", totalQuestions: 50, correctAnswers: 34, studyHours: 9, lastStudied: "2026-02-20", status: "completed", essenceNotes: [] },
  { id: "far-ch8", section: "FAR", number: 8, title: "Bonds", totalQuestions: 60, correctAnswers: 40, studyHours: 11, lastStudied: "2026-02-20", status: "completed", essenceNotes: [] },
  { id: "far-ch9", section: "FAR", number: 9, title: "Lease Accounting for Lessee", totalQuestions: 55, correctAnswers: 36, studyHours: 10, lastStudied: "2026-02-21", status: "completed", essenceNotes: [] },
  { id: "far-ch10", section: "FAR", number: 10, title: "Notes Receivable and Payable", totalQuestions: 35, correctAnswers: 27, studyHours: 5.5, lastStudied: "2026-02-12", status: "completed", essenceNotes: [] },
  { id: "far-ch11", section: "FAR", number: 11, title: "Revenue from Contracts with Customers", totalQuestions: 58, correctAnswers: 40, studyHours: 10.5, lastStudied: "2026-02-21", status: "completed", essenceNotes: [] },
  { id: "far-ch12", section: "FAR", number: 12, title: "Equity Transactions and Earnings Per Share", totalQuestions: 48, correctAnswers: 33, studyHours: 8, lastStudied: "2026-02-19", status: "completed", essenceNotes: [] },
  { id: "far-ch13", section: "FAR", number: 13, title: "Investments", totalQuestions: 42, correctAnswers: 31, studyHours: 7, lastStudied: "2026-02-15", status: "completed", essenceNotes: [] },
  { id: "far-ch14", section: "FAR", number: 14, title: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", totalQuestions: 65, correctAnswers: 40, studyHours: 13, lastStudied: "2026-02-22", status: "completed", essenceNotes: [] },
  { id: "far-ch15", section: "FAR", number: 15, title: "Deferred Taxes", totalQuestions: 52, correctAnswers: 35, studyHours: 9.5, lastStudied: "2026-02-22", status: "completed", essenceNotes: [] },
  { id: "far-ch16", section: "FAR", number: 16, title: "Statement of Cash Flows", totalQuestions: 50, correctAnswers: 40, studyHours: 7.5, lastStudied: "2026-02-18", status: "completed", essenceNotes: [] },
  { id: "far-ch17", section: "FAR", number: 17, title: "Accounting Changes and Error Corrections", totalQuestions: 38, correctAnswers: 28, studyHours: 6, lastStudied: "2026-02-18", status: "completed", essenceNotes: [] },
  { id: "far-ch18", section: "FAR", number: 18, title: "Miscellaneous Topics", totalQuestions: 30, correctAnswers: 23, studyHours: 5, lastStudied: "2026-02-14", status: "completed", essenceNotes: [] },
  { id: "far-ch19", section: "FAR", number: 19, title: "Financial Statement Ratios and Performance Metrics", totalQuestions: 28, correctAnswers: 21, studyHours: 4.5, lastStudied: "2026-02-15", status: "completed", essenceNotes: [] },
  { id: "far-ch20", section: "FAR", number: 20, title: "Nongovernmental Not-for-profit Organizations", totalQuestions: 35, correctAnswers: 24, studyHours: 6, lastStudied: "2026-02-16", status: "completed", essenceNotes: [] },
  { id: "far-ch21", section: "FAR", number: 21, title: "Governmental Accounting", totalQuestions: 40, correctAnswers: 26, studyHours: 7.5, lastStudied: "2026-02-17", status: "completed", essenceNotes: [] },
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
  // REG Chapters — REG1: Business Law (all 11 completed) + REG2: Taxation (1 done, 1 in-progress) = 12/23 ~52%
  { id: "reg-ch1", section: "REG", number: 1, title: "Overview of the Business Law", totalQuestions: 22, correctAnswers: 18, studyHours: 3, lastStudied: "2026-01-20", status: "completed", essenceNotes: [] },
  { id: "reg-ch2", section: "REG", number: 2, title: "Contracts", totalQuestions: 28, correctAnswers: 21, studyHours: 4.5, lastStudied: "2026-01-23", status: "completed", essenceNotes: [] },
  { id: "reg-ch3", section: "REG", number: 3, title: "Sales", totalQuestions: 20, correctAnswers: 14, studyHours: 3, lastStudied: "2026-01-25", status: "completed", essenceNotes: [] },
  { id: "reg-ch4", section: "REG", number: 4, title: "Agency", totalQuestions: 18, correctAnswers: 14, studyHours: 2.5, lastStudied: "2026-01-28", status: "completed", essenceNotes: [] },
  { id: "reg-ch5", section: "REG", number: 5, title: "Real Property", totalQuestions: 20, correctAnswers: 13, studyHours: 3.5, lastStudied: "2026-01-30", status: "completed", essenceNotes: [] },
  { id: "reg-ch6", section: "REG", number: 6, title: "Suretyship", totalQuestions: 15, correctAnswers: 11, studyHours: 2.5, lastStudied: "2026-02-01", status: "completed", essenceNotes: [] },
  { id: "reg-ch7", section: "REG", number: 7, title: "Secured Transaction", totalQuestions: 18, correctAnswers: 12, studyHours: 3.5, lastStudied: "2026-02-04", status: "completed", essenceNotes: [] },
  { id: "reg-ch8", section: "REG", number: 8, title: "Bankruptcy", totalQuestions: 16, correctAnswers: 11, studyHours: 3, lastStudied: "2026-02-06", status: "completed", essenceNotes: [] },
  { id: "reg-ch9", section: "REG", number: 9, title: "Business Structure", totalQuestions: 22, correctAnswers: 15, studyHours: 4, lastStudied: "2026-02-09", status: "completed", essenceNotes: [] },
  { id: "reg-ch10", section: "REG", number: 10, title: "Governmental Regulations and Professional Responsibilities", totalQuestions: 18, correctAnswers: 13, studyHours: 3, lastStudied: "2026-02-12", status: "completed", essenceNotes: [] },
  { id: "reg-ch11", section: "REG", number: 11, title: "Federal Securities Act", totalQuestions: 20, correctAnswers: 14, studyHours: 3.5, lastStudied: "2026-02-15", status: "completed", essenceNotes: [] },
  // REG Chapters — REG2: Taxation
  { id: "reg-ch12", section: "REG", number: 12, title: "Introduction to Taxation", totalQuestions: 18, correctAnswers: 14, studyHours: 3, lastStudied: "2026-02-18", status: "completed", essenceNotes: [] },
  { id: "reg-ch13", section: "REG", number: 13, title: "Individual Part 1: Overview and Gross Income", totalQuestions: 10, correctAnswers: 6, studyHours: 2, lastStudied: "2026-02-21", status: "in-progress", essenceNotes: [] },
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
  // ═══════════════════════════════════════════════════════════════
  // FAR — Round 1: First pass (Dec 20 – Jan 18)
  // ═══════════════════════════════════════════════════════════════
  { id: "sl-1", date: "2025-12-20", section: "FAR", chapterId: "far-ch1", chapterTitle: "Basic Concepts of Financial Accounting and Financial Statements", studyHours: 4.5, mcQuestions: 25, mcCorrect: 21, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 25, correctAnswers: 21, memo: "Conceptual framework, GAAP hierarchy, qualitative characteristics", recallRating: 3 },
  { id: "sl-2", date: "2025-12-21", section: "FAR", chapterId: "far-ch2", chapterTitle: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", studyHours: 4, mcQuestions: 25, mcCorrect: 19, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 25, correctAnswers: 19, memo: "Fair value hierarchy Levels 1-3. Measurement attributes", recallRating: 2 },
  { id: "sl-3", date: "2025-12-23", section: "FAR", chapterId: "far-ch3", chapterTitle: "Current Assets (Cash, Accounts Receivable, Inventory)", studyHours: 5.5, mcQuestions: 28, mcCorrect: 20, tbsQuestions: 7, tbsCorrect: 5, questionsAnswered: 35, correctAnswers: 25, memo: "LIFO/FIFO, LCM vs NRV. Bank reconciliation TBS. AR factoring", recallRating: 2 },
  { id: "sl-4", date: "2025-12-25", section: "FAR", chapterId: "far-ch4", chapterTitle: "Current Liabilities and Contingencies", studyHours: 3.5, mcQuestions: 22, mcCorrect: 18, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 22, correctAnswers: 18, memo: "ASC 450 probable/reasonably possible/remote. Warranty accruals", recallRating: 3 },
  { id: "sl-5", date: "2025-12-27", section: "FAR", chapterId: "far-ch5", chapterTitle: "Property, Plant, and Equipment", studyHours: 5, mcQuestions: 24, mcCorrect: 20, tbsQuestions: 6, tbsCorrect: 4, questionsAnswered: 30, correctAnswers: 24, memo: "Capitalization rules, depreciation methods, asset impairment 2-step", recallRating: 3 },
  { id: "sl-6", date: "2025-12-28", section: "FAR", chapterId: "far-ch6", chapterTitle: "Intangible Assets", studyHours: 3, mcQuestions: 20, mcCorrect: 16, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 16, memo: "Goodwill impairment, R&D costs, software dev capitalization", recallRating: 2 },
  { id: "sl-7", date: "2025-12-30", section: "FAR", chapterId: "far-ch7", chapterTitle: "Time Value of Money", studyHours: 4, mcQuestions: 18, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 11, memo: "PV/FV single sum ok. Annuity due vs ordinary annuity confusing", recallRating: 1 },
  { id: "sl-8", date: "2026-01-02", section: "FAR", chapterId: "far-ch8", chapterTitle: "Bonds", studyHours: 5, mcQuestions: 20, mcCorrect: 12, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 25, correctAnswers: 15, memo: "Effective interest method confusing. Premium/discount amort schedule TBS hard", recallRating: 1 },
  { id: "sl-9", date: "2026-01-04", section: "FAR", chapterId: "far-ch9", chapterTitle: "Lease Accounting for Lessee", studyHours: 4.5, mcQuestions: 18, mcCorrect: 10, tbsQuestions: 4, tbsCorrect: 3, questionsAnswered: 22, correctAnswers: 13, memo: "ASC 842 ROU asset. Finance vs operating lease classification criteria", recallRating: 1 },
  { id: "sl-10", date: "2026-01-05", section: "FAR", chapterId: "far-ch10", chapterTitle: "Notes Receivable and Payable", studyHours: 3, mcQuestions: 18, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 14, memo: "Note discount, imputation of interest. Below-market rate rules", recallRating: 2 },
  { id: "sl-11", date: "2026-01-07", section: "FAR", chapterId: "far-ch11", chapterTitle: "Revenue from Contracts with Customers", studyHours: 5, mcQuestions: 20, mcCorrect: 13, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 25, correctAnswers: 16, memo: "ASC 606 5-step model. Variable consideration, SSP allocation complex", recallRating: 1 },
  { id: "sl-12", date: "2026-01-08", section: "FAR", chapterId: "far-ch12", chapterTitle: "Equity Transactions and Earnings Per Share", studyHours: 4, mcQuestions: 18, mcCorrect: 12, tbsQuestions: 4, tbsCorrect: 3, questionsAnswered: 22, correctAnswers: 15, memo: "Treasury stock, stock dividends/splits. Diluted EPS with convertibles hard", recallRating: 1 },
  { id: "sl-13", date: "2026-01-10", section: "FAR", chapterId: "far-ch13", chapterTitle: "Investments", studyHours: 4, mcQuestions: 20, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 14, memo: "HTM, trading, AFS. Equity method 20-50%. FVNI vs FVOCI", recallRating: 2 },
  { id: "sl-14", date: "2026-01-12", section: "FAR", chapterId: "far-ch14", chapterTitle: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", studyHours: 6, mcQuestions: 22, mcCorrect: 12, tbsQuestions: 6, tbsCorrect: 4, questionsAnswered: 28, correctAnswers: 16, memo: "Elimination entries killer. NCI at fair value. Intercompany profit elimination", recallRating: 0 },
  { id: "sl-15", date: "2026-01-13", section: "FAR", chapterId: "far-ch15", chapterTitle: "Deferred Taxes", studyHours: 4.5, mcQuestions: 22, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 22, correctAnswers: 14, memo: "Temporary vs permanent diff. DTA valuation allowance. Tax rate change impact", recallRating: 1 },
  { id: "sl-16", date: "2026-01-15", section: "FAR", chapterId: "far-ch16", chapterTitle: "Statement of Cash Flows", studyHours: 4, mcQuestions: 20, mcCorrect: 16, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 25, correctAnswers: 20, memo: "Indirect method clear. Noncash activities disclosure. Operating/investing/financing", recallRating: 3 },
  { id: "sl-17", date: "2026-01-16", section: "FAR", chapterId: "far-ch17", chapterTitle: "Accounting Changes and Error Corrections", studyHours: 3.5, mcQuestions: 18, mcCorrect: 13, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 13, memo: "Retrospective for principle change, prospective for estimate. Error = restatement", recallRating: 2 },
  { id: "sl-18", date: "2026-01-17", section: "FAR", chapterId: "far-ch18", chapterTitle: "Miscellaneous Topics", studyHours: 3, mcQuestions: 15, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 11, memo: "Segment reporting 10% tests, interim reporting, subsequent events", recallRating: 2 },
  { id: "sl-19", date: "2026-01-18", section: "FAR", chapterId: "far-ch19", chapterTitle: "Financial Statement Ratios and Performance Metrics", studyHours: 2.5, mcQuestions: 12, mcCorrect: 9, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 12, correctAnswers: 9, memo: "Current ratio, quick ratio, D/E, ROA, ROE. Formulas need memorization", recallRating: 2 },
  { id: "sl-20", date: "2026-01-20", section: "FAR", chapterId: "far-ch20", chapterTitle: "Nongovernmental Not-for-profit Organizations", studyHours: 3.5, mcQuestions: 18, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 12, memo: "Net asset classification: without/with donor restrictions. Pledge revenue", recallRating: 1 },
  { id: "sl-21", date: "2026-01-22", section: "FAR", chapterId: "far-ch21", chapterTitle: "Governmental Accounting", studyHours: 4.5, mcQuestions: 20, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 12, memo: "Fund types, modified accrual, GASB vs FASB. Government-wide vs fund statements", recallRating: 0 },
  // ═══════════════════════════════════════════════════════════════
  // FAR — Round 2: Review weak chapters (Jan 24 – Feb 5)
  // ═══════════════════════════════════════════════════════════════
  { id: "sl-22", date: "2026-01-24", section: "FAR", chapterId: "far-ch7", chapterTitle: "Time Value of Money", studyHours: 3, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 10, memo: "2nd pass. Annuity tables starting to click. Deferred annuity still weak", recallRating: 2 },
  { id: "sl-23", date: "2026-01-25", section: "FAR", chapterId: "far-ch8", chapterTitle: "Bonds", studyHours: 3.5, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 20, correctAnswers: 13, memo: "2nd pass. Bond issuance costs, retirement before maturity. Getting better", recallRating: 2 },
  { id: "sl-24", date: "2026-01-26", section: "FAR", chapterId: "far-ch9", chapterTitle: "Lease Accounting for Lessee", studyHours: 3.5, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 3, tbsCorrect: 2, questionsAnswered: 18, correctAnswers: 12, memo: "2nd pass. Variable lease payments, short-term lease exception. Improving", recallRating: 2 },
  { id: "sl-25", date: "2026-01-28", section: "FAR", chapterId: "far-ch11", chapterTitle: "Revenue from Contracts with Customers", studyHours: 3.5, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 3, tbsCorrect: 2, questionsAnswered: 18, correctAnswers: 12, memo: "2nd pass. Contract modifications, principal vs agent, licensing. Clicking now", recallRating: 2 },
  { id: "sl-26", date: "2026-01-29", section: "FAR", chapterId: "far-ch12", chapterTitle: "Equity Transactions and Earnings Per Share", studyHours: 3, mcQuestions: 14, mcCorrect: 10, tbsQuestions: 2, tbsCorrect: 1, questionsAnswered: 16, correctAnswers: 11, memo: "2nd pass. Diluted EPS if-converted and treasury stock method drilled", recallRating: 2 },
  { id: "sl-27", date: "2026-01-30", section: "FAR", chapterId: "far-ch14", chapterTitle: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", studyHours: 4, mcQuestions: 15, mcCorrect: 9, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 20, correctAnswers: 12, memo: "2nd pass. Step acquisition, disposal of subsidiary. Still struggling with eliminations", recallRating: 1 },
  { id: "sl-28", date: "2026-02-01", section: "FAR", chapterId: "far-ch15", chapterTitle: "Deferred Taxes", studyHours: 3, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 10, memo: "2nd pass. Tax loss carryforward, interperiod tax allocation. Clearer now", recallRating: 2 },
  { id: "sl-29", date: "2026-02-02", section: "FAR", chapterId: "far-ch20", chapterTitle: "Nongovernmental Not-for-profit Organizations", studyHours: 2.5, mcQuestions: 12, mcCorrect: 8, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 12, correctAnswers: 8, memo: "2nd pass. Contribution types, split-interest agreements. Improving", recallRating: 2 },
  { id: "sl-30", date: "2026-02-03", section: "FAR", chapterId: "far-ch21", chapterTitle: "Governmental Accounting", studyHours: 3, mcQuestions: 15, mcCorrect: 10, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 10, memo: "2nd pass. General fund, special revenue, capital projects. Measurement focus", recallRating: 1 },
  { id: "sl-31", date: "2026-02-04", section: "FAR", chapterId: "far-ch3", chapterTitle: "Current Assets (Cash, Accounts Receivable, Inventory)", studyHours: 2.5, mcQuestions: 15, mcCorrect: 12, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 20, correctAnswers: 16, memo: "Review. Retail inventory method, dollar-value LIFO. Tightening up", recallRating: 3 },
  { id: "sl-32", date: "2026-02-05", section: "FAR", chapterId: "far-ch2", chapterTitle: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", studyHours: 2, mcQuestions: 15, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 12, memo: "Review. Subsequent measurement, fair value option. Solid now", recallRating: 3 },
  // ═══════════════════════════════════════════════════════════════
  // FAR — Round 3: Targeted drilling + weak area focus (Feb 8 – Feb 17)
  // ═══════════════════════════════════════════════════════════════
  { id: "sl-33", date: "2026-02-08", section: "FAR", chapterId: "far-ch14", chapterTitle: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", studyHours: 3, mcQuestions: 12, mcCorrect: 8, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 17, correctAnswers: 11, memo: "3rd pass. Upstream/downstream intercompany sales. Starting to see patterns", recallRating: 2 },
  { id: "sl-34", date: "2026-02-09", section: "FAR", chapterId: "far-ch9", chapterTitle: "Lease Accounting for Lessee", studyHours: 2, mcQuestions: 10, mcCorrect: 7, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 11, memo: "3rd pass. Lease modification, sale-leaseback. TBS practice solid", recallRating: 2 },
  { id: "sl-35", date: "2026-02-10", section: "FAR", chapterId: "far-ch4", chapterTitle: "Current Liabilities and Contingencies", studyHours: 1.5, mcQuestions: 13, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 13, correctAnswers: 11, memo: "Quick review. Strong on this chapter", recallRating: 3 },
  { id: "sl-36", date: "2026-02-10", section: "FAR", chapterId: "far-ch10", chapterTitle: "Notes Receivable and Payable", studyHours: 1.5, mcQuestions: 12, mcCorrect: 9, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 12, correctAnswers: 9, memo: "Quick review. Troubled debt restructuring rules updated by ASU 2022-02", recallRating: 2 },
  { id: "sl-37", date: "2026-02-11", section: "FAR", chapterId: "far-ch5", chapterTitle: "Property, Plant, and Equipment", studyHours: 2, mcQuestions: 15, mcCorrect: 13, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 20, correctAnswers: 17, memo: "Review. Component depreciation, ARO calculations. Comfortable", recallRating: 3 },
  { id: "sl-38", date: "2026-02-11", section: "FAR", chapterId: "far-ch6", chapterTitle: "Intangible Assets", studyHours: 1.5, mcQuestions: 15, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 12, memo: "Review. Internally developed intangibles criteria. Good", recallRating: 2 },
  { id: "sl-39", date: "2026-02-12", section: "FAR", chapterId: "far-ch10", chapterTitle: "Notes Receivable and Payable", studyHours: 1, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 5, correctAnswers: 4, memo: "Quick MC drill on imputation of interest", recallRating: 3 },
  { id: "sl-40", date: "2026-02-13", section: "FAR", chapterId: "far-ch13", chapterTitle: "Investments", studyHours: 2, mcQuestions: 15, mcCorrect: 11, tbsQuestions: 2, tbsCorrect: 1, questionsAnswered: 17, correctAnswers: 12, memo: "Review. Equity method goodwill, impairment of investments. ASU 2016-01 impact", recallRating: 2 },
  { id: "sl-41", date: "2026-02-14", section: "FAR", chapterId: "far-ch18", chapterTitle: "Miscellaneous Topics", studyHours: 2, mcQuestions: 15, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 12, memo: "Review. Related party disclosures, forex transactions, troubled debt", recallRating: 2 },
  { id: "sl-42", date: "2026-02-15", section: "FAR", chapterId: "far-ch19", chapterTitle: "Financial Statement Ratios and Performance Metrics", studyHours: 2, mcQuestions: 16, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 16, correctAnswers: 12, memo: "Review. All ratio formulas drilled. Leverage ratios clear", recallRating: 3 },
  { id: "sl-43", date: "2026-02-15", section: "FAR", chapterId: "far-ch13", chapterTitle: "Investments", studyHours: 1, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 5, correctAnswers: 4, memo: "Quick follow-up drill on AFS reclassification entries", recallRating: 3 },
  { id: "sl-44", date: "2026-02-16", section: "FAR", chapterId: "far-ch20", chapterTitle: "Nongovernmental Not-for-profit Organizations", studyHours: 2, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 5, correctAnswers: 4, memo: "Focused review on contribution revenue timing. Museum collections exception", recallRating: 2 },
  { id: "sl-45", date: "2026-02-17", section: "FAR", chapterId: "far-ch21", chapterTitle: "Governmental Accounting", studyHours: 2, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 5, correctAnswers: 4, memo: "Focused on GASB 34 government-wide vs fund. MD&A requirements", recallRating: 2 },
  { id: "sl-46", date: "2026-02-17", section: "FAR", chapterId: "far-ch1", chapterTitle: "Basic Concepts of Financial Accounting and Financial Statements", studyHours: 1.5, mcQuestions: 20, mcCorrect: 18, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 18, memo: "Confidence boost. Framework mastered", recallRating: 3 },
  { id: "sl-47", date: "2026-02-17", section: "FAR", chapterId: "far-ch2", chapterTitle: "Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement", studyHours: 1, mcQuestions: 10, mcCorrect: 9, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 10, correctAnswers: 9, memo: "Quick refresh. All good", recallRating: 3 },
  // ═══════════════════════════════════════════════════════════════
  // FAR — Final sprint (Feb 18 – Feb 22): heavy TBS + weak areas
  // ═══════════════════════════════════════════════════════════════
  { id: "sl-48", date: "2026-02-18", section: "FAR", chapterId: "far-ch16", chapterTitle: "Statement of Cash Flows", studyHours: 2, mcQuestions: 10, mcCorrect: 8, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 12, memo: "Final review. Full cash flow statement TBS drills. Strong", recallRating: 3 },
  { id: "sl-49", date: "2026-02-18", section: "FAR", chapterId: "far-ch17", chapterTitle: "Accounting Changes and Error Corrections", studyHours: 1.5, mcQuestions: 10, mcCorrect: 8, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 12, memo: "Cumulative effect calculations, error restatement TBS. Solid", recallRating: 3 },
  { id: "sl-50", date: "2026-02-19", section: "FAR", chapterId: "far-ch3", chapterTitle: "Current Assets (Cash, Accounts Receivable, Inventory)", studyHours: 2, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 10, correctAnswers: 8, memo: "Final TBS drill. Inventory costing simulation. Nailed it", recallRating: 3 },
  { id: "sl-51", date: "2026-02-19", section: "FAR", chapterId: "far-ch12", chapterTitle: "Equity Transactions and Earnings Per Share", studyHours: 2, mcQuestions: 5, mcCorrect: 4, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 10, correctAnswers: 7, memo: "Diluted EPS with multiple convertibles TBS. Getting there but not 100%", recallRating: 2 },
  { id: "sl-52", date: "2026-02-20", section: "FAR", chapterId: "far-ch7", chapterTitle: "Time Value of Money", studyHours: 2, mcQuestions: 12, mcCorrect: 9, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 17, correctAnswers: 13, memo: "Final drill. Deferred annuity, bond pricing with PV. Improved a lot", recallRating: 2 },
  { id: "sl-53", date: "2026-02-20", section: "FAR", chapterId: "far-ch8", chapterTitle: "Bonds", studyHours: 2, mcQuestions: 10, mcCorrect: 8, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 12, memo: "Final drill. Full amort schedule TBS. Convertible bond issuance. Much better", recallRating: 2 },
  { id: "sl-54", date: "2026-02-21", section: "FAR", chapterId: "far-ch11", chapterTitle: "Revenue from Contracts with Customers", studyHours: 2, mcQuestions: 10, mcCorrect: 8, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 12, memo: "Final review. Multi-element arrangements TBS. Feeling confident", recallRating: 3 },
  { id: "sl-55", date: "2026-02-21", section: "FAR", chapterId: "far-ch9", chapterTitle: "Lease Accounting for Lessee", studyHours: 2, mcQuestions: 0, mcCorrect: 0, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 5, correctAnswers: 3, memo: "Pure TBS practice. Full lease liability schedule. Tricky but manageable", recallRating: 2 },
  { id: "sl-56", date: "2026-02-22", section: "FAR", chapterId: "far-ch14", chapterTitle: "Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination", studyHours: 3, mcQuestions: 0, mcCorrect: 0, tbsQuestions: 5, tbsCorrect: 3, questionsAnswered: 5, correctAnswers: 3, memo: "Final TBS cram. Full consolidation worksheet. Not perfect but workable", recallRating: 2 },
  { id: "sl-57", date: "2026-02-22", section: "FAR", chapterId: "far-ch15", chapterTitle: "Deferred Taxes", studyHours: 2, mcQuestions: 10, mcCorrect: 7, tbsQuestions: 5, tbsCorrect: 4, questionsAnswered: 15, correctAnswers: 11, memo: "Final review. DTA/DTL schedule with rate changes. Acceptable", recallRating: 2 },
  // ═══════════════════════════════════════════════════════════════
  // REG — First pass Business Law (Jan 20 – Feb 15) + Taxation start (Feb 18+)
  // ═══════════════════════════════════════════════════════════════
  { id: "sl-58", date: "2026-01-20", section: "REG", chapterId: "reg-ch1", chapterTitle: "Overview of the Business Law", studyHours: 3, mcQuestions: 22, mcCorrect: 18, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 22, correctAnswers: 18, memo: "Sources of law, constitutional fundamentals. Clear", recallRating: 3 },
  { id: "sl-59", date: "2026-01-23", section: "REG", chapterId: "reg-ch2", chapterTitle: "Contracts", studyHours: 4.5, mcQuestions: 22, mcCorrect: 16, tbsQuestions: 6, tbsCorrect: 5, questionsAnswered: 28, correctAnswers: 21, memo: "Offer/acceptance, consideration, Statute of Frauds. UCC vs Common Law", recallRating: 2 },
  { id: "sl-60", date: "2026-01-25", section: "REG", chapterId: "reg-ch3", chapterTitle: "Sales", studyHours: 3, mcQuestions: 20, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 14, memo: "UCC Article 2, risk of loss, warranties. Merchant rules tricky", recallRating: 2 },
  { id: "sl-61", date: "2026-01-28", section: "REG", chapterId: "reg-ch4", chapterTitle: "Agency", studyHours: 2.5, mcQuestions: 18, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 14, memo: "Actual vs apparent authority. Principal liability for torts", recallRating: 2 },
  { id: "sl-62", date: "2026-01-30", section: "REG", chapterId: "reg-ch5", chapterTitle: "Real Property", studyHours: 3.5, mcQuestions: 20, mcCorrect: 13, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 13, memo: "Types of deeds, recording statutes, landlord-tenant", recallRating: 1 },
  { id: "sl-63", date: "2026-02-01", section: "REG", chapterId: "reg-ch6", chapterTitle: "Suretyship", studyHours: 2.5, mcQuestions: 15, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 15, correctAnswers: 11, memo: "Surety vs guarantor, co-surety contribution rights", recallRating: 2 },
  { id: "sl-64", date: "2026-02-04", section: "REG", chapterId: "reg-ch7", chapterTitle: "Secured Transaction", studyHours: 3.5, mcQuestions: 18, mcCorrect: 12, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 12, memo: "UCC Article 9. Attachment/perfection/priority. PMSI priority rules complex", recallRating: 1 },
  { id: "sl-65", date: "2026-02-06", section: "REG", chapterId: "reg-ch8", chapterTitle: "Bankruptcy", studyHours: 3, mcQuestions: 16, mcCorrect: 11, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 16, correctAnswers: 11, memo: "Ch 7 vs 11 vs 13. Priority of claims in liquidation", recallRating: 2 },
  { id: "sl-66", date: "2026-02-09", section: "REG", chapterId: "reg-ch9", chapterTitle: "Business Structure", studyHours: 4, mcQuestions: 18, mcCorrect: 12, tbsQuestions: 4, tbsCorrect: 3, questionsAnswered: 22, correctAnswers: 15, memo: "LLC, LLP, GP, LP formation and liability. Partnership dissolution", recallRating: 2 },
  { id: "sl-67", date: "2026-02-12", section: "REG", chapterId: "reg-ch10", chapterTitle: "Governmental Regulations and Professional Responsibilities", studyHours: 3, mcQuestions: 18, mcCorrect: 13, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 13, memo: "AICPA Code of Conduct, Circular 230 penalties", recallRating: 2 },
  { id: "sl-68", date: "2026-02-15", section: "REG", chapterId: "reg-ch11", chapterTitle: "Federal Securities Act", studyHours: 3.5, mcQuestions: 20, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 20, correctAnswers: 14, memo: "Securities Act 1933 vs 1934. Registration exemptions, Rule 10b-5", recallRating: 1 },
  { id: "sl-69", date: "2026-02-18", section: "REG", chapterId: "reg-ch12", chapterTitle: "Introduction to Taxation", studyHours: 3, mcQuestions: 18, mcCorrect: 14, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 18, correctAnswers: 14, memo: "Tax formula, filing status, dependents. Fairly intuitive", recallRating: 3 },
  { id: "sl-70", date: "2026-02-21", section: "REG", chapterId: "reg-ch13", chapterTitle: "Individual Part 1: Overview and Gross Income", studyHours: 2, mcQuestions: 10, mcCorrect: 6, tbsQuestions: 0, tbsCorrect: 0, questionsAnswered: 10, correctAnswers: 6, memo: "Gross income inclusions/exclusions. Just started, many rules to memorize", recallRating: 1 },
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
  // FAR Mock Exams — 6 attempts showing progression
  { id: "me-1", date: "2026-01-19", section: "FAR", source: "Becker", mcQuestions: 33, mcCorrect: 18, tbsQuestions: 8, tbsCorrect: 3, totalQuestions: 41, totalCorrect: 21, accuracy: 51.2, memo: "1st attempt after first pass. Many gaps. TVM, Bonds, Leases all terrible" },
  { id: "me-2", date: "2026-02-03", section: "FAR", source: "Becker", mcQuestions: 36, mcCorrect: 23, tbsQuestions: 8, tbsCorrect: 5, totalQuestions: 44, totalCorrect: 28, accuracy: 63.6, memo: "2nd attempt after review round. Consolidation and Rev Rec still weak. Improving" },
  { id: "me-3", date: "2026-02-10", section: "FAR", source: "Wiley", mcQuestions: 40, mcCorrect: 28, tbsQuestions: 10, tbsCorrect: 6, totalQuestions: 50, totalCorrect: 34, accuracy: 68.0, memo: "Different source for fresh questions. Gov/NFP exposed gaps. Core chapters better" },
  { id: "me-4", date: "2026-02-15", section: "FAR", source: "Becker", mcQuestions: 44, mcCorrect: 32, tbsQuestions: 12, tbsCorrect: 8, totalQuestions: 56, totalCorrect: 40, accuracy: 71.4, memo: "Full-length sim. Time management ok. Deferred tax TBS still shaky" },
  { id: "me-5", date: "2026-02-19", section: "FAR", source: "Roger CPA", mcQuestions: 44, mcCorrect: 34, tbsQuestions: 12, tbsCorrect: 9, totalQuestions: 56, totalCorrect: 43, accuracy: 76.8, memo: "Breaking through 75! Bonds and Leases improved. Consolidation TBS was ok" },
  { id: "me-6", date: "2026-02-22", section: "FAR", source: "Becker", mcQuestions: 44, mcCorrect: 35, tbsQuestions: 12, tbsCorrect: 10, totalQuestions: 56, totalCorrect: 45, accuracy: 80.4, memo: "Final mock before exam. Confident on most topics. Gov acctg still weakest but passable" },
  // REG Mock Exam
  { id: "me-7", date: "2026-02-16", section: "REG", source: "Wiley", mcQuestions: 30, mcCorrect: 19, tbsQuestions: 5, tbsCorrect: 3, totalQuestions: 35, totalCorrect: 22, accuracy: 62.9, memo: "Business law section only. Secured transactions and real property weak" },
]

export const INITIAL_ESSENCE_NOTES: EssenceNote[] = []

export const INITIAL_PROGRESS: StudyProgress[] = [
  { section: "FAR", questionsAnswered: 1056, correctAnswers: 732, totalQuestions: 400, studyHours: 163, lastStudied: "2026-02-22", streak: 12 },
  { section: "AUD", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 300, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "REG", questionsAnswered: 245, correctAnswers: 176, totalQuestions: 350, studyHours: 41, lastStudied: "2026-02-21", streak: 3 },
  { section: "BEC", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 250, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "TCP", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 200, studyHours: 0, lastStudied: "", streak: 0 },
  { section: "ISC", questionsAnswered: 0, correctAnswers: 0, totalQuestions: 250, studyHours: 0, lastStudied: "", streak: 0 },
]

