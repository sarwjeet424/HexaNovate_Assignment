import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const IntegrationBanner: React.FC = () => (
  <section className="py-12 bg-[#eef3fc] border-y border-blue-100">
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center gap-4"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
          Already Using SAP, Tally Or QuickBooks?
        </h2>
        <p className="text-lg font-bold text-accent">We Integrates With All!</p>
        <a href="#lead-form" className="btn-primary text-base px-8 py-4">
          Get A Free Demo <ArrowRight className="w-5 h-5" />
        </a>
      </motion.div>
    </div>
  </section>
);

export default IntegrationBanner;
