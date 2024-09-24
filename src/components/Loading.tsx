// components/AdvancedLoading.js  

const AdvancedLoading = () => {  
    return (  
      <div className="fixed inset-0 flex items-center justify-center bg-black">  
        <div className="relative w-32 h-32">  
          {/* Spinner Ring */}  
          <div className="absolute inset-0 border-4 border-white rounded-full animate-spin-fast ring-glow"></div>  
          
          {/* Follow-up Spinner Ring */}  
          <div className="absolute inset-0 border-4 border-white rounded-full animate-spin-slow ring-glow"></div>  
  
          {/* Diagonal Cross Lines */}  
          <div className="absolute inset-0 flex items-center justify-center">  
            <div className="relative transform rotate-45">  
              <div className="absolute inset-0 w-0.5 h-full bg-white line-glow animate-line-glow"></div>  
              <div className="absolute inset-0 h-0.5 w-full bg-white line-glow animate-line-glow"></div>  
            </div>  
          </div>  
        </div>  
      </div>  
    );  
  }  
  
  export default AdvancedLoading;