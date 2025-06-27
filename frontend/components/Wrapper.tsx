import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface WrapperProps {
    children: ReactNode;
    className?: string;
}

export default function Wrapper({ children, className }: WrapperProps) {
    return <div className={cn(`max-w-7xl w-[95%] mx-auto px-4 sm:px-6 lg:px-8`, className)}>{children}</div>;
}
