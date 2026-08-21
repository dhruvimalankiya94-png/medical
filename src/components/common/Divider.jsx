import React from 'react';

const Divider = ({ label = 'Or continue with' }) => {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div className="relative bg-slate-50 dark:bg-[#080d1a] px-4 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
        {label}
      </div>
    </div>
  );
};

export default Divider;
