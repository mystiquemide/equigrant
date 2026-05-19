"use client";

import { motion } from "framer-motion";

import { useLanguage } from "@/components/LanguageProvider";

export function Testimonials() {
  const { t } = useLanguage();
  const testimonials = [
    {
      quote: t.testimonialOne,
      author: t.testimonialOneAuthor,
      org: t.testimonialOneOrg,
    },
    {
      quote: t.testimonialTwo,
      author: t.testimonialTwoAuthor,
      org: t.testimonialTwoOrg,
    },
    {
      quote: t.testimonialThree,
      author: t.testimonialThreeAuthor,
      org: t.testimonialThreeOrg,
    },
  ];

  return (
    <section className="border-b border-black/10 bg-white px-4 py-20 dark:border-white/10 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase text-[#282B5D] dark:text-[#BCA2FF]">{t.testimonials}</p>
          <h2 className="text-3xl font-bold tracking-normal text-black dark:text-white sm:text-4xl">{t.testimonialsHeadline}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="rounded-md border border-black/10 bg-[#f7f7f8] p-6 dark:border-white/10 dark:bg-white/5"
            >
              <blockquote className="text-lg font-semibold leading-8 text-black dark:text-white">"{testimonial.quote}"</blockquote>
              <figcaption className="mt-8 border-t border-black/10 pt-5 dark:border-white/10">
                <p className="font-bold text-black dark:text-white">{testimonial.author}</p>
                <p className="mt-1 text-sm text-black/55 dark:text-white/55">{testimonial.org}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
