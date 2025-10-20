"use client";

import Link from 'next/link';

export function SoraWatermarkCTA() {
  return (
    <section
      id="cta"
      className="flex flex-col items-center justify-center w-full pt-8 sm:pt-10 md:pt-12 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6"
    >
      <div className="w-full mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-hidden shadow-xl w-full border border-border rounded-xl bg-secondary relative z-20">
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8 sm:py-10 md:py-12">
              {/* 标题区域 */}
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-medium tracking-tighter max-w-[280px] sm:max-w-xs md:max-w-lg lg:max-w-2xl text-center leading-tight">
                  Start Using Sora Watermark Remover Today
                </h1>
              </div>
              
              {/* 按钮区域 */}
              <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 pb-4 sm:pb-6">
                <Link
                  href="#hero"
                  scroll={true}
                  className="bg-white text-black font-semibold text-xs sm:text-sm h-9 sm:h-10 md:h-11 w-fit px-5 sm:px-6 md:px-7 rounded-full flex items-center justify-center shadow-md hover:bg-white/90 hover:shadow-lg transition-all"
                >
                  Try It Now
                </Link>
                <span className="text-white/90 text-xs sm:text-sm text-center px-4">
                  Free • No Registration • Privacy Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
