import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  const { t, language } = useTranslation();

  const isBengali = language === 'bn';

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header section */}
          <div className="bg-slate-900 px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                {isBengali ? 'পরিষেবার শর্তাবলী' : 'Terms of Triage Service'}
              </h1>
              <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
                {isBengali ? 'সর্বশেষ হালনাগাদ: ' : 'Last Updated: '} 
                {new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-8 sm:space-y-10">
            {isBengali ? (
              <>
                <div className="prose prose-slate max-w-none text-slate-700">
                  <p className="text-lg leading-relaxed text-slate-600 mb-8">
                    "আমার ডাক্তার" একটি AI-সহায়ক স্বাস্থ্য তথ্য ও প্রাথমিক ট্রায়াজ প্ল্যাটফর্ম। এই পরিষেবা ব্যবহার করার মাধ্যমে আপনি নিম্নোক্ত শর্তাবলীর সাথে সম্মত হচ্ছেন।
                  </p>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">১</span>
                        পরিষেবার উদ্দেশ্য
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        আমাদের AI সিস্টেম শুধুমাত্র ব্যবহারকারীর প্রদত্ত তথ্যের ভিত্তিতে সম্ভাব্য স্বাস্থ্যঝুঁকি, লক্ষণ বিশ্লেষণ এবং প্রাথমিক নির্দেশনা প্রদান করে।
                      </p>
                    </section>

                    <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                        <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">২</span>
                        চিকিৎসা পরামর্শ নয়
                      </h2>
                      <p className="text-amber-800 leading-relaxed pl-11 mb-4">
                        এই প্ল্যাটফর্ম কোনো চিকিৎসক, হাসপাতাল বা জরুরি চিকিৎসা সেবার বিকল্প নয়।
                      </p>
                      <div className="pl-11">
                        <p className="font-semibold text-amber-900 mb-2">AI দ্বারা প্রদত্ত তথ্য:</p>
                        <ul className="list-disc pl-5 space-y-2 text-amber-800 marker:text-amber-400">
                          <li>চিকিৎসা পরামর্শ নয়</li>
                          <li>প্রেসক্রিপশন নয়</li>
                          <li>রোগ নির্ণয়ের নিশ্চয়তা নয়</li>
                          <li>চিকিৎসার বিকল্প নয়</li>
                        </ul>
                      </div>
                    </section>

                    <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
                      <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <span className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৩</span>
                        জরুরি পরিস্থিতি
                      </h2>
                      <p className="text-red-800 leading-relaxed pl-11 mb-4 font-medium">
                        নিম্নোক্ত ক্ষেত্রে অবিলম্বে নিকটস্থ চিকিৎসাকেন্দ্র বা জরুরি সেবার সাথে যোগাযোগ করুন:
                      </p>
                      <ul className="list-disc pl-16 space-y-2 text-red-700 marker:text-red-400 font-medium">
                        <li>শ্বাসকষ্ট</li>
                        <li>বুকের তীব্র ব্যথা</li>
                        <li>অজ্ঞান হয়ে যাওয়া</li>
                        <li>স্ট্রোকের লক্ষণ</li>
                        <li>মারাত্মক আঘাত</li>
                        <li>জীবন-হুমকিস্বরূপ যেকোনো অবস্থা</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৪</span>
                        তথ্যের যথার্থতা
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        AI বিশ্লেষণের ফলাফল ব্যবহারকারীর প্রদত্ত তথ্যের উপর নির্ভরশীল। অসম্পূর্ণ বা ভুল তথ্য ফলাফলের নির্ভুলতা কমাতে পারে।
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৫</span>
                        ব্যবহারকারীর দায়িত্ব
                      </h2>
                      <div className="pl-11">
                        <p className="text-slate-600 mb-3">ব্যবহারকারী সম্মত হচ্ছেন যে:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-slate-300">
                          <li>সঠিক তথ্য প্রদান করবেন</li>
                          <li>স্বাস্থ্যসংক্রান্ত সিদ্ধান্ত গ্রহণের আগে প্রয়োজনে চিকিৎসকের পরামর্শ নেবেন</li>
                          <li>AI ফলাফলকে সহায়ক তথ্য হিসেবে ব্যবহার করবেন</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৬</span>
                        সীমাবদ্ধতা
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        আমরা শতভাগ নির্ভুলতা, রোগ নির্ণয় বা চিকিৎসা ফলাফলের গ্যারান্টি প্রদান করি না।
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৭</span>
                        পরিষেবার পরিবর্তন
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        আমরা যেকোনো সময় পরিষেবার বৈশিষ্ট্য, কার্যপ্রণালী বা শর্তাবলী হালনাগাদ করার অধিকার সংরক্ষণ করি।
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">৮</span>
                        যোগাযোগ
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        কোনো প্রশ্ন বা উদ্বেগ থাকলে আমাদের যোগাযোগ পৃষ্ঠার মাধ্যমে যোগাযোগ করুন।
                      </p>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="prose prose-slate max-w-none text-slate-700">
                  <p className="text-lg leading-relaxed text-slate-600 mb-8">
                    Amar Daktar is an AI-assisted health information and preliminary triage platform. By using this service, you agree to the following terms.
                  </p>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">1</span>
                        Purpose of the Service
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        Our AI system provides preliminary symptom analysis, risk assessment, and informational guidance based solely on the information submitted by users.
                      </p>
                    </section>

                    <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                      <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                        <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">2</span>
                        Not Medical Advice
                      </h2>
                      <p className="text-amber-800 leading-relaxed pl-11 mb-4">
                        This platform is not a substitute for:
                      </p>
                      <ul className="list-disc pl-16 space-y-2 text-amber-800 marker:text-amber-400 mb-4">
                        <li>Licensed physicians</li>
                        <li>Hospitals</li>
                        <li>Emergency medical services</li>
                      </ul>
                      <div className="pl-11">
                        <p className="font-semibold text-amber-900 mb-2">Information generated by the AI:</p>
                        <ul className="list-disc pl-5 space-y-2 text-amber-800 marker:text-amber-400">
                          <li>Is not medical advice</li>
                          <li>Is not a prescription</li>
                          <li>Is not a confirmed diagnosis</li>
                          <li>Is not a replacement for professional healthcare</li>
                        </ul>
                      </div>
                    </section>

                    <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
                      <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <span className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">3</span>
                        Emergency Situations
                      </h2>
                      <p className="text-red-800 leading-relaxed pl-11 mb-4 font-medium">
                        Seek immediate medical attention if you experience:
                      </p>
                      <ul className="list-disc pl-16 space-y-2 text-red-700 marker:text-red-400 font-medium">
                        <li>Difficulty breathing</li>
                        <li>Severe chest pain</li>
                        <li>Loss of consciousness</li>
                        <li>Stroke symptoms</li>
                        <li>Major injuries</li>
                        <li>Any life-threatening condition</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">4</span>
                        Accuracy of Information
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        AI-generated assessments depend on the accuracy and completeness of information provided by users.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">5</span>
                        User Responsibilities
                      </h2>
                      <div className="pl-11">
                        <p className="text-slate-600 mb-3">Users agree to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-slate-300">
                          <li>Provide accurate information</li>
                          <li>Consult qualified healthcare professionals when appropriate</li>
                          <li>Use AI-generated results as informational support only</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">6</span>
                        Limitations
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        We do not guarantee diagnosis accuracy, treatment outcomes, or complete medical correctness.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">7</span>
                        Service Modifications
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        We reserve the right to update, modify, or discontinue any aspect of the service at any time.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm">8</span>
                        Contact
                      </h2>
                      <p className="text-slate-600 leading-relaxed pl-11">
                        For questions regarding these terms, please use the website's contact page.
                      </p>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
