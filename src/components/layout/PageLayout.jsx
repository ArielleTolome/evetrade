/**
 * Page Layout Component
 * Wraps pages with common content structure
 */
export function PageLayout({ children, title, subtitle }) {
  return (
    <>
      {(title || subtitle) && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 sm:pt-8">
          {title && (
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary dark:text-text-primary text-light-text mb-1 sm:mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-text-secondary text-sm sm:text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  );
}

export default PageLayout;
