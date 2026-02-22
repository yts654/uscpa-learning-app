"use client"

import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export default function PrivacyPage() {
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
            <h1 className="font-serif text-3xl font-bold mb-8">プライバシーポリシー</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">最終更新日: 2026年2月22日</p>

              <h2 className="text-lg font-bold mt-8">1. 収集する情報</h2>
              <p>本サービスでは以下の情報を収集します：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>アカウント情報:</strong> 名前、メールアドレス、パスワード（ハッシュ化して保存）</li>
                <li><strong>学習データ:</strong> 学習記録、進捗状況、Essence Notesのデータ</li>
                <li><strong>決済情報:</strong> Stripeを通じて処理（カード情報は当方で保持しません）</li>
                <li><strong>利用データ:</strong> AI分析の使用回数、アクセスログ</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">2. 情報の利用目的</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>サービスの提供・改善</li>
                <li>アカウント管理・認証</li>
                <li>サブスクリプション管理・決済処理</li>
                <li>AI分析機能の使用量管理</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">3. 第三者サービス</h2>
              <p>本サービスは以下の第三者サービスを利用しています：</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Stripe:</strong> 決済処理（<a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripeプライバシーポリシー</a>）</li>
                <li><strong>OpenRouter:</strong> AI分析のAPIプロバイダー</li>
                <li><strong>Upstash:</strong> データベースホスティング</li>
                <li><strong>Vercel:</strong> アプリケーションホスティング</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">4. データの保護</h2>
              <p>パスワードはbcryptでハッシュ化して保存し、通信はHTTPSで暗号化されます。決済情報はStripeが安全に管理します。</p>

              <h2 className="text-lg font-bold mt-8">5. ユーザーの権利</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>アカウント情報の閲覧・修正</li>
                <li>アカウントの削除依頼</li>
                <li>データのエクスポート依頼</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">6. Cookie</h2>
              <p>本サービスは認証セッション管理のためにCookieを使用します。言語設定やテーマ設定はlocalStorageに保存されます。</p>

              <h2 className="text-lg font-bold mt-8">7. 変更</h2>
              <p>本ポリシーは予告なく変更される場合があります。</p>

              <h2 className="text-lg font-bold mt-8">8. お問い合わせ</h2>
              <p>プライバシーに関するお問い合わせは、アプリ内のサポート機能をご利用ください。</p>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">Last updated: February 22, 2026</p>

              <h2 className="text-lg font-bold mt-8">1. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account information:</strong> Name, email address, password (stored hashed)</li>
                <li><strong>Study data:</strong> Study logs, progress, Essence Notes data</li>
                <li><strong>Payment information:</strong> Processed through Stripe (we do not store card details)</li>
                <li><strong>Usage data:</strong> AI analysis usage counts, access logs</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">2. How We Use Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Providing and improving the Service</li>
                <li>Account management and authentication</li>
                <li>Subscription management and payment processing</li>
                <li>AI analysis usage tracking</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">3. Third-Party Services</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Stripe:</strong> Payment processing (<a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>)</li>
                <li><strong>OpenRouter:</strong> AI analysis API provider</li>
                <li><strong>Upstash:</strong> Database hosting</li>
                <li><strong>Vercel:</strong> Application hosting</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">4. Data Protection</h2>
              <p>Passwords are hashed using bcrypt. All communications are encrypted via HTTPS. Payment information is securely managed by Stripe.</p>

              <h2 className="text-lg font-bold mt-8">5. Your Rights</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>View and update your account information</li>
                <li>Request account deletion</li>
                <li>Request data export</li>
              </ul>

              <h2 className="text-lg font-bold mt-8">6. Cookies</h2>
              <p>We use cookies for authentication session management. Language and theme preferences are stored in localStorage.</p>

              <h2 className="text-lg font-bold mt-8">7. Changes</h2>
              <p>This policy may be updated without prior notice.</p>

              <h2 className="text-lg font-bold mt-8">8. Contact</h2>
              <p>For privacy-related questions, please use the in-app support feature.</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
