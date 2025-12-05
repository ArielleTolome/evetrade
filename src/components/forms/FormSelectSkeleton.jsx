const FormSelectSkeleton = ({ labelWidth = 'w-1/3' }) => {
  return (
    <div className="space-y-2 animate-pulse">
      <div className={`h-5 bg-space-light rounded ${labelWidth}`}></div>
      <div className="h-12 bg-space-light rounded-lg"></div>
    </div>
  );
};

export default FormSelectSkeleton;
