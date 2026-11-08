
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Content, Locale } from "@/lib/types";
import { t } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Teacher = {
  id?: string;
  name?: string;
  name_bn?: string;
  role_bn?: string;
  role_en?: string;
  image_url?: string | null;
};

export function Teachers({
  content,
  locale,
}: {
  content: Content;
  locale: Locale;
}) {
  const teacherList = (content.teachers || []) as Teacher[];

  const [items, setItems] = useState<Teacher[]>(teacherList);
  const [offset, setOffset] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const shouldAnimate = items.length > 3;

  // Content update হলে teacher list update হবে
  useEffect(() => {
    setItems(teacherList);
    setOffset(0);
    setIsAnimating(false);
  }, [content.teachers]);

  // একটি card এবং gap-এর মোট width
  const getStepWidth = () => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>(".teacher-card");

    if (!firstCard) return 0;

    return firstCard.getBoundingClientRect().width + 24;
  };

  // Next / Previous navigation
  const moveSlider = (dir: "next" | "prev") => {
    if (!shouldAnimate || isAnimating) return;

    const step = getStepWidth();
    if (!step) return;

    setDirection(dir);
    setIsAnimating(true);
    setOffset(dir === "next" ? -step : step);
  };

  // Animation শেষ হলে card-এর order পরিবর্তন
  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) return;
    if (!isAnimating) return;

    setItems((previous) => {
      if (direction === "next") {
        return [...previous.slice(1), previous[0]];
      }

      return [
        previous[previous.length - 1],
        ...previous.slice(0, -1),
      ];
    });

    // Transition ছাড়াই track আগের position-এ ফিরবে
    setOffset(0);
    setIsAnimating(false);
  };

  // Automatic scrolling
  useEffect(() => {
    if (!shouldAnimate || isHovered || isAnimating) return;

    timerRef.current = setInterval(() => {
      moveSlider("next");
    }, 2800);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [shouldAnimate, isHovered, isAnimating, items]);

  const renderCard = (teacher: Teacher, index: number) => (
    <div
      key={teacher.id || `${teacher.name}-${index}`}
      className="teacher-card bg-white rounded-3xl p-4 text-center shadow-sm border-2 border-transparent hover:border-brand hover:shadow-xl transition-all duration-300"
    >
      <div className="rounded-2xl overflow-hidden aspect-square mb-4 bg-slate-100">
        {teacher.image_url ? (
          <Image
            src={teacher.image_url}
            alt={teacher.name_bn || teacher.name || "Teacher"}
            width={400}
            height={400}
            draggable={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            No Image
          </div>
        )}
      </div>

      <h3 className="text-base font-bold text-ink">
        {teacher.name_bn || teacher.name || "শিক্ষক"}
      </h3>

      <p className="text-xs text-brand mt-1">
        {teacher.role_bn || teacher.role_en || "শিক্ষক"}
      </p>
    </div>
  );

  return (
    <section
      id="teachers"
      className="bg-soft2 py-24 overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto px-5">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-brand mb-3">
            {t(locale, "টিচার্স টিম", "Teachers Team")}
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">
            {t(locale, "আমাদের অসাধারণ শিক্ষকগণ", "Our exceptional teachers")}
          </h2>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            কোনো শিক্ষক পাওয়া যায়নি।
          </p>
        ) : !shouldAnimate ? (

          /* 1-3 teachers: Static layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(renderCard)}
          </div>

        ) : (

          /* 4+ teachers: Infinite carousel */
          <>
            <div
              className="overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div
                ref={trackRef}
                onTransitionEnd={handleTransitionEnd}
                className="teacher-track flex gap-6"
                style={{
                  transform: `translateX(${offset}px)`,
                  transition: isAnimating
                    ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
              >
                {items.map(renderCard)}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => moveSlider("prev")}
                disabled={isAnimating}
                aria-label="Previous teachers"
                className="w-11 h-11 rounded-full border border-brand/30 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all disabled:opacity-40"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={() => moveSlider("next")}
                disabled={isAnimating}
                aria-label="Next teachers"
                className="w-11 h-11 rounded-full border border-brand/30 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all disabled:opacity-40"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
