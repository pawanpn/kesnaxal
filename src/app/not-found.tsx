import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center p-8">
        <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-heading font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
