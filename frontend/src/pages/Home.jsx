import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="max-w-xl w-full mx-4 bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] text-sky-500 uppercase mb-2">
            MED-SYSTEM
          </p>
        </div>



        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-2xl bg-sky-600 text-white font-semibold text-sm md:text-base shadow-lg shadow-sky-500/30 hover:bg-sky-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

