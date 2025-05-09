'use client';

export default function VerifyPendingPage() {
  return (
   <section className="flex justify-center items-center h-screen">
    <div className="max-w-md mx-auto  p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Check Your Email</h1>
      <p className="text-gray-600 text-center">
        We've sent you a verification link. Please check your email and click the link to complete your registration.
      </p>
      <p className="text-gray-500 text-sm text-center mt-4">
        Don't see the email? Check your spam folder.
      </p>
    </div>
   </section>

    
  );
} 