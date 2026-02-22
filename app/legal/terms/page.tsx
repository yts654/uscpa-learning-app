"use client"

import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export default function TermsPage() {
  const { t, locale } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-background" />
            </div>
            <span className="font-serif text-lg font-bold">CPA Mastery</span>
          </Link>
          <Link href="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            {t("legal.backHome")}
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {locale === "ja" ? (
          <>
            <h1 className="font-serif text-3xl font-bold mb-8">利用規約</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">最終更新日: 2026年2月22日</p>

              <h2 className="text-lg font-bold mt-8">1. サービスの概要</h2>
              <p>CPA Mastery（以下「本サービス」）は、USCPA試験の学習を支援するウェブアプリケーションです。AI技術を活用した学習ノート分析機能、進捗管理、復習スケジュール管理などの機能を提供します。</p>

              <h2 className="text-lg font-bold mt-8">2. アカウント</h2>
              <p>本サービスの利用にはアカウント登録が必要です。登録情報は正確かつ最新のものを提供してください。アカウントの安全管理はお客様の責任となります。</p>

              <h2 className="text-lg font-bold mt-8">3. 料金プラン</h2>
              <p>本サービスはFree（無料）プランとPro（有料）プランを提供しています。Proプランは月額制のサブスクリプションで、Stripeを通じて決済されます。</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Proプランはいつでも解約可能です</li>
                <li>解約した場合、現在の請求期間の終了まで利用可能です</li>
                <li>返金は原則として行いません</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">4. AI機能について</h2>
              <p>本サービスのAI分析機能は第三者のAIモデルを利用しています。AI生成コンテンツの正確性は保証されません。学習の補助として利用し、最終的な判断はお客様自身で行ってください。</p>

              <h2 className="text-lg font-bold mt-8">5. 禁止事項</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>不正アクセスやサービスの悪用</li>
                <li>他のユーザーの迷惑となる行為</li>
                <li>自動化ツールによる大量リクエスト</li>
                <li>著作権を侵害するコンテンツのアップロード</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">6. 免責事項</h2>
              <p>本サービスは「現状のまま」で提供されます。試験の合格を保証するものではありません。サービスの中断・データ損失について、法律で認められる最大限の範囲で責任を負いません。</p>

              <h2 className="text-lg font-bold mt-8">7. 変更</h2>
              <p>本規約は予告なく変更される場合があります。重要な変更がある場合は、サービス内で通知します。</p>

              <h2 className="text-lg font-bold mt-8">8. お問い合わせ</h2>
              <p>本規約に関するお問い合わせは、アプリ内のサポート機能をご利用ください。</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">Last updated: February 22, 2026</p>

              <h2 className="text-lg font-bold mt-8">1. Overview</h2>
              <p>CPA Mastery (&quot;the Service&quot;) is a web application designed to assist with USCPA exam preparation. It provides AI-powered study note analysis, progress tracking, and spaced repetition review scheduling.</p>

              <h2 className="text-lg font-bold mt-8">2. Accounts</h2>
              <p>An account is required to use the Service. You must provide accurate and up-to-date information during registration. You are responsible for maintaining the security of your account.</p>

              <h2 className="text-lg font-bold mt-8">3. Pricing Plans</h2>
              <p>The Service offers a Free plan and a Pro (paid) plan. The Pro plan is a monthly subscription billed through Stripe.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Pro plan can be cancelled at any time</li>
                <li>Upon cancellation, access continues until the end of the current billing period</li>
                <li>Refunds are generally not provided</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">4. AI Features</h2>
              <p>The AI analysis features use third-party AI models. The accuracy of AI-generated content is not guaranteed. Use it as a study aid and make final decisions on your own.</p>

              <h2 className="text-lg font-bold mt-8">5. Prohibited Activities</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Unauthorized access or misuse of the Service</li>
                <li>Actions that inconvenience other users</li>
                <li>Automated mass requests</li>
                <li>Uploading content that infringes copyrights</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">6. Disclaimer</h2>
              <p>The Service is provided &quot;as is.&quot; We do not guarantee passing the exam. To the maximum extent permitted by law, we are not liable for service interruptions or data loss.</p>

              <h2 className="text-lg font-bold mt-8">7. Changes</h2>
              <p>These terms may be updated without prior notice. Significant changes will be communicated through the Service.</p>

              <h2 className="text-lg font-bold mt-8">8. Contact</h2>
              <p>For questions about these terms, please use the in-app support feature.</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
