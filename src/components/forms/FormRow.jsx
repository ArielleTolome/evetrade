export default function FormRow({ children, columns = 2, widths }) {
  const gridClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  const gridTemplateColumns = widths ? widths.join(' ') : undefined;
  const responsiveGrid = gridClasses[columns] || gridClasses[2];

  return (
    <div
      className={`grid gap-4 ${responsiveGrid}`}
      style={{ gridTemplateColumns }}
    >
      {children}
    </div>
  );
}
