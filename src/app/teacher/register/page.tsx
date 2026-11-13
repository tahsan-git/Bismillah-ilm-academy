"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // 🌟 Supabase ক্লায়েন্ট
import {
  User,
  Mail,
  Lock,
  Phone,
  Loader2,
  CheckCircle2,
  UserRound,
  GraduationCap,
  MapPin,
  BookOpen,
  Eye, // 👈 Eye যোগ করা হয়েছে
  EyeOff, // 👈 EyeOff যোগ করা হয়েছে
} from "lucide-react";

type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "radio";
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

const commonFields: Field[] = [
  {
    name: "hifz_year",
    label: "হিফজ ফারেগ সাল",
    type: "number",
    placeholder: "হিফজ না করে থাকলে ০০ লিখুন",
  },
  {
    name: "hifz_madrasa",
    label: "মাদ্রাসার নাম (যেখান থেকে হিফজ ফারেগ করেছেন)",
    type: "text",
    placeholder: "মাদ্রাসার সম্পূর্ণ নাম লিখুন",
    required: true,
  },
  {
    name: "other_studies",
    label: "অন্যান্য পড়াশোনা (যদি থাকে)",
    type: "text",
    placeholder: 'না থাকলে "নেই" লিখুন',
    required: true,
  },
  {
    name: "present_address",
    label: "বর্তমান ঠিকানা",
    type: "textarea",
    placeholder: "সম্পূর্ণ ঠিকানা লিখুন",
    required: true,
  },
  {
    name: "permanent_address",
    label: "স্থায়ী ঠিকানা",
    type: "textarea",
    placeholder: "সম্পূর্ণ ঠিকানা লিখুন",
    required: true,
  },
  {
    name: "age",
    label: "বয়স",
    type: "number",
    placeholder: "আপনার বয়স উল্লেখ করুন",
    required: true,
  },
  {
    name: "marital_status",
    label: "বৈবাহিক অবস্থা",
    type: "radio",
    options: ["বিবাহিত", "অবিবাহিত"],
    required: true,
  },
];

const maleFields: Field[] = [
  {
    name: "dawra_year",
    label: "দাওরা ফারেগ সাল",
    type: "text",
    placeholder: "কত সালে দাওরা ফারেগ করেছেন?",
  },
  {
    name: "dawra_madrasa",
    label: "মাদ্রাসার নাম (যেখান থেকে দাওরা সম্পন্ন করেছেন)",
    type: "text",
    placeholder: "মাদ্রাসার সম্পূর্ণ নাম লিখুন",
    required: true,
  },
  {
    name: "current_work",
    label: "বর্তমানে কোথায়? কতদিন ধরে? কোন খেদমতে নিয়োজিত আছেন?",
    type: "textarea",
    placeholder: "প্রশ্ন মোতাবেক বিস্তারিত উত্তর লিখুন",
    required: true,
  },
  {
    name: "work_objection",
    label: "বর্তমান কর্মক্ষেত্র থেকে অনলাইনে খেদমতের ব্যাপারে কোনো আপত্তি আছে কি?",
    type: "radio",
    options: [
      "না আলহামদুলিল্লাহ কোনো আপত্তি নেই।",
      "কর্তৃপক্ষের সাথে কথা বলে নিতে হবে।",
    ],
    required: true,
  },
  {
    name: "guardian_communication",
    label: "খেদমত চলাকালীন সময়ে একাডেমিক কাজের স্বার্থে মহিলা গার্ডিয়ানদের সাথে কথা বলতে আপত্তি আছে কিনা?",
    type: "radio",
    options: [
      "না আলহামদুলিল্লাহ কোনো আপত্তি নেই।",
      "দুঃখিত এই বিষয়ে আপত্তি রয়েছে।",
    ],
    required: true,
  },
  {
    name: "avoid_hifz",
    label: "আমাদের একাডেমিতে সংযুক্ত থাকা অবস্থায়, হিফজ বিভাগের খেদমত এড়িয়ে চলব।",
    type: "radio",
    options: ["এখনই বলতে পারছি না", "জ্বী ইনশা আল্লাহ্"],
    required: true,
  },
  {
    name: "long_leave",
    label: "তাবলিগ জামাত, নুরানী ট্রেনিং বা অন্য কোনো কোর্সের জন্য প্রতি বছরের নির্দিষ্ট সময়ে লম্বা ছুটির প্রয়োজন আছে কিনা?",
    type: "textarea",
    placeholder: "প্রয়োজন থাকলে সময়সহ স্পষ্ট করে লিখুন",
    required: true,
  },
  {
    name: "free_time",
    label: "সারা দিন ক্লাস নেওয়ার মতো কত ঘণ্টা সময় ফ্রি থাকেন? (এবং কোন কোন সময় ফ্রি থাকেন?)",
    type: "textarea",
    placeholder: "বিস্তারিত লিখুন",
    required: true,
  },
  {
    name: "phone_model",
    label: "বর্তমান ব্যবহৃত ফোনের ব্র্যান্ড ও মডেল (র‍্যাম ও রমসহ) উল্লেখ করুন।",
    type: "textarea",
    placeholder: "কমপক্ষে ৪GB RAM-এর ফোন থাকা আবশ্যক",
    required: true,
  },
];

