export default function SubscribeCTA() {
  return (
    <section className="py-12 bg-primary-dark">
      <div className="container-custom text-center">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-3">Never Miss an Update</h2>
        <p className="text-gray-300 max-w-lg mx-auto text-sm mb-6">
          Subscribe to our newsletter and get the latest news, events, and announcements delivered straight to your inbox.
        </p>
        <form className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <input type="email" placeholder="Enter your email address" className="w-full sm:flex-1 px-4 py-3 rounded-lg text-sm bg-white text-foreground outline-none border-2 border-transparent focus:border-secondary transition-colors" />
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-secondary text-primary rounded-lg text-sm font-bold hover:bg-secondary-dark transition-colors whitespace-nowrap">Subscribe Now</button>
        </form>
      </div>
    </section>
  );
}
