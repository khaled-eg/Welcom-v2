import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GRADE_LEVELS } from '../utils/constants';

const studentSchema = z.object({
  studentName: z.string()
    .min(2, 'اسم الطالب يجب أن يكون حرفين على الأقل')
    .regex(/^[\u0600-\u06FF\s]+$/, 'يرجى إدخال الاسم بالعربي فقط! 🇸🇦'),
  phoneNumber: z.string()
    .regex(/^[0-9]{10,15}$/, 'رقم الجوال غير صحيح'),
  gradeLevel: z.string()
    .min(1, 'يرجى اختيار الصف الدراسي')
});

export default function StudentForm({ onSubmit, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(studentSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
      {/* Student Name */}
      <label htmlFor="studentName" className="text-right text-dolphin-dark font-semibold">
        ادخل اسمك
      </label>
      <div className="relative">
        <input
          type="text"
          id="studentName"
          {...register('studentName')}
          disabled={loading}
          placeholder="مثال: محمد أحمد"
          className={`w-full py-3 pr-12 pl-4 rounded-xl border-2 ${
            errors.studentName ? 'border-red-500' : 'border-dolphin-light/30'
          } focus:border-dolphin-light text-lg bg-white text-dolphin-dark transition outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-dolphin-light/70 text-xl"></i>
      </div>
      {errors.studentName && (
        <p className="text-red-500 text-sm text-right -mt-2">{errors.studentName.message}</p>
      )}

      {/* Phone Number */}
      <label htmlFor="phoneNumber" className="text-right text-dolphin-dark font-semibold">
        رقم الجوال
      </label>
      <div className="relative">
        <input
          type="text"
          id="phoneNumber"
          {...register('phoneNumber')}
          disabled={loading}
          placeholder="مثال: 9665xxxxxxxx"
          className={`w-full py-3 pr-12 pl-4 rounded-xl border-2 ${
            errors.phoneNumber ? 'border-red-500' : 'border-dolphin-light/30'
          } focus:border-dolphin-light text-lg bg-white text-dolphin-dark transition outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <i className="fa-solid fa-phone absolute right-4 top-1/2 -translate-y-1/2 text-dolphin-light/70 text-xl"></i>
      </div>
      {errors.phoneNumber && (
        <p className="text-red-500 text-sm text-right -mt-2">{errors.phoneNumber.message}</p>
      )}

      {/* Grade Level */}
      <label htmlFor="gradeLevel" className="text-right text-dolphin-dark font-semibold">
        اختر الصف الدراسي
      </label>
      <select
        id="gradeLevel"
        {...register('gradeLevel')}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl border-2 ${
          errors.gradeLevel ? 'border-red-500' : 'border-dolphin-light/30'
        } focus:border-dolphin-light text-lg bg-white text-dolphin-dark transition outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="">اختر الصف</option>
        {GRADE_LEVELS.map((grade) => (
          <option key={grade} value={grade}>{grade}</option>
        ))}
      </select>
      {errors.gradeLevel && (
        <p className="text-red-500 text-sm text-right -mt-2">{errors.gradeLevel.message}</p>
      )}

      {/* Submit Button */}
      <div className="mt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-l from-dolphin-light to-dolphin-dark text-white text-xl font-bold shadow-lg shadow-dolphin-dark/20 hover:from-dolphin-dark/90 hover:to-dolphin-dark/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <i className="fa-solid fa-bolt text-2xl"></i>
          <span>ابدأ الآن</span>
        </button>
      </div>
    </form>
  );
}