const femaleFields: Field[] = [
  {
    name: "jamath_studies",
    label: "জামাতখানায় পড়ে থাকলে কোন জামাত পর্যন্ত পড়াশোনা করেছেন?",
    type: "textarea",
    placeholder: "প্রশ্ন মোতাবেক বিস্তারিত উত্তর লিখুন",
    required: true,
  },
  {
    name: "children",
    label: "সন্তান-সন্তাদি কতজন এবং তাদের বয়স কত? (যদি থাকে)",
    type: "textarea",
    placeholder: 'না থাকলে "নেই" লিখুন',
    required: true,
  },
  {
    name: "current_work",
    label: "বর্তমানে কোথায়? কতদিন ধরে? কোন খেদমতে নিয়োজিত আছেন? (কোনো খেদমতে না থাকলে সেটিও উল্লেখ করুন)",
    type: "textarea",
    placeholder: "বিস্তারিত উত্তর লিখুন",
    required: true,
  },
  {
    name: "residential_madrasa",
    label: "বর্তমানে কোনো আবাসিক মাদ্রাসায় ২৪ ঘণ্টা আবাসিক থেকে খেদমতরত আছেন?",
    type: "radio",
    options: ["জ্বী", "জ্বী না"],
    required: true,
  },
  {
    name: "work_objection",
    label: "বর্তমান কর্মক্ষেত্র থেকে অনলাইনে খেদমতের ব্যাপারে কোনো আপত্তি আছে কি?",
    type: "radio",
    options: [
      "না আলহামদুলিল্লাহ কোনো আপত্তি নেই।",
      "কর্তৃপক্ষের সাথে কথা বলে নিতে হবে।",
    ],
    required: true,
  },
  {
    name: "family_permission",
    label: "অনলাইনে খেদমতের ব্যাপারে পারিবারিক অনুমতি আছে কিনা? (পিতা কিংবা স্বামী)",
    type: "radio",
    options: [
      "জ্বী আলহামদুলিল্লাহ",
      "কথা বলে নিতে হবে",
      "অনুমতি নেই",
    ],
    required: true,
  },
  {
    name: "avoid_hifz",
    label: "আমাদের একাডেমিতে সংযুক্ত থাকা অবস্থায়, হিফজ বিভাগের খেদমত এড়িয়ে চলব।",
    type: "radio",
    options: ["এখনই বলতে পারছি না", "জ্বী ইনশা আল্লাহ্"],
    required: true,
  },
  {
    name: "free_time",
    label: "সারা দিন ক্লাস নেওয়ার মতো কত ঘণ্টা সময় ফ্রি থাকেন? (এবং কোন কোন সময় ফ্রি থাকেন?)",
    type: "textarea",
    placeholder: "বিস্তারিত লিখুন",
    required: true,
  },
  {
    name: "phone_model",
    label: "বর্তমান ব্যবহৃত ফোনের ব্র্যান্ড ও মডেল (র‍্যাম ও রমসহ) উল্লেখ করুন।",
    type: "textarea",
    placeholder: "কমপক্ষে ৪GB RAM-এর ফোন থাকা আবশ্যক",
    required: true,
  },
  {
    name: "maternity_leave",
    label: "আগামী ৬ থেকে ৮ মাসের মধ্যে আপনার কি মাতৃত্বকালীন ছুটির প্রয়োজন রয়েছে?",
    type: "radio",
    options: ["জ্বী ইনশাআল্লাহ", "প্রয়োজন নেই"],
    required: true,
  },
];

