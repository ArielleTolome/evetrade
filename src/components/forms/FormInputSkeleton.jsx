const FormInputSkeleton = ({ labelWidth = 'w-1/3', hasHelperText = false }) => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className={`h-5 bg-space-light rounded ${labelWidth}`}></div>
      <div className="h-12 bg-space-light rounded-lg"></div>
      {hasHelperText && <div className="h-4 bg-space-light rounded w-2/3"></div>}
    </div>
  );
};

export default FormInputSkeleton;
