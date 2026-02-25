export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020817]">
            <div className="relative flex flex-col items-center gap-6">
                {/* Animated logo/icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-[var(--civic-amber)] opacity-20 blur-2xl animate-pulse rounded-full" />
                    <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[var(--civic-amber)] animate-spin" />
                    </div>
                </div>

                {/* Loading text */}
                <div className="flex flex-col items-center space-y-2">
                    <p className="text-sm font-display font-bold tracking-widest text-[var(--civic-amber)] uppercase animate-pulse">
                        JanMitra
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        Initializing Accountability Engine
                    </p>
                </div>

                {/* Shimmer bar */}
                <div className="w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--civic-amber)] w-1/2 animate-[shimmer_1.5s_infinite] shadow-[0_0_10px_var(--civic-amber)]" />
                </div>
            </div>
        </div>
    );
}
