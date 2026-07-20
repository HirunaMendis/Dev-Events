import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    // @ts-ignore
    return (

        <header>
            <nav>
                <Link href='/'  className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>

                    <p>DevEvent</p>

                </Link>

                <ul>
                    <Link href="/">Home</Link>
                    <Link href="/">Events</Link>
                    <Link href="/">Create</Link>
                    {/*<Link href="/">Home</Link>*/}
                </ul>
            </nav>

        </header>
    )
}
export default Navbar
