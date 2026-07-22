import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";

const Navbar = async () => {
    const session = await auth();
    const isAdmin = !!session;

    return (
        <header>
            <nav>
                <Link href='/'  className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                    <p>DevEvent</p>
                </Link>

                <ul>
                    <Link href="/">Home</Link>
                    <Link href="/#events">Events</Link>
                    {isAdmin && (
                        <>
                            <Link href="/admin" className="text-primary font-semibold">
                                Dashboard
                            </Link>
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/" });
                                }}
                            >
                                <button
                                    id="sign-out-btn"
                                    type="submit"
                                    className="text-light-200 hover:text-foreground cursor-pointer text-sm transition-colors"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    )
}
export default Navbar
