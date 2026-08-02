import { NavLink } from "react-router-dom";

import "./BottomNavigation.scss";

const ITEMS = [
    { to: "/dashboard", icon: "🏠", label: "Home" },
    { to: "/lobby", icon: "♟️", label: "Play" },
    { to: "/wallet", icon: "💰", label: "Wallet" },
    { to: "/history", icon: "📜", label: "History" },
    { to: "/profile", icon: "👤", label: "Profile" },
];

export function BottomNavigation() {

    return (

        <nav className="bottom-nav">

            {ITEMS.map((item) => (

                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        isActive ? "active" : undefined
                    }
                >
                    <span>{item.icon}</span>
                    <span className="label">{item.label}</span>
                </NavLink>
            ))}

        </nav>

    );
}