const commonQuestions: Field[] = [
  {
    name: "teaching_ability",
    label: "অনলাইনে কায়দা থেকে শুরু করে হিফজ পর্যন্ত পড়ানোর মতো মনমানসিকতা আছে?",
    type: "radio",
    options: ["জ্বী ইনশা আল্লাহ্"],
    required: true,
  },
  {
    name: "internet_type",
    label: "ইন্টারনেট ব্যবহারের মাধ্যম কোনটি?",
    type: "radio",
    options: ["মোবাইল ডাটা", "ওয়াইফাই", "দুইটাই"],
    required: true,
  },
  {
    name: "teaching_language",
    label: "আপনি কোন ভাষায় ক্লাস নিতে আগ্রহী?",
    type: "radio",
    options: ["বাংলা", "ইংলিশ", "দুটো ভাষাতেই আমি পারদর্শী"],
    required: true,
  },
  {
    name: "quiet_environment",
    label: "অনলাইনে ক্লাস নেওয়ার জন্য নিরিবিলি পরিবেশ আছে কিনা?",
    type: "radio",
    options: ["হ্যাঁ", "না"],
    required: true,
  },
  {
    name: "other_academy",
    label: "বর্তমানে অন্য কোনো একাডেমিতে খেদমতরত আছেন কিনা?",
    type: "radio",
    options: [
      "জ্বী আলহামদুলিল্লাহ",
      "দুঃখিত অন্য কোনো একাডেমিতে খেদমত করছি না",
    ],
    required: true,
  },
  {
    name: "long_term",
    label: "বিসমিল্লাহ ইলম একাডেমিতে কমপক্ষে ১ বছর পূর্ণ হওয়ার পূর্বে খেদমত হতে অব্যাহতি নেওয়া যাবে না। আপনি কি দীর্ঘ সময়ের জন্য অনলাইনে খেদমত করতে আগ্রহী?",
    type: "radio",
    options: [
      "জ্বী ইনশা আল্লাহ্",
      "এখনই বলতে পারছি না, ভেবে জানাবো ইনশা আল্লাহ্।",
    ],
    required: true,
  },
];

const opinionField: Field = {
  name: "opinion",
  label: "আমাদের একাডেমির কার্যক্রম এবং এই উদ্যোগের ব্যাপারে আপনার ব্যক্তিগত কিছু মতামত ব্যক্ত করুন।",
  type: "textarea",
  placeholder: "আপনার মতামত লিখুন",
  required: true,
};

