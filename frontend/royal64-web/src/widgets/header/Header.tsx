import "./Header.scss";

import { useAuthStore } from "@/features/auth/auth-store";

export function Header() {

    const user = useAuthStore((s) => s.user);

    return (
        <header className="r64-header">
            <div className="logo">
                Royal64
            </div>

            <div className="user">

                {user?.username ? `@${user.username}` : "Guest"}

            </div>

        </header>
    );
}
