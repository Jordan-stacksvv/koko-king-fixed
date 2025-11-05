import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import kokoKingLogo from "@/assets/koko-king-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div>
            <img src={kokoKingLogo} alt="Koko King" className="h-16 mb-4" />
            <p className="text-sm text-muted-foreground">
              Fresh, delicious food delivered to your doorstep. Experience the taste of quality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/menu" className="text-sm text-muted-foreground hover:text-primary">Menu</Link></li>
              <li><Link to="/store-locator" className="text-sm text-muted-foreground hover:text-primary">Store Locator</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link to="/cart" className="text-sm text-muted-foreground hover:text-primary">Cart</Link></li>
            </ul>
          </div>

          {/* Staff Access */}
          <div>
            <h3 className="font-semibold mb-4">Staff Access</h3>
            <ul className="space-y-2">
              <li><Link to="/kitchen/login" className="text-sm text-muted-foreground hover:text-primary">Kitchen Login</Link></li>
              <li><Link to="/manager/login" className="text-sm text-muted-foreground hover:text-primary">Manager Login</Link></li>
              <li><Link to="/admin/login" className="text-sm text-muted-foreground hover:text-primary">Admin Login</Link></li>
              <li><Link to="/driver/login" className="text-sm text-muted-foreground hover:text-primary">Driver Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+233 XX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@kokoking.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Accra, Ghana</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Liderlabs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};