function FormField({ field }: { field: Field }) {
  const baseClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/10";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-ink">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>

      {field.type === "radio" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm transition hover:border-[#4CAF50] has-[:checked]:border-[#4CAF50] has-[:checked]:bg-[#4CAF50]/5"
            >
              <input
                type="radio"
                name={field.name}
                value={option}
                required={field.required}
                className="mt-0.5 accent-[#4CAF50]"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          name={field.name}
          required={field.required}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseClass} resize-y`}
        />
      ) : (
        <input
          name={field.name}
          type={field.type}
          required={field.required}
          placeholder={field.placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

export default function TeacherRegister() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // 👈 পাসওয়ার্ড দেখার স্টেট
  const supabase = createClient();

  const fields = [
    ...commonFields,
    ...(gender === "male" ? maleFields : femaleFields),
    ...commonQuestions,
    opinionField,
  ];

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      const name = String(formData.get("name") || "");
      const email = String(formData.get("email") || "");
      const phone = String(formData.get("phone") || "");
      // পাসওয়ার্ড আপাতত ডাটাবেসে সেভ করছি না, কারণ Auth আলাদা। 
      // চাইলে application_data-তেও রাখা যেতে পারে। 

      const applicationData: Record<string, string> = {
        gender,
        password: String(formData.get("password") || ""), // চাইলে রাখতে পারেন
      };

      formData.forEach((value, key) => {
        if (!["name", "email", "phone", "password"].includes(key)) {
          applicationData[key] = String(value);
        }
      });

      // 🌟 ডাটাবেসে ডাটা সেভ (আপনার স্কিমা অনুযায়ী)
      const { error: dbError } = await supabase.from("teachers").insert({
        name_bn: name,
        name_en: name, 
        email: email,
        phone: phone,
        role_bn: gender === "male" ? "শিক্ষক" : "শিক্ষিকা",
        role_en: "Teacher",
        status: "pending", // 🌟 আবেদন সবসময় pending থাকবে
        application_data: applicationData, 
      });

      if (dbError) {
        console.error("Database Error:", dbError);
        setError("ডাটাবেসে সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }

      setSuccess(true);

    } catch (err) {
      console.error(err);
      setError("দুঃখিত, রেজিস্ট্রেশন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soft2 px-5 py-10 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#4CAF50]/10">
          <CheckCircle2 className="h-10 w-10 text-[#4CAF50]" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-ink">
          রেজিস্ট্রেশন সফল হয়েছে!
        </h1>

        <p className="mb-8 max-w-md text-body">
          আপনার শিক্ষক প্রোফাইলটি অ্যাডমিনের কাছে অনুমোদনের জন্য পাঠানো
          হয়েছে।
          <strong>
            {" "}অনুগ্রহ করে অ্যাডমিনের অ্যাপ্রুভালের জন্য অপেক্ষা করুন।
          </strong>
          অ্যাপ্রুভাল পেলে আপনি লগইন করতে পারবেন।
        </p>

        <Link
          href="/teacher/login"
          className="rounded-lg bg-[#4CAF50] px-8 py-3 font-bold text-white transition hover:bg-[#388E3C]"
        >
          লগইন পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft2 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4CAF50]/10">
            <GraduationCap className="h-7 w-7 text-[#4CAF50]" />
          </div>

          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            শিক্ষক রেজিস্ট্রেশন
          </h1>

          <p className="mt-2 text-sm text-body">
            বিসমিল্লাহ ইলম একাডেমিতে শিক্ষক হিসেবে যোগদানের আবেদন করুন।
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-7 rounded-3xl border border-slate-100 bg-white p-5 shadow-xl sm:p-8"
        >
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Gender Selection */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#4CAF50]" />
              <h2 className="font-bold text-ink">আবেদনের ধরন নির্বাচন করুন</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "male", label: "শিক্ষক" },
                { value: "female", label: "শিক্ষিকা" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setGender(item.value as "male" | "female")}
                  className={`rounded-xl border px-4 py-4 font-bold transition ${
                    gender === item.value
                      ? "border-[#4CAF50] bg-[#4CAF50]/10 text-[#388E3C]"
                      : "border-slate-200 text-slate-600 hover:border-[#4CAF50]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Account Information */}
          <section className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-[#4CAF50]" />
              <h2 className="font-bold text-ink">অ্যাকাউন্টের তথ্য</h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                পুরো নাম *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                মোবাইল নম্বর (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  name="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                ইমেইল *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="teacher@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                পাসওয়ার্ড *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"} // 👈 টাইপ পরিবর্তন হবে
                  minLength={6}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none focus:border-[#4CAF50]" // 👈 pr-12 যোগ করা হলো
                />
                {/* 👇 Eye Icon বাটন */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </section>

          {/* Application Information */}
          <section className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="h-5 w-5 text-[#4CAF50]" />
              <h2 className="font-bold text-ink">শিক্ষাগত ও ব্যক্তিগত তথ্য</h2>
            </div>

            {commonFields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-[#4CAF50]" />
              <h2 className="font-bold text-ink">
                {gender === "male" ? "শিক্ষক আবেদন ফরম" : "শিক্ষিকা আবেদন ফরম"}
              </h2>
            </div>

            {(gender === "male" ? maleFields : femaleFields).map((field) => (
              <FormField key={field.name} field={field} />
            ))}
          </section>

          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-bold text-ink">অনলাইন ক্লাস ও একাডেমি সংক্রান্ত তথ্য</h2>
              <p className="mt-1 text-xs text-body">
                প্রতিটি প্রশ্নের উত্তর সতর্কতার সঙ্গে প্রদান করুন।
              </p>
            </div>

            {commonQuestions.map((field) => (
              <FormField key={field.name} field={field} />
            ))}

            <FormField field={opinionField} />
          </section>

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4CAF50] py-4 font-bold text-white transition hover:bg-[#388E3C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                রেজিস্ট্রেশন হচ্ছে...
              </>
            ) : (
              "আবেদন ও রেজিস্ট্রেশন সম্পন্ন করুন"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link
            href="/teacher/login"
            className="font-bold text-[#4CAF50] hover:underline"
          >
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}