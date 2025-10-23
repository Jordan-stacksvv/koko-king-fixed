import { Navbar } from "@/components/Navbar";
import { FloatingCart } from "@/components/FloatingCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

const Contact = () => {
  const phoneNumber = "+233257962987";
  const whatsappNumber = "233257962987";
  const email = "hello@kokoking.com";

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hi! I'd like to place an order from Koko King.`, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              Have questions? We're here to help! Reach out to us anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Speak directly with our team to place orders or ask questions
                </p>
                <p className="text-2xl font-bold text-primary">{phoneNumber}</p>
                <Button onClick={handleCall} className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Chat with us instantly and place your order via WhatsApp
                </p>
                <p className="text-2xl font-bold text-secondary">{phoneNumber}</p>
                <Button onClick={handleWhatsApp} variant="secondary" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>More Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Button onClick={handleEmail} variant="ghost" size="sm" className="p-0 h-auto">
                  Send Email
                </Button>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple locations<br />
                  across Accra, Ghana
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold">Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Open 24/7<br />
                  Every day of the week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FloatingCart />
    </div>
  );
};

export default Contact;
