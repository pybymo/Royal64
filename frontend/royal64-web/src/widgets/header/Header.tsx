import "./Header.scss";

import { useAuthStore } from "@/features/auth/auth-store";

export function Header() {

    const user = useAuthStore((s) => s.user);

    const initial = user?.username ? user.username[0].toUpperCase() : "?";

    return (
        <header className="r64-header">

            <div className="r64-header-logo display">
                ROYAL<span className="gold-text">64</span>
            </div>

            <div className="r64-header-user">

                <div className="r64-header-user-name">
                    {user?.username ? `@${user.username}` : "Guest"}
                </div>

                <div className="r64-header-avatar">
                    {initial}
                </div>

            </div>

        </header>
    );
}
