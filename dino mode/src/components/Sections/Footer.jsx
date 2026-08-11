import {
    FaInstagram,
    FaFacebook,
    FaTiktok
} from "react-icons/fa";
import { Link } from "react-router-dom";


export default function Footer() {

    const quickLinks = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "Categories", path: "/categories" },
        { name: "Offers", path: "/offers" },
        { name: "Cart", path: "/cart" },
        { name: "Contact", path: "/contact" }
    ];

    const socialLinks = [
        { icon: <FaInstagram size={18} />, link: "https://www.instagram.com/dinou_moda", label: "Instagram" },
        { icon: <FaFacebook size={18} />, link: "https://www.facebook.com/dinoumoda", label: "Facebook" },
        { icon: <FaTiktok size={18} />, link: "https://www.tiktok.com/@dinou_moda", label: "TikTok" }
    ];


    return (

        <footer className="bg-black text-white px-10 py-12">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">


                {/* ===== BRAND ===== */}
                <div>

                    <Link to="/" className="inline-block group">
                        <h2 className="text-4xl font-serif transition-colors duration-300 group-hover:text-pink-400">
                            Dinou <span className="text-pink-500">Moda</span>
                        </h2>
                    </Link>

                    <p className="mt-5 text-gray-400">
                        Luxury Women's Fashion
                    </p>

                    <p className="mt-3 text-gray-400">
                        Elegant clothes for modern women.
                    </p>

                </div>



                {/* ===== QUICK LINKS (avec vrais liens) ===== */}
                <div>

                    <h3 className="text-xl font-bold mb-5">
                        Quick Links
                    </h3>

                    <ul className="space-y-3">

                        {quickLinks.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className="
                                        text-gray-400 
                                        hover:text-pink-400 
                                        transition-all duration-300
                                        hover:translate-x-1
                                        inline-flex items-center gap-2
                                        group
                                    "
                                >
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-pink-400 transition-all duration-300"></span>
                                    {item.name}
                                </Link>
                            </li>
                        ))}

                    </ul>

                </div>




                {/* ===== CONTACT ===== */}
                <div>

                    <h3 className="text-xl font-bold mb-5">
                        Contact
                    </h3>

                    <p className="text-gray-400 flex items-center gap-2">
                        <span className="text-pink-500">☎</span> 0558142628
                    </p>

                    <p className="mt-3 text-gray-400 flex items-center gap-2">
                        <span className="text-pink-500">📍</span> Rue Mohamed Belarbi 624 B
                    </p>



                    {/* ===== SOCIAL ICONS (tous les 3) ===== */}
                    <div className="flex gap-4 mt-6">

                        {socialLinks.map((social) => (
                            <SocialIcon
                                key={social.label}
                                link={social.link}
                                label={social.label}
                            >
                                {social.icon}
                            </SocialIcon>
                        ))}

                    </div>

                </div>


            </div>




            {/* ===== COPYRIGHT ===== */}
            <div className="border-t border-gray-700 mt-10 pt-5 text-center text-gray-500 text-sm">
                © 2026 Dinou Moda. All Rights Reserved.
            </div>


        </footer>

    );

}




function SocialIcon({ children, link, label }) {

    return (

        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="
                bg-white
                text-black
                p-3
                rounded-full
                hover:bg-pink-500
                hover:text-white
                hover:scale-110
                transition-all duration-300
                shadow-lg hover:shadow-pink-500/50
            "
        >

            {children}

        </a>

    );

}