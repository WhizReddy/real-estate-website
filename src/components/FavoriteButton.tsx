'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useToast } from "./Toast";

interface FavoriteButtonProps {
    propertyId: string;
    initialFavorited?: boolean;
    className?: string;
}

export default function FavoriteButton({
    propertyId,
    initialFavorited = false,
    className = ""
}: FavoriteButtonProps) {
    const { data: session } = useSession();
    const [isFavorited, setIsFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { showToast } = useToast();

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            showToast({ title: "Ju lutem hyni në llogari për të ruajtur pasuritë.", type: "info" });
            return;
        }

        setLoading(true);
        setIsAnimating(true);

        // Optimistic update
        const previousState = isFavorited;
        setIsFavorited(!previousState);

        try {
            const response = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId }),
            });

            if (!response.ok) {
                throw new Error("Failed to toggle favorite");
            }

            const data = await response.json();
            setIsFavorited(data.favorited);

            if (data.favorited) {
                showToast({ title: "Pasuria u shtua në të preferuarat.", type: "success" });
            } else {
                showToast({ title: "Pasuria u hoq nga të preferuarat.", type: "info" });
            }
        } catch (error) {
            console.error("Favorite toggle error:", error);
            setIsFavorited(previousState);
            showToast({ title: "Diçka shkoi keq. Ju lutem provoni përsëri.", type: "error" });
        } finally {
            setLoading(false);
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`
        relative p-2.5 rounded-full transition-all duration-300 group
        ${isFavorited
                    ? "bg-red-50 text-red-500 shadow-sm"
                    : "bg-white/90 backdrop-blur-md text-gray-600 hover:text-red-500 hover:bg-red-50 shadow-md"}
        ${isAnimating ? "scale-125" : "hover:scale-110 active:scale-90"}
        ${className}
      `}
            title={isFavorited ? "Hiqe nga të preferuarat" : "Shto në të preferuarat"}
        >
            <Heart
                className={`h-5 w-5 transition-all duration-300 ${isFavorited ? "fill-current" : "fill-transparent"
                    } ${isAnimating ? "animate-ping" : ""}`}
            />

            {/* Sparkle effect on favorite */}
            {isFavorited && !isAnimating && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400/20 pointer-events-none"></span>
            )}
        </button>
    );
}
