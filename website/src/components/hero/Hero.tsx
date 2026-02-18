import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <div ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Parallax Background */}
            <motion.div
                style={{ y: backgroundY }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-sm text-primary mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Launch Your Collections in Minutes, Not Months
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-main mb-6">
                        Automate Your Revenue. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                            Simplify Reconciliation.
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-muted mb-10 text-balance">
                        Accelerate cash flow with next-gen payment collections. From instant M-Pesa triggers to seamless bank settlements, Paylor puts your business finances on autopilot.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            href={process.env.NEXT_PUBLIC_REGISTER_URL || "/register"}
                            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
                        >
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-muted bg-surface border border-border rounded-lg hover:bg-surface/80 hover:text-main transition-all backdrop-blur-sm"
                        >
                            Let's Talk
                        </Link>
                    </div>

                    {/* Dashboard Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="relative mx-auto max-w-5xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden glass-panel"
                    >
                        <img
                            src="/hero-dashboard.png"
                            alt="Paylor Dashboard"
                            className="w-full h-auto rounded-xl opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
