import { Link } from "react-router-dom";

export default function SidebarItem({ title, icon, link, isActive = false }) {
    return (
        <Link
            to={link}
            className={`
                flex items-center gap-4 px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                group
                ${isActive
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 translate-x-1"
                    : "text-gray-700 hover:bg-white/60 hover:text-pink-600 hover:translate-x-1"
                }
            `}
        >
            <span className={`
                text-lg transition-transform duration-300
                ${isActive ? "scale-110" : "group-hover:scale-110"}
            `}>
                {icon}
            </span>
            
            <span className="font-medium text-sm tracking-wide">
                {title}
            </span>

            {/* Indicateur actif */}
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
        </Link>
    );
}