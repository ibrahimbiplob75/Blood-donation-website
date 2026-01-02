import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center mt-6 sm:mt-8 md:mt-10">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 border-t-4 border-[#5d0808e8] border-solid"></div>
    </div>
  );
};

export default Loader;
