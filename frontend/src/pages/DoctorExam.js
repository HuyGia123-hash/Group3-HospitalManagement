import React from 'react';
import './hospital-theme.css';

const DoctorExam = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center w-14 h-14">
          <div className="w-6 h-6 bg-sky-500 rounded-full opacity-50"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Khám bệnh & Kê đơn</h1>
          <p className="text-slate-500 text-sm">Triệu chứng, chẩn đoán và đơn thuốc</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div> Thông tin bệnh nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Họ tên bệnh nhân <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Mã bệnh nhân / CCCD</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              placeholder="Tùy chọn"
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div> Thông tin khám
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Triệu chứng</label>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none transition-all h-24"
              placeholder="Ví dụ: Ho khan, sốt nhẹ về chiều..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Chẩn đoán</label>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none resize-none transition-all h-24"
              placeholder="Ví dụ: Viêm họng cấp tính..."
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 relative">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded"></div> Tìm thuốc
        </h2>
        <div className="relative">
          <input
            type="text"
            className="w-full p-3.5 pl-11 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            placeholder="Gõ tên thuốc..."
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 rounded-full"></div>
        </div>
        <div className="mt-6 p-5 bg-sky-50 rounded-xl border border-sky-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Tên Thuốc Mẫu</h3>
              <p className="text-sm text-slate-500">Ghi chú mặc định mẫu</p>
            </div>
            <span className="text-lg font-bold text-sky-600">100,000đ</span>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {['sang', 'trua', 'chieu', 'toi'].map((buoi) => (
              <div key={buoi}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{buoi}</label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-2 rounded-lg border border-sky-200 text-center font-medium focus:border-sky-500 outline-none"
                  defaultValue="0"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Ngày</label>
              <input
                type="number"
                min="1"
                className="w-full p-2 rounded-lg border border-sky-200 bg-sky-100 text-center font-medium focus:border-sky-500 outline-none"
                defaultValue="1"
              />
            </div>
          </div>
          <button
            type="button"
            className="w-full py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 flex items-center justify-center gap-2 transition-colors"
          >
            <div className="w-5 h-5 bg-white/20 rounded"></div> Thêm vào đơn
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Đơn thuốc đã kê</span>
          <span className="text-sm text-slate-500">1 loại</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-left">
                <th className="p-4 font-medium">Thuốc</th>
                <th className="p-4 text-center">Sáng · Trưa · Chiều · Tối</th>
                <th className="p-4 text-center">Ngày</th>
                <th className="p-4 text-right">Thành tiền</th>
                <th className="p-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-4">
                  <span className="font-medium text-slate-800">Tên Thuốc Mẫu</span>
                  <p className="text-xs text-slate-400">1 Viên</p>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex gap-1">
                    {[1, 0, 1, 0].map((v, i) => (
                      <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${v > 0 ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-300'}`}>
                        {v}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="p-4 text-center text-slate-600">3</td>
                <td className="p-4 text-right font-semibold text-slate-800">300,000đ</td>
                <td className="p-4">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <div className="w-4 h-4 bg-current rounded-sm"></div>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-sky-600 text-white flex justify-between items-center">
          <span className="font-semibold">Tổng cộng</span>
          <span className="text-xl font-bold">300,000đ</span>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 bg-white/20 rounded-sm"></div> Xác nhận & Lưu đơn
        </button>
      </div>
    </div>
  );
};

export default DoctorExam;
