import FormInputSkeleton from './FormInputSkeleton';

const FormSkeleton = ({ fields = 3, hasSubmitButton = false }) => {
  const fieldWidths = [
    'w-1/3',
    'w-1/2',
    'w-2/3',
    'w-full',
    'w-5/6',
    'w-3/4',
  ];

  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <FormInputSkeleton
          key={i}
          labelWidth={fieldWidths[i % fieldWidths.length]}
          hasHelperText={i % 2 === 0}
        />
      ))}
      {hasSubmitButton && (
        <div className="h-12 bg-space-light rounded-lg w-1/4 animate-pulse"></div>
      )}
    </div>
  );
};

export default FormSkeleton;